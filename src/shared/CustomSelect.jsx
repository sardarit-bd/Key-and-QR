import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";

export default function CustomSelect({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    label = null,
    error = null,
    disabled = false,
    searchable = false,
    clearable = false,
    className = "",
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Find selected option
    const selectedOption = options.find(opt => opt.value === value);

    // Filter options based on search
    const filteredOptions = searchable && searchTerm
        ? options.filter(opt =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : options;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchable && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen, searchable]);

    const handleSelect = (option) => {
        onChange(option.value);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange("");
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}

            {/* Selected Value Display */}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
                    w-full px-3 py-2 border rounded-lg bg-white cursor-pointer
                    flex items-center justify-between
                    transition-all duration-200
                    ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "hover:border-gray-400"}
                    ${isOpen ? "border-gray-500 ring-2 ring-gray-200" : "border-gray-300"}
                    ${error ? "border-red-500 ring-2 ring-red-100" : ""}
                `}
            >
                <span className={`flex-1 truncate ${!selectedOption ? "text-gray-400" : "text-gray-900"}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                
                <div className="flex items-center gap-1">
                    {clearable && selectedOption && (
                        <button
                            onClick={handleClear}
                            className="p-0.5 hover:bg-gray-100 rounded-full transition"
                        >
                            <X size={14} className="text-gray-400" />
                        </button>
                    )}
                    <ChevronDown
                        size={18}
                        className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <p className="mt-1 text-xs text-red-500">{error}</p>
            )}

            {/* Dropdown Menu */}
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {/* Search Input */}
                    {searchable && (
                        <div className="p-2 border-b border-gray-100">
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
                            />
                        </div>
                    )}

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-400 text-center">
                                No options found
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleSelect(option)}
                                    className={`
                                        px-3 py-2 cursor-pointer transition-colors duration-150
                                        flex items-center justify-between
                                        ${value === option.value ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}
                                    `}
                                >
                                    <span className="text-sm">{option.label}</span>
                                    {value === option.value && (
                                        <Check size={14} className="text-blue-600" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}