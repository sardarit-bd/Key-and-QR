"use client";

import { orderService } from "@/services/order.service";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "./Loader";

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const clearCart = useCartStore((state) => state.clearCart);

    useEffect(() => {
        if (!orderId || orderId.length < 10) {
            setError("Invalid order ID");
            setLoading(false);
            return;
        }

        checkOrderStatus();
    }, [orderId]);

    const checkOrderStatus = async () => {
        try {
            const response = await orderService.getOrderStatus(orderId);
            const orderData = response.data;
            setOrder(orderData);

            if (orderData?.paymentStatus === "paid") {
                clearCart();
            }

        } catch (err) {
            console.error("Error checking order:", err);
            setError("Failed to verify order");
        } finally {
            setLoading(false);
        }
    };

    // 🔄 Loading UI
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader text="Qkey..." size={40} fullScreen={false} />
            </div>
        );
    }

    // ❌ Error UI
    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-32 px-4 text-center">
                <h2 className="text-2xl font-semibold text-red-600 mb-4">{error}</h2>
                <Link href="/shop" className="bg-black text-white px-6 py-3 rounded-lg">
                    Go to Shop
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-32 px-4 text-center">
            <div className="bg-white border border-gray-300 rounded-lg p-8 max-w-2xl mx-auto shadow-sm">

                {/* Icon */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 
                    ${order?.paymentStatus === "paid" ? "bg-green-100" : "bg-red-100"}`}>
                    <svg
                        className={`w-8 h-8 ${order?.paymentStatus === "paid" ? "text-green-600" : "text-red-600"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {order?.paymentStatus === "paid" ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        )}
                    </svg>
                </div>

                {/* Title */}
                {order?.paymentStatus === "paid" ? (
                    <h1 className="text-3xl font-bold mb-2 text-gray-900">
                        Payment Successful! 🎉
                    </h1>
                ) : (
                    <h1 className="text-3xl font-bold mb-2 text-red-600">
                        Payment Pending / Failed ❌
                    </h1>
                )}

                {/* Description */}
                <p className="text-gray-600 mb-6">
                    {order?.paymentStatus === "paid"
                        ? "Your order has been confirmed and is being processed."
                        : "Your payment is not completed yet. Please try again."}
                </p>

                {/* Order Info */}
                {order && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <p className="text-sm text-gray-500 mb-2">
                            Order ID: <span className="font-mono">{order._id}</span>
                        </p>

                        {order.assignedTag && (
                            <p className="text-sm text-gray-500 mb-2">
                                Tag ID:{" "}
                                <span className="font-mono font-semibold text-black">
                                    {typeof order.assignedTag === "object"
                                        ? order.assignedTag.tagCode || order.assignedTag._id
                                        : order.assignedTag}
                                </span>
                            </p>
                        )}

                        <p className="text-sm text-gray-500">
                            Status:{" "}
                            <span className="capitalize font-medium text-green-600">
                                {order.fulfillmentStatus}
                            </span>
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 justify-center">
                    <Link
                        href="/shop"
                        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition"
                    >
                        Continue Shopping
                    </Link>
                    <Link
                        href="/dashboard/user/orders"
                        className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition"
                    >
                        View Orders
                    </Link>
                </div>
            </div>
        </div>
    );
}