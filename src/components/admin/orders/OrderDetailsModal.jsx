// components/admin/orders/OrderDetailsModal.jsx - সম্পূর্ণ আপডেটেড (Responsive)

import {
    Calendar, CheckCircle, Clock, CreditCard, Gift, Package,
    Tag, Truck, User, XCircle, Ban, Undo2, RotateCcw,
    AlertCircle, Info, MapPin, Phone, Mail, Home, Building2, Globe
} from "lucide-react";

const getPaymentStatusBadge = (status) => {
    const styles = {
        paid: "bg-green-100 text-green-700",
        pending: "bg-yellow-100 text-yellow-700",
        refunded: "bg-purple-100 text-purple-700",
        failed: "bg-red-100 text-red-700"
    };
    return styles[status] || "bg-gray-100 text-gray-700";
};

const getFulfillmentStatusBadge = (status) => {
    const styles = {
        delivered: "bg-green-100 text-green-700",
        shipped: "bg-blue-100 text-blue-700",
        assigned: "bg-purple-100 text-purple-700",
        pending: "bg-yellow-100 text-yellow-700",
        cancelled: "bg-red-100 text-red-700",
        returned: "bg-orange-100 text-orange-700"
    };
    return styles[status] || "bg-gray-100 text-gray-700";
};

const getFulfillmentStatusIcon = (status) => {
    switch (status) {
        case "delivered": return <CheckCircle size={14} className="inline mr-1" />;
        case "shipped": return <Truck size={14} className="inline mr-1" />;
        case "assigned": return <Tag size={14} className="inline mr-1" />;
        case "cancelled": return <Ban size={14} className="inline mr-1" />;
        case "returned": return <Undo2 size={14} className="inline mr-1" />;
        default: return <Clock size={14} className="inline mr-1" />;
    }
};

const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const formatPrice = (price) => {
    return `$${Number(price).toFixed(2)}`;
};

const canCancel = (status) => {
    return ["pending", "assigned"].includes(status);
};

const canRefund = (order) => {
    return order.paymentStatus === "paid" &&
        order.refundStatus === "none" &&
        !["cancelled", "returned"].includes(order.fulfillmentStatus);
};

const canReturn = (order) => {
    return ["shipped", "delivered"].includes(order.fulfillmentStatus) &&
        order.returnStatus === "none";
};

