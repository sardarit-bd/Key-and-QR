"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { ProductImage } from "@/components/ui/ProductImage";
import { Minus, Plus, Trash2, ShoppingBag, ShieldCheck, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import CartSkeleton from "@/components/skeletons/CartSkeleton";
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
    const reduceMotion = useReducedMotion();

    const [mounted, setMounted] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [removingId, setRemovingId] = useState(null);

    // Hydration guard — show skeleton for one frame to avoid flash.
    useEffect(() => {
        setMounted(true);
    }, []);

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
    const handleIncrease = async (id, name, itemStock) => {
        const item = cart.find((i) => i.id === id);
        const currentQty = item?.qty || 1;
        const availableStock = typeof itemStock === "number" ? itemStock : (item?.stock ?? item?.stockQuantity);

        if (typeof availableStock === "number" && currentQty >= availableStock) {
            toast.error(`Only ${availableStock} items left in stock`);
            return;
        }

        setIsLoading(true);
        try {
            const res = await increaseQty(id);
            if (res && !res.success) {
                toast.error(res.error || "Maximum stock limit reached");
            }
        } catch (error) {
            toast.error(error?.message || "Failed to update quantity");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle remove item
    const handleRemove = (id, name) => {
        setRemovingId(id);
        // Slight delay so the removal animation is visible
        setTimeout(() => {
            removeItem(id);
            setRemovingId(null);
            toast.success(`${name} removed from cart`);
        }, 200);
    };

    // Hydration guard — show skeleton for one frame to avoid flash.
    if (!mounted) {
        return <CartSkeleton />;
    }

    if (!hasItems()) {
        return (
            <section className="mx-auto max-w-7xl my-16 sm:my-20 px-4 sm:px-6">
                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center justify-center rounded-3xl border border-[#EDE4D0]/70 bg-white px-6 py-20 text-center"
                >
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F5EDDC] shadow-[0_8px_30px_-8px_rgba(60_45_15/0.12)]">
                        <ShoppingBag size={34} className="text-[#A6782B]" />
                    </div>
                    <h2 className="mt-6 text-2xl font-bold tracking-tight text-[#2E2A24]">
                        Your cart is empty
                    </h2>
                    <p className="mt-2 max-w-sm text-sm text-[#8A7A5C]">
                        Looks like you haven't added anything yet. Explore our collection and find your next inspiration.
                    </p>
                    <Link
                        href="/shop"
                        className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#2E2A24] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1F1C18] active:scale-95 cursor-pointer"
                    >
                        Start Shopping
                        <ArrowRight size={16} />
                    </Link>
                </motion.div>
            </section>
        );
    }

    return (
        <section className="bg-[#FDFBF6] text-[#2E2A24] pb-16 sm:pb-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                {/* Header */}
                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-8 flex flex-wrap items-center justify-between gap-4"
                >
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2E2A24]">
                            Shopping Cart
                        </h1>
                        <p className="mt-1 text-sm text-[#8A7A5C]">
                            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
                        </p>
                    </div>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#A99B7F] transition-colors hover:text-[#A6782B] cursor-pointer"
                    >
                        Continue shopping
                        <ArrowRight size={15} />
                    </Link>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
                    {/* LEFT: Cart Items */}
                    <div className="lg:col-span-2">
                        {isValidating && (
                            <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#F5EDDC]/50 px-4 py-3 text-sm text-[#8A7A5C]">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C6922D] opacity-60" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C6922D]" />
                                </span>
                                Validating stock...
                            </div>
                        )}

                        <div className="space-y-4">
                            <AnimatePresence>
                                {cart.map((item) => {
                                    const itemStock = typeof item.stock === "number" ? item.stock : (typeof item.stockQuantity === "number" ? item.stockQuantity : null);
                                    const isMaxStock = typeof itemStock === "number" && item.qty >= itemStock;

                                    return (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={reduceMotion ? undefined : { opacity: 0, x: -24 }}
                                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                            className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-[#EDE4D0]/80 bg-white p-4 shadow-[0_2px_12px_-4px_rgb(60_45_15/0.06)] transition-all duration-300 hover:border-[#C6922D]/30 hover:shadow-[0_16px_36px_-16px_rgb(60_45_15/0.2)]"
                                        >
                                            {/* Image + Info */}
                                            <div className="flex flex-1 items-center gap-4 min-w-0">
                                                <Link href={`/shop/${item.id}`} className="shrink-0 cursor-pointer">
                                                    <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-[#F5F0E4]">
                                                        <ProductImage
                                                            src={item.img}
                                                            alt={item.name}
                                                            width={80}
                                                            height={80}
                                                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                                            fill={false}
                                                        />
                                                    </div>
                                                </Link>

                                                <div className="min-w-0 flex-1">
                                                    <Link href={`/shop/${item.id}`} className="cursor-pointer">
                                                        <h3 className="truncate text-[15px] font-semibold text-[#2E2A24] transition-colors hover:text-[#A6782B]">
                                                            {item.name}
                                                        </h3>
                                                    </Link>
                                                    <p className="mt-1 text-sm font-medium text-[#5C5346]">
                                                        ${Number(item.price).toFixed(2)}
                                                    </p>
                                                    {item.purchaseType === "gift" && (
                                                        <span className="mt-1.5 inline-flex items-center rounded-full bg-[#FCE8E8] px-2 py-0.5 text-[11px] font-semibold text-[#C25B5B]">
                                                            Gift
                                                        </span>
                                                    )}
                                                    {isMaxStock && (
                                                        <p className="mt-1.5 text-[11.5px] font-medium text-[#C25B5B] flex items-center gap-1">
                                                            <span>Max limit reached ({itemStock} available)</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Controls */}
                                            <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
                                                {/* Quantity */}
                                                <div className="flex items-center overflow-hidden rounded-lg border border-[#E5DCC8] bg-white">
                                                    <button
                                                        onClick={() => decreaseQty(item.id)}
                                                        className="flex h-9 w-9 items-center justify-center text-[#8A7A5C] transition-colors hover:bg-[#F5EDDC] hover:text-[#2E2A24] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                                                        disabled={isLoading || item.qty <= 1}
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus size={15} />
                                                    </button>
                                                    <span className="w-9 text-center text-sm font-semibold text-[#2E2A24] tabular-nums" aria-live="polite">
                                                        {item.qty}
                                                    </span>
                                                    <button
                                                        onClick={() => handleIncrease(item.id, item.name, itemStock)}
                                                        className="flex h-9 w-9 items-center justify-center text-[#8A7A5C] transition-colors hover:bg-[#F5EDDC] hover:text-[#2E2A24] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                                                        disabled={isLoading || isMaxStock}
                                                        title={isMaxStock ? `Maximum limit reached (${itemStock} available)` : "Increase quantity"}
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus size={15} />
                                                    </button>
                                                </div>

                                                {/* Line total + remove */}
                                                <div className="flex items-center gap-4">
                                                    <p className="w-20 text-right font-semibold text-[#2E2A24] tabular-nums">
                                                        ${(item.price * item.qty).toFixed(2)}
                                                    </p>
                                                    <button
                                                        onClick={() => handleRemove(item.id, item.name)}
                                                        className="flex h-9 w-9 items-center justify-center rounded-full text-[#C25B5B] transition-all duration-200 hover:bg-[#FCE8E8] hover:text-[#C25B5B] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                                                        disabled={isLoading || removingId === item.id}
                                                        aria-label="Remove item"
                                                    >
                                                        {removingId === item.id ? (
                                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#C25B5B]/40 border-t-transparent" />
                                                        ) : (
                                                            <Trash2 size={17} />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* RIGHT: Sticky Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl border border-[#EDE4D0]/80 bg-white p-6 shadow-[0_12px_40px_-16px_rgb(60_45_15/0.12)] lg:sticky lg:top-8">
                            <h3 className="text-lg font-bold tracking-tight text-[#2E2A24]">
                                Order Summary
                            </h3>

                            <div className="mt-5 space-y-3 text-sm">
                                <div className="flex justify-between text-[#8A7A5C]">
                                    <span>Subtotal ({totalItems} items)</span>
                                    <span className="font-medium text-[#2E2A24] tabular-nums">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[#8A7A5C]">
                                    <span>Shipping</span>
                                    <span className="font-medium text-[#2E5B3A]">Free</span>
                                </div>

                                <div className="flex justify-between border-t border-[#EDE4D0]/70 pt-4 text-base font-bold text-[#2E2A24]">
                                    <span>Total</span>
                                    <span className="tabular-nums">${subtotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Link href="/checkout" className="block">
                                    <button
                                        disabled={isValidating || isLoading}
                                        className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 text-sm font-semibold transition-all duration-300 ${
                                            isValidating || isLoading
                                                ? "bg-[#EDE4D0] text-[#A99B7F] cursor-not-allowed"
                                                : "bg-[#2E2A24] text-white hover:bg-[#1F1C18] active:scale-[0.99] cursor-pointer"
                                        }`}
                                    >
                                        {isValidating ? (
                                            "Validating stock..."
                                        ) : (
                                            <>
                                                Proceed to Checkout
                                                <ArrowRight size={16} />
                                            </>
                                        )}
                                    </button>
                                </Link>
                            </div>

                            {/* Trust badges */}
                            <div className="mt-6 space-y-2.5 border-t border-[#EDE4D0]/70 pt-5">
                                <p className="flex items-center gap-2 text-xs text-[#8A7A5C]">
                                    <ShieldCheck size={14} className="text-[#2E5B3A]" />
                                    Secure 256-bit SSL encrypted checkout
                                </p>
                                <p className="flex items-center gap-2 text-xs text-[#8A7A5C]">
                                    <Lock size={14} className="text-[#A99B7F]" />
                                    Payments processed securely by Stripe
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
