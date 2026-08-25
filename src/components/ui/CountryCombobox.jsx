"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, X, Check, Globe } from "lucide-react";
import { COUNTRIES, getCountryByCode, filterAndRankCountries } from "@/config/countries.data";
import { cn } from "@/lib/utils";

/**
 * Industry-standard accessible Country Combobox / Searchable Select.
 * Supports typeahead filtering, ISO-2 codes, flags, keyboard navigation, and custom styling.
 */
export default function CountryCombobox({
  value,
  onChange,
  error,
  disabled = false,
  placeholder = "Select your country",
  id = "country-combobox",
  name = "country",
  required = false,
  className,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Selected country object
  const selectedCountry = useMemo(() => getCountryByCode(value), [value]);

  // Filter and rank countries using multi-tiered relevance scoring
  const filteredCountries = useMemo(() => {
    return filterAndRankCountries(COUNTRIES, searchQuery);
  }, [searchQuery]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Keyboard navigation handler
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredCountries.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCountries.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCountries[highlightedIndex]) {
          selectCountry(filteredCountries[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      case "Tab":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const selectCountry = (country) => {
    if (onChange) {
      onChange(country.code, country);
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Hidden input for standard HTML form submissions if needed */}
      <input
        type="hidden"
        id={id}
        name={name}
        value={value || ""}
        required={required}
      />

      {/* Trigger Button */}
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${id}-listbox`}
        aria-label="Select country"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex h-11 w-full cursor-pointer items-center justify-between rounded-xl border bg-white px-3.5 py-2.5 text-left text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6922D]/40 active:scale-[0.995]",
          error
            ? "border-[#C25B5B] bg-[#FFF8F8] text-[#2E2A24]"
            : isOpen
            ? "border-[#C6922D] ring-2 ring-[#C6922D]/20 shadow-sm"
            : "border-[#E5DCC8] hover:border-[#C6922D]/60 hover:bg-[#FDFBF6]",
          disabled && "cursor-not-allowed opacity-50 bg-[#F5EDDC]/30 hover:border-[#E5DCC8]"
        )}
      >
        <div className="flex items-center gap-2.5 truncate min-w-0">
          {selectedCountry ? (
            <>
              <span className="text-base shrink-0 leading-none" role="img" aria-label={selectedCountry.name}>
                {selectedCountry.flag}
              </span>
              <span className="truncate font-medium text-[#2E2A24]">
                {selectedCountry.name}
              </span>
              <span className="shrink-0 rounded-md bg-[#F5EDDC] px-1.5 py-0.5 text-[10.5px] font-semibold text-[#8A7A5C]">
                {selectedCountry.code}
              </span>
            </>
          ) : (
            <span className="flex items-center gap-2 text-[#A99B7F]">
              <Globe size={16} className="shrink-0 text-[#A99B7F]" />
              {placeholder}
            </span>
          )}
        </div>

        <ChevronDown
          size={17}
          className={cn(
            "shrink-0 text-[#A99B7F] transition-transform duration-200",
            isOpen && "rotate-180 text-[#C6922D]"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id={`${id}-listbox`}
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[280px] overflow-hidden rounded-2xl border border-[#EDE4D0] bg-white shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {/* Inline Search Input */}
          <div className="border-b border-[#EDE4D0]/80 p-2.5 bg-[#FDFBF6]/80">
            <div className="relative flex items-center">
              <Search
                size={15}
                className="absolute left-3 text-[#A99B7F] pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search by country or code (e.g. US, UK)..."
                className="h-9 w-full rounded-xl border border-[#E5DCC8] bg-white pl-9 pr-8 text-xs sm:text-sm text-[#2E2A24] placeholder:text-[#A99B7F] focus:border-[#C6922D] focus:outline-none focus:ring-1 focus:ring-[#C6922D]/40"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2.5 p-1 text-[#A99B7F] hover:text-[#2E2A24] cursor-pointer"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Match Counter */}
            <div className="mt-1.5 flex items-center justify-between px-1 text-[11px] text-[#8A7A5C]">
              <span>
                {filteredCountries.length}{" "}
                {filteredCountries.length === 1 ? "country" : "countries"}
              </span>
              <span className="text-[10px] text-[#A99B7F]">
                ↑↓ to navigate • ↵ to select
              </span>
            </div>
          </div>

          {/* List of Countries */}
          <div
            ref={listRef}
            className="max-h-64 sm:max-h-72 overflow-y-auto p-1.5 space-y-0.5 overscroll-contain"
          >
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country, index) => {
                const isSelected = selectedCountry?.code === country.code;
                const isHighlighted = highlightedIndex === index;

                return (
                  <button
                    key={country.code}
                    type="button"
                    role="option"
                    data-index={index}
                    aria-selected={isSelected}
                    onClick={() => selectCountry(country)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors duration-100",
                      isSelected
                        ? "bg-[#F5EDDC] text-[#2E2A24] font-semibold"
                        : isHighlighted
                        ? "bg-[#F5EDDC]/60 text-[#2E2A24]"
                        : "text-[#5C5346] hover:bg-[#F5EDDC]/40"
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate min-w-0">
                      <span className="text-base shrink-0 leading-none" role="img" aria-label={country.name}>
                        {country.flag}
                      </span>
                      <span className="truncate">{country.name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10.5px] font-mono",
                          isSelected
                            ? "bg-[#C6922D]/20 text-[#8A5A1B] font-bold"
                            : "bg-[#F5F0E4] text-[#8A7A5C]"
                        )}
                      >
                        {country.code}
                      </span>
                      {isSelected && (
                        <Check size={15} className="text-[#C6922D] shrink-0" strokeWidth={2.5} />
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-8 px-4 text-center">
                <Globe size={28} className="mx-auto mb-2 text-[#A99B7F]/60" />
                <p className="text-sm font-medium text-[#2E2A24]">
                  No country found
                </p>
                <p className="mt-1 text-xs text-[#8A7A5C]">
                  No results matching &ldquo;{searchQuery}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-xs font-semibold text-[#C6922D] hover:underline cursor-pointer"
                >
                  Clear search query
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
