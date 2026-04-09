import { Check, ChevronDown, Filter } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function SubscriptionCustomSelect({ options, value, onChange, placeholder }) {
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

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-black"
            >
                <Filter size={16} className="text-gray-400" />
                <span className="text-sm text-gray-700">
                    {selectedOption?.label || placeholder || "Filter by status"}
                </span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`
                                px-3 py-2 cursor-pointer transition-colors flex items-center justify-between
                                ${value === option.value ? "bg-gray-100 text-black" : "hover:bg-gray-50 text-gray-700"}
                            `}
                        >
                            <div className="flex items-center gap-2">
                                {option.icon && <span className="text-xs">{option.icon}</span>}
                                <span className="text-sm">{option.label}</span>
                            </div>
                            {value === option.value && <Check size={14} className="text-black" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}