"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { ProductImage } from "@/components/ui/ProductImage";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function Cart() {
    const {
        cart,
        increaseQty,
        decreaseQty,
        removeItem,
        getTotalPrice,
        getTotalQuantity,
        hasItems,
        validateStock
    } = useCartStore();

    const [isValidating, setIsValidating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const subtotal = getTotalPrice();
    const totalItems = getTotalQuantity();

    // Validate cart on load
    useEffect(() => {
        const checkStock = async () => {
            setIsValidating(true);
            const errors = await validateStock();
            if (errors.length > 0) {
                for (const error of errors) {
                    toast.error(
                        `${error.name}: Only ${error.available} available, you have ${error.requested} in cart`
                    );
                }
            }
            setIsValidating(false);
        };
        checkStock();
    }, []);

    // Handle quantity increase with stock check
    const handleIncrease = async (id) => {
        setIsLoading(true);
        try {
            await increaseQty(id);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle remove item
    const handleRemove = (id, name) => {
        removeItem(id);
        toast.success(`${name} removed from cart`);
    };

    if (!hasItems()) {
        return (
            <section className="max-w-7xl mx-auto my-18 px-4">
                <div className="bg-gray-100 shadow rounded-xl p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <ShoppingBag size={48} className="text-gray-300" />
                        <p className="text-gray-500">Your cart is empty.</p>
                        <Link
                            href="/shop"
                            className="inline-block bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
                        >
                            Start Shopping
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="max-w-7xl mx-auto my-18 px-4 grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* LEFT: Cart Items */}
            <div className="lg:col-span-2">
                <div className="bg-gray-100 shadow rounded-xl divide-y divide-gray-300 p-3">
                    <div className="flex justify-between items-center px-4 py-2">
                        <h2 className="text-lg font-semibold">Your Cart ({totalItems} items)</h2>
                        {isValidating && (
                            <span className="text-sm text-gray-500">Validating stock...</span>
                        )}
                    </div>

                    {cart.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col md:flex-row items-center gap-8 justify-between p-4"
                        >
                            {/* Image + Name */}
                            <div className="flex items-center gap-4 w-full">
                                <div className="relative w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                    <ProductImage
                                        src={item.img}
                                        alt={item.name}
                                        width={64}
                                        height={64}
                                        className="object-cover"
                                        fill={false}
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-800 truncate">{item.name}</h3>
                                    <p className="text-gray-400 text-sm">${item.price.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-5 w-full justify-start md:justify-end">
                                {/* Quantity */}
                                <div className="flex items-center gap-3 p-1 border-2 border-gray-400 rounded-lg">
                                    <button
                                        onClick={() => decreaseQty(item.id)}
                                        className="px-3 py-1 cursor-pointer hover:bg-gray-200 rounded transition disabled:opacity-50"
                                        disabled={isLoading}
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus size={16} />
                                    </button>

                                    <span className="w-6 text-center font-medium">{item.qty}</span>

                                    <button
                                        onClick={() => handleIncrease(item.id)}
                                        className="px-3 py-1 cursor-pointer hover:bg-gray-200 rounded transition disabled:opacity-50"
                                        disabled={isLoading}
                                        aria-label="Increase quantity"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                {/* Total per item */}
                                <p className="font-medium text-gray-800 w-[100px] text-right">
                                    ${(item.price * item.qty).toFixed(2)}
                                </p>

                                {/* Remove */}
                                <button
                                    onClick={() => handleRemove(item.id, item.name)}
                                    className="text-red-500 hover:text-red-600 transition cursor-pointer p-2 hover:bg-red-50 rounded-full"
                                    disabled={isLoading}
                                    aria-label="Remove item"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: Order Summary */}
            <div className="p-6 bg-gray-100 rounded-xl h-fit">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

                <div className="flex justify-between text-gray-700 py-2 border-b border-gray-300">
                    <span>Subtotal ({totalItems} items):</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-700 py-2 border-b border-gray-300">
                    <span>Shipping:</span>
                    <span className="text-green-600">Free</span>
                </div>

                <div className="flex justify-between text-gray-900 py-3 font-medium text-lg">
                    <span>Total:</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="mt-5">
                    <Link href="/checkout">
                        <button
                            disabled={isValidating || isLoading}
                            className={`w-full py-3 text-center px-6 rounded-lg transition ${isValidating || isLoading
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-black text-white hover:bg-gray-800 cursor-pointer"
                                }`}
                        >
                            {isValidating ? "Validating stock..." : "Proceed to Checkout"}
                        </button>
                    </Link>
                </div>

                {isValidating && (
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        Checking stock availability...
                    </p>
                )}
            </div>
        </section>
    );
}