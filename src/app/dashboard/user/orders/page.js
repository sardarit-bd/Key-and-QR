"use client";

import UserCustomSelect from "@/components/user/UserCustomSelect";
import { orderService } from "@/services/order.service";
import Loader from "@/shared/Loader";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
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
    RotateCcw,
    ShoppingBag,
    Tag,
    Truck,
    Undo2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";

const isWithinReturnWindow = (deliveredAt) => {
    if (!deliveredAt) return false;
    
    const now = new Date();
    const deliveredDate = new Date(deliveredAt);
    const diffTime = now - deliveredDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    return diffDays <= 3;
};

function RequestModal({ isOpen, onClose, onSubmit, title, description, submitText, loading }) {
    const [reason, setReason] = useState("");

    const handleSubmit = () => {
        if (!reason.trim()) {
            toast.error("Please provide a reason");
            return;
        }
        onSubmit(reason);
        setReason("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                        >
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                </div>
                
                <div className="p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for {title.toLowerCase()} *
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder={`Please describe why you want to ${title.toLowerCase()}...`}
                    />
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-700">
                            ⚠️ This request will be reviewed by our admin team. You will be notified once processed.
                        </p>
                    </div>
                </div>
                
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !reason.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? "Submitting..." : submitText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function OrdersPage() {
    const router = useRouter();
    const { user, isInitialized } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Modal states
    const [refundModalOpen, setRefundModalOpen] = useState(false);
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalSpent, setTotalSpent] = useState(0);

    useEffect(() => {
        if (!isInitialized) return;

        if (!user) {
            router.push("/login");
            return;
        }

        fetchOrders();
    }, [user, currentPage, itemsPerPage, isInitialized]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await orderService.getUserOrders({
                page: currentPage,
                limit: itemsPerPage
            });

            console.log("Full response:", response);

            if (response?.data?.orders) {
                setOrders(response.data.orders);
                setTotalPages(response.data.pagination?.totalPages || 1);
                setTotalOrders(response.data.pagination?.total || response.data.orders.length);
                setTotalSpent(response.data.totalSpent || 0);
            }
            else if (response?.data?.data) {
                setOrders(response.data.data);
                setTotalPages(response.data.pagination?.totalPages || 1);
                setTotalOrders(response.data.pagination?.total || response.data.data.length);
            }
            else if (Array.isArray(response?.data)) {
                setOrders(response.data);
                setTotalPages(1);
                setTotalOrders(response.data.length);
            }
            else {
                setOrders([]);
                setTotalPages(1);
                setTotalOrders(0);
            }

        } catch (error) {
            console.error("Error fetching orders:", error);
            const errorMessage = error.response?.data?.message || "Failed to load orders";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Request Refund Handler
    const handleRequestRefund = async (orderId, reason) => {
        setSubmitting(true);
        try {
            await api.post(`/orders/${orderId}/refund/request`, { reason });
            toast.success("Refund request submitted successfully. Admin will review it.");
            fetchOrders();
        } catch (error) {
            console.error("Error requesting refund:", error);
            toast.error(error.response?.data?.message || "Failed to submit refund request");
        } finally {
            setSubmitting(false);
            setSelectedOrderId(null);
        }
    };

    // Request Return Handler
    const handleRequestReturn = async (orderId, reason) => {
        setSubmitting(true);
        try {
            await api.post(`/orders/${orderId}/return/request`, { reason });
            toast.success("Return request submitted successfully. Admin will review it.");
            fetchOrders();
        } catch (error) {
            console.error("Error requesting return:", error);
            toast.error(error.response?.data?.message || "Failed to submit return request");
        } finally {
            setSubmitting(false);
            setSelectedOrderId(null);
        }
    };

    // Open refund modal
    const openRefundModal = (orderId) => {
        setSelectedOrderId(orderId);
        setRefundModalOpen(true);
    };

    // Open return modal
    const openReturnModal = (orderId) => {
        setSelectedOrderId(orderId);
        setReturnModalOpen(true);
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
            cancelled: "bg-red-100 text-red-800",
            returned: "bg-orange-100 text-orange-800"
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
        if (status === "refunded") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                    <RotateCcw className="w-3 h-3" />
                    Refunded
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
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return "Invalid date";
        }
    };

    const formatPrice = (price) => {
        return `$${Number(price).toFixed(2)}`;
    };

    const getOrderQuantity = (order) => {
        return order.quantity || 1;
    };

    const getOrderTotal = (order) => {
        const price = order.product?.price || 0;
        const quantity = getOrderQuantity(order);
        return price * quantity;
    };

    // Pagination handlers
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToFirstPage = () => {
        setCurrentPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToLastPage = () => {
        setCurrentPage(totalPages);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    // Pagination Component
    const Pagination = () => {
        if (totalPages <= 1 && totalOrders <= itemsPerPage) return null;

        const pageNumbers = getPageNumbers();

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2">
                    <UserCustomSelect
                        value={itemsPerPage}
                        onChange={(newValue) => {
                            setItemsPerPage(newValue);
                            setCurrentPage(1);
                        }}
                        options={[
                            { value: 5, label: "5" },
                            { value: 10, label: "10" },
                            { value: 20, label: "20" },
                            { value: 50, label: "50" },
                            { value: 100, label: "100" },
                        ]}
                    />
                    <span className="text-sm text-gray-600">Per Page</span>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={goToFirstPage}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-md transition-all duration-200 ${currentPage === 1
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-600 hover:bg-gray-100 cursor-pointer"
                                }`}
                            aria-label="First page"
                        >
                            <ChevronsLeft className="w-4 h-4" />
                        </button>

                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-md transition-all duration-200 ${currentPage === 1
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-600 hover:bg-gray-100 cursor-pointer"
                                }`}
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {pageNumbers.map((page, index) => (
                            page === '...' ? (
                                <span key={`dots-${index}`} className="px-3 py-1 text-gray-400">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`min-w-[36px] h-9 px-3 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${currentPage === page
                                        ? "bg-gray-900 text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    {page}
                                </button>
                            )
                        ))}

                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-md transition-all duration-200 ${currentPage === totalPages
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-600 hover:bg-gray-100 cursor-pointer"
                                }`}
                            aria-label="Next page"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>

                        <button
                            onClick={goToLastPage}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-md transition-all duration-200 ${currentPage === totalPages
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-600 hover:bg-gray-100 cursor-pointer"
                                }`}
                            aria-label="Last page"
                        >
                            <ChevronsRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, totalOrders)} of {totalOrders} orders
                </div>
            </div>
        );
    };

    if (loading) {
        return <Loader text="Qkey..." size={50} fullScreen />;
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-16 px-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={fetchOrders}
                        className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 inline-flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                        Try Again
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-16 px-4 md:px-8">
            <Toaster position="top-right" />
            
            {/* Refund Modal */}
            <RequestModal
                isOpen={refundModalOpen}
                onClose={() => {
                    setRefundModalOpen(false);
                    setSelectedOrderId(null);
                }}
                onSubmit={(reason) => handleRequestRefund(selectedOrderId, reason)}
                title="Request Refund"
                description="Please provide the reason for requesting a refund. This will help us process your request faster."
                submitText="Submit Refund Request"
                loading={submitting}
            />
            
            {/* Return Modal */}
            <RequestModal
                isOpen={returnModalOpen}
                onClose={() => {
                    setReturnModalOpen(false);
                    setSelectedOrderId(null);
                }}
                onSubmit={(reason) => handleRequestReturn(selectedOrderId, reason)}
                title="Request Return"
                description="Please provide the reason for returning this item. Returns are only accepted within 3 days of delivery."
                submitText="Submit Return Request"
                loading={submitting}
            />
            
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="w-7 h-7 md:w-8 md:h-8" />
                        My Orders
                    </h1>
                    <p className="text-gray-600 mt-2 text-sm md:text-base">View and track all your orders</p>
                </div>
                {orders.length > 0 && (
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <p className="text-sm text-gray-600">
                            Total: <span className="font-semibold text-gray-900">{totalOrders}</span> orders
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
                        className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Start Shopping
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
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
                                                <Package className="w-4 h-4" />
                                                Qty
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
                                    {orders.map((order) => {
                                        const quantity = getOrderQuantity(order);
                                        const totalAmount = getOrderTotal(order);
                                        const isReturnEligible = isWithinReturnWindow(order.deliveredAt);
                                        const canRequestRefund = order.paymentStatus === "paid" &&
                                            !["shipped", "delivered", "cancelled", "returned"].includes(order.fulfillmentStatus) &&
                                            order.refundStatus === "none";
                                        const canRequestReturn = order.paymentStatus === "paid" &&
                                            order.fulfillmentStatus === "delivered" &&
                                            order.returnStatus === "none" &&
                                            isReturnEligible;

                                        return (
                                            <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-200">
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-sm text-gray-900">
                                                        #{order._id?.slice(-8).toUpperCase()}
                                                    </span>
                                                </td>
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
                                                            <p className="font-medium text-gray-900 text-sm line-clamp-1">
                                                                {order.product?.name || "Product"}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                ${order.product?.price || 0} each
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-600">
                                                        {formatDate(order.createdAt)}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {quantity}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {formatPrice(totalAmount)}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                                                                order.fulfillmentStatus
                                                            )}`}
                                                        >
                                                            {getStatusIcon(order.fulfillmentStatus)}
                                                            {order.fulfillmentStatus === "assigned" && "Assigned"}
                                                            {order.fulfillmentStatus === "pending" && "Pending"}
                                                            {order.fulfillmentStatus === "shipped" && "Shipped"}
                                                            {order.fulfillmentStatus === "delivered" && "Delivered"}
                                                            {order.fulfillmentStatus === "cancelled" && "Cancelled"}
                                                            {order.fulfillmentStatus === "returned" && "Returned"}
                                                        </span>

                                                        {/* Refund Status Badges */}
                                                        {order.refundStatus === "requested" && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                                                                <Clock className="w-3 h-3" />
                                                                Refund Requested
                                                            </span>
                                                        )}
                                                        {order.refundStatus === "rejected" && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                                                                <XCircle className="w-3 h-3" />
                                                                Refund Rejected
                                                            </span>
                                                        )}

                                                        {/* Return Status Badges */}
                                                        {order.returnStatus === "requested" && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                                                                <Undo2 className="w-3 h-3" />
                                                                Return Requested
                                                            </span>
                                                        )}
                                                        {order.returnStatus === "approved" && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                                                <CheckCircle className="w-3 h-3" />
                                                                Return Approved
                                                            </span>
                                                        )}
                                                        {order.returnStatus === "shipped" && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                                                <Truck className="w-3 h-3" />
                                                                Return Shipped
                                                            </span>
                                                        )}
                                                        {order.returnStatus === "rejected" && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                                                                <XCircle className="w-3 h-3" />
                                                                Return Rejected
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getPaymentBadge(order.paymentStatus)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {order.assignedTag ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                            <Tag className="w-3 h-3" />
                                                            {typeof order.assignedTag === "object"
                                                                ? order.assignedTag.tagCode || order.assignedTag._id?.slice(-6)
                                                                : order.assignedTag}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">Not assigned</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex gap-2 flex-wrap">
                                                            <Link
                                                                href={`/dashboard/user/orders/${order._id}`}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-200 hover:scale-[1.02]"
                                                            >
                                                                <Eye className="w-3 h-3" />
                                                                View
                                                            </Link>

                                                            {order.paymentStatus === "pending" && (
                                                                <Link
                                                                    href={`/checkout?orderId=${order._id}`}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-black rounded-md hover:bg-gray-900 transition-all duration-200 hover:scale-[1.02]"
                                                                >
                                                                    Pay
                                                                    <ArrowRight className="w-3 h-3" />
                                                                </Link>
                                                            )}

                                                            {/* Request Refund Button */}
                                                            {canRequestRefund && (
                                                                <button
                                                                    onClick={() => openRefundModal(order._id)}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 transition-all duration-200 cursor-pointer"
                                                                >
                                                                    <RotateCcw className="w-3 h-3" />
                                                                    Request Refund
                                                                </button>
                                                            )}

                                                            {/* Request Return Button */}
                                                            {canRequestReturn && (
                                                                <button
                                                                    onClick={() => openReturnModal(order._id)}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-100 rounded-md hover:bg-orange-200 transition-all duration-200 cursor-pointer"
                                                                >
                                                                    <Undo2 className="w-3 h-3" />
                                                                    Request Return
                                                                </button>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Show expired return message */}
                                                        {order.paymentStatus === "paid" && 
                                                         order.fulfillmentStatus === "delivered" && 
                                                         order.returnStatus === "none" && 
                                                         !isWithinReturnWindow(order.deliveredAt) && (
                                                            <div className="mt-1">
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-400">
                                                                    <Clock className="w-3 h-3" />
                                                                    Return window expired (3 days)
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden divide-y divide-gray-200">
                            {orders.map((order) => {
                                const quantity = getOrderQuantity(order);
                                const totalAmount = getOrderTotal(order);
                                const isReturnEligible = isWithinReturnWindow(order.deliveredAt);
                                const canRequestRefund = order.paymentStatus === "paid" &&
                                    !["shipped", "delivered", "cancelled", "returned"].includes(order.fulfillmentStatus) &&
                                    order.refundStatus === "none";
                                const canRequestReturn = order.paymentStatus === "paid" &&
                                    order.fulfillmentStatus === "delivered" &&
                                    order.returnStatus === "none" &&
                                    isReturnEligible;

                                return (
                                    <div key={order._id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <span className="font-mono text-sm font-semibold text-gray-900">
                                                    #{order._id?.slice(-8).toUpperCase()}
                                                </span>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(order.fulfillmentStatus)}`}>
                                                {getStatusIcon(order.fulfillmentStatus)}
                                                {order.fulfillmentStatus}
                                            </span>
                                        </div>

                                        <div className="flex gap-3 mt-3">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={order.product?.image?.url || "/placeholder.png"}
                                                    alt={order.product?.name || "Product"}
                                                    width={64}
                                                    height={64}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 line-clamp-2">
                                                    {order.product?.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    ${order.product?.price || 0} each
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        Qty: {quantity}
                                                    </span>
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {formatPrice(totalAmount)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Badges Mobile */}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {getPaymentBadge(order.paymentStatus)}
                                            {order.refundStatus === "requested" && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                                                    Refund Requested
                                                </span>
                                            )}
                                            {order.returnStatus === "requested" && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                                                    Return Requested
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                                            <Link
                                                href={`/dashboard/user/orders/${order._id}`}
                                                className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                            >
                                                View Details
                                            </Link>
                                            {order.paymentStatus === "pending" && (
                                                <Link
                                                    href={`/checkout?orderId=${order._id}`}
                                                    className="flex-1 text-center px-3 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-900 transition"
                                                >
                                                    Pay Now
                                                </Link>
                                            )}
                                            {canRequestRefund && (
                                                <button
                                                    onClick={() => openRefundModal(order._id)}
                                                    className="flex-1 text-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition"
                                                >
                                                    Request Refund
                                                </button>
                                            )}
                                            {canRequestReturn && (
                                                <button
                                                    onClick={() => openReturnModal(order._id)}
                                                    className="flex-1 text-center px-3 py-2 text-sm font-medium text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 transition"
                                                >
                                                    Request Return
                                                </button>
                                            )}
                                        </div>
                                        
                                        {/* Show expired return message on mobile */}
                                        {order.paymentStatus === "paid" && 
                                         order.fulfillmentStatus === "delivered" && 
                                         order.returnStatus === "none" && 
                                         !isWithinReturnWindow(order.deliveredAt) && (
                                            <div className="text-center mt-2">
                                                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                                    <Clock className="w-3 h-3" />
                                                    Return window expired (3 days)
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Summary Footer */}
                        <div className="bg-gray-50 px-4 md:px-6 py-4 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                                <p className="text-sm text-gray-600 inline-flex items-center gap-1">
                                    <Package className="w-4 h-4" />
                                    Total Orders: <span className="font-semibold text-gray-900">{totalOrders}</span>
                                </p>
                                <p className="text-sm text-gray-600 inline-flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    Total Spent:{" "}
                                    <span className="font-semibold text-gray-900">
                                        {formatPrice(totalSpent)}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pagination Component */}
                    <div className="mt-6">
                        <Pagination />
                    </div>
                </>
            )}
        </div>
    );
}