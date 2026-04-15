// components/admin/quotes/CategorySelect.jsx
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { FaChurch, FaHeart, FaStar, FaTrophy, FaBolt } from "react-icons/fa";

const CATEGORIES = [
    { 
        value: "faith", 
        label: "Faith", 
        color: "bg-purple-100 text-purple-700", 
        hoverColor: "hover:bg-purple-200",
        icon: FaChurch,
        iconColor: "text-purple-600"
    },
    { 
        value: "love", 
        label: "Love", 
        color: "bg-pink-100 text-pink-700", 
        hoverColor: "hover:bg-pink-200",
        icon: FaHeart,
        iconColor: "text-pink-600"
    },
    { 
        value: "hope", 
        label: "Hope", 
        color: "bg-green-100 text-green-700", 
        hoverColor: "hover:bg-green-200",
        icon: FaStar,
        iconColor: "text-green-600"
    },
    { 
        value: "success", 
        label: "Success", 
        color: "bg-blue-100 text-blue-700", 
        hoverColor: "hover:bg-blue-200",
        icon: FaTrophy,
        iconColor: "text-blue-600"
    },
    { 
        value: "motivation", 
        label: "Motivation", 
        color: "bg-orange-100 text-orange-700", 
        hoverColor: "hover:bg-orange-200",
        icon: FaBolt,
        iconColor: "text-orange-600"
    },
];

export default function CategorySelect({ value, onChange, disabled = false }) {
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

    const currentCategory = CATEGORIES.find(cat => cat.value === value) || CATEGORIES[0];
    const CurrentIcon = currentCategory.icon;

    const handleSelect = (selectedValue) => {
        if (disabled) return;
        onChange(selectedValue);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "cursor-pointer hover:bg-gray-50"}`}
            >
                <div className="flex items-center gap-2">
                    <CurrentIcon className={`w-4 h-4 ${currentCategory.iconColor}`} />
                    <span className="text-sm text-gray-700">{currentCategory.label}</span>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && !disabled && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="py-1">
                        {CATEGORIES.map((category) => {
                            const Icon = category.icon;
                            const isSelected = category.value === value;
                            
                            return (
                                <button
                                    key={category.value}
                                    type="button"
                                    onClick={() => handleSelect(category.value)}
                                    className={`w-full text-left px-3 py-2 transition flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                                        isSelected ? "bg-gray-50" : ""
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon className={`w-4 h-4 ${category.iconColor}`} />
                                        <span className={`text-sm ${isSelected ? "font-medium" : "text-gray-700"}`}>
                                            {category.label}
                                        </span>
                                    </div>
                                    {isSelected && <Check size={14} className="text-green-500" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}