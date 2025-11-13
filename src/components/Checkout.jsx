"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";

export default function Checkout() {
    const cart = useCartStore((state) => state.cart);

    // price calculations
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const taxRate = 0.0875; // 8.75%
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return (
        <section className="max-w-6xl mx-auto py-12 px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-12">

            {/* LEFT — ORDER SUMMARY */}
            <div>
                <Link href="/cart" className="text-sm text-gray-500 hover:underline mb-4 block">
                    ← Back
                </Link>

                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                {/* Cart Items */}
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

                {/* Price Breakdown */}
                <div className="border-t mt-6 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-gray-600">
                        <span>Tax (8.75%)</span>
                        <span>${tax.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span className="text-green-600">Free</span>
                    </div>

                    <div className="flex justify-between text-base font-semibold mt-2">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* RIGHT — BILLING DETAILS */}
            <div>
                <h2 className="text-xl font-semibold mb-6">Billing Details</h2>

                <form className="space-y-6">

                    {/* Contact info */}
                    <div>
                        <label className="text-sm font-medium">Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            className="w-full mt-1 border rounded-md px-4 py-2"
                        />
                    </div>

                    {/* PAYMENT METHOD */}
                    <div>
                        <label className="text-sm font-medium">Payment method</label>

                        <div className="space-y-2 mt-2">
                            <button
                                type="button"
                                className="flex items-center justify-between w-full border rounded-md px-4 py-3 hover:bg-gray-50"
                            >
                                <span>💳 Card</span>
                            </button>

                            <button
                                type="button"
                                className="flex items-center justify-between w-full border rounded-md px-4 py-3 hover:bg-gray-50"
                            >
                                <span>🏦 Bank</span>
                            </button>

                            <button
                                type="button"
                                className="flex items-center justify-between w-full border rounded-md px-4 py-3 hover:bg-gray-50"
                            >
                                <span>… More</span>
                                <span className="text-gray-400">Visa | Amex | Bkash | Nagad</span>
                            </button>
                        </div>
                    </div>

                    {/* Shipping Information */}
                    <div>
                        <h3 className="text-sm font-medium mb-2">Shipping information</h3>

                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Full name"
                                className="w-full border rounded-md px-4 py-2"
                            />

                            <select className="w-full border rounded-md px-4 py-2">
                                <option>Select your country</option>
                                <option>Bangladesh</option>
                                <option>India</option>
                                <option>USA</option>
                            </select>

                            <input
                                type="text"
                                placeholder="Address"
                                className="w-full border rounded-md px-4 py-2"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 mt-4"
                    >
                        Place Order
                    </button>

                </form>
            </div>

        </section>
    );
}
