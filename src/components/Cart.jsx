"use client";

import { useCartStore } from "@/store/cartStore";
import { Trash2 } from "lucide-react";
import Image from "next/image";

export default function Cart() {
    const { cart, increaseQty, decreaseQty, removeItem } = useCartStore();

    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    return (
        <section className="max-w-7xl mx-auto my-18 px-4 grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* LEFT SIDE */}
            <div className="lg:col-span-2">
                <div className="bg-gray-100 shadow rounded-xl divide-y divide-gray-300 p-3">

                    {cart.length === 0 && (
                        <p className="p-6 text-center text-gray-500">
                            Your cart is empty.
                        </p>
                    )}

                    {cart.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col md:flex-row items-center gap-8 justify-between p-4"
                        >
                            {/* Image + text */}
                            <div className="flex items-center gap-4 w-full">
                                <Image
                                    src={item.img}
                                    alt={item.name}
                                    width={50}
                                    height={50}
                                    className="rounded-md"
                                />

                                <div>
                                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                                    <p className="text-gray-400 text-sm">${item.price}.00</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 w-full justify-start md:justify-end">
                                {/* Quantity */}
                                <div className="flex items-center gap-3 border-2 border-gray-400 rounded-lg w-[130px] mr-5">
                                    <button
                                        onClick={() => decreaseQty(item.id)}
                                        className="px-3 py-1"
                                    >
                                        –
                                    </button>

                                    <span className="w-6 text-center">{item.qty}</span>

                                    <button
                                        onClick={() => increaseQty(item.id)}
                                        className="px-3 py-1"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Total per item */}
                                <p className="font-medium text-gray-800 w-[130px]">
                                    ${item.price * item.qty}.00
                                </p>

                                {/* Remove */}
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="text-red-500 hover:text-red-600 w-fit"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>


                        </div>
                    ))}

                </div>
            </div>

            {/* RIGHT SUMMARY */}
            <div className="p-6 bg-gray-100 rounded-xl h-fit">
                <h3 className="text-lg font-semibold mb-4">Cart Total</h3>

                <div className="flex justify-between text-gray-700 py-2 border-b border-gray-300">
                    <span>Subtotal:</span>
                    <span>${subtotal}.00</span>
                </div>

                <div className="flex justify-between text-gray-700 py-2 border-b border-gray-300">
                    <span>Shipping:</span>
                    <span className="text-green-600">Free</span>
                </div>

                <div className="flex justify-between text-gray-900 py-3 font-medium">
                    <span>Total:</span>
                    <span>${subtotal}.00</span>
                </div>

                <div className="mt-5">
                    <button className="w-full bg-black text-white py-3 text-center px-6 rounded-lg hover:bg-gray-900">
                        Proceed to checkout
                    </button>
                </div>
            </div>

        </section>
    );
}
