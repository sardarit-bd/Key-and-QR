"use client";

import { orderService } from "@/services/order.service";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { ProductImage } from "@/components/ui/ProductImage";
import Loader from "@/shared/Loader";
import { CHECKOUT_CONFIG, formatPrice, getCountryName } from "@/config/checkout.config";
import { validateCheckoutForm } from "@/lib/validators/checkout.validator";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const PLACEHOLDER_IMAGE = "https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image";

export default function Checkout() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    const { user } = useAuthStore();
    const {
        cart,
        clearCart,
        getTotalPrice,
        getTotalQuantity,
        hasItems,
        validateStock,
        getCheckoutItems,
    } = useCartStore();

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [countryOpen, setCountryOpen] = useState(false);
    const [imageErrors, setImageErrors] = useState({});
    const [existingOrder, setExistingOrder] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const [formData, setFormData] = useState({
        email: "",
        fullName: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        country: CHECKOUT_CONFIG.defaults.country,
        purchaseType: CHECKOUT_CONFIG.defaults.purchaseType,
        giftMessage: "",
    });

    const countries = CHECKOUT_CONFIG.countries;

    // ✅ Get checkout items from cart
    const checkoutItems = useMemo(() => {
        if (orderId && existingOrder?.product) {
            // Legacy single product order
            return [
                {
                    id: existingOrder.product._id,
                    name: existingOrder.product.name,
                    price: existingOrder.product.price,
                    qty: existingOrder.quantity || 1,
                    img: existingOrder.product.image?.url || PLACEHOLDER_IMAGE,
                },
            ];
        }

        // ✅ Multi-product from cart
        if (cart.length > 0) {
            return cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                qty: item.qty || 1,
                img: item.img || PLACEHOLDER_IMAGE,
                purchaseType: item.purchaseType || CHECKOUT_CONFIG.defaults.purchaseType,
                giftMessage: item.giftMessage || null,
            }));
        }

        return [];
    }, [orderId, existingOrder, cart]);

    const firstItem = checkoutItems?.[0];

    // ✅ Set user data to form
    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                email: user.email || "",
                fullName: user.name || "",
            }));
        }
    }, [user]);

    // ✅ Fetch existing order
    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;

            try {
                setPageLoading(true);
                const response = await orderService.getOrderStatus(orderId);
                const orderData = response.data || response;
                setExistingOrder(orderData);

                setFormData((prev) => ({
                    ...prev,
                    purchaseType: orderData?.purchaseType || CHECKOUT_CONFIG.defaults.purchaseType,
                    giftMessage: orderData?.giftMessage || "",
                }));
            } catch (error) {
                console.error("Failed to load order:", error);
                toast.error("Failed to load order details");
            } finally {
                setPageLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    // ✅ Calculate totals
    const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
    const shippingCost = CHECKOUT_CONFIG.shipping.cost;
    const total = subtotal + shippingCost;

    // ✅ Validate cart before checkout
    const validateCart = async () => {
        const errors = await validateStock();
        if (errors.length > 0) {
            for (const error of errors) {
                toast.error(
                    `${error.name}: Only ${error.available} available, you requested ${error.requested}`
                );
            }
            return false;
        }
        return true;
    };

    // Build checkout payload with items
    const buildCheckoutPayload = () => {
        if (orderId) {
            return {
                orderId,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                postalCode: formData.postalCode,
                country: formData.country,
            };
        }

        const cartItems = getCheckoutItems();

        // Convert to backend expected format with prices
        const items = cartItems.map(item => {
            // Get product price from cart
            const product = cart.find(p => p.id === item.productId);
            const unitPrice = product?.price || 0;
            const quantity = item.quantity || 1;
            const subtotal = unitPrice * quantity;

            return {
                product: item.productId,
                quantity: quantity,
                unitPrice: unitPrice,        // ← SEND THIS
                subtotal: subtotal,          // ← SEND THIS
                purchaseType: item.purchaseType || formData.purchaseType || "self",
                giftMessage: (item.purchaseType || formData.purchaseType) === "gift"
                    ? item.giftMessage || formData.giftMessage || null
                    : null,
            };
        });

        return {
            items,
            productId: items.length === 1 ? items[0].product : undefined,
            quantity: items.length === 1 ? items[0].quantity : undefined,
            purchaseType: formData.purchaseType,
            giftMessage: formData.purchaseType === "gift" ? formData.giftMessage || null : null,
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
        };
    };

    // Handle checkout submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting || loading) return;

        // Validate cart
        if (!orderId && !hasItems()) {
            toast.error("Your cart is empty. Please add items before checking out.");
            router.push("/shop");
            return;
        }

        // Use extracted validation
        const validation = validateCheckoutForm(formData);
        if (!validation.valid) {
            setFieldErrors(validation.errors);
            const firstError = Object.values(validation.errors)[0];
            if (firstError) toast.error(firstError);
            return;
        }

        // Clear field errors
        setFieldErrors({});

        setIsSubmitting(true);
        setLoading(true);

        try {
            if (!orderId) {
                const isValid = await validateCart();
                if (!isValid) {
                    setLoading(false);
                    setIsSubmitting(false);
                    return;
                }
            }

            const payload = buildCheckoutPayload();
            console.log("Checkout payload:", payload);

            const response = await orderService.createCheckout(payload);

            if (response?.data?.url) {
                if (!orderId) {
                    clearCart();
                }

                window.location.href = response.data.url;
                return;
            }

            throw new Error("No checkout URL received");
        } catch (error) {
            console.error("Checkout failed:", error);

            let errorMessage = "Something went wrong. Please try again.";
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    };

    // ✅ Image error handler
    const handleImageError = (productId) => {
        setImageErrors((prev) => ({ ...prev, [productId]: true }));
    };

    const getImageUrl = (item) => {
        if (imageErrors[item.id]) return PLACEHOLDER_IMAGE;
        return item.img || PLACEHOLDER_IMAGE;
    };

    // ✅ Loading state
    if (pageLoading) {
        return <Loader text="Loading order..." size={50} fullScreen />;
    }

    // ✅ Empty cart
    if (!orderId && !hasItems()) {
        return (
            <section className="max-w-7xl mx-auto py-32 px-4 text-center">
                <div className="bg-gray-50 p-8 rounded-lg max-w-md mx-auto">
                    <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
                    <p className="text-gray-600 mb-6">Add some products to your cart before checking out.</p>
                    <Link
                        href="/shop"
                        className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </section>
        );
    }

    // ✅ Check if cart has multiple items
    const hasMultipleItems = checkoutItems.length > 1;

    return (
        <section className="max-w-7xl mx-auto py-16 px-4 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-52">
            {/* LEFT: Order Summary */}
            <div>
                <Link
                    href={orderId ? "/dashboard/user/orders" : "/cart"}
                    className="text-md text-gray-500 hover:underline mb-4 inline-block"
                >
                    ← {orderId ? "Back to Orders" : "Back to Cart"}
                </Link>

                <h2 className="text-xl font-semibold mb-6">
                    Order Summary ({checkoutItems.reduce((sum, i) => sum + (i.qty || 1), 0)} items)
                </h2>

                {checkoutItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No items in cart
                    </div>
                ) : (
                    <>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {checkoutItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            <ProductImage
                                                src={getImageUrl(item)}
                                                alt={item.name}
                                                width={64}
                                                height={64}
                                                className="object-cover"
                                                fill={false}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-sm">{item.name}</h3>
                                            <p className="text-sm text-gray-500">Qty: {item.qty || 1}</p>
                                            <p className="text-sm text-gray-500">{formatPrice(item.price)} each</p>
                                        </div>
                                    </div>
                                    <p className="font-medium">{formatPrice((item.price || 0) * (item.qty || 1))}</p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-300 mt-6 pt-4 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal ({checkoutItems.length} items)</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600">{CHECKOUT_CONFIG.shipping.label}</span>
                            </div>
                            {hasMultipleItems && (
                                <div className="flex justify-between text-gray-600 text-xs italic">
                                    <span>Multiple items</span>
                                    <span>✓</span>
                                </div>
                            )}
                            <div className="flex justify-between text-base font-semibold mt-2 border-t border-gray-300 pt-4">
                                <span>Total</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* RIGHT: Checkout Form */}
            <div>
                <h2 className="text-xl font-semibold mb-6">
                    {orderId ? "Complete Payment" : "Billing Details"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
                    <div>
                        <label className="text-sm font-medium block mb-1" htmlFor="email">
                            Email *
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value });
                                if (fieldErrors.email) {
                                    const { errors } = validateCheckoutForm({ ...formData, email: e.target.value });
                                    setFieldErrors(prev => ({ ...prev, email: errors.email }));
                                }
                            }}
                            placeholder="you@example.com"
                            className={`w-full border ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-2 focus:outline-none focus:border-black transition`}
                            disabled={isSubmitting || loading}
                            aria-label="Email address"
                        />
                        {fieldErrors.email && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                        )}
                    </div>

                    {/* Shipping Information */}
                    <div>
                        <h3 className="text-sm font-medium mb-2">Shipping Information</h3>
                        <div className="space-y-3">
                            <div>
                                <input
                                    type="text"
                                    required
                                    placeholder="Full name *"
                                    value={formData.fullName}
                                    onChange={(e) => {
                                        setFormData({ ...formData, fullName: e.target.value });
                                        if (fieldErrors.fullName) {
                                            const { errors } = validateCheckoutForm({ ...formData, fullName: e.target.value });
                                            setFieldErrors(prev => ({ ...prev, fullName: errors.fullName }));
                                        }
                                    }}
                                    className={`w-full border ${fieldErrors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-2 focus:outline-none focus:border-black transition`}
                                    disabled={isSubmitting || loading}
                                    aria-label="Full name"
                                />
                                {fieldErrors.fullName && (
                                    <p className="text-red-500 text-xs mt-1">{fieldErrors.fullName}</p>
                                )}
                            </div>

                            <div>
                                <input
                                    type="tel"
                                    placeholder="Phone number"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        setFormData({ ...formData, phone: e.target.value });
                                        if (fieldErrors.phone) {
                                            const { errors } = validateCheckoutForm({ ...formData, phone: e.target.value });
                                            setFieldErrors(prev => ({ ...prev, phone: errors.phone }));
                                        }
                                    }}
                                    className={`w-full border ${fieldErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-2 focus:outline-none focus:border-black transition`}
                                    disabled={isSubmitting || loading}
                                    aria-label="Phone number"
                                />
                                {fieldErrors.phone && (
                                    <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>
                                )}
                            </div>

                            {/* Country Select */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setCountryOpen(!countryOpen)}
                                    className={`w-full border ${fieldErrors.country ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-2 flex justify-between items-center focus:outline-none focus:border-black transition bg-white`}
                                    disabled={isSubmitting || loading}
                                    aria-label="Select country"
                                >
                                    <span className={formData.country === '' || formData.country === 'Select your country' ? 'text-gray-400' : ''}>
                                        {formData.country ? getCountryName(formData.country) : 'Select your country'}
                                    </span>
                                    <ChevronDown size={18} className={`transition-transform ${countryOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {countryOpen && (
                                    <div className="absolute bg-white w-full border border-gray-300 rounded-md shadow-md mt-1 z-10 max-h-48 overflow-y-auto">
                                        <button
                                            key="default"
                                            type="button"
                                            onClick={() => {
                                                setFormData({ ...formData, country: '' });
                                                setCountryOpen(false);
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-100 transition"
                                        >
                                            Select your country
                                        </button>
                                        {countries.map((c) => (
                                            <button
                                                key={c.code}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, country: c.code });
                                                    setCountryOpen(false);
                                                    if (fieldErrors.country) {
                                                        const { errors } = validateCheckoutForm({ ...formData, country: c.code });
                                                        setFieldErrors(prev => ({ ...prev, country: errors.country }));
                                                    }
                                                }}
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100 transition"
                                            >
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {fieldErrors.country && (
                                    <p className="text-red-500 text-xs mt-1">{fieldErrors.country}</p>
                                )}
                            </div>

                            <div>
                                <input
                                    type="text"
                                    required
                                    placeholder="Address *"
                                    value={formData.address}
                                    onChange={(e) => {
                                        setFormData({ ...formData, address: e.target.value });
                                        if (fieldErrors.address) {
                                            const { errors } = validateCheckoutForm({ ...formData, address: e.target.value });
                                            setFieldErrors(prev => ({ ...prev, address: errors.address }));
                                        }
                                    }}
                                    className={`w-full border ${fieldErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-2 focus:outline-none focus:border-black transition`}
                                    disabled={isSubmitting || loading}
                                    aria-label="Address"
                                />
                                {fieldErrors.address && (
                                    <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={formData.city}
                                        onChange={(e) => {
                                            setFormData({ ...formData, city: e.target.value });
                                            if (fieldErrors.city) {
                                                const { errors } = validateCheckoutForm({ ...formData, city: e.target.value });
                                                setFieldErrors(prev => ({ ...prev, city: errors.city }));
                                            }
                                        }}
                                        className={`w-full border ${fieldErrors.city ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-2 focus:outline-none focus:border-black transition`}
                                        disabled={isSubmitting || loading}
                                        aria-label="City"
                                    />
                                    {fieldErrors.city && (
                                        <p className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Postal Code"
                                        value={formData.postalCode}
                                        onChange={(e) => {
                                            setFormData({ ...formData, postalCode: e.target.value });
                                            if (fieldErrors.postalCode) {
                                                const { errors } = validateCheckoutForm({ ...formData, postalCode: e.target.value });
                                                setFieldErrors(prev => ({ ...prev, postalCode: errors.postalCode }));
                                            }
                                        }}
                                        className={`w-full border ${fieldErrors.postalCode ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-2 focus:outline-none focus:border-black transition`}
                                        disabled={isSubmitting || loading}
                                        aria-label="Postal code"
                                    />
                                    {fieldErrors.postalCode && (
                                        <p className="text-red-500 text-xs mt-1">{fieldErrors.postalCode}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Purchase Type - Only for single item or new orders */}
                    {!orderId && checkoutItems.length <= 1 && (
                        <div>
                            <label className="text-sm font-medium block mb-2" htmlFor="purchaseType">
                                Purchase Type
                            </label>
                            <select
                                id="purchaseType"
                                value={formData.purchaseType}
                                onChange={(e) => {
                                    setFormData({ ...formData, purchaseType: e.target.value });
                                    if (fieldErrors.purchaseType) {
                                        setFieldErrors(prev => ({ ...prev, purchaseType: undefined }));
                                    }
                                }}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-black transition bg-white"
                                disabled={isSubmitting || loading}
                            >
                                <option value="self">For myself</option>
                                <option value="gift">As a gift</option>
                            </select>

                            {formData.purchaseType === "gift" && (
                                <div className="mt-3 animate-fadeIn">
                                    <label className="text-sm font-medium block mb-2" htmlFor="giftMessage">
                                        Gift Message
                                    </label>
                                    <textarea
                                        id="giftMessage"
                                        placeholder="Write your gift message here..."
                                        value={formData.giftMessage}
                                        onChange={(e) => {
                                            setFormData({ ...formData, giftMessage: e.target.value });
                                            if (fieldErrors.giftMessage) {
                                                const { errors } = validateCheckoutForm({ ...formData, giftMessage: e.target.value });
                                                setFieldErrors(prev => ({ ...prev, giftMessage: errors.giftMessage }));
                                            }
                                        }}
                                        rows={4}
                                        className={`w-full border ${fieldErrors.giftMessage ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-2 focus:outline-none focus:border-black transition resize-none`}
                                        disabled={isSubmitting || loading}
                                        aria-label="Gift message"
                                    />
                                    {fieldErrors.giftMessage && (
                                        <p className="text-red-500 text-xs mt-1">{fieldErrors.giftMessage}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Multiple Items Notice */}
                    {!orderId && checkoutItems.length > 1 && (
                        <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                            <p className="font-medium">📦 Multiple Items</p>
                            <p className="text-xs mt-1">
                                You have {checkoutItems.length} items in your cart. Each item will be processed separately.
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || loading || checkoutItems.length === 0}
                        className={`w-full text-white py-3 rounded-lg transition ${isSubmitting || loading || checkoutItems.length === 0
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-black hover:bg-gray-800 cursor-pointer"
                            }`}
                    >
                        {isSubmitting || loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            `${orderId ? "Pay Now" : "Place Order"} • ${formatPrice(total)}`
                        )}
                    </button>
                </form>
            </div>
        </section>
    );
}