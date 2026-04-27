"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function AdminHeroCustomSelect({ 
  options, 
  value, 
  onChange, 
  label,
  renderOption,
  renderValue,
  placeholder = "Select...",
  className = ""
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

  const selectedOption = options.find(opt => {
    if (typeof value === 'object') {
      return opt.value === value.value;
    }
    return opt.value === value;
  });

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      {/* Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent flex items-center justify-between hover:bg-gray-50 transition"
      >
        {renderValue ? (
          renderValue(selectedOption)
        ) : (
          <div className="flex items-center gap-2">
            {selectedOption?.icon && (
              <span className="text-gray-600">{selectedOption.icon}</span>
            )}
            <span className="text-gray-900">
              {selectedOption?.label || placeholder}
            </span>
          </div>
        )}
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(option)}
              className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between transition ${
                ((typeof value === 'object' && option.value === value.value) || option.value === value)
                  ? "bg-gray-50 text-black"
                  : "text-gray-700"
              }`}
            >
              {renderOption ? (
                renderOption(option)
              ) : (
                <div className="flex items-center gap-2">
                  {option.icon && <span>{option.icon}</span>}
                  <span>{option.label}</span>
                </div>
              )}
              {((typeof value === 'object' && option.value === value.value) || option.value === value) && (
                <Check size={16} className="text-green-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}