import { Ban, Check, CheckCircle, ChevronDown, Clock, Tag, Truck, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";





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

export function FulfillmentStatusSelect({ currentStatus, orderId, onUpdateStatus, isUpdating }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const nextStatuses = getNextAllowedStatuses(currentStatus);
    const isLocked = currentStatus === "cancelled" || currentStatus === "returned";

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Status options with disabled state
    const statusOptions = [
        { 
            value: "pending", 
            label: "Pending", 
            icon: <Clock size={10} className="inline mr-1" />,
            disabled: currentStatus !== "pending" && !nextStatuses.includes("pending")
        },
        { 
            value: "assigned", 
            label: "Assigned", 
            icon: <Tag size={10} className="inline mr-1" />,
            disabled: currentStatus !== "assigned" && !nextStatuses.includes("assigned")
        },
        { 
            value: "shipped", 
            label: "Shipped", 
            icon: <Truck size={10} className="inline mr-1" />,
            disabled: currentStatus !== "shipped" && !nextStatuses.includes("shipped")
        },
        { 
            value: "delivered", 
            label: "Delivered", 
            icon: <CheckCircle size={10} className="inline mr-1" />,
            disabled: currentStatus !== "delivered" && !nextStatuses.includes("delivered")
        },
    ];

    // Filter available options (show current + allowed next statuses)
    const availableOptions = statusOptions.filter(opt => 
        opt.value === currentStatus || (!opt.disabled && nextStatuses.includes(opt.value))
    );

    if (isLocked) {
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getFulfillmentStatusBadge(currentStatus)}`}>
                {getFulfillmentStatusIcon(currentStatus)}
                {currentStatus}
            </span>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Selected Value Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isUpdating}
                className={`
                    inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full
                    ${getFulfillmentStatusBadge(currentStatus)}
                    hover:opacity-80 transition cursor-pointer
                    ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}
                `}
            >
                {getFulfillmentStatusIcon(currentStatus)}
                <span className="capitalize">{currentStatus}</span>
                <ChevronDown size={10} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && !isUpdating && (
                <div className="absolute z-50 mt-1 min-w-[130px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    <div className="py-1">
                        {availableOptions.map((option) => {
                            const isSelected = option.value === currentStatus;
                            const isDisabled = option.disabled && !isSelected;
                            
                            return (
                                <div
                                    key={option.value}
                                    onClick={() => {
                                        if (!isDisabled && !isSelected) {
                                            onUpdateStatus(orderId, option.value);
                                            setIsOpen(false);
                                        }
                                    }}
                                    className={`
                                        px-3 py-2 text-xs cursor-pointer transition-colors
                                        flex items-center justify-between gap-2
                                        ${isSelected ? "bg-blue-50 text-blue-700 font-medium" : ""}
                                        ${isDisabled ? "opacity-40 cursor-not-allowed bg-gray-50" : "hover:bg-gray-50"}
                                        ${!isSelected && !isDisabled ? "text-gray-700" : ""}
                                    `}
                                >
                                    <div className="flex items-center gap-2">
                                        {option.icon}
                                        <span className="capitalize">{option.label}</span>
                                    </div>
                                    {isSelected && <Check size={12} className="text-blue-600" />}
                                    {isDisabled && !isSelected && (
                                        <span className="text-[10px] text-gray-400">🔒</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}