export default function OrderDetailsModal({
    isOpen,
    onClose,
    order,
    onAssignTag,
    onCancelOrder,
    onProcessRefund,
    onProcessReturn,
    onCompleteReturn,
    processingAction
}) {
    if (!isOpen || !order) return null;

    // Check if shipping address exists and has data
    const hasShippingAddress = order.shippingAddress && (
        order.shippingAddress.fullName ||
        order.shippingAddress.address ||
        order.shippingAddress.city ||
        order.shippingAddress.country
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-xl">
                {/* Header - Sticky */}
                <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <div className="flex justify-between items-start gap-2">
                        <div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Order Details</h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-mono break-all">
                                Order ID: {order._id}
                            </p>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                        >
                            <XCircle size={20} className="text-gray-400 hover:text-gray-600" />
                        </button>
                    </div>
                </div>

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* Status Summary - Responsive Grid */}
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                        <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${getPaymentStatusBadge(order.paymentStatus)}`}>
                            {order.paymentStatus === "paid" ? <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" /> :
                                order.paymentStatus === "refunded" ? <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" /> :
                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />}
                            <span className="hidden xs:inline">Payment:</span> {order.paymentStatus === "paid" ? "Paid" :
                                order.paymentStatus === "refunded" ? "Refunded" :
                                    "Pending"}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm capitalize ${getFulfillmentStatusBadge(order.fulfillmentStatus)}`}>
                            {getFulfillmentStatusIcon(order.fulfillmentStatus)}
                            <span className="hidden xs:inline">Fulfillment:</span> {order.fulfillmentStatus}
                        </span>
                        {order.refundStatus === "requested" && (
                            <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-orange-100 text-orange-700">
                                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                Refund Requested
                            </span>
                        )}
                        {order.returnStatus === "requested" && (
                            <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-orange-100 text-orange-700">
                                <Undo2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                Return Requested
                            </span>
                        )}
                        {order.returnStatus === "shipped" && (
                            <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-blue-100 text-blue-700">
                                <Truck className="w-3 h-3 sm:w-4 sm:h-4" />
                                Return Shipped
                            </span>
                        )}
                    </div>

                    {/* Customer Info - Responsive */}
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                            <User size={16} className="text-blue-500" />
                            Customer Information
                        </h4>
                        <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex flex-col xs:flex-row xs:justify-between gap-1 xs:gap-0">
                                <span className="text-gray-500">Name:</span>
                                <span className="text-gray-900 font-medium xs:font-normal">{order.user?.name || "N/A"}</span>
                            </div>
                            <div className="flex flex-col xs:flex-row xs:justify-between gap-1 xs:gap-0">
                                <span className="text-gray-500">Email:</span>
                                <span className="text-gray-900 break-all">{order.user?.email || "N/A"}</span>
                            </div>
                        </div>
                    </div>

                    {/* 🆕 Shipping Address Section - Responsive */}
                    {hasShippingAddress && (
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                                <MapPin size={16} className="text-blue-500" />
                                Shipping Address
                            </h4>
                            <div className="space-y-2 text-xs sm:text-sm">
                                {order.shippingAddress.fullName && (
                                    <div className="flex flex-col xs:flex-row xs:justify-between gap-1 xs:gap-0">
                                        <span className="text-gray-500 flex items-center gap-1">
                                            <User size={12} /> Full Name:
                                        </span>
                                        <span className="text-gray-900 font-medium xs:font-normal">{order.shippingAddress.fullName}</span>
                                    </div>
                                )}
                                {order.shippingAddress.email && (
                                    <div className="flex flex-col xs:flex-row xs:justify-between gap-1 xs:gap-0">
                                        <span className="text-gray-500 flex items-center gap-1">
                                            <Mail size={12} /> Email:
                                        </span>
                                        <span className="text-gray-900 break-all">{order.shippingAddress.email}</span>
                                    </div>
                                )}
                                {order.shippingAddress.phone && (
                                    <div className="flex flex-col xs:flex-row xs:justify-between gap-1 xs:gap-0">
                                        <span className="text-gray-500 flex items-center gap-1">
                                            <Phone size={12} /> Phone:
                                        </span>
                                        <span className="text-gray-900">{order.shippingAddress.phone}</span>
                                    </div>
                                )}
                                {order.shippingAddress.address && (
                                    <div className="flex flex-col xs:flex-row xs:justify-between gap-1 xs:gap-0">
                                        <span className="text-gray-500 flex items-center gap-1">
                                            <Home size={12} /> Address:
                                        </span>
                                        <span className="text-gray-900">{order.shippingAddress.address}</span>
                                    </div>
                                )}
                                {(order.shippingAddress.city || order.shippingAddress.postalCode) && (
                                    <div className="flex flex-col xs:flex-row xs:justify-between gap-1 xs:gap-0">
                                        <span className="text-gray-500 flex items-center gap-1">
                                            <Building2 size={12} /> City/PIN:
                                        </span>
                                        <span className="text-gray-900">
                                            {[order.shippingAddress.city, order.shippingAddress.postalCode].filter(Boolean).join(", ")}
                                        </span>
                                    </div>
                                )}
                                {order.shippingAddress.country && (
                                    <div className="flex flex-col xs:flex-row xs:justify-between gap-1 xs:gap-0">
                                        <span className="text-gray-500 flex items-center gap-1">
                                            <Globe size={12} /> Country:
                                        </span>
                                        <span className="text-gray-900">{order.shippingAddress.country}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Product Info - Responsive */}
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                            <Package size={16} className="text-green-500" />
                            Product Information
                        </h4>
                        <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex flex-col xs:flex-row xs:justify-between gap-1 xs:gap-0">
                                <span className="text-gray-500">Product:</span>
                                <span className="text-gray-900 text-right xs:text-left">{order.product?.name || "N/A"}</span>
                            </div>
                            <div className="flex flex-col xs:flex-row xs:justify-between gap-1 xs:gap-0">
                                <span className="text-gray-500">Price:</span>
                                <span className="text-gray-900 font-semibold">{formatPrice(order.product?.price || 0)}</span>
                            </div>
                            <div className="flex flex-col xs:flex-row xs:justify-between gap-1 xs:gap-0">
                                <span className="text-gray-500">Quantity:</span>
                                <span className="text-gray-900">{order.quantity || 1}</span>
                            </div>
                            {order.product?.image?.url && (
                                <div className="mt-2">
                                    <span className="text-gray-500 text-xs block mb-1">Image:</span>
                                    <img 
                                        src={order.product.image.url} 
                                        alt={order.product.name || "Product"} 
                                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200" 
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Info - Responsive */}
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                            <Tag size={16} className="text-purple-500" />
                            Order Information
                        </h4>
                        <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex flex-col xs:flex-row xs:justify-between gap-1 xs:gap-0">
                                <span className="text-gray-500">Purchase Type:</span>
                                <span className="text-gray-900 capitalize flex items-center gap-1">
                                    {order.purchaseType === "gift" ? <Gift size={12} /> : <User size={12} />}
                                    {order.purchaseType === "gift" ? "Gift" : "Self Purchase"}
                                </span>
                            </div>
                            {order.giftMessage && (
                                <div>
                                    <span className="text-gray-500 text-xs block mb-1">Gift Message:</span>
                                    <p className="text-gray-900 mt-1 italic bg-white p-2 rounded border border-gray-200 text-xs sm:text-sm break-words">
                                        "{order.giftMessage}"
                                    </p>
                                </div>
                            )}
                            <div className="flex flex-col xs:flex-row xs:justify-between gap-1 xs:gap-0">
                                <span className="text-gray-500">Assigned Tag:</span>
                                {order.assignedTag ? (
                                    <span className="text-blue-600 font-mono font-medium text-xs sm:text-sm">
                                        {order.assignedTag.tagCode}
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => {
                                            onClose();
                                            onAssignTag(order);
                                        }}
                                        className="text-blue-600 text-xs sm:text-sm font-medium hover:underline"
                                        disabled={processingAction}
                                    >
                                        Assign Tag
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col xs:flex-row xs:justify-between gap-1 xs:gap-0">
                                <span className="text-gray-500 flex items-center gap-1">
                                    <Calendar size={12} /> Created:
                                </span>
                                <span className="text-gray-900">{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex flex-col xs:flex-row xs:justify-between gap-1 xs:gap-0">
                                <span className="text-gray-500">Last Updated:</span>
                                <span className="text-gray-900">{formatDate(order.updatedAt)}</span>
                            </div>
                            {order.cancelledAt && (
                                <div className="flex flex-col xs:flex-row xs:justify-between gap-1 xs:gap-0">
                                    <span className="text-gray-500">Cancelled At:</span>
                                    <span className="text-gray-900">{formatDate(order.cancelledAt)}</span>
                                </div>
                            )}
                            {order.cancellationReason && (
                                <div>
                                    <span className="text-gray-500 text-xs block mb-1">Cancellation Reason:</span>
                                    <p className="text-gray-900 mt-1 text-xs sm:text-sm bg-white p-2 rounded border border-gray-200 break-words">
                                        {order.cancellationReason}
                                    </p>
                                </div>
                            )}
                            {order.refundReason && (
                                <div>
                                    <span className="text-gray-500 text-xs block mb-1">Refund Reason:</span>
                                    <p className="text-gray-900 mt-1 text-xs sm:text-sm bg-white p-2 rounded border border-gray-200 break-words">
                                        {order.refundReason}
                                    </p>
                                </div>
                            )}
                            {order.returnReason && (
                                <div>
                                    <span className="text-gray-500 text-xs block mb-1">Return Reason:</span>
                                    <p className="text-gray-900 mt-1 text-xs sm:text-sm bg-white p-2 rounded border border-gray-200 break-words">
                                        {order.returnReason}
                                    </p>
                                </div>
                            )}
                            {order.returnTrackingNumber && (
                                <div className="flex flex-col xs:flex-row xs:justify-between gap-1 xs:gap-0">
                                    <span className="text-gray-500">Return Tracking:</span>
                                    <span className="text-gray-900 font-mono text-xs break-all">{order.returnTrackingNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons - Responsive Grid */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {!order.assignedTag && order.fulfillmentStatus !== "cancelled" && order.fulfillmentStatus !== "returned" && (
                            <button
                                onClick={() => {
                                    onClose();
                                    onAssignTag(order);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                disabled={processingAction}
                            >
                                <Tag size={14} />
                                Assign Tag
                            </button>
                        )}

                        {canCancel(order.fulfillmentStatus) && (
                            <button
                                onClick={() => {
                                    onClose();
                                    onCancelOrder(order);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                                disabled={processingAction}
                            >
                                <Ban size={14} />
                                Cancel Order
                            </button>
                        )}

                        {canRefund(order) && (
                            <button
                                onClick={() => {
                                    onClose();
                                    onProcessRefund(order);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition"
                                disabled={processingAction}
                            >
                                <RotateCcw size={14} />
                                Process Refund
                            </button>
                        )}

                        {canReturn(order) && (
                            <button
                                onClick={() => {
                                    onClose();
                                    onProcessReturn(order);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition"
                                disabled={processingAction}
                            >
                                <Undo2 size={14} />
                                Process Return
                            </button>
                        )}

                        {order.returnStatus === "shipped" && (
                            <button
                                onClick={() => {
                                    onClose();
                                    onCompleteReturn(order._id);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm border border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition"
                                disabled={processingAction}
                            >
                                <CheckCircle size={14} />
                                Complete Return
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer - Sticky */}
                <div className="p-4 sm:p-6 border-t border-gray-200 flex justify-end sticky bottom-0 bg-white">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 sm:px-4 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer text-sm sm:text-base"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}