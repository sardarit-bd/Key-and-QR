"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User, Gift, MessageSquareHeart, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const PurchaseOptions = ({
    selectedOption,
    onOptionChange,
    giftMessage,
    onGiftMessageChange,
}) => {
    const isGift = selectedOption === 'gift';
    const charCount = giftMessage?.length || 0;
    const maxChars = 500;
    const nearLimit = charCount >= maxChars - 50;

    return (
        <div>
            <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[#8A7A5C]">
                Choose Your Message
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 items-stretch">
                {/* Self Purchase Option */}
                <motion.button
                    type="button"
                    onClick={() => onOptionChange('self')}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                        "relative flex flex-col justify-start h-full w-full cursor-pointer rounded-xl border p-3.5 sm:p-4 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6922D]/40",
                        selectedOption === 'self'
                            ? "border-[#C6922D] bg-[#FDFBF7] shadow-[0_4px_16px_-8px_rgba(198,146,45,0.2)]"
                            : "border-[#EDE4D0] bg-white hover:border-[#C6922D]/35 hover:bg-[#FAF8F5]/50"
                    )}
                    aria-pressed={selectedOption === 'self'}
                >
                    <AnimatePresence>
                        {selectedOption === 'self' && (
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
                            selectedOption === 'self'
                                ? "border-[#C6922D]/30 bg-[#C6922D]/10 text-[#A6782B]"
                                : "border-[#EDE4D0] bg-[#F8F5EE] text-[#9A8B6F]"
                        )}>
                            <User size={14} />
                        </span>
                        <h3 className="text-[13.5px] font-semibold text-[#2E2A24] leading-snug">
                            Purchase for yourself
                        </h3>
                    </div>

                    {/* Description: Wrapped naturally without clipping */}
                    <p className="mt-2 text-[12px] leading-relaxed text-[#8A7A5C]">
                        Selected quote from our collection
                    </p>
                </motion.button>

                {/* Gift Purchase Option */}
                <motion.button
                    type="button"
                    onClick={() => onOptionChange('gift')}
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

                    {/* Description: Wrapped naturally without clipping */}
                    <p className="mt-2 text-[12px] leading-relaxed text-[#8A7A5C]">
                        Personalize with your own words
                    </p>
                </motion.button>
            </div>

            {/* Gift Message — smooth height + opacity reveal */}
            <AnimatePresence>
                {isGift && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="rounded-2xl border border-[#EDE4D0] bg-white p-5 shadow-[0_2px_12px_-4px_rgba(60,45,15,0.04)]">
                            {/* Header */}
                            <div className="mb-3.5 flex items-center justify-between">
                                <label htmlFor="gift-message" className="flex items-center gap-2 text-sm font-semibold text-[#2E2A24] cursor-pointer">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#C6922D]/10 text-[#A6782B]">
                                        <MessageSquareHeart className="h-3.5 w-3.5 text-[#C6922D]" />
                                    </span>
                                    Personal Gift Message
                                </label>
                                <span className="text-[11px] font-medium text-[#8A7A5C] bg-[#FDF8EE] px-2.5 py-0.5 rounded-full border border-[#EDE4D0]">
                                    Linked to Tag
                                </span>
                            </div>

                            {/* Distinct interactive textarea input */}
                            <textarea
                                id="gift-message"
                                value={giftMessage}
                                onChange={(e) => onGiftMessageChange(e.target.value)}
                                placeholder="Write something heartfelt and meaningful to be read upon scanning..."
                                rows={5}
                                maxLength={maxChars}
                                className="min-h-[120px] w-full resize-none rounded-xl border border-[#DCD3C1] bg-[#FCFBF8] p-3.5 text-sm text-[#2E2A24] leading-relaxed placeholder:text-[#A99B7F] transition-all duration-200 hover:border-[#C6922D]/50 focus:border-[#C6922D] focus:bg-white focus:ring-1 focus:ring-[#C6922D] focus:outline-none"
                                aria-label="Gift message"
                                aria-invalid={nearLimit || undefined}
                            />

                            {/* Footer helper & counter */}
                            <div className="mt-3.5 pt-3 border-t border-[#EDE4D0]/60 flex items-center justify-between gap-3 text-xs">
                                <p className="text-[#8A7A5C] text-[12px] flex items-center gap-1.5 min-w-0">
                                    <span className="shrink-0 text-amber-500">✨</span>
                                    <span className="truncate">Linked to physical tag &amp; delivered on first scan.</span>
                                </p>
                                <span className={cn(
                                    "font-medium tabular-nums shrink-0 text-[11.5px] px-2.5 py-0.5 rounded-md",
                                    charCount === 0 ? "text-[#A99B7F] bg-[#F8F5EE]" : nearLimit ? "text-[#A6782B] bg-[#FCE8CB]" : "text-[#7A6A4E] bg-[#F8F5EE]"
                                )}>
                                    {charCount}/{maxChars}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PurchaseOptions;
