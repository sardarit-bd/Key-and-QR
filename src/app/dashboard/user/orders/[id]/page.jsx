"use client";

import { orderService } from "@/services/order.service";
import { useAuthStore } from "@/store/authStore";
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    Gift,
    MessageSquare,
    Package,
    Tag,
    Truck,
    User
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function OrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuthStore(); // 👈 Using user instead of accessToken
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) {
            toast.error("Please login to view order details");
            router.push("/login");
            return;
        }
        if (id) {
            fetchOrderDetails();
        }
    }, [user, id]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await orderService.getOrderStatus(id);
            console.log("Order details response:", response.data);

            // Handle different response structures
            const orderData = response.data?.data || response.data;
            setOrder(orderData);
        } catch (error) {
            console.error("Error fetching order:", error);
            const errorMessage = error.response?.data?.message || "Order not found or you don't have permission to view it";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                icon: Clock,
                color: "bg-yellow-100 text-yellow-800",
                label: "Pending",
                description: "Your order is being processed"
            },
            assigned: {
                icon: Package,
                color: "bg-blue-100 text-blue-800",
                label: "Assigned",
                description: "Your tag has been assigned"
            },
            shipped: {
                icon: Truck,
                color: "bg-purple-100 text-purple-800",
                label: "Shipped",
                description: "Your order is on the way"
            },
            delivered: {
                icon: CheckCircle,
                color: "bg-green-100 text-green-800",
                label: "Delivered",
                description: "Your order has been delivered"
            }
        };
        return configs[status] || configs.pending;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch {
            return "Invalid date";
        }
    };

    const formatPrice = (price) => {
        return `$${Number(price).toFixed(2)}`;
    };

    const calculateTotal = () => {
        if (!order?.product?.price) return 0;
        const subtotal = order.product.price;
        const tax = subtotal * 0.0875;
        return subtotal + tax;
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-16 px-4">
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading order details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="max-w-7xl mx-auto py-16 px-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <p className="text-red-600 mb-4">{error || "Order not found"}</p>
                    <Link
                        href="/dashboard/user/orders"
                        className="inline-flex items-center gap-2 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    const StatusConfig = getStatusConfig(order.fulfillmentStatus);
    const StatusIcon = StatusConfig.icon;

    return (
        <div className="py-16 px-4 md:px-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/dashboard/user/orders"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-all duration-200 hover:translate-x-[-2px]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Orders
                </Link>

                <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Order Details</h1>
                        <p className="text-gray-600 mt-2 font-mono text-sm md:text-base">
                            Order ID: #{order._id?.slice(-12).toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Left Side */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Status Card */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${StatusConfig.color}`}>
                                <StatusIcon className="w-4 h-4" />
                                {StatusConfig.label}
                            </span>
                        </div>
                        <p className="text-gray-600">{StatusConfig.description}</p>

                        {/* Status Timeline */}
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                <div className="space-y-6 relative">
                                    {[
                                        { status: "Order Placed", date: order.createdAt, icon: Clock, completed: true },
                                        { status: "Payment Confirmed", date: order.paymentStatus === "paid" ? order.updatedAt : null, icon: CreditCard, completed: order.paymentStatus === "paid" },
                                        { status: "Tag Assigned", date: order.assignedTag ? order.updatedAt : null, icon: Tag, completed: !!order.assignedTag },
                                        { status: "Shipped", date: order.fulfillmentStatus === "shipped" ? order.updatedAt : null, icon: Truck, completed: order.fulfillmentStatus === "shipped" },
                                        { status: "Delivered", date: order.fulfillmentStatus === "delivered" ? order.updatedAt : null, icon: CheckCircle, completed: order.fulfillmentStatus === "delivered" }
                                    ].map((step, index) => (
                                        <div key={index} className="flex gap-4 relative">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${step.completed ? "bg-green-100" : "bg-gray-100"}`}>
                                                <step.icon className={`w-4 h-4 ${step.completed ? "text-green-600" : "text-gray-400"}`} />
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-medium ${step.completed ? "text-gray-900" : "text-gray-500"}`}>
                                                    {step.status}
                                                </p>
                                                {step.date && (
                                                    <p className="text-sm text-gray-500">{formatDate(step.date)}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Product Details
                        </h2>

                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                                <Image
                                    src={order.product?.image?.url || "/placeholder.png"}
                                    alt={order.product?.name || "Product"}
                                    width={128}
                                    height={128}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = "/placeholder.png";
                                    }}
                                />
                            </div>

                            <div className="flex-1">
                                <h3 className="font-semibold text-xl text-gray-900 mb-2 text-center sm:text-left">
                                    {order.product?.name}
                                </h3>
                                <p className="text-gray-600 mb-4 text-sm text-center sm:text-left">
                                    {order.product?.description}
                                </p>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Price</p>
                                        <p className="font-semibold text-gray-900">{formatPrice(order.product?.price)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Quantity</p>
                                        <p className="font-semibold text-gray-900">1</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Category</p>
                                        <p className="font-semibold text-gray-900 capitalize">{order.product?.category || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Brand</p>
                                        <p className="font-semibold text-gray-900">{order.product?.brand || "InspireTag"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gift Message */}
                    {order.purchaseType === "gift" && order.giftMessage && (
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 transition-all duration-300 hover:shadow-md">
                            <div className="flex items-start gap-3">
                                <Gift className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-yellow-800 mb-2">Gift Message</h3>
                                    <p className="text-gray-700 italic">"{order.giftMessage}"</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Right Side */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-lg p-6 sticky top-6 transition-all duration-300 hover:shadow-md">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">{formatPrice(order.product?.price || 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax (8.75%)</span>
                                <span className="font-medium">{formatPrice((order.product?.price || 0) * 0.0875)}</span>
                            </div>
                            <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span className="text-xl">{formatPrice(calculateTotal())}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Information */}
                    <div className="bg-gray-50 rounded-lg p-6 transition-all duration-300 hover:shadow-md">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Order Information
                        </h2>

                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-500 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Order Date
                                </p>
                                <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Last Updated
                                </p>
                                <p className="font-medium text-gray-900">{formatDate(order.updatedAt)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    Purchase Type
                                </p>
                                <p className="font-medium text-gray-900 capitalize">
                                    {order.purchaseType === "gift" ? (
                                        <span className="inline-flex items-center gap-1">
                                            <Gift className="w-3 h-3" />
                                            Gift
                                        </span>
                                    ) : (
                                        "For Myself"
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 flex items-center gap-1">
                                    <CreditCard className="w-3 h-3" />
                                    Payment Method
                                </p>
                                <p className="font-medium text-gray-900">Stripe (Card)</p>
                            </div>
                        </div>
                    </div>

                    {/* Need Help */}
                    {/* <div className="bg-gray-50 rounded-lg p-6 transition-all duration-300 hover:shadow-md">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h2>
                        <p className="text-sm text-gray-600 mb-3">
                            Having issues with your order? Contact our support team.
                        </p>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-all duration-200 group"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Contact Support
                            <ArrowLeft className="w-3 h-3 rotate-180 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div> */}
                </div>
            </div>
        </div>
    );
}