import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, DollarSign, Sparkles } from "lucide-react";

const subscriptionOptions = [
    { 
        value: "free", 
        label: "Free", 
        icon: Sparkles,
        description: "1 random quote per day",
        color: "bg-gray-100 text-gray-700",
        hoverColor: "hover:bg-gray-200"
    },
    { 
        value: "subscriber", 
        label: "Subscriber", 
        icon: DollarSign,
        description: "3 unlocks per day + category selection",
        color: "bg-purple-100 text-purple-800",
        hoverColor: "hover:bg-purple-200"
    }
];

export default function SubscriptionTypeSelect({ 
    value, 
    onChange, 
    isUpdating = false,
    disabled = false 
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const currentOption = subscriptionOptions.find(opt => opt.value === value) || subscriptionOptions[0];
    const CurrentIcon = currentOption.icon;

    const handleSelect = (selectedValue) => {
        if (disabled || isUpdating) return;
        onChange(selectedValue);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={() => !disabled && !isUpdating && setIsOpen(!isOpen)}
                disabled={disabled || isUpdating}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-all cursor-pointer ${currentOption.color} ${currentOption.hoverColor} ${(disabled || isUpdating) ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                <CurrentIcon size={12} />
                <span>{currentOption.label}</span>
                {!isUpdating && <ChevronDown size={10} className="ml-0.5" />}
                {isUpdating && (
                    <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin ml-0.5"></div>
                )}
            </button>

            {isOpen && !disabled && !isUpdating && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px] overflow-hidden">
                    <div className="py-1">
                        {subscriptionOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected = option.value === value;
                            
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`w-full text-left px-3 py-2 transition flex items-start gap-2 hover:bg-gray-50 ${
                                        isSelected ? "bg-gray-50" : ""
                                    }`}
                                >
                                    <div className={`p-1 rounded-full ${option.color}`}>
                                        <Icon size={12} />
                                    </div>
                                    <div className="flex-1 cursor-pointer">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-xs font-medium ${option.color}`}>
                                                {option.label}
                                            </span>
                                            {isSelected && <Check size={12} className="text-green-500" />}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {option.description}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}