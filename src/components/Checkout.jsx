"use client";

import { orderService } from "@/services/order.service";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PLACEHOLDER_IMAGE = "https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image";

export default function Checkout() {
    const router = useRouter();
    const { user, accessToken } = useAuthStore();
    const cart = useCartStore((state) => state.cart);
    const clearCart = useCartStore((state) => state.clearCart);
    const [loading, setLoading] = useState(false);
    const [countryOpen, setCountryOpen] = useState(false);
    const [imageErrors, setImageErrors] = useState({});
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

    // Auto-fill user data if logged in
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                email: user.email || "",
                fullName: user.name || "",
            }));
        }
    }, [user]);

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shippingCost = 0;
    const total = subtotal + shippingCost;

    const handleImageError = (productId) => {
        setImageErrors(prev => ({ ...prev, [productId]: true }));
    };

    const getImageUrl = (item) => {
        if (imageErrors[item.id]) {
            return PLACEHOLDER_IMAGE;
        }
        return item.img || PLACEHOLDER_IMAGE;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            alert("Your cart is empty. Please add items before checkout.");
            router.push("/shop");
            return;
        }

        if (!formData.email || !formData.fullName || !formData.address || !formData.country || formData.country === "Select your country") {
            alert("Please fill in all required fields");
            return;
        }

        setLoading(true);

        try {
            const firstItem = cart[0];

            const orderPayload = {
                productId: firstItem.id,
                purchaseType: formData.purchaseType,
                giftMessage: formData.giftMessage || null,
            };

            const response = await orderService.createCheckout(orderPayload);

            if (response.data?.url) {
                window.location.href = response.data.url;
                return;
            }

            throw new Error("No checkout URL received");
        } catch (error) {
            console.error("Checkout failed:", error);
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Empty cart state
    if (cart.length === 0) {
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
            {/* LEFT — ORDER SUMMARY */}
            <div>
                <Link href="/cart" className="text-md text-gray-500 hover:underline mb-4 inline-block">
                    ← Back to Cart
                </Link>

                <h2 className="text-xl font-semibold mb-6">Order Summary ({cart.reduce((sum, i) => sum + i.qty, 0)} items)</h2>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                    <Image
                                        src={getImageUrl(item)}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                        onError={() => handleImageError(item.id)}
                                        unoptimized={true}
                                    />
                                </div>
                                <div>
                                    <h3 className="font-medium">{item.name}</h3>
                                    <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                                    <p className="text-sm text-gray-500">${item.price}</p>
                                </div>
                            </div>
                            <p className="font-medium">${(item.price * item.qty).toFixed(2)}</p>
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
            </div>

            {/* RIGHT — BILLING DETAILS */}
            <div>
                <h2 className="text-xl font-semibold mb-6">Billing Details</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
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

                    {/* Shipping Info */}
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

                            {/* Country Dropdown */}
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

                    {/* Purchase Type */}
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
                            <div className="mt-3 animate-fadeIn">
                                <label className="text-sm font-medium block mb-2">Gift Message</label>
                                <textarea
                                    placeholder="Write your gift message here..."
                                    value={formData.giftMessage}
                                    onChange={(e) => setFormData({ ...formData, giftMessage: e.target.value })}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-black resize-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    This message will be included with your gift
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Delivery Info Note */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800">
                            📦 <strong>Delivery Information:</strong> Free shipping worldwide.
                            Estimated delivery: 7-14 business days after payment confirmation.
                        </p>
                    </div>

                    {/* Order Summary for Mobile */}
                    <div className="md:hidden border-t border-gray-200 pt-4">
                        <div className="flex justify-between text-gray-600 mb-2">
                            <span>Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 mb-2">
                            <span>Shipping:</span>
                            <span className="text-green-600">Free</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold mt-2">
                            <span>Total:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Processing...
                            </div>
                        ) : (
                            `Place Order • $${total.toFixed(2)}`
                        )}
                    </button>

                    {/* Payment Info Note */}
                    <p className="text-xs text-gray-400 text-center">
                        Secure payment powered by Stripe. Your payment information is encrypted and secure.
                    </p>
                </form>
            </div>
        </section>
    );
}