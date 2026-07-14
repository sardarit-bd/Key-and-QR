"use client";

import { orderService } from "@/services/order.service";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function CancelPage() {
    return (
        <Suspense fallback={<div className="py-32 text-center">Loading...</div>}>
            <CancelPageContent />
        </Suspense>
    );
}

function CancelPageContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (orderId && orderId.length > 10) {
            const cancelOrder = async () => {
                try {
                    setIsProcessing(true);
                    await orderService.cancelOrder(orderId, "Payment cancelled by customer");
                } catch (error) {
                    console.error("Failed to cancel order:", error);
                } finally {
                    setIsProcessing(false);
                }
            };
            cancelOrder();
        }
    }, [orderId]);

    return (
        <div className="max-w-7xl mx-auto py-32 px-4 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold mb-2 text-gray-900">
                    Payment Cancelled
                </h1>

                <p className="text-gray-600 mb-6">
                    {isProcessing
                        ? "Processing cancellation..."
                        : "Your payment was cancelled. No charges were made to your account."}
                </p>

                <div className="flex flex-wrap gap-4 justify-center">
                    <Link
                        href="/checkout"
                        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
                    >
                        {isProcessing ? "Processing..." : "Try Again"}
                    </Link>
                    <Link
                        href="/cart"
                        className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition"
                    >
                        Return to Cart
                    </Link>
                    <Link
                        href="/shop"
                        className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}