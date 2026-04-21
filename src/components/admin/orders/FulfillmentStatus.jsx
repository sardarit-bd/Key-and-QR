import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, RefreshCw, Clock, Tag, Truck, CheckCircle, Ban, Undo2 } from "lucide-react";
import { toast } from "react-hot-toast";

const statusConfig = {
    pending: {
        label: "Pending",
        icon: Clock,
        color: "bg-yellow-100 text-yellow-700",
        hoverColor: "hover:bg-yellow-200"
    },
    assigned: {
        label: "Assigned",
        icon: Tag,
        color: "bg-purple-100 text-purple-700",
        hoverColor: "hover:bg-purple-200"
    },
    shipped: {
        label: "Shipped",
        icon: Truck,
        color: "bg-blue-100 text-blue-700",
        hoverColor: "hover:bg-blue-200"
    },
    delivered: {
        label: "Delivered",
        icon: CheckCircle,
        color: "bg-green-100 text-green-700",
        hoverColor: "hover:bg-green-200"
    },
    cancelled: {
        label: "Cancelled",
        icon: Ban,
        color: "bg-red-100 text-red-700",
        hoverColor: "hover:bg-red-200"
    },
    returned: {
        label: "Returned",
        icon: Undo2,
        color: "bg-orange-100 text-orange-700",
        hoverColor: "hover:bg-orange-200"
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

export function FulfillmentStatusSelect({ 
    currentStatus, 
    orderId, 
    onUpdateStatus, 
    isUpdating,
    hasTag 
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const dropdownRef = useRef(null);
    const iconRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const nextStatuses = getNextAllowedStatuses(currentStatus, hasTag);
    const isLocked = currentStatus === "cancelled" || currentStatus === "returned";
    
    const currentConfig = statusConfig[currentStatus] || statusConfig.pending;
    const CurrentIcon = currentConfig.icon;

    const handleStatusChange = (newStatus) => {
        if (newStatus === "assigned" && !hasTag) {
            toast.error("Cannot assign status: Please assign a tag first.", {
                duration: 4000,
                icon: '⚠️'
            });
            setIsOpen(false);
            return;
        }

        const statusOrder = ["pending", "assigned", "shipped", "delivered"];
        const currentIndex = statusOrder.indexOf(currentStatus);
        const newIndex = statusOrder.indexOf(newStatus);

        if (newIndex < currentIndex) {
            toast.error(`Cannot change status from "${currentConfig.label}" back to "${statusConfig[newStatus]?.label}".`, {
                duration: 4000
            });
            setIsOpen(false);
            return;
        }

        if (!nextStatuses.includes(newStatus)) {
            toast.error(`Cannot change from "${currentConfig.label}" to "${statusConfig[newStatus]?.label}".`, {
                duration: 4000
            });
            setIsOpen(false);
            return;
        }

        onUpdateStatus(orderId, newStatus);
        setIsOpen(false);
    };

    if (isLocked) {
        return (
            <div className="relative inline-block">
                <div
                    ref={iconRef}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${currentConfig.color} cursor-default`}
                >
                    <CurrentIcon size={12} />
                    <span className="capitalize">{currentConfig.label}</span>
                    <span className="text-[10px] ml-0.5">(Locked)</span>
                </div>
                {showTooltip && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 whitespace-nowrap">
                        <div className="bg-gray-800 text-white text-xs rounded-lg py-1.5 px-3 shadow-lg">
                            This status is locked and cannot be changed
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                <div className="border-4 border-transparent border-t-gray-800"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={() => !isUpdating && setIsOpen(!isOpen)}
                disabled={isUpdating}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-all ${currentConfig.color} ${currentConfig.hoverColor} ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
                <CurrentIcon size={12} />
                <span className="capitalize">{currentConfig.label}</span>
                {!isUpdating && <ChevronDown size={10} className="ml-0.5" />}
                {isUpdating && <RefreshCw size={10} className="animate-spin ml-0.5" />}
            </button>

            {isOpen && !isUpdating && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px] overflow-hidden">
                    <div className="py-1">
                        {/* Current status - disabled */}
                        <div className="px-3 py-2 text-xs bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CurrentIcon size={12} className="text-gray-500" />
                                <span className="capitalize text-gray-500">{currentConfig.label}</span>
                            </div>
                            <Check size={12} className="text-green-500" />
                        </div>
                        
                        {/* Divider */}
                        <div className="border-t border-gray-100 my-1"></div>
                        
                        {/* Available next statuses */}
                        {nextStatuses.map((status) => {
                            const config = statusConfig[status];
                            if (!config) return null;
                            const Icon = config.icon;
                            
                            return (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 transition flex items-center gap-2 group"
                                >
                                    <Icon size={12} className="text-gray-500 group-hover:text-gray-700" />
                                    <span className="capitalize text-gray-700 group-hover:text-gray-900">{config.label}</span>
                                </button>
                            );
                        })}
                        
                        {/* Show message if no next statuses */}
                        {nextStatuses.length === 0 && (
                            <div className="px-3 py-2 text-xs text-gray-400 text-center">
                                No further updates allowed
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}