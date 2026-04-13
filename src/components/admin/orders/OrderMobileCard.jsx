import { ChevronDown, ChevronUp, Eye, Tag, User, Gift, CreditCard, Clock, Truck, CheckCircle, Ban, Undo2, RotateCcw, Info, RefreshCw, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
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
        case "delivered": return <CheckCircle size={14} className="inline" />;
        case "shipped": return <Truck size={14} className="inline" />;
        case "assigned": return <Tag size={14} className="inline" />;
        case "cancelled": return <Ban size={14} className="inline" />;
        case "returned": return <Undo2 size={14} className="inline" />;
        default: return <Clock size={14} className="inline" />;
    }
};

const getNextAllowedStatuses = (currentStatus, hasTag) => {
    const flow = {
        pending: hasTag ? ["assigned", "cancelled"] : ["cancelled"],
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

// কাস্টম স্ট্যাটাস সিলেক্টর কম্পোনেন্ট
function CustomStatusSelect({ currentStatus, hasTag, onStatusChange, isUpdating, orderId }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    const statuses = [
        { value: "pending", label: "Pending", icon: Clock, color: "bg-yellow-100 text-yellow-700" },
        { value: "assigned", label: "Assigned", icon: Tag, color: "bg-purple-100 text-purple-700" },
        { value: "shipped", label: "Shipped", icon: Truck, color: "bg-blue-100 text-blue-700" },
        { value: "delivered", label: "Delivered", icon: CheckCircle, color: "bg-green-100 text-green-700" }
    ];
    
    const nextStatuses = getNextAllowedStatuses(currentStatus, hasTag);
    const currentStatusIndex = statuses.findIndex(s => s.value === currentStatus);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const canSelectStatus = (statusValue) => {
        const statusIndex = statuses.findIndex(s => s.value === statusValue);
        if (statusIndex <= currentStatusIndex) return false;
        return nextStatuses.includes(statusValue);
    };
    
    const handleSelect = (statusValue) => {
        if (statusValue === "assigned" && !hasTag) {
            toast.error("Cannot assign status: Please assign a tag first.", {
                duration: 4000,
                icon: '⚠️'
            });
            setIsOpen(false);
            return;
        }
        
        if (canSelectStatus(statusValue)) {
            onStatusChange(statusValue);
            setIsOpen(false);
        } else {
            toast.error(`Cannot change from "${currentStatus}" to "${statusValue}".`, {
                duration: 3000
            });
        }
    };
    
    const currentStatusConfig = statuses.find(s => s.value === currentStatus);
    const CurrentIcon = currentStatusConfig?.icon || Clock;
    
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => !isUpdating && setIsOpen(!isOpen)}
                disabled={isUpdating}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${currentStatusConfig?.color || "bg-gray-100 text-gray-700"} ${isUpdating ? "opacity-50" : "hover:opacity-80"}`}
            >
                <CurrentIcon size={14} />
                <span className="capitalize">{currentStatus}</span>
                {!isUpdating && <ChevronDown size={14} className="ml-1" />}
                {isUpdating && <RefreshCw size={14} className="animate-spin" />}
            </button>
            
            {isOpen && !isUpdating && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px] overflow-hidden">
                    <div className="py-1">
                        {statuses.map((status) => {
                            const isDisabled = !canSelectStatus(status.value);
                            const StatusIcon = status.icon;
                            const isCurrent = status.value === currentStatus;
                            
                            if (isCurrent) {
                                return (
                                    <div key={status.value} className="px-3 py-2 text-xs text-gray-400 bg-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <StatusIcon size={12} />
                                            <span className="capitalize">{status.label}</span>
                                        </div>
                                        <Check size={12} className="text-green-500" />
                                    </div>
                                );
                            }
                            
                            if (isDisabled) {
                                return (
                                    <div key={status.value} className="px-3 py-2 text-xs text-gray-400 bg-gray-50 flex items-center gap-2 cursor-not-allowed">
                                        <StatusIcon size={12} />
                                        <span className="capitalize">{status.label}</span>
                                        <span className="text-[10px] ml-auto">🔒</span>
                                    </div>
                                );
                            }
                            
                            return (
                                <button
                                    key={status.value}
                                    onClick={() => handleSelect(status.value)}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 transition flex items-center gap-2"
                                >
                                    <StatusIcon size={12} />
                                    <span className="capitalize">{status.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

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
    const hasTag = !!order.assignedTag;
    const nextStatuses = getNextAllowedStatuses(currentStatus, hasTag);
    const isStatusLocked = currentStatus === "cancelled" || currentStatus === "returned";
    const canCancel = nextStatuses.includes("cancelled");
    const isUpdating = updatingStatus && statusUpdateOrder === order._id;

    const handleStatusChange = (newStatus) => {
        onUpdateStatus(order._id, newStatus);
    };

    return (
        <div className="p-4 border-b border-gray-100 hover:bg-gray-50 transition">
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <span className="font-mono font-semibold text-gray-900 text-sm">
                            #{order._id?.slice(-8).toUpperCase()}
                        </span>
                        {expanded ? (
                            <ChevronUp size={20} className="text-gray-400" />
                        ) : (
                            <ChevronDown size={20} className="text-gray-400" />
                        )}
                    </div>
                    <div className="text-sm text-gray-600 mb-1 break-words">
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
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full capitalize ${getFulfillmentStatusBadge(currentStatus)}`}>
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
                            {currentStatus === "pending" && !hasTag && (
                                <p className="text-xs text-orange-600 mt-1">
                                    ⚠️ Assign a tag first to mark as Assigned
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {expanded && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                    <div className="flex justify-between text-sm flex-wrap gap-1">
                        <span className="text-gray-500">Customer:</span>
                        <span className="text-gray-900 break-words max-w-[60%] text-right">{order.user?.name || order.user?.email || "Guest"}</span>
                    </div>
                    <div className="flex justify-between text-sm flex-wrap gap-1">
                        <span className="text-gray-500">Purchase Type:</span>
                        <span className="text-gray-900 capitalize">
                            {order.purchaseType === "gift" ? <Gift size={12} className="inline mr-1" /> : <User size={12} className="inline mr-1" />}
                            {order.purchaseType === "gift" ? "Gift" : "Self"}
                        </span>
                    </div>
                    {order.giftMessage && (
                        <div className="text-sm">
                            <span className="text-gray-500">Gift Message:</span>
                            <p className="text-gray-900 mt-1 italic text-xs bg-gray-50 p-2 rounded break-words">
                                {order.giftMessage}
                            </p>
                        </div>
                    )}
                    <div className="flex justify-between text-sm flex-wrap gap-1">
                        <span className="text-gray-500">Tag:</span>
                        {order.assignedTag ? (
                            <span className="text-blue-600 font-mono">{order.assignedTag.tagCode}</span>
                        ) : (
                            <button
                                onClick={() => onAssignTag(order)}
                                className="text-blue-600 text-sm font-medium hover:underline"
                            >
                                Assign Tag
                            </button>
                        )}
                    </div>
                    <div className="flex justify-between text-sm flex-wrap gap-1">
                        <span className="text-gray-500">Created:</span>
                        <span className="text-gray-900">{formatDate(order.createdAt)}</span>
                    </div>

                    {/* Custom Status Update Section */}
                    {!isStatusLocked && (
                        <div className="flex justify-between text-sm items-center flex-wrap gap-2 pt-1">
                            <span className="text-gray-500">Update Status:</span>
                            <CustomStatusSelect
                                currentStatus={currentStatus}
                                hasTag={hasTag}
                                onStatusChange={handleStatusChange}
                                isUpdating={isUpdating}
                                orderId={order._id}
                            />
                        </div>
                    )}

                    {isStatusLocked && (
                        <div className="flex justify-between text-sm items-center flex-wrap gap-1">
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
                                className="w-full py-2 text-center text-sm text-red-600 font-medium border border-red-200 rounded-lg hover:bg-red-50 transition"
                            >
                                <Ban size={14} className="inline mr-1" />
                                Cancel Order
                            </button>
                        </div>
                    )}

                    <div className="pt-1">
                        <button
                            onClick={() => onViewDetails(order)}
                            className="w-full py-2 text-center text-sm text-blue-600 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition"
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