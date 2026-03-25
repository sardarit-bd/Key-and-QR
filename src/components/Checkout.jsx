// components/Checkout.js
"use client";

import { orderService } from "@/services/order.service";
import { useCartStore } from "@/store/cartStore";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Checkout() {
    const router = useRouter();
    const cart = useCartStore((state) => state.cart);
    const clearCart = useCartStore((state) => state.clearCart);
    const [loading, setLoading] = useState(false);
    const [countryOpen, setCountryOpen] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        fullName: "",
        address: "",
        country: "Select your country",
        purchaseType: "self",
        giftMessage: "",
    });

    const countries = ["Bangladesh", "India", "USA", "UK", "Australia"];

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const taxRate = 0.0875;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            alert("Your cart is empty");
            return;
        }

        setLoading(true);

        try {
            // For now, we're using the first product
            // If you want multiple products, you'll need to modify backend
            const firstItem = cart[0];

            const orderPayload = {
                productId: firstItem.id,
                purchaseType: formData.purchaseType,
                giftMessage: formData.giftMessage || null,
            };

            const response = await orderService.createCheckout(orderPayload);

            if (response.data?.url) {
                // Clear cart before redirect
                clearCart();
                // Redirect to Stripe checkout
                window.location.href = response.data.url;
            } else {
                throw new Error("No checkout URL received");
            }
        } catch (error) {
            console.error("Checkout failed:", error);
            alert(error.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

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

                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                <div className="space-y-4">
                    {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Image
                                    src={item.img || "/placeholder.png"}
                                    alt={item.name}
                                    width={60}
                                    height={60}
                                    className="rounded-lg object-cover"
                                    onError={(e) => {
                                        e.target.src = "/placeholder.png";
                                    }}
                                />
                                <div>
                                    <h3 className="font-medium">{item.name}</h3>
                                    <p className="text-sm text-gray-500">Qty: {item.qty}</p>
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
                        <span>Tax (8.75%)</span>
                        <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 pb-4">
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

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
                    </button>
                </form>
            </div>
        </section>
    );
}