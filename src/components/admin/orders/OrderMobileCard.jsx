import { ChevronDown, ChevronUp, Eye, Tag, User, Gift, CreditCard, Clock, Truck, CheckCircle, Ban, Undo2, RotateCcw, Info, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

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
        case "delivered": return <CheckCircle size={12} className="inline mr-1" />;
        case "shipped": return <Truck size={12} className="inline mr-1" />;
        case "assigned": return <Tag size={12} className="inline mr-1" />;
        case "cancelled": return <Ban size={12} className="inline mr-1" />;
        case "returned": return <Undo2 size={12} className="inline mr-1" />;
        default: return <Clock size={12} className="inline mr-1" />;
    }
};

// Get next allowed status options
const getNextAllowedStatuses = (currentStatus) => {
    const flow = {
        pending: ["assigned", "cancelled"],
        assigned: ["shipped", "cancelled"],
        shipped: ["delivered", "returned"],
        delivered: ["returned"],
        cancelled: [],
        returned: []
    };
    return flow[currentStatus] || [];
};

const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

export default function OrderMobileCard({
    order,
    onAssignTag,
    onViewDetails,
    onUpdateStatus,
    onCancelOrder,
    updatingStatus,
    statusUpdateOrder
}) {
    const [expanded, setExpanded] = useState(false);
    const [showStatusInfo, setShowStatusInfo] = useState(false);

    const currentStatus = order.fulfillmentStatus;
    const nextStatuses = getNextAllowedStatuses(currentStatus);
    const isStatusLocked = currentStatus === "cancelled" || currentStatus === "returned";
    const canCancel = ["pending", "assigned"].includes(currentStatus);

    const handleStatusChange = (newStatus) => {
        // Check if trying to go backwards
        const statusOrder = ["pending", "assigned", "shipped", "delivered"];
        const currentIndex = statusOrder.indexOf(currentStatus);
        const newIndex = statusOrder.indexOf(newStatus);

        if (newIndex < currentIndex) {
            toast.error(`Cannot change from "${currentStatus}" back to "${newStatus}". Status can only move forward.`, {
                duration: 4000,
                icon: '⚠️'
            });
            return;
        }

        if (!nextStatuses.includes(newStatus)) {
            toast.error(`Cannot change from "${currentStatus}" to "${newStatus}". Allowed: ${nextStatuses.join(" → ")}`, {
                duration: 4000
            });
            return;
        }

        onUpdateStatus(order._id, newStatus);
    };

    return (
        <div className="p-4 border-b border-gray-100">
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-semibold text-gray-900 text-sm">
                            #{order._id?.slice(-8).toUpperCase()}
                        </span>
                        {expanded ? (
                            <ChevronUp size={20} className="text-gray-400" />
                        ) : (
                            <ChevronDown size={20} className="text-gray-400" />
                        )}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                        {order.product?.name}
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getPaymentStatusBadge(order.paymentStatus)}`}>
                            {order.paymentStatus === "paid" ? <CreditCard size={10} /> :
                                order.paymentStatus === "refunded" ? <RotateCcw size={10} /> :
                                    <Clock size={10} />}
                            {order.paymentStatus === "paid" ? "Paid" :
                                order.paymentStatus === "refunded" ? "Refunded" :
                                    "Pending"}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getFulfillmentStatusBadge(currentStatus)}`}>
                            {getFulfillmentStatusIcon(currentStatus)}
                            {currentStatus}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowStatusInfo(!showStatusInfo);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <Info size={14} />
                        </button>
                    </div>
                    {showStatusInfo && (
                        <div className="mt-2 p-2 bg-gray-100 rounded-lg text-xs text-gray-600">
                            <p className="font-medium">Status Flow:</p>
                            <p>Pending → Assigned → Shipped → Delivered</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {nextStatuses.length > 0
                                    ? `Next allowed: ${nextStatuses.join(" → ")}`
                                    : "No further status updates allowed"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {expanded && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Customer:</span>
                        <span className="text-gray-900">{order.user?.name || order.user?.email || "Guest"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Purchase Type:</span>
                        <span className="text-gray-900 capitalize">
                            {order.purchaseType === "gift" ? <Gift size={12} className="inline mr-1" /> : <User size={12} className="inline mr-1" />}
                            {order.purchaseType === "gift" ? "Gift" : "Self"}
                        </span>
                    </div>
                    {order.giftMessage && (
                        <div className="text-sm">
                            <span className="text-gray-500">Gift Message:</span>
                            <p className="text-gray-900 mt-1 italic text-xs bg-gray-50 p-2 rounded">
                                {order.giftMessage}
                            </p>
                        </div>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tag:</span>
                        {order.assignedTag ? (
                            <span className="text-blue-600 font-mono">{order.assignedTag.tagCode}</span>
                        ) : (
                            <button
                                onClick={() => onAssignTag(order)}
                                className="text-blue-600 text-sm font-medium"
                            >
                                Assign Tag
                            </button>
                        )}
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Created:</span>
                        <span className="text-gray-900">{formatDate(order.createdAt)}</span>
                    </div>

                    {/* Status Update Section */}
                    {!isStatusLocked && (
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-gray-500">Update Status:</span>
                            <div className="flex items-center gap-2">
                                <select
                                    value={currentStatus}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    disabled={updatingStatus && statusUpdateOrder === order._id}
                                    className={`text-xs px-2 py-1 rounded-full ${getFulfillmentStatusBadge(currentStatus)}`}
                                >
                                    <option value="pending" disabled={currentStatus !== "pending"}>
                                        Pending {currentStatus !== "pending" && "🔒"}
                                    </option>
                                    <option value="assigned" disabled={!nextStatuses.includes("assigned")}>
                                        Assigned {!nextStatuses.includes("assigned") && "🔒"}
                                    </option>
                                    <option value="shipped" disabled={!nextStatuses.includes("shipped")}>
                                        Shipped {!nextStatuses.includes("shipped") && "🔒"}
                                    </option>
                                    <option value="delivered" disabled={!nextStatuses.includes("delivered")}>
                                        Delivered {!nextStatuses.includes("delivered") && "🔒"}
                                    </option>
                                </select>
                                {updatingStatus && statusUpdateOrder === order._id && (
                                    <RefreshCw size={12} className="animate-spin" />
                                )}
                            </div>
                        </div>
                    )}

                    {isStatusLocked && (
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-gray-500">Status:</span>
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getFulfillmentStatusBadge(currentStatus)}`}>
                                {getFulfillmentStatusIcon(currentStatus)}
                                {currentStatus} (Locked)
                            </span>
                        </div>
                    )}

                    {canCancel && (
                        <div className="pt-1">
                            <button
                                onClick={() => onCancelOrder(order)}
                                className="w-full py-1.5 text-center text-sm text-red-600 font-medium border border-red-200 rounded-lg hover:bg-red-50 transition"
                            >
                                <Ban size={14} className="inline mr-1" />
                                Cancel Order
                            </button>
                        </div>
                    )}

                    <div className="pt-1">
                        <button
                            onClick={() => onViewDetails(order)}
                            className="w-full py-1.5 text-center text-sm text-blue-600 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                        >
                            <Eye size={14} className="inline mr-1" />
                            View Full Details
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}