"use client";

import { orderService } from "@/services/order.service";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import PAYMENT_STATUS from "@/config/paymentStatus";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    CheckCircle2,
    Clock,
    Lock,
    ArrowRight,
    ShoppingBag,
    RefreshCw,
    AlertCircle,
} from "lucide-react";

const MAX_POLL_ATTEMPTS = 5;
const POLL_INTERVAL_MS = 2000;

export default function SuccessPage() {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const token = searchParams.get("token");

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPolling, setIsPolling] = useState(false);
    const [pollAttempt, setPollAttempt] = useState(0);
    const [error, setError] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(PAYMENT_STATUS.PENDING);

    const clearCart = useCartStore((state) => state.clearCart);
    const pollTimerRef = useRef(null);

    const stopPolling = useCallback(() => {
        if (pollTimerRef.current) {
            clearTimeout(pollTimerRef.current);
            pollTimerRef.current = null;
        }
        setIsPolling(false);
    }, []);

    const checkOrderStatus = useCallback(async (attempt = 1) => {
        if (!orderId) return;

        try {
            // Attempt active verification via backend payment service if available
            try {
                await orderService.verifyPaymentStatus(orderId);
            } catch {
                // Ignore verification endpoint errors and continue fetching order
            }

            const response = await orderService.getOrderStatus(orderId, token);
            const orderData = response?.data || response;
            setOrder(orderData);

            const status = orderData?.paymentStatus || PAYMENT_STATUS.PENDING;
            setPaymentStatus(status);

            // Once paid, clean up polling, clear cart, and invalidate caches
            if (status === PAYMENT_STATUS.SUCCEEDED) {
                stopPolling();
                clearCart();
                queryClient.invalidateQueries({ queryKey: ["products"] });
                queryClient.invalidateQueries({ queryKey: ["admin-products"] });
                queryClient.invalidateQueries({ queryKey: ["user-orders"] });
                setLoading(false);
                return;
            }

            // If still pending and attempts remain, poll every 2 seconds up to 5 times
            if (status === PAYMENT_STATUS.PENDING && attempt < MAX_POLL_ATTEMPTS) {
                setIsPolling(true);
                setPollAttempt(attempt);
                stopPolling();
                pollTimerRef.current = setTimeout(() => {
                    checkOrderStatus(attempt + 1);
                }, POLL_INTERVAL_MS);
            } else {
                stopPolling();
                setLoading(false);
            }
        } catch (err) {
            console.error("Error checking order status:", err);
            if (attempt === 1) {
                setError("Failed to verify order details");
            }
            stopPolling();
            setLoading(false);
        }
    }, [orderId, token, clearCart, queryClient, stopPolling]);

    useEffect(() => {
        if (!orderId || orderId.length < 10) {
            setError("Invalid order ID");
            setLoading(false);
            return;
        }

        checkOrderStatus(1);

        return () => {
            stopPolling();
        };
    }, [orderId, checkOrderStatus, stopPolling]);

    const isSuccessful = paymentStatus === PAYMENT_STATUS.SUCCEEDED;

    return (
        <section className="min-h-[75vh] flex items-center justify-center py-12 px-4 bg-gradient-to-b from-[#FDFBF7] to-[#F7F4EC]/60 dark:from-neutral-950 dark:to-neutral-900 text-[#2E2A24] dark:text-neutral-100">
            <AnimatePresence mode="wait">
                {/* 1. Verifying Loader Card */}
                {loading && (
                    <motion.div
                        key="verifying-card"
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -12 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-10 shadow-xl shadow-black/5 dark:shadow-black/20 text-center relative overflow-hidden"
                    >
                        {/* Golden star / sparkle icon with pulsating ring & smooth spinner */}
                        <div className="relative mb-6 mx-auto flex h-20 w-20 items-center justify-center">
                            <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
                            <div className="absolute -inset-1 rounded-full border border-amber-400/30 animate-pulse opacity-50" />
                            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-500 border-r-amber-400/50 animate-spin" />
                            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-50 to-amber-100/70 dark:from-neutral-800 dark:to-neutral-900 shadow-inner">
                                <Sparkles className="h-7 w-7 text-amber-500 fill-amber-400/25 animate-pulse" />
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight mb-2">
                            Verifying Payment...
                        </h2>

                        {/* Subtitle */}
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
                            Please wait a moment while we confirm your transaction with Stripe. Do not refresh this page.
                        </p>

                        {/* Subtle Polling Attempt Indicator */}
                        {isPolling && pollAttempt > 0 && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 text-xs font-medium mb-4">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                                </span>
                                <span>Confirming status ({pollAttempt} of {MAX_POLL_ATTEMPTS})</span>
                            </div>
                        )}

                        {/* Brand Tag at the bottom */}
                        <div className="pt-5 mt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                            <Lock size={12} className="text-amber-500/80" />
                            <span>Secured by Stripe • MyInspireTag</span>
                        </div>
                    </motion.div>
                )}

                {/* 2. Error Card */}
                {!loading && error && (
                    <motion.div
                        key="error-card"
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -12 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-10 shadow-xl shadow-black/5 dark:shadow-black/20 text-center relative overflow-hidden"
                    >
                        <div className="relative mb-6 mx-auto flex h-20 w-20 items-center justify-center">
                            <div className="absolute inset-0 rounded-full bg-rose-400/20 blur-xl" />
                            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-300/40 bg-gradient-to-br from-rose-50 to-rose-100/70 dark:from-neutral-800 dark:to-neutral-900 shadow-inner">
                                <AlertCircle className="h-7 w-7 text-rose-500" />
                            </div>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight mb-2">
                            Something Went Wrong
                        </h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
                            {error}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setError(null);
                                    setLoading(true);
                                    checkOrderStatus(1);
                                }}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#2E2A24] hover:bg-[#1F1C18] text-white px-6 py-3 rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
                            >
                                <RefreshCw size={15} />
                                <span>Try Again</span>
                            </button>
                            <Link
                                href="/shop"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 px-6 py-3 rounded-xl font-medium text-sm transition-all active:scale-95 cursor-pointer"
                            >
                                <span>Continue Shopping</span>
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* 3. Verified Success / Pending Status Card */}
                {!loading && !error && (
                    <motion.div
                        key="status-card"
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -12 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-xl w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-10 shadow-xl shadow-black/5 dark:shadow-black/20 text-center relative"
                    >
                        {/* Status Icon */}
                        <div className="relative mb-6 mx-auto flex h-20 w-20 items-center justify-center">
                            {isSuccessful ? (
                                <>
                                    <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl animate-pulse" />
                                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-300/40 bg-gradient-to-br from-emerald-50 to-emerald-100/70 dark:from-emerald-950/40 dark:to-neutral-900 shadow-inner">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl" />
                                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-50 to-amber-100/70 dark:from-amber-950/40 dark:to-neutral-900 shadow-inner">
                                        <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-2">
                            {isSuccessful
                                ? "Payment Successful! 🎉"
                                : isPolling
                                    ? "Confirming Payment..."
                                    : "Payment Pending"}
                        </h1>

                        {/* Subtitle */}
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6 max-w-md mx-auto">
                            {isSuccessful
                                ? "Your order has been confirmed and is being processed with love and inspiration."
                                : isPolling
                                    ? `Verifying payment with Stripe... (Attempt ${pollAttempt} of ${MAX_POLL_ATTEMPTS})`
                                    : "Your payment is being processed. If you just completed payment, click Refresh Status below."}
                        </p>

                        {/* Order Details Card */}
                        {order && (
                            <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-5 mb-6 text-left border border-neutral-100 dark:border-neutral-700/60 space-y-2.5">
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                    <span className="text-neutral-500 dark:text-neutral-400 font-medium">Order Reference</span>
                                    <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                                        {order._id}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                    <span className="text-neutral-500 dark:text-neutral-400 font-medium">Payment Status</span>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                        isSuccessful
                                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                                            : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60"
                                    }`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${isSuccessful ? "bg-emerald-500" : "bg-amber-500"}`} />
                                        {order.paymentStatus || "pending"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                    <span className="text-neutral-500 dark:text-neutral-400 font-medium">Fulfillment</span>
                                    <span className="font-medium capitalize text-neutral-700 dark:text-neutral-300">
                                        {order.fulfillmentStatus || "Processing"}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            {!isSuccessful && (
                                <button
                                    type="button"
                                    onClick={() => checkOrderStatus(1)}
                                    disabled={isPolling}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#C6922D] hover:bg-[#A6782B] text-white px-6 py-3 rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50 cursor-pointer"
                                >
                                    <RefreshCw size={15} className={isPolling ? "animate-spin" : ""} />
                                    <span>{isPolling ? "Checking..." : "Refresh Status"}</span>
                                </button>
                            )}
                            {isSuccessful && (
                                <Link
                                    href="/dashboard/user/orders"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#2E2A24] hover:bg-[#1F1C18] text-white px-6 py-3 rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
                                >
                                    <span>View Orders</span>
                                    <ArrowRight size={15} />
                                </Link>
                            )}
                            <Link
                                href="/shop"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 px-6 py-3 rounded-xl font-medium text-sm transition-all active:scale-95 cursor-pointer"
                            >
                                <ShoppingBag size={15} />
                                <span>Continue Shopping</span>
                            </Link>
                        </div>

                        {/* Brand Tag at the bottom */}
                        <div className="pt-6 mt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                            <Lock size={12} className="text-neutral-400 dark:text-neutral-500" />
                            <span>Secured by Stripe • MyInspireTag</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
