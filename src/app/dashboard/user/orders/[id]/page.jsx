"use client";

import { orderService } from "@/services/order.service";
import Loader from "@/shared/Loader";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    Gift,
    Package,
    RotateCcw,
    Tag,
    Truck,
    Undo2,
    User,
    Edit2,
    Save,
    X,
    MapPin,
    XCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { UserDetailsRequestModal } from "@/components/user/order/UserDetailsRequestModal";

// Helper function to check if return is within 3-day window
const isWithinReturnWindow = (deliveredAt) => {
    if (!deliveredAt) return false;
    
    const now = new Date();
    const deliveredDate = new Date(deliveredAt);
    const diffTime = now - deliveredDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    return diffDays <= 3;
};

// Request Modal Component


export default function OrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Modal states
    const [refundModalOpen, setRefundModalOpen] = useState(false);
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Edit address state
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [updatingAddress, setUpdatingAddress] = useState(false);
    const [editFormData, setEditFormData] = useState({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        country: ""
    });

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

            const orderData = response.data?.data || response.data;
            setOrder(orderData);

            // Initialize edit form with current shipping address
            if (orderData?.shippingAddress) {
                setEditFormData({
                    fullName: orderData.shippingAddress.fullName || orderData.user?.name || "",
                    phone: orderData.shippingAddress.phone || "",
                    address: orderData.shippingAddress.address || "",
                    city: orderData.shippingAddress.city || "",
                    postalCode: orderData.shippingAddress.postalCode || "",
                    country: orderData.shippingAddress.country || ""
                });
            }
        } catch (error) {
            console.error("Error fetching order:", error);
            const errorMessage = error.response?.data?.message || "Order not found or you don't have permission to view it";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Request Refund Handler
    const handleRequestRefund = async (reason) => {
        setSubmitting(true);
        try {
            await api.post(`/orders/${order._id}/refund/request`, { reason });
            toast.success("Refund request submitted successfully. Admin will review it.");
            fetchOrderDetails();
        } catch (error) {
            console.error("Error requesting refund:", error);
            toast.error(error.response?.data?.message || "Failed to submit refund request");
        } finally {
            setSubmitting(false);
        }
    };

    // Request Return Handler
    const handleRequestReturn = async (reason) => {
        setSubmitting(true);
        try {
            await api.post(`/orders/${order._id}/return/request`, { reason });
            toast.success("Return request submitted successfully. Admin will review it.");
            fetchOrderDetails();
        } catch (error) {
            console.error("Error requesting return:", error);
            toast.error(error.response?.data?.message || "Failed to submit return request");
        } finally {
            setSubmitting(false);
        }
    };

    // Check if user can edit address (only before shipping)
    const canEditAddress = () => {
        const uneditableStatuses = ["shipped", "delivered", "cancelled", "returned"];
        return !uneditableStatuses.includes(order?.fulfillmentStatus);
    };

    // Handle edit form input change
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    // Save updated shipping address
    const handleSaveAddress = async () => {
        if (!editFormData.address || !editFormData.city || !editFormData.country) {
            toast.error("Please fill in address, city, and country");
            return;
        }

        setUpdatingAddress(true);
        try {
            const response = await orderService.updateOrderAddress(id, {
                shippingAddress: editFormData
            });

            if (response.success === true) {
                toast.success(response.message || "Shipping address updated successfully!");

                setOrder(prev => ({
                    ...prev,
                    shippingAddress: { ...editFormData }
                }));

                setIsEditingAddress(false);

                fetchOrderDetails().catch(console.error);
            } else {
                toast.error(response.message || "Failed to update address");
            }
        } catch (error) {
            console.error("Error updating address:", error);
            toast.error(error.response?.data?.message || "Failed to update shipping address");
        } finally {
            setUpdatingAddress(false);
        }
    };

    // Cancel editing
    const cancelEditing = () => {
        setIsEditingAddress(false);
        // Reset form to original order data
        if (order?.shippingAddress) {
            setEditFormData({
                fullName: order.shippingAddress.fullName || order.user?.name || "",
                phone: order.shippingAddress.phone || "",
                address: order.shippingAddress.address || "",
                city: order.shippingAddress.city || "",
                postalCode: order.shippingAddress.postalCode || "",
                country: order.shippingAddress.country || ""
            });
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                icon: Clock,
                color: "bg-yellow-100 text-yellow-800",
                label: "Pending",
                description: "Your order is being processed",
                canEdit: true
            },
            assigned: {
                icon: Package,
                color: "bg-blue-100 text-blue-800",
                label: "Assigned",
                description: "Your tag has been assigned",
                canEdit: true
            },
            shipped: {
                icon: Truck,
                color: "bg-purple-100 text-purple-800",
                label: "Shipped",
                description: "Your order is on the way",
                canEdit: false
            },
            delivered: {
                icon: CheckCircle,
                color: "bg-green-100 text-green-800",
                label: "Delivered",
                description: "Your order has been delivered",
                canEdit: false
            },
            cancelled: {
                icon: XCircle,
                color: "bg-red-100 text-red-800",
                label: "Cancelled",
                description: "Your order has been cancelled",
                canEdit: false
            },
            returned: {
                icon: Undo2,
                color: "bg-orange-100 text-orange-800",
                label: "Returned",
                description: "Your order has been returned",
                canEdit: false
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

    const getOrderQuantity = () => {
        return order?.quantity || 1;
    };

    const calculateTotal = () => {
        if (!order?.product?.price) return 0;
        return order.product.price * getOrderQuantity();
    };

    const getSubtotal = () => {
        if (!order?.product?.price) return 0;
        return order.product.price * getOrderQuantity();
    };

    if (loading) {
        return <Loader text="Qkey..." size={50} fullScreen />;
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
    const quantity = getOrderQuantity();
    const subtotal = getSubtotal();
    const total = calculateTotal();
    const canEdit = canEditAddress();
    const isReturnEligible = isWithinReturnWindow(order.deliveredAt);
    const canRequestRefund = order.paymentStatus === "paid" &&
        !["shipped", "delivered", "cancelled", "returned"].includes(order.fulfillmentStatus) &&
        order.refundStatus === "none";
    const canRequestReturn = order.paymentStatus === "paid" &&
        order.fulfillmentStatus === "delivered" &&
        order.returnStatus === "none" &&
        isReturnEligible;

    return (
        <div className="py-16 px-4 md:px-8">
            {/* Refund Modal */}
            <UserDetailsRequestModal
                isOpen={refundModalOpen}
                onClose={() => setRefundModalOpen(false)}
                onSubmit={handleRequestRefund}
                title="Request Refund"
                description="Please provide the reason for requesting a refund. This will help us process your request faster."
                submitText="Submit Refund Request"
                loading={submitting}
            />
            
            {/* Return Modal */}
            <UserDetailsRequestModal
                isOpen={returnModalOpen}
                onClose={() => setReturnModalOpen(false)}
                onSubmit={handleRequestReturn}
                title="Request Return"
                description="Please provide the reason for returning this item. Returns are only accepted within 3 days of delivery."
                submitText="Submit Return Request"
                loading={submitting}
            />
            
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
                    {canEdit && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                            <p className="text-sm text-yellow-700 flex items-center gap-1">
                                <Edit2 size={14} />
                                You can edit shipping address before shipment
                            </p>
                        </div>
                    )}
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

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                <div className="space-y-6 relative">
                                    {[
                                        { status: "Order Placed", date: order.createdAt, icon: Clock, completed: true },
                                        { status: "Payment Confirmed", date: order.paymentStatus === "paid" ? order.updatedAt : null, icon: CreditCard, completed: order.paymentStatus === "paid" },
                                        { status: "Tag Assigned", date: order.assignedTag ? order.updatedAt : null, icon: Tag, completed: !!order.assignedTag },
                                        { status: "Shipped", date: order.fulfillmentStatus === "shipped" ? order.updatedAt : null, icon: Truck, completed: order.fulfillmentStatus === "shipped" },
                                        { status: "Delivered", date: order.fulfillmentStatus === "delivered" ? order.deliveredAt : null, icon: CheckCircle, completed: order.fulfillmentStatus === "delivered" }
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

                    {/* Refund/Return Status Section */}
                    {(order.refundStatus !== "none" || order.returnStatus !== "none" || order.cancellationReason) && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                Request Status
                            </h2>

                            {order.cancellationReason && (
                                <div className="mb-4 p-3 bg-red-50 rounded-lg">
                                    <p className="text-sm font-medium text-red-800">Cancellation Reason:</p>
                                    <p className="text-sm text-red-700 mt-1">{order.cancellationReason}</p>
                                    {order.cancelledAt && (
                                        <p className="text-xs text-red-600 mt-2">Cancelled on: {formatDate(order.cancelledAt)}</p>
                                    )}
                                </div>
                            )}

                            {order.refundStatus === "requested" && (
                                <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                                    <p className="text-sm font-medium text-yellow-800">Refund Request Pending</p>
                                    <p className="text-sm text-yellow-700 mt-1">Reason: {order.refundReason || "Not specified"}</p>
                                    <p className="text-xs text-yellow-600 mt-2">Requested on: {formatDate(order.refundRequestedAt)}</p>
                                </div>
                            )}

                            {order.refundStatus === "rejected" && (
                                <div className="mb-4 p-3 bg-red-50 rounded-lg">
                                    <p className="text-sm font-medium text-red-800">Refund Request Rejected</p>
                                    <p className="text-sm text-red-700 mt-1">Reason: {order.refundReason}</p>
                                </div>
                            )}

                            {order.refundStatus === "completed" && (
                                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                                    <p className="text-sm font-medium text-green-800">Refund Processed</p>
                                    <p className="text-sm text-green-700 mt-1">Your refund has been processed successfully.</p>
                                    {order.refundProcessedAt && (
                                        <p className="text-xs text-green-600 mt-2">Processed on: {formatDate(order.refundProcessedAt)}</p>
                                    )}
                                </div>
                            )}

                            {order.returnStatus === "requested" && (
                                <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                                    <p className="text-sm font-medium text-yellow-800">Return Request Pending</p>
                                    <p className="text-sm text-yellow-700 mt-1">Reason: {order.returnReason || "Not specified"}</p>
                                    <p className="text-xs text-yellow-600 mt-2">Requested on: {formatDate(order.returnRequestedAt)}</p>
                                </div>
                            )}

                            {order.returnStatus === "approved" && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm font-medium text-blue-800">Return Request Approved</p>
                                    <p className="text-sm text-blue-700 mt-1">Your return request has been approved by admin.</p>
                                    {order.returnApprovedAt && (
                                        <p className="text-xs text-blue-600 mt-2">Approved on: {formatDate(order.returnApprovedAt)}</p>
                                    )}
                                </div>
                            )}

                            {order.returnStatus === "shipped" && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm font-medium text-blue-800">Return in Progress</p>
                                    <p className="text-sm text-blue-700 mt-1">Return approved. Please ship the item back.</p>
                                    {order.returnTrackingNumber && (
                                        <p className="text-xs text-blue-600 mt-2">Tracking Number: {order.returnTrackingNumber}</p>
                                    )}
                                    {order.returnApprovedAt && (
                                        <p className="text-xs text-blue-600 mt-1">Approved on: {formatDate(order.returnApprovedAt)}</p>
                                    )}
                                </div>
                            )}

                            {order.returnStatus === "rejected" && (
                                <div className="mb-4 p-3 bg-red-50 rounded-lg">
                                    <p className="text-sm font-medium text-red-800">Return Request Rejected</p>
                                    <p className="text-sm text-red-700 mt-1">Reason: {order.returnReason}</p>
                                </div>
                            )}

                            {order.returnStatus === "completed" && (
                                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                                    <p className="text-sm font-medium text-green-800">Return Completed</p>
                                    <p className="text-sm text-green-700 mt-1">Your return has been completed and refund processed.</p>
                                    {order.returnReceivedAt && (
                                        <p className="text-xs text-green-600 mt-2">Return received on: {formatDate(order.returnReceivedAt)}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

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
                                        <p className="font-semibold text-gray-900">{quantity}</p>
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

                    {/* Shipping Address Section with Edit Feature */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Shipping Address
                            </h2>
                            {canEdit && !isEditingAddress && (
                                <button
                                    onClick={() => setIsEditingAddress(true)}
                                    className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer border border-blue-100"
                                >
                                    <Edit2 size={14} />
                                    Edit
                                </button>
                            )}
                        </div>

                        {isEditingAddress ? (
                            // Edit Mode
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={editFormData.fullName}
                                            onChange={handleEditInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:outline-none focus:ring-gray-400"
                                            placeholder="Full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={editFormData.phone}
                                            onChange={handleEditInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:outline-none focus:ring-gray-400"
                                            placeholder="Phone number"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={editFormData.address}
                                        onChange={handleEditInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:outline-none focus:ring-gray-400"
                                        placeholder="Street address"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={editFormData.city}
                                            onChange={handleEditInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:outline-none focus:ring-gray-400"
                                            placeholder="City"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={editFormData.postalCode}
                                            onChange={handleEditInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:outline-none focus:ring-gray-400"
                                            placeholder="Postal code"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={editFormData.country}
                                            onChange={handleEditInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:outline-none focus:ring-gray-400"
                                            placeholder="Country"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={handleSaveAddress}
                                        disabled={updatingAddress}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                                    >
                                        {updatingAddress ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin cursor-pointer" />
                                        ) : (
                                            <Save size={16} />
                                        )}
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={cancelEditing}
                                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                                    >
                                        <X size={16} />
                                        Cancel
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500">* Required fields. Address can only be changed before shipping.</p>
                            </div>
                        ) : (
                            // View Mode
                            <div className="space-y-2 text-sm">
                                {order.shippingAddress?.fullName && (
                                    <p><span className="text-gray-500">Name:</span> {order.shippingAddress.fullName}</p>
                                )}
                                {order.shippingAddress?.phone && (
                                    <p><span className="text-gray-500">Phone:</span> {order.shippingAddress.phone}</p>
                                )}
                                {order.shippingAddress?.address && (
                                    <p><span className="text-gray-500">Address:</span> {order.shippingAddress.address}</p>
                                )}
                                {order.shippingAddress?.city && (
                                    <p><span className="text-gray-500">City:</span> {order.shippingAddress.city}</p>
                                )}
                                {order.shippingAddress?.postalCode && (
                                    <p><span className="text-gray-500">Postal Code:</span> {order.shippingAddress.postalCode}</p>
                                )}
                                {order.shippingAddress?.country && (
                                    <p><span className="text-gray-500">Country:</span> {order.shippingAddress.country}</p>
                                )}
                                {!order.shippingAddress?.address && (
                                    <p className="text-gray-500">No shipping address provided</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Right Side */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-lg p-6 sticky top-6 transition-all duration-300 hover:shadow-md">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span className="text-xl">{formatPrice(total)}</span>
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
                            <div>
                                <p className="text-gray-500 flex items-center gap-1">
                                    <CreditCard className="w-3 h-3" />
                                    Payment Status
                                </p>
                                <p className="font-medium text-gray-900 capitalize">{order.paymentStatus}</p>
                            </div>
                            {order.deliveredAt && (
                                <div>
                                    <p className="text-gray-500 flex items-center gap-1">
                                        <Truck className="w-3 h-3" />
                                        Delivered On
                                    </p>
                                    <p className="font-medium text-gray-900">{formatDate(order.deliveredAt)}</p>
                                </div>
                            )}
                            {order.assignedTag && (
                                <div>
                                    <p className="text-gray-500 flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        Assigned Tag
                                    </p>
                                    <p className="font-medium text-gray-900 font-mono">
                                        {typeof order.assignedTag === "object" ? order.assignedTag.tagCode : order.assignedTag}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Request Refund/Return Buttons */}
                    {canRequestRefund && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <button
                                onClick={() => setRefundModalOpen(true)}
                                className="w-full py-2 bg-green-400 text-white rounded-lg hover:bg-green-500 transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Request Refund
                            </button>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                Request refund for this order (order not shipped yet)
                            </p>
                        </div>
                    )}

                    {canRequestReturn && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <button
                                onClick={() => setReturnModalOpen(true)}
                                className="w-full py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Undo2 className="w-4 h-4" />
                                Request Return
                            </button>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                Request return within 3 days of delivery
                            </p>
                        </div>
                    )}

                    {/* Show expired return message */}
                    {order.paymentStatus === "paid" && 
                     order.fulfillmentStatus === "delivered" && 
                     order.returnStatus === "none" && 
                     !isWithinReturnWindow(order.deliveredAt) && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Clock className="w-4 h-4" />
                                <div>
                                    <p className="text-sm font-medium">Return window expired</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Returns are only available within 3 days of delivery.
                                    </p>
                                    {order.deliveredAt && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            Delivered on: {formatDate(order.deliveredAt)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}