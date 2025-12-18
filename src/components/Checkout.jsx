"use client";

import { useCartStore } from "@/store/cartStore";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Checkout() {
    const cart = useCartStore((state) => state.cart);

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const taxRate = 0.0875;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    const [countryOpen, setCountryOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState("Select your country");

    const [paymentMethod, setPaymentMethod] = useState("cod");

    const countries = ["Bangladesh", "India", "USA", "UK", "Australia"];

    return (
        <section className="max-w-7xl mx-auto py-16 px-4 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-52">

            {/* LEFT — ORDER SUMMARY */}
            <div>
                <Link href="/cart" className="text-md text-gray-500 hover:underline mb-4 block">
                    ← Back
                </Link>

                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                <div className="space-y-4">
                    {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Image
                                    src={item.img}
                                    alt={item.name}
                                    width={60}
                                    height={60}
                                    className="rounded-lg"
                                />
                                <div>
                                    <h3 className="font-medium">{item.name}</h3>
                                    <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                                </div>
                            </div>
                            <p className="font-medium">${item.price * item.qty}.00</p>
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

                <form className="space-y-6">

                    {/* Email */}
                    <div>
                        <label className="text-sm font-medium">Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            className="w-full mt-1 border border-gray-300 rounded-md px-4 py-2"
                        />
                    </div>

                    {/* Shipping Info */}
                    <div>
                        <h3 className="text-sm font-medium mb-2">Shipping information</h3>

                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Full name"
                                className="w-full border border-gray-300 rounded-md px-4 py-2"
                            />

                            {/* CUSTOM SELECT DROPDOWN */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setCountryOpen(!countryOpen)}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 flex justify-between items-center"
                                >
                                    {selectedCountry}
                                    <ChevronDown size={18} />
                                </button>

                                {countryOpen && (
                                    <div className="absolute bg-white w-full border border-gray-300 rounded-md shadow-md mt-1 z-10">
                                        {countries.map((c) => (
                                            <p
                                                key={c}
                                                onClick={() => {
                                                    setSelectedCountry(c);
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
                                placeholder="Address"
                                className="w-full border border-gray-300 rounded-md px-4 py-2"
                            />
                        </div>

                        {/* PAYMENT METHOD TABS */}
                        <div className="mt-6">
                            <h3 className="text-sm font-medium mb-3">
                                Payment Method
                            </h3>

                            <div className="flex items-center gap-4 p-1">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("cod")}
                                    className={`flex-1 py-2 border border-gray-300 rounded-lg rounded-md text-sm font-medium transition ${paymentMethod === "cod"
                                        ? "bg-black text-white shadow-sm"
                                        : "text-gray-600"
                                        }`}
                                >
                                    Cash on Delivery
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("stripe")}
                                    className={`flex-1 py-2 border border-gray-300 rounded-lg rounded-md text-sm font-medium transition ${paymentMethod === "stripe"
                                        ? "bg-white shadow-sm"
                                        : "text-gray-600"
                                        }`}
                                >
                                    Pay with Card (Stripe)
                                </button>
                            </div>

                            {/* TAB CONTENT */}
                            <div className="mt-2">
                                {paymentMethod === "cod" && (
                                    <p className="text-sm text-gray-600">
                                        You will pay in cash after the product is delivered.
                                    </p>
                                )}

                                {paymentMethod === "stripe" && (
                                    <p className="text-sm text-gray-600">
                                        A secure popup will appear to complete your card payment.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900"
                    >
                        Place Order
                    </button>

                </form>
            </div>
        </section>
    );
}
