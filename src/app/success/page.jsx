"use client";

import { orderService } from "@/services/order.service";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get("orderId");
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            checkOrderStatus();
        } else {
            setLoading(false);
        }
    }, [orderId]);

    const checkOrderStatus = async () => {
        try {
            const response = await orderService.getOrderStatus(orderId);
            setOrder(response.data);
        } catch (error) {
            console.error("Error checking order:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-32 px-4 text-center">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600">Verifying your order...</p>
            </div>
        );
    }

    const getTagInfo = () => {
        if (!order?.assignedTag) return null;

        if (typeof order.assignedTag === 'object') {
            return order.assignedTag.tagCode || order.assignedTag._id;
        }
        return order.assignedTag;
    };

    return (
        <div className="max-w-7xl mx-auto py-32 px-4 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold mb-2 text-gray-900">
                    Payment Successful! 🎉
                </h1>
                <p className="text-gray-600 mb-4">
                    Your order has been confirmed and is being processed.
                </p>

                {order && (
                    <div className="bg-white rounded-lg p-4 mb-6 text-left">
                        <p className="text-sm text-gray-500 mb-2">
                            Order ID: <span className="font-mono">{order._id}</span>
                        </p>

                        {order.assignedTag && (
                            <p className="text-sm text-gray-500 mb-2">
                                Your Tag ID:{" "}
                                <span className="font-mono font-semibold text-black">
                                    {typeof order.assignedTag === 'object'
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

                <p className="text-gray-500 mb-6">
                    A confirmation email has been sent to your email address.
                </p>

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