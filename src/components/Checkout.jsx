// components/Checkout.jsx
"use client";

import { orderService } from "@/services/order.service";
import Loader from "@/shared/Loader";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
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
    const { cart, clearCart } = useCartStore();

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [countryOpen, setCountryOpen] = useState(false);
    const [imageErrors, setImageErrors] = useState({});
    const [existingOrder, setExistingOrder] = useState(null);
    const [cartLoaded, setCartLoaded] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        fullName: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        country: "Select your country",
        purchaseType: "self",
        giftMessage: "",
    });

    const countries = ["Bangladesh", "India", "USA", "UK", "Australia"];

    // Debug: Check cart data
    useEffect(() => {
        console.log("Cart data in Checkout:", cart);
        setCartLoaded(true);
    }, [cart]);

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

    // Fetch existing order (for pending payment)
    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;

            try {
                setPageLoading(true);
                const response = await orderService.getOrderStatus(orderId);
                const orderData = response.data?.data || response.data;
                setExistingOrder(orderData);

                setFormData((prev) => ({
                    ...prev,
                    purchaseType: orderData?.purchaseType || "self",
                    giftMessage: orderData?.giftMessage || "",
                }));
            } catch (error) {
                console.error("Failed to load order for checkout:", error);
                toast.error(error.response?.data?.message || "Failed to load order");
            } finally {
                setPageLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    // Get checkout items
    const checkoutItems = useMemo(() => {
        if (orderId && existingOrder?.product) {
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

        // ✅ Return cart items with their quantities
        if (cart && cart.length > 0) {
            return cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                qty: item.qty || 1,
                img: item.img || PLACEHOLDER_IMAGE,
                purchaseType: item.purchaseType || "self",
                giftMessage: item.giftMessage || null,
            }));
        }
        
        return [];
    }, [orderId, existingOrder, cart]);

    const firstItem = checkoutItems?.[0];

    // Set form data from first item (for gift purchase)
    useEffect(() => {
        if (!orderId && firstItem) {
            setFormData((prev) => ({
                ...prev,
                purchaseType: firstItem.purchaseType || "self",
                giftMessage: firstItem.giftMessage || "",
            }));
        }
    }, [orderId, firstItem]);

    // Calculate totals with proper quantity
    const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
    const shippingCost = 0;
    const total = subtotal + shippingCost;

    const handleImageError = (productId) => {
        setImageErrors((prev) => ({ ...prev, [productId]: true }));
    };

    const getImageUrl = (item) => {
        if (imageErrors[item.id]) return PLACEHOLDER_IMAGE;
        return item.img || PLACEHOLDER_IMAGE;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Checkout items before submit:", checkoutItems);
        console.log("Cart before submit:", cart);

        if (checkoutItems.length === 0) {
            toast.error("Your cart is empty. Please add items before checkout.");
            router.push("/shop");
            return;
        }

        if (
            !formData.email ||
            !formData.fullName ||
            !formData.address ||
            !formData.country ||
            formData.country === "Select your country"
        ) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);

        try {
            let response;

            if (orderId) {
                response = await orderService.createCheckout({
                    orderId,
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    postalCode: formData.postalCode,
                    country: formData.country,
                });
            } else {
                // ✅ Make sure we have a valid product
                if (!firstItem || !firstItem.id) {
                    toast.error("No product found in cart");
                    setLoading(false);
                    return;
                }

                const orderPayload = {
                    productId: firstItem.id,
                    quantity: firstItem.qty || 1,
                    purchaseType: firstItem.purchaseType || formData.purchaseType || "self",
                    giftMessage: (firstItem.purchaseType || formData.purchaseType) === "gift"
                        ? firstItem.giftMessage || formData.giftMessage || null
                        : null,
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    postalCode: formData.postalCode,
                    country: formData.country,
                };

                console.log("Order payload being sent:", orderPayload);
                response = await orderService.createCheckout(orderPayload);
            }

            console.log("Checkout response:", response);

            if (response.data?.url) {
                // Clear cart after successful checkout
                if (!orderId) {
                    clearCart();
                }
                window.location.href = response.data.url;
                return;
            }

            throw new Error("No checkout URL received");
        } catch (error) {
            console.error("Checkout failed - Full error:", error);
            console.error("Error response:", error.response);
            
            let errorMessage = "Something went wrong. Please try again.";
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading || !cartLoaded) {
        return <Loader text="QKey..." size={50} fullScreen />;
    }

    if (!orderId && checkoutItems.length === 0 && cart.length === 0) {
        return (
            <section className="max-w-7xl mx-auto py-32 px-4 text-center">
                <div className="bg-gray-50 p-8 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
                    <p className="text-gray-600 mb-6">Add some products to your cart before checking out.</p>
                    <Link
                        href="/shop"
                        className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="max-w-7xl mx-auto py-16 px-4 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-52">
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
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {checkoutItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                            <Image
                                                src={getImageUrl(item)}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                onError={() => handleImageError(item.id)}
                                                unoptimized
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{item.name}</h3>
                                            <p className="text-sm text-gray-500">Qty: {item.qty || 1}</p>
                                            <p className="text-sm text-gray-500">${item.price} each</p>
                                        </div>
                                    </div>
                                    <p className="font-medium">${((item.price || 0) * (item.qty || 1)).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-300 mt-6 pt-4 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600">Free</span>
                            </div>
                            <div className="flex justify-between text-base font-semibold mt-2 border-t border-gray-300 pt-4">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-6">
                    {orderId ? "Complete Payment" : "Billing Details"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium block mb-1">Email *</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="you@example.com"
                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-black"
                        />
                    </div>

                    <div>
                        <h3 className="text-sm font-medium mb-2">Shipping Information</h3>
                        <div className="space-y-3">
                            <input
                                type="text"
                                required
                                placeholder="Full name *"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-black"
                            />

                            <input
                                type="tel"
                                placeholder="Phone number"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-black"
                            />

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setCountryOpen(!countryOpen)}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 flex justify-between items-center focus:outline-none focus:border-black"
                                >
                                    {formData.country}
                                    <ChevronDown size={18} />
                                </button>

                                {countryOpen && (
                                    <div className="absolute bg-white w-full border border-gray-300 rounded-md shadow-md mt-1 z-10">
                                        {countries.map((c) => (
                                            <p
                                                key={c}
                                                onClick={() => {
                                                    setFormData({ ...formData, country: c });
                                                    setCountryOpen(false);
                                                }}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            >
                                                {c}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <input
                                type="text"
                                required
                                placeholder="Address *"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-black"
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-black"
                                />
                                <input
                                    type="text"
                                    placeholder="Postal Code"
                                    value={formData.postalCode}
                                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-black"
                                />
                            </div>
                        </div>
                    </div>

                    {!orderId && (
                        <div>
                            <label className="text-sm font-medium block mb-2">Purchase Type</label>
                            <select
                                value={formData.purchaseType}
                                onChange={(e) => setFormData({ ...formData, purchaseType: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-black"
                            >
                                <option value="self">For myself</option>
                                <option value="gift">As a gift</option>
                            </select>

                            {formData.purchaseType === "gift" && (
                                <div className="mt-3">
                                    <label className="text-sm font-medium block mb-2">Gift Message</label>
                                    <textarea
                                        placeholder="Write your gift message here..."
                                        value={formData.giftMessage}
                                        onChange={(e) => setFormData({ ...formData, giftMessage: e.target.value })}
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-black resize-none"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || checkoutItems.length === 0}
                        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Processing..." : `${orderId ? "Pay Now" : "Place Order"} • $${total.toFixed(2)}`}
                    </button>
                </form>
            </div>
        </section>
    );
}