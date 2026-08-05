"use client";

import { Textarea } from "@/components/ui/textarea";
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
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#8A7A5C]">
                Choose Your Message
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Self Purchase Option */}
                <motion.button
                    type="button"
                    onClick={() => onOptionChange('self')}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                        "relative w-full cursor-pointer rounded-2xl border p-5 text-left transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6922D]/50 focus-visible:ring-offset-2",
                        selectedOption === 'self'
                            ? "border-[#C6922D]/60 bg-[#FDF8EE] shadow-[0_8px_24px_-12px_rgba(198,146,45,0.25)]"
                            : "border-[#EDE4D0] bg-white hover:border-[#C6922D]/30"
                    )}
                    aria-pressed={selectedOption === 'self'}
                >
                    <AnimatePresence>
                        {selectedOption === 'self' && (
                            <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                                className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#C6922D] text-white"
                            >
                                <Check size={12} strokeWidth={3} />
                            </motion.span>
                        )}
                    </AnimatePresence>

                    <div className="flex items-start gap-3">
                        <span className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300",
                            selectedOption === 'self'
                                ? "border-[#C6922D]/30 bg-[#C6922D]/10 text-[#A6782B]"
                                : "border-[#EDE4D0] bg-[#F8F3E8] text-[#A99B7F]"
                        )}>
                            <User size={16} />
                        </span>
                        <div>
                            <h3 className="font-semibold text-[#2E2A24]">Purchase for yourself</h3>
                            <p className="mt-1 text-[13px] leading-relaxed text-[#8A7A5C]">
                                We'll select a beautiful quote from our collection
                            </p>
                        </div>
                    </div>
                </motion.button>

                {/* Gift Purchase Option */}
                <motion.button
                    type="button"
                    onClick={() => onOptionChange('gift')}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                        "relative w-full cursor-pointer rounded-2xl border p-5 text-left transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6922D]/50 focus-visible:ring-offset-2",
                        isGift
                            ? "border-[#C6922D]/60 bg-[#FDF8EE] shadow-[0_8px_24px_-12px_rgba(198,146,45,0.25)]"
                            : "border-[#EDE4D0] bg-white hover:border-[#C6922D]/30"
                    )}
                    aria-pressed={isGift}
                >
                    <AnimatePresence>
                        {isGift && (
                            <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                                className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#C6922D] text-white"
                            >
                                <Check size={12} strokeWidth={3} />
                            </motion.span>
                        )}
                    </AnimatePresence>

                    <div className="flex items-start gap-3">
                        <span className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300",
                            isGift
                                ? "border-[#C6922D]/30 bg-[#C6922D]/10 text-[#A6782B]"
                                : "border-[#EDE4D0] bg-[#F8F3E8] text-[#A99B7F]"
                        )}>
                            <Gift size={16} />
                        </span>
                        <div>
                            <h3 className="font-semibold text-[#2E2A24]">Purchase for Gift</h3>
                            <p className="mt-1 text-[13px] leading-relaxed text-[#8A7A5C]">
                                Personalize with your own words
                            </p>
                        </div>
                    </div>
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
                        <label htmlFor="gift-message" className="mb-2 flex items-center gap-1.5 text-sm font-medium text-[#2E2A24]">
                            <MessageSquareHeart className="h-4 w-4 text-[#C6922D]" />
                            Gift Message
                        </label>
                        <Textarea
                            id="gift-message"
                            value={giftMessage}
                            onChange={(e) => onGiftMessageChange(e.target.value)}
                            placeholder="Write something meaningful..."
                            rows={4}
                            maxLength={maxChars}
                            className="resize-none rounded-xl border-[#E5DCC8] bg-white text-[#2E2A24] placeholder:text-[#A99B7F] focus:border-[#C6922D]/60 focus:ring-2 focus:ring-[#C6922D]/15"
                            aria-label="Gift message"
                            aria-invalid={nearLimit || undefined}
                        />
                        <div className="mt-1.5 flex items-center justify-between">
                            <p className={cn(
                                "text-xs",
                                charCount === 0 ? "text-[#A99B7F]" : nearLimit ? "text-[#A6782B]" : "text-[#8A7A5C]"
                            )}>
                                {charCount === 0
                                    ? "Add a personal note"
                                    : `${charCount} of ${maxChars} characters`}
                            </p>
                            <span className="text-xs tabular-nums text-[#A99B7F]">{charCount}/{maxChars}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PurchaseOptions;
