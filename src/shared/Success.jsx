"use client";

import { orderService } from "@/services/order.service";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "@/shared/Loader";
import PAYMENT_STATUS from "@/config/paymentStatus";

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(PAYMENT_STATUS.PENDING);

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
            setPaymentStatus(orderData?.paymentStatus || PAYMENT_STATUS.PENDING);

            // Clear cart only after successful payment
            if (orderData?.paymentStatus === PAYMENT_STATUS.SUCCEEDED) {
                clearCart();
            }
        } catch (err) {
            console.error("Error checking order:", err);
            setError("Failed to verify order");
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader text="Verifying payment..." size={40} fullScreen={false} />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-32 px-4 text-center">
                <div className="bg-red-50 rounded-lg p-8 max-w-md mx-auto">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link href="/shop" className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    const isSuccessful = paymentStatus === PAYMENT_STATUS.SUCCEEDED;

    return (
        <div className="max-w-7xl mx-auto py-32 px-4 text-center">
            <div className="bg-white border border-gray-300 rounded-lg p-8 max-w-2xl mx-auto shadow-sm">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 
                    ${isSuccessful ? "bg-green-100" : "bg-yellow-100"}`}>
                    {isSuccessful ? (
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold mb-2 text-gray-900">
                    {isSuccessful ? "Payment Successful! 🎉" : "Payment Pending"}
                </h1>

                {/* Description */}
                <p className="text-gray-600 mb-6">
                    {isSuccessful
                        ? "Your order has been confirmed and is being processed."
                        : "Your payment is being processed. You will receive a confirmation shortly."}
                </p>

                {/* Order Info */}
                {order && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <p className="text-sm text-gray-500 mb-2">
                            Order ID: <span className="font-mono">{order._id}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                            Status:{" "}
                            <span className={`capitalize font-medium ${
                                isSuccessful ? "text-green-600" : "text-yellow-600"
                            }`}>
                                {order.fulfillmentStatus || "Processing"}
                            </span>
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <Link
                        href="/shop"
                        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
                    >
                        Continue Shopping
                    </Link>
                    {isSuccessful && (
                        <Link
                            href="/dashboard/user/orders"
                            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition"
                        >
                            View Orders
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}