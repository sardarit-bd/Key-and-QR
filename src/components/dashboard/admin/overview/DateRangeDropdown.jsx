'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, Check } from 'lucide-react';

export const DATE_RANGES = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: '3m', label: 'Last 3 Months' },
  { id: '1y', label: 'This Year' },
];

export default function DateRangeDropdown({
  selectedRange = '30d',
  onRangeChange,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  const selectedOption = DATE_RANGES.find((r) => r.id === selectedRange) || DATE_RANGES[3];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsOpen(true);
          const idx = DATE_RANGES.findIndex((r) => r.id === selectedRange);
          setFocusedIndex(idx >= 0 ? idx : 0);
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev < DATE_RANGES.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : DATE_RANGES.length - 1));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < DATE_RANGES.length) {
            const chosen = DATE_RANGES[focusedIndex];
            onRangeChange?.(chosen.id);
            setIsOpen(false);
            triggerRef.current?.focus();
          }
          break;
        case 'Tab':
          setIsOpen(false);
          break;
        default:
          break;
      }
    },
    [isOpen, focusedIndex, selectedRange, onRangeChange]
  );

  const handleSelect = (id) => {
    onRangeChange?.(id);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={`relative inline-block text-left ${className}`}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select date range. Currently ${selectedOption.label}`}
        className="h-10 px-3.5 bg-card hover:bg-muted/40 border border-border hover:border-accent/40 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm font-medium text-foreground transition-all duration-200 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 select-none active:scale-[0.98]"
      >
        <Calendar size={15} className="text-foreground-secondary shrink-0" />
        <span>{selectedOption.label}</span>
        <ChevronDown
          size={14}
          className={`text-foreground-tertiary transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-foreground' : ''
          }`}
        />
      </button>

      {/* Custom Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            role="listbox"
            aria-label="Date range options"
            className="absolute right-0 top-full mt-1.5 w-48 sm:w-52 z-50 rounded-2xl border border-border bg-popover/95 backdrop-blur-xl p-1.5 shadow-2xl text-popover-foreground origin-top-right overflow-hidden focus:outline-none"
          >
            <div className="space-y-0.5 max-h-[300px] overflow-y-auto">
              {DATE_RANGES.map((option, index) => {
                const isSelected = option.id === selectedRange;
                const isFocused = index === focusedIndex;

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option.id)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer text-left ${
                      isSelected
                        ? 'bg-accent/15 text-accent font-semibold shadow-xs'
                        : isFocused
                        ? 'bg-muted/80 text-foreground'
                        : 'text-foreground-secondary hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <Check size={14} className="text-accent shrink-0 ml-2" strokeWidth={2.5} />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
