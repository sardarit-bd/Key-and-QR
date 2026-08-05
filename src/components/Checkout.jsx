"use client";

import { orderService } from "@/services/order.service";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { ProductImage } from "@/components/ui/ProductImage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "@/shared/Loader";
import { CHECKOUT_CONFIG, formatPrice, getCountryName } from "@/config/checkout.config";
import { validateCheckoutForm } from "@/lib/validators/checkout.validator";
import { ChevronDown, ShieldCheck, Lock, CreditCard, Gift } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import toast from "react-hot-toast";

const PLACEHOLDER_IMAGE = "https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image";

// Shared input styling for consistent premium form fields
const inputClass = (hasError) =>
  `w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-300 focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
      : "border-gray-300 focus:border-gray-900 focus:ring-gray-900/10 hover:border-gray-400"
  }`;

function Field({ label, htmlFor, required = false, error, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function Checkout() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const reduceMotion = useReducedMotion();

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
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const [formData, setFormData] = useState({
        email: "",
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: CHECKOUT_CONFIG.defaults.country,
        purchaseType: CHECKOUT_CONFIG.defaults.purchaseType,
        giftMessage: "",
    });

    const countries = CHECKOUT_CONFIG.countries;

    // Get checkout items from cart
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

        // Multi-product from cart
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

    // Set user data to form
    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                email: user.email || "",
                fullName: user.name || "",
            }));
        }
    }, [user]);

    // Fetch existing order
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

    // Calculate totals
    const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
    const shippingCost = CHECKOUT_CONFIG.shipping.cost;
    const total = subtotal + shippingCost;

    // Validate cart before checkout
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
                state: formData.state,
                postalCode: formData.postalCode,
                country: formData.country,
            };
        }

        const cartItems = getCheckoutItems();

        // Convert to backend expected format
        const items = cartItems.map(item => ({
            product: item.productId,
            quantity: item.quantity || 1,
            purchaseType: item.purchaseType || formData.purchaseType || "self",
            giftMessage: (item.purchaseType || formData.purchaseType) === "gift"
                ? item.giftMessage || formData.giftMessage || null
                : null,
        }));

        return {
            items,
            // Legacy support for single product
            productId: items.length === 1 ? items[0].product : undefined,
            quantity: items.length === 1 ? items[0].quantity : undefined,
            purchaseType: formData.purchaseType,
            giftMessage: formData.purchaseType === "gift" ? formData.giftMessage || null : null,
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
        };
    };

    // Handle checkout submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting || loading || isRedirecting) return;

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
                // Do NOT clear cart here - will be cleared on success page
                setIsRedirecting(true);
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
            setIsRedirecting(false);
        } finally {
            if (!isRedirecting) {
                setLoading(false);
                setIsSubmitting(false);
            }
        }
    };

    // Image error handler
    const handleImageError = (productId) => {
        setImageErrors((prev) => ({ ...prev, [productId]: true }));
    };

    const getImageUrl = (item) => {
        if (imageErrors[item.id]) return PLACEHOLDER_IMAGE;
        return item.img || PLACEHOLDER_IMAGE;
    };

    // Loading state
    if (pageLoading) {
        return <Loader text="Loading order..." size={50} fullScreen />;
    }

    // Redirecting state - Show loading while redirecting to Stripe
    if (isRedirecting) {
        return (
            <section className="max-w-7xl mx-auto py-32 px-4 text-center">
                <div className="bg-gray-50 p-8 rounded-lg max-w-md mx-auto">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                        <p className="text-gray-600">Redirecting to secure payment...</p>
                    </div>
                </div>
            </section>
        );
    }

    // Empty cart - Only show when not submitting and not redirecting
    if (!orderId && !hasItems() && !isSubmitting && !loading) {
        return (
            <section className="max-w-7xl mx-auto py-32 px-4 text-center">
                <div className="bg-gray-50 p-8 rounded-lg max-w-md mx-auto">
                    <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
                    <p className="text-gray-600 mb-6">Add some products to your cart before checking out.</p>
                    <Link
                        href="/shop"
                        className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition cursor-pointer"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </section>
        );
    }

    // Check if cart has multiple items
    const hasMultipleItems = checkoutItems.length > 1;

    return (
        <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-7xl mx-auto py-12 sm:py-16 px-4"
        >
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                        {orderId ? "Complete Payment" : "Checkout"}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {orderId ? "Finish securing your order" : "Secure checkout — fill in your details to continue"}
                    </p>
                </div>
                <Link
                    href={orderId ? "/new-dashboard/user/orders" : "/cart"}
                    className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 cursor-pointer"
                >
                    ← {orderId ? "Back to Orders" : "Back to Cart"}
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
                {/* LEFT: Checkout Form */}
                <div className="lg:col-span-3">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Contact */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-[0_4px_20px_-8px_rgb(0_0_0/0.06)]">
                            <h2 className="mb-5 flex items-center gap-2 text-base font-bold tracking-tight text-gray-900">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-[13px] font-bold text-white">1</span>
                                Contact
                            </h2>

                            <div className="space-y-4">
                                <Field label="Email" htmlFor="email" required error={fieldErrors.email}>
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
                                        className={inputClass(fieldErrors.email)}
                                        disabled={isSubmitting || loading || isRedirecting}
                                        aria-label="Email address"
                                    />
                                </Field>

                                <Field label="Phone number" htmlFor="phone" error={fieldErrors.phone}>
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            setFormData({ ...formData, phone: e.target.value });
                                            if (fieldErrors.phone) {
                                                const { errors } = validateCheckoutForm({ ...formData, phone: e.target.value });
                                                setFieldErrors(prev => ({ ...prev, phone: errors.phone }));
                                            }
                                        }}
                                        placeholder="+1 (555) 000-0000"
                                        className={inputClass(fieldErrors.phone)}
                                        disabled={isSubmitting || loading || isRedirecting}
                                        aria-label="Phone number"
                                    />
                                </Field>
                            </div>
                        </div>

                        {/* Shipping Information */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-[0_4px_20px_-8px_rgb(0_0_0/0.06)]">
                            <h2 className="mb-5 flex items-center gap-2 text-base font-bold tracking-tight text-gray-900">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-[13px] font-bold text-white">2</span>
                                Shipping Information
                            </h2>

                            <div className="space-y-4">
                                <Field label="Full name" htmlFor="fullName" required error={fieldErrors.fullName}>
                                    <input
                                        id="fullName"
                                        type="text"
                                        required
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={(e) => {
                                            setFormData({ ...formData, fullName: e.target.value });
                                            if (fieldErrors.fullName) {
                                                const { errors } = validateCheckoutForm({ ...formData, fullName: e.target.value });
                                                setFieldErrors(prev => ({ ...prev, fullName: errors.fullName }));
                                            }
                                        }}
                                        className={inputClass(fieldErrors.fullName)}
                                        disabled={isSubmitting || loading || isRedirecting}
                                        aria-label="Full name"
                                    />
                                </Field>

                                {/* Country Select */}
                                <Field label="Country" htmlFor="country" required error={fieldErrors.country}>
                                    <div className="relative">
                                        <button
                                            id="country"
                                            type="button"
                                            onClick={() => setCountryOpen(!countryOpen)}
                                            className={`${inputClass(fieldErrors.country)} flex cursor-pointer items-center justify-between text-left`}
                                            disabled={isSubmitting || loading || isRedirecting}
                                            aria-label="Select country"
                                            aria-expanded={countryOpen}
                                        >
                                            <span className={formData.country ? 'text-gray-900' : 'text-gray-400'}>
                                                {formData.country ? getCountryName(formData.country) : 'Select your country'}
                                            </span>
                                            <ChevronDown size={18} className={`shrink-0 text-gray-400 transition-transform ${countryOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {countryOpen && (
                                            <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({ ...formData, country: '' });
                                                        setCountryOpen(false);
                                                    }}
                                                    className="w-full cursor-pointer px-4 py-2.5 text-left text-sm text-gray-500 transition-colors hover:bg-gray-50"
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
                                                        className={`w-full cursor-pointer px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 ${
                                                            formData.country === c.code ? "font-semibold text-gray-900" : "text-gray-700"
                                                        }`}
                                                    >
                                                        {c.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Field>

                                <Field label="Address" htmlFor="address" required error={fieldErrors.address}>
                                    <input
                                        id="address"
                                        type="text"
                                        required
                                        placeholder="123 Main Street"
                                        value={formData.address}
                                        onChange={(e) => {
                                            setFormData({ ...formData, address: e.target.value });
                                            if (fieldErrors.address) {
                                                const { errors } = validateCheckoutForm({ ...formData, address: e.target.value });
                                                setFieldErrors(prev => ({ ...prev, address: errors.address }));
                                            }
                                        }}
                                        className={inputClass(fieldErrors.address)}
                                        disabled={isSubmitting || loading || isRedirecting}
                                        aria-label="Address"
                                    />
                                </Field>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Field label="City" htmlFor="city" required error={fieldErrors.city}>
                                        <input
                                            id="city"
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
                                            className={inputClass(fieldErrors.city)}
                                            disabled={isSubmitting || loading || isRedirecting}
                                            aria-label="City"
                                        />
                                    </Field>
                                    <Field label="State" htmlFor="state" required error={fieldErrors.state}>
                                        <input
                                            id="state"
                                            type="text"
                                            placeholder="State"
                                            value={formData.state}
                                            onChange={(e) => {
                                                setFormData({ ...formData, state: e.target.value });
                                                if (fieldErrors.state) {
                                                    const { errors } = validateCheckoutForm({ ...formData, state: e.target.value });
                                                    setFieldErrors(prev => ({ ...prev, state: errors.state }));
                                                }
                                            }}
                                            className={inputClass(fieldErrors.state)}
                                            disabled={isSubmitting || loading || isRedirecting}
                                            aria-label="State"
                                        />
                                    </Field>
                                    <Field label="ZIP Code" htmlFor="postalCode" required error={fieldErrors.postalCode}>
                                        <input
                                            id="postalCode"
                                            type="text"
                                            placeholder="ZIP"
                                            value={formData.postalCode}
                                            onChange={(e) => {
                                                setFormData({ ...formData, postalCode: e.target.value });
                                                if (fieldErrors.postalCode) {
                                                    const { errors } = validateCheckoutForm({ ...formData, postalCode: e.target.value });
                                                    setFieldErrors(prev => ({ ...prev, postalCode: errors.postalCode }));
                                                }
                                            }}
                                            className={inputClass(fieldErrors.postalCode)}
                                            disabled={isSubmitting || loading || isRedirecting}
                                            aria-label="ZIP Code"
                                        />
                                    </Field>
                                </div>
                            </div>
                        </div>

                        {/* Purchase Type - Only for single item or new orders */}
                        {!orderId && checkoutItems.length <= 1 && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-[0_4px_20px_-8px_rgb(0_0_0/0.06)]">
                                <h2 className="mb-5 flex items-center gap-2 text-base font-bold tracking-tight text-gray-900">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-[13px] font-bold text-white">3</span>
                                    Gift Information
                                </h2>

                                <div className="space-y-4">
                                    <Field label="Purchase Type" htmlFor="purchaseType">
                                        <Select
                                            value={formData.purchaseType}
                                            onValueChange={(val) => {
                                                setFormData({ ...formData, purchaseType: val });
                                                if (fieldErrors.purchaseType) {
                                                    setFieldErrors(prev => ({ ...prev, purchaseType: undefined }));
                                                }
                                            }}
                                            disabled={isSubmitting || loading || isRedirecting}
                                        >
                                            <SelectTrigger
                                                id="purchaseType"
                                                className="h-11 w-full bg-white text-gray-900 [&>span]:text-gray-900"
                                                aria-label="Purchase type"
                                            >
                                                <SelectValue placeholder="Select purchase type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="self">For myself</SelectItem>
                                                <SelectItem value="gift">As a gift</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    {formData.purchaseType === "gift" && (
                                        <motion.div
                                            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            transition={{ duration: 0.25, ease: 'easeOut' }}
                                            className="overflow-hidden"
                                        >
                                            <Field label="Gift Message" htmlFor="giftMessage" error={fieldErrors.giftMessage}>
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
                                                    className={`${inputClass(fieldErrors.giftMessage)} resize-none`}
                                                    disabled={isSubmitting || loading || isRedirecting}
                                                    aria-label="Gift message"
                                                />
                                            </Field>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Multiple Items Notice */}
                        {!orderId && checkoutItems.length > 1 && (
                            <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
                                <Gift size={16} className="mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold">Multiple Items</p>
                                    <p className="mt-0.5 text-xs">
                                        You have {checkoutItems.length} items in your cart. Each item will be processed separately.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || loading || isRedirecting || checkoutItems.length === 0}
                            className={`w-full flex items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold transition-all duration-300 ${
                                isSubmitting || loading || isRedirecting || checkoutItems.length === 0
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-900 text-white hover:bg-gray-700 active:scale-[0.99] cursor-pointer"
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
                                <span className="flex items-center gap-2">
                                    <Lock size={16} />
                                    {orderId ? "Pay Now" : "Place Order"} • {formatPrice(total)}
                                </span>
                            )}
                        </button>

                        {/* Security note */}
                        <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                            <ShieldCheck size={14} className="text-green-600" />
                            Your payment information is encrypted and processed securely.
                        </p>
                    </form>
                </div>

                {/* RIGHT: Sticky Order Summary */}
                <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_12px_40px_-16px_rgb(0_0_0/0.12)] lg:sticky lg:top-8">
                        <h2 className="text-lg font-bold tracking-tight text-gray-900">
                            Order Summary ({checkoutItems.reduce((sum, i) => sum + (i.qty || 1), 0)} items)
                        </h2>

                        {checkoutItems.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">
                                No items in cart
                            </div>
                        ) : (
                            <>
                                {/* Items */}
                                <div className="mt-5 space-y-4 max-h-80 overflow-y-auto pr-1">
                                    {checkoutItems.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                                <ProductImage
                                                    src={getImageUrl(item)}
                                                    alt={item.name}
                                                    width={64}
                                                    height={64}
                                                    className="h-full w-full object-cover"
                                                    fill={false}
                                                />
                                                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1 text-[11px] font-bold text-white">
                                                    {item.qty || 1}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate text-sm font-semibold text-gray-900">{item.name}</h3>
                                                <p className="text-xs text-gray-500">{formatPrice(item.price)} each</p>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900 tabular-nums">
                                                {formatPrice((item.price || 0) * (item.qty || 1))}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="mt-6 space-y-2.5 border-t border-gray-100 pt-5 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-gray-900 tabular-nums">{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span className="font-medium text-green-600">{CHECKOUT_CONFIG.shipping.label}</span>
                                    </div>
                                    {hasMultipleItems && (
                                        <div className="flex justify-between text-gray-400 text-xs italic">
                                            <span>Multiple items</span>
                                            <span>✓</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t border-gray-100 pt-4 text-base font-bold text-gray-900">
                                        <span>Total</span>
                                        <span className="tabular-nums">{formatPrice(total)}</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Trust badges */}
                        <div className="mt-6 space-y-3 border-t border-gray-100 pt-5">
                            <p className="flex items-center gap-2.5 text-xs text-gray-500">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50">
                                    <ShieldCheck size={15} className="text-green-600" />
                                </span>
                                Secure 256-bit SSL encrypted checkout
                            </p>
                            <p className="flex items-center gap-2.5 text-xs text-gray-500">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
                                    <CreditCard size={15} className="text-blue-600" />
                                </span>
                                Payments processed securely by Stripe
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
