"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function UserCustomSelect({ value, onChange, options, label }) {
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

    const selectedOption = options.find(opt => Number(opt.value) === Number(value));

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between gap-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white min-w-[70px] cursor-pointer hover:border-gray-400 transition-colors"
            >
                <span>{selectedOption?.label || value}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
                    <div 
                        className="max-h-20 overflow-y-auto"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#94a3b8 #e2e8f0',
                            WebkitOverflowScrolling: 'touch',
                        }}
                    >
                        {options.map((option, index) => (
                            <div key={option.value}>
                                <button
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors cursor-pointer ${
                                        Number(value) === Number(option.value) 
                                            ? 'bg-gray-100 text-gray-900 font-medium' 
                                            : 'text-gray-600'
                                    }`}
                                >
                                    {option.label}
                                </button>
                                {index < options.length - 1 && (
                                    <div className="border-t border-gray-100 mx-2" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Inject global styles for webkit scrollbar */}
            <style jsx global>{`
                .max-h-48::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .max-h-48::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .max-h-48::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .max-h-48::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
}