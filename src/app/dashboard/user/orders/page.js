"use client";

import { orderService } from "@/services/order.service";
import { authStore } from "@/store/authStore";
import {
    AlertCircle,
    ArrowRight,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    Eye,
    Package,
    ShoppingBag,
    Tag,
    Truck
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = authStore.getState().accessToken;
        if (!token) {
            router.push("/login");
            return;
        }

        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderService.getUserOrders();
            setOrders(response.data || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setError(error.response?.data?.message || "Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "pending":
                return <Clock className="w-3.5 h-3.5" />;
            case "assigned":
                return <Package className="w-3.5 h-3.5" />;
            case "shipped":
                return <Truck className="w-3.5 h-3.5" />;
            case "delivered":
                return <CheckCircle className="w-3.5 h-3.5" />;
            default:
                return <Package className="w-3.5 h-3.5" />;
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            assigned: "bg-blue-100 text-blue-800",
            shipped: "bg-purple-100 text-purple-800",
            delivered: "bg-green-100 text-green-800",
            paid: "bg-green-100 text-green-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getPaymentBadge = (status) => {
        if (status === "paid") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3" />
                    Paid
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                <Clock className="w-3 h-3" />
                Pending
            </span>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatPrice = (price) => {
        return `$${Number(price).toFixed(2)}`;
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-16 px-4">
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading your orders...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-16 px-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={fetchOrders}
                        className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 inline-flex items-center gap-2"
                    >
                        Try Again
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-16 px-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="w-8 h-8" />
                        My Orders
                    </h1>
                    <p className="text-gray-600 mt-2">View and track all your orders</p>
                </div>
                {orders.length > 0 && (
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <p className="text-sm text-gray-600">
                            Total: <span className="font-semibold text-gray-900">{orders.length}</span> orders
                        </p>
                    </div>
                )}
            </div>

            {orders.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-12 text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                        No orders yet
                    </h2>
                    <p className="text-gray-500 mb-6">
                        You haven't placed any orders yet. Start shopping!
                    </p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition"
                    >
                        Start Shopping
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Product
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            Date
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="w-4 h-4" />
                                            Amount
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        <div className="flex items-center gap-1">
                                            <CreditCard className="w-4 h-4" />
                                            Payment
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        <div className="flex items-center gap-1">
                                            <Tag className="w-4 h-4" />
                                            Tag
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition">
                                        {/* Order ID */}
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm text-gray-900">
                                                #{order._id.slice(-8).toUpperCase()}
                                            </span>
                                        </td>

                                        {/* Product */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={order.product?.image?.url || "/placeholder.png"}
                                                        alt={order.product?.name || "Product"}
                                                        width={40}
                                                        height={40}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = "/placeholder.png";
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">
                                                        {order.product?.name?.length > 30
                                                            ? order.product.name.slice(0, 30) + "..."
                                                            : order.product?.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Qty: 1
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </td>

                                        {/* Amount */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {formatPrice(order.product?.price || 0)}
                                            </p>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                                    order.fulfillmentStatus
                                                )}`}
                                            >
                                                {getStatusIcon(order.fulfillmentStatus)}
                                                {order.fulfillmentStatus === "assigned" && "Assigned"}
                                                {order.fulfillmentStatus === "pending" && "Pending"}
                                                {order.fulfillmentStatus === "shipped" && "Shipped"}
                                                {order.fulfillmentStatus === "delivered" && "Delivered"}
                                                {!["assigned", "pending", "shipped", "delivered"].includes(order.fulfillmentStatus) &&
                                                    order.fulfillmentStatus?.toUpperCase()}
                                            </span>
                                        </td>

                                        {/* Payment */}
                                        <td className="px-6 py-4">
                                            {getPaymentBadge(order.paymentStatus)}
                                        </td>

                                        {/* Tag */}
                                        <td className="px-6 py-4">
                                            {order.assignedTag ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                    <Tag className="w-3 h-3" />
                                                    {typeof order.assignedTag === "object"
                                                        ? order.assignedTag.tagCode || order.assignedTag._id.slice(-6)
                                                        : order.assignedTag}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">Not assigned</span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/dashboard/user/orders/${order._id}`}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                    View
                                                </Link>
                                                {order.paymentStatus === "pending" && (
                                                    <Link
                                                        href={`/checkout?orderId=${order._id}`}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-black rounded-md hover:bg-gray-900 transition"
                                                    >
                                                        Pay
                                                        <ArrowRight className="w-3 h-3" />
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Order Summary Footer */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600 inline-flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                Total Orders: <span className="font-semibold text-gray-900">{orders.length}</span>
                            </p>
                            <p className="text-sm text-gray-600 inline-flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                Total Spent:{" "}
                                <span className="font-semibold text-gray-900">
                                    ${orders.reduce((sum, order) => sum + (order.product?.price || 0), 0).toFixed(2)}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}