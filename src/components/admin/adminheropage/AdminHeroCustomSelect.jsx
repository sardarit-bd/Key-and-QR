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
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const dropdownRef = useRef(null);

  const DROPDOWN_HEIGHT = 240;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen || !dropdownRef.current) return;

    const rect = dropdownRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < DROPDOWN_HEIGHT && spaceAbove > spaceBelow) {
      setOpenUpward(true);
    } else {
      setOpenUpward(false);
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => {
    if (typeof value === "object" && value !== null) {
      return (
        opt.value === value.value ||
        (opt.bgColor === value.bgColor && opt.iconColor === value.iconColor)
      );
    }

    return opt.value === value;
  });

  const isSelected = (option) => {
    if (typeof value === "object" && value !== null) {
      return (
        option.value === value.value ||
        (option.bgColor === value.bgColor && option.iconColor === value.iconColor)
      );
    }

    return option.value === value;
  };

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className={`relative overflow-visible ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent flex items-center justify-between hover:bg-gray-50 transition cursor-pointer"
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
          className={`text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 z-[9999] w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto ${
            openUpward ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(option)}
              className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between transition cursor-pointer ${
                isSelected(option)
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

              {isSelected(option) && (
                <Check size={16} className="text-green-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}