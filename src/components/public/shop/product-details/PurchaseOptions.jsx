"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Gift,
    MessageSquareHeart,
    Check,
    ChevronDown,
    Copy,
    Sparkles,
    Tag,
    Layers,
    ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export const PurchaseOptions = ({
    selectedOption,
    onOptionChange,
    giftMessage,
    onGiftMessageChange,
    giftOption = "same",
    onGiftOptionChange,
    giftMessages = [],
    onGiftMessagesChange,
    quantity = 1,
}) => {
    const isGift = selectedOption === "gift";
    const maxChars = 500;
    const charCount = giftMessage?.length || 0;
    const nearLimit = charCount >= maxChars - 50;

    // Track which tag card is expanded (0 = first card expanded by default)
    const [expandedIndex, setExpandedIndex] = useState(0);

    // Ensure giftMessages array has entries for all quantities
    useEffect(() => {
        if (!isGift || giftOption !== "different") return;

        const currentCount = giftMessages?.length || 0;
        if (currentCount !== quantity && typeof onGiftMessagesChange === "function") {
            const nextMessages = Array.from({ length: quantity }, (_, idx) => {
                const existing = giftMessages?.[idx];
                return existing
                    ? { ...existing, tagIndex: idx + 1 }
                    : { tagIndex: idx + 1, recipientName: "", message: "" };
            });
            onGiftMessagesChange(nextMessages);
        }
    }, [isGift, giftOption, quantity, giftMessages, onGiftMessagesChange]);

    const handleUpdateTagMessage = (index, field, value) => {
        if (typeof onGiftMessagesChange !== "function") return;

        const updated = Array.from({ length: quantity }, (_, idx) => {
            const current = giftMessages?.[idx] || { tagIndex: idx + 1, recipientName: "", message: "" };
            if (idx === index) {
                return { ...current, [field]: value };
            }
            return current;
        });
        onGiftMessagesChange(updated);
    };

    // Replicate Tag 1 message & recipient to all remaining tags (2 to N)
    const handleCopyFirstToAll = () => {
        const firstEntry = giftMessages?.[0];
        const firstMsg = firstEntry?.message?.trim();
        if (!firstMsg) {
            toast.error("Please enter a message for Gift Tag 1 first.");
            setExpandedIndex(0);
            return;
        }
        if (typeof onGiftMessagesChange !== "function") return;

        const updated = Array.from({ length: quantity }, (_, idx) => {
            const current = giftMessages?.[idx] || { tagIndex: idx + 1, recipientName: "", message: "" };
            if (idx === 0) return current;
            return {
                ...current,
                recipientName: firstEntry.recipientName ? firstEntry.recipientName : current.recipientName,
                message: firstEntry.message,
            };
        });
        onGiftMessagesChange(updated);
        toast.success(`Copied Gift Tag 1 details to all ${quantity - 1} remaining tags!`, {
            icon: "📋",
            duration: 3000,
        });
    };

    // Calculate filled status
    const filledCount = Array.from({ length: quantity }).filter((_, idx) => {
        return Boolean(giftMessages?.[idx]?.message?.trim());
    }).length;
    const isAllFilled = filledCount === quantity;

    return (
        <div>
            <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[#8A7A5C]">
                Choose Your Message
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 items-stretch">
                {/* Self Purchase Option */}
                <motion.button
                    type="button"
                    onClick={() => onOptionChange("self")}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                        "relative flex flex-col justify-start h-full w-full cursor-pointer rounded-xl border p-3.5 sm:p-4 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6922D]/40",
                        selectedOption === "self"
                            ? "border-[#C6922D] bg-[#FDFBF7] shadow-[0_4px_16px_-8px_rgba(198,146,45,0.2)]"
                            : "border-[#EDE4D0] bg-white hover:border-[#C6922D]/35 hover:bg-[#FAF8F5]/50"
                    )}
                    aria-pressed={selectedOption === "self"}
                >
                    <AnimatePresence>
                        {selectedOption === "self" && (
                            <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 450, damping: 20 }}
                                className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-[#C6922D] text-white shadow-xs"
                            >
                                <Check size={10} strokeWidth={3} />
                            </motion.span>
                        )}
                    </AnimatePresence>

                    {/* Top row: Icon + Title */}
                    <div className="flex items-center gap-2.5 pr-6">
                        <span className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200",
                            selectedOption === "self"
                                ? "border-[#C6922D]/30 bg-[#C6922D]/10 text-[#A6782B]"
                                : "border-[#EDE4D0] bg-[#F8F5EE] text-[#9A8B6F]"
                        )}>
                            <User size={14} />
                        </span>
                        <h3 className="text-[13.5px] font-semibold text-[#2E2A24] leading-snug">
                            Purchase for yourself
                        </h3>
                    </div>

                    <p className="mt-2 text-[12px] leading-relaxed text-[#8A7A5C]">
                        Selected quote from our collection
                    </p>
                </motion.button>

                {/* Gift Purchase Option */}
                <motion.button
                    type="button"
                    onClick={() => onOptionChange("gift")}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                        "relative flex flex-col justify-start h-full w-full cursor-pointer rounded-xl border p-3.5 sm:p-4 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6922D]/40",
                        isGift
                            ? "border-[#C6922D] bg-[#FDFBF7] shadow-[0_4px_16px_-8px_rgba(198,146,45,0.2)]"
                            : "border-[#EDE4D0] bg-white hover:border-[#C6922D]/35 hover:bg-[#FAF8F5]/50"
                    )}
                    aria-pressed={isGift}
                >
                    <AnimatePresence>
                        {isGift && (
                            <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 450, damping: 20 }}
                                className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-[#C6922D] text-white shadow-xs"
                            >
                                <Check size={10} strokeWidth={3} />
                            </motion.span>
                        )}
                    </AnimatePresence>

                    {/* Top row: Icon + Title */}
                    <div className="flex items-center gap-2.5 pr-6">
                        <span className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200",
                            isGift
                                ? "border-[#C6922D]/30 bg-[#C6922D]/10 text-[#A6782B]"
                                : "border-[#EDE4D0] bg-[#F8F5EE] text-[#9A8B6F]"
                        )}>
                            <Gift size={14} />
                        </span>
                        <h3 className="text-[13.5px] font-semibold text-[#2E2A24] leading-snug">
                            Purchase for Gift
                        </h3>
                    </div>

                    <p className="mt-2 text-[12px] leading-relaxed text-[#8A7A5C]">
                        Personalize with your own words
                    </p>
                </motion.button>
            </div>

            {/* Gift Options & Messages Container */}
            <AnimatePresence>
                {isGift && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="rounded-2xl border border-[#EDE4D0] bg-white p-4 sm:p-5 shadow-[0_2px_12px_-4px_rgba(60,45,15,0.04)]">
                            {/* Multi-quantity Choice Pill Switcher (Rendered only when quantity > 1) */}
                            {quantity > 1 && (
                                <div className="mb-4 pb-4 border-b border-[#EDE4D0]/70">
                                    <div className="flex items-center justify-between mb-2.5">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-[#8A7A5C]">
                                            Gift Messaging Mode ({quantity} Tags)
                                        </span>
                                        <span className="text-[11px] font-medium text-[#C6922D] bg-[#FDF8EE] px-2 py-0.5 rounded-full border border-[#EDE4D0]">
                                            {giftOption === "different" ? "Per-tag Custom" : "Shared Message"}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {/* Same Message Pill */}
                                        <button
                                            type="button"
                                            onClick={() => onGiftOptionChange?.("same")}
                                            className={cn(
                                                "flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer",
                                                giftOption === "same"
                                                    ? "border-[#C6922D] bg-[#FAF6EE] shadow-xs"
                                                    : "border-[#EDE4D0] bg-[#FCFBF8] hover:border-[#C6922D]/40"
                                            )}
                                        >
                                            <span className={cn(
                                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
                                                giftOption === "same"
                                                    ? "bg-[#C6922D] text-white border-[#C6922D]"
                                                    : "bg-white text-[#8A7A5C] border-[#EDE4D0]"
                                            )}>
                                                <Copy size={13} />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-[13px] font-semibold text-[#2E2A24] leading-snug">
                                                    Same message for all tags
                                                </p>
                                                <p className="text-[11px] text-[#8A7A5C] truncate">
                                                    All {quantity} tags share one dedication
                                                </p>
                                            </div>
                                        </button>

                                        {/* Different Message Pill */}
                                        <button
                                            type="button"
                                            onClick={() => onGiftOptionChange?.("different")}
                                            className={cn(
                                                "flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer",
                                                giftOption === "different"
                                                    ? "border-[#C6922D] bg-[#FAF6EE] shadow-xs"
                                                    : "border-[#EDE4D0] bg-[#FCFBF8] hover:border-[#C6922D]/40"
                                            )}
                                        >
                                            <span className={cn(
                                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
                                                giftOption === "different"
                                                    ? "bg-[#C6922D] text-white border-[#C6922D]"
                                                    : "bg-white text-[#8A7A5C] border-[#EDE4D0]"
                                            )}>
                                                <Sparkles size={13} />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-[13px] font-semibold text-[#2E2A24] leading-snug">
                                                    Different message for each tag
                                                </p>
                                                <p className="text-[11px] text-[#8A7A5C] truncate">
                                                    Personalize Gift 1 through {quantity}
                                                </p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* MODE 1: Single Shared Message Box (quantity === 1 or giftOption === 'same') */}
                            {(quantity === 1 || giftOption === "same") && (
                                <div>
                                    <div className="mb-3 flex items-center justify-between">
                                        <label htmlFor="gift-message" className="flex items-center gap-2 text-sm font-semibold text-[#2E2A24] cursor-pointer">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#C6922D]/10 text-[#A6782B]">
                                                <MessageSquareHeart className="h-3.5 w-3.5 text-[#C6922D]" />
                                            </span>
                                            Personal Gift Message
                                        </label>
                                        <span className="text-[11px] font-medium text-[#8A7A5C] bg-[#FDF8EE] px-2.5 py-0.5 rounded-full border border-[#EDE4D0]">
                                            {quantity > 1 ? `Shared on ${quantity} Tags` : "Linked to Tag"}
                                        </span>
                                    </div>

                                    <textarea
                                        id="gift-message"
                                        value={giftMessage}
                                        onChange={(e) => onGiftMessageChange(e.target.value)}
                                        placeholder="Write something heartfelt and meaningful to be read upon scanning..."
                                        rows={4}
                                        maxLength={maxChars}
                                        className="min-h-[110px] w-full resize-none rounded-xl border border-[#DCD3C1] bg-[#FCFBF8] p-3.5 text-sm text-[#2E2A24] leading-relaxed placeholder:text-[#A99B7F] transition-all duration-200 hover:border-[#C6922D]/50 focus:border-[#C6922D] focus:bg-white focus:ring-1 focus:ring-[#C6922D] focus:outline-none"
                                        aria-label="Gift message"
                                        aria-invalid={nearLimit || undefined}
                                    />

                                    <div className="mt-3 pt-2.5 border-t border-[#EDE4D0]/60 flex items-center justify-between gap-3 text-xs">
                                        <p className="text-[#8A7A5C] text-[12px] flex items-center gap-1.5 min-w-0">
                                            <span className="shrink-0 text-amber-500">✨</span>
                                            <span className="truncate">
                                                {quantity > 1
                                                    ? `Delivered on scan across all ${quantity} tags.`
                                                    : "Linked to physical tag & delivered on first scan."}
                                            </span>
                                        </p>
                                        <span className={cn(
                                            "font-medium tabular-nums shrink-0 text-[11.5px] px-2.5 py-0.5 rounded-md",
                                            charCount === 0 ? "text-[#A99B7F] bg-[#F8F5EE]" : nearLimit ? "text-[#A6782B] bg-[#FCE8CB]" : "text-[#7A6A4E] bg-[#F8F5EE]"
                                        )}>
                                            {charCount}/{maxChars}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* MODE 2: Multi-Tag Collapsible Accordion (quantity > 1 && giftOption === 'different') */}
                            {quantity > 1 && giftOption === "different" && (
                                <div className="space-y-3">
                                    {/* Sticky / Pinned Quick-Action Toolbar */}
                                    <div className="sticky -top-4 sm:-top-5 z-10 -mx-4 sm:-mx-5 px-4 sm:px-5 py-3 bg-white/95 backdrop-blur-md border-b border-[#EDE4D0]/80 mb-2 shadow-[0_4px_12px_-4px_rgba(60,45,15,0.03)] flex flex-wrap items-center justify-between gap-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#C6922D]/10 text-[#A6782B]">
                                                <Sparkles className="h-3.5 w-3.5 text-[#C6922D]" />
                                            </span>
                                            <span className="text-xs font-semibold uppercase tracking-wider text-[#2E2A24]">
                                                Individual Tag Messages
                                            </span>
                                            <span className={cn(
                                                "text-[11px] font-semibold px-2.5 py-0.5 rounded-full border tabular-nums transition-colors",
                                                isAllFilled
                                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                                    : "bg-[#FDF8EE] text-[#A6782B] border-[#EDE4D0]"
                                            )}>
                                                {filledCount} of {quantity} filled
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={handleCopyFirstToAll}
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer border shadow-2xs active:scale-98",
                                                    giftMessages?.[0]?.message?.trim()
                                                        ? "bg-[#FAF5EC] text-[#91671F] border-[#E3CFAD] hover:bg-[#F3E7D3] hover:text-[#7A5310] hover:border-[#C6922D]"
                                                        : "bg-[#FCFBF8] text-[#A99B7F] border-[#EDE4D0] hover:border-[#D5C7AF]"
                                                )}
                                                title={giftMessages?.[0]?.message?.trim() ? "Replicate Gift 1 details to all remaining tags" : "Fill Gift 1 first to copy"}
                                            >
                                                <Copy size={12} className="shrink-0 text-[#C6922D]" />
                                                <span>Copy Gift 1 text to all remaining tags</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Dedicated Fixed-Height Scrollable Container */}
                                    <div
                                        className={cn(
                                            "max-h-[480px] overflow-y-auto pr-1.5 space-y-2.5 scroll-smooth",
                                            /* Custom luxury stationery styled scrollbar */
                                            "[scrollbar-width:thin] [scrollbar-color:#D8CDBC_#FAF8F5]",
                                            "[&::-webkit-scrollbar]:w-1.5",
                                            "[&::-webkit-scrollbar-track]:bg-[#FAF8F5]",
                                            "[&::-webkit-scrollbar-track]:rounded-full",
                                            "[&::-webkit-scrollbar-thumb]:bg-[#D8CDBC]",
                                            "[&::-webkit-scrollbar-thumb]:rounded-full",
                                            "hover:[&::-webkit-scrollbar-thumb]:bg-[#C6922D]"
                                        )}
                                    >
                                        {Array.from({ length: quantity }, (_, idx) => {
                                            const entry = giftMessages?.[idx] || { tagIndex: idx + 1, recipientName: "", message: "" };
                                            const isExpanded = expandedIndex === idx;
                                            const isComplete = Boolean(entry.message?.trim());
                                            const itemCharCount = entry.message?.length || 0;
                                            const isMaster = idx === 0;

                                            return (
                                                <div
                                                    key={idx}
                                                    className={cn(
                                                        "rounded-xl border transition-all duration-200 overflow-hidden",
                                                        isExpanded
                                                            ? "border-[#C6922D] bg-[#FCFBF8] shadow-xs"
                                                            : "border-[#EDE4D0] bg-white hover:border-[#D5C7AF]"
                                                    )}
                                                >
                                                    {/* Card Header Accordion Trigger */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}
                                                        className="w-full flex items-center justify-between p-3.5 text-left cursor-pointer transition-colors"
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <span className={cn(
                                                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                                                                isComplete
                                                                    ? "bg-emerald-100 text-emerald-800"
                                                                    : "bg-amber-100 text-amber-800"
                                                            )}>
                                                                {idx + 1}
                                                            </span>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[13px] font-semibold text-[#2E2A24]">
                                                                        Gift Tag {idx + 1} of {quantity}
                                                                    </span>
                                                                    {isMaster && (
                                                                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider text-[#A6782B] bg-[#FDF8EE] px-1.5 py-0.5 rounded border border-[#EDE4D0]">
                                                                            Master
                                                                        </span>
                                                                    )}
                                                                    {entry.recipientName?.trim() && (
                                                                        <span className="text-[11px] font-medium text-[#8A7A5C] truncate max-w-[120px]">
                                                                            • {entry.recipientName.trim()}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {!isExpanded && (
                                                                    <p className="text-[11px] text-[#A99B7F] truncate max-w-[240px] sm:max-w-[340px]">
                                                                        {entry.message?.trim() || "No message entered yet"}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 shrink-0">
                                                            {isComplete ? (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700 border border-emerald-200/60">
                                                                    <Check size={10} strokeWidth={3} />
                                                                    Ready
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-medium text-amber-700 border border-amber-200/60">
                                                                    Needs Text
                                                                </span>
                                                            )}
                                                            <motion.span
                                                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="text-[#8A7A5C]"
                                                            >
                                                                <ChevronDown size={15} />
                                                            </motion.span>
                                                        </div>
                                                    </button>

                                                    {/* Card Body Collapsible */}
                                                    <AnimatePresence initial={false}>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="p-3.5 pt-0 space-y-3 border-t border-[#EDE4D0]/60">
                                                                    {/* Recipient Name Input */}
                                                                    <div>
                                                                        <label className="block text-[11.5px] font-medium text-[#7A6A4E] mb-1">
                                                                            Recipient Name (Optional)
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={entry.recipientName || ""}
                                                                            onChange={(e) => handleUpdateTagMessage(idx, "recipientName", e.target.value)}
                                                                            placeholder={`e.g. Sarah, Dad, Colleague ${idx + 1}`}
                                                                            maxLength={100}
                                                                            className="w-full rounded-lg border border-[#DCD3C1] bg-white px-3 py-1.5 text-xs text-[#2E2A24] placeholder:text-[#A99B7F] focus:border-[#C6922D] focus:outline-none focus:ring-1 focus:ring-[#C6922D]"
                                                                        />
                                                                    </div>

                                                                    {/* Tag Message Textarea */}
                                                                    <div>
                                                                        <label className="block text-[11.5px] font-medium text-[#7A6A4E] mb-1">
                                                                            Message for Tag #{idx + 1}
                                                                        </label>
                                                                        <textarea
                                                                            value={entry.message || ""}
                                                                            onChange={(e) => handleUpdateTagMessage(idx, "message", e.target.value)}
                                                                            placeholder={`Write a personal message for Tag ${idx + 1}...`}
                                                                            rows={3}
                                                                            maxLength={maxChars}
                                                                            className="w-full resize-none rounded-lg border border-[#DCD3C1] bg-white p-3 text-xs text-[#2E2A24] leading-relaxed placeholder:text-[#A99B7F] focus:border-[#C6922D] focus:outline-none focus:ring-1 focus:ring-[#C6922D]"
                                                                        />
                                                                        <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#8A7A5C]">
                                                                            <span className="flex items-center gap-1">
                                                                                <Tag size={11} className="text-[#C6922D]" />
                                                                                Bound to Physical Tag {idx + 1}
                                                                            </span>
                                                                            <span className="tabular-nums font-medium">
                                                                                {itemCharCount}/{maxChars}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PurchaseOptions;
