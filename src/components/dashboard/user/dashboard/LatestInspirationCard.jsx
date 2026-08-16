"use client";

import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, Heart, Share2, Gift } from "lucide-react";
import FavoriteButton from "@/components/favorite/FavoriteButton";
import VisualQuoteRenderer from "@/components/quote/VisualQuoteRenderer";

export default function LatestInspirationCard({
  inspiration,
  onShare,
  onGift,
  onReadAgain,
  onFavoriteChange,
}) {
  const reduceMotion = useReducedMotion();
  const quote = inspiration?.text || "";
  const author = inspiration?.author || "";
  const image = inspiration?.image || null;
  const category = inspiration?.category || null;
  const usedToday = inspiration?.dailyUsage?.usedToday ?? 0;
  const dailyLimit = inspiration?.dailyUsage?.dailyLimit ?? 0;
  const quoteId = inspiration?.quoteId || inspiration?.id || null;
  const hasVisualDesign = Boolean(
    inspiration?.editorData &&
    ((inspiration.editorData.desktop?.elements && inspiration.editorData.desktop.elements.length > 0) ||
      (inspiration.editorData.mobile?.elements && inspiration.editorData.mobile.elements.length > 0) ||
      (inspiration.editorData.elements && inspiration.editorData.elements.length > 0))
  );

  const remaining = dailyLimit > 0 ? Math.max(0, dailyLimit - usedToday) : 0;

  const actionButtonClass =
    "inline-flex h-9 sm:h-10 w-auto cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-black/35 px-3 sm:px-4 text-[13px] font-medium text-white/80 transition-colors duration-150 ease-out hover:bg-white/10 hover:border-white/20 hover:text-white active:scale-[0.97]";

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="group relative w-full overflow-hidden rounded-[24px] sm:rounded-[28px] md:rounded-[32px] min-h-[360px] sm:min-h-[420px] md:min-h-[460px]"
    >
      {/* ===== Full-bleed background image (legacy quotes only) ===== */}
      {!hasVisualDesign && (
        <>
          {image ? (
            <div className="absolute inset-0">
              <Image
                src={image}
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 80vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
          )}

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
        </>
      )}

      {/* ===== Content ===== */}
      <div className="relative z-10 flex flex-col justify-between h-full p-6 sm:p-8 md:p-10 lg:p-12">
        {/* Top row: badge + usage */}
        <div className="flex items-center justify-between">
          {/* Today's Quote badge */}
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3.5 py-1.5"
          >
            <Sparkles size={12} className="text-accent" fill="currentColor" />
            <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.12em] text-white/90">
              Today&apos;s Quote
            </span>
          </motion.span>

          {/* Usage indicator */}
          {dailyLimit > 0 && (
            <motion.span
              initial={reduceMotion ? false : { opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 backdrop-blur-md px-3 py-1.5"
            >
              <span className="text-[16px] leading-none">☀</span>
              <span className="text-[11px] sm:text-[12px] font-medium text-white/80">
                {remaining} remaining
              </span>
            </motion.span>
          )}
        </div>

        {/* Middle: Visual Quote or Legacy Quote Block */}
        <div className="flex-1 flex flex-col justify-center my-6 sm:my-8 md:my-10">
          {hasVisualDesign ? (
            <div className="w-full flex items-center justify-center min-h-[280px] sm:min-h-[320px] max-h-[380px]">
              <VisualQuoteRenderer
                editorData={inspiration.editorData}
                mode="auto"
                showAudioPlayer={true}
                className="w-full h-full max-w-[720px]"
              />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={quote}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="max-w-[720px]"
              >
                <p className="text-[28px] sm:text-[36px] md:text-[44px] lg:text-[52px] xl:text-[58px] leading-[1.15] sm:leading-[1.18] tracking-tight text-white font-light sm:font-normal text-pretty drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
                  {quote}
                </p>

                {(author || category?.name) && (
                  <footer className="mt-6 sm:mt-8 flex items-center gap-3">
                    {author && (
                      <cite className="not-italic text-[15px] sm:text-[16px] md:text-[18px] text-white/75 font-medium tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)]">
                        &mdash; {author}
                      </cite>
                    )}
                    {category?.name && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/8 backdrop-blur-md px-2.5 py-1 text-[11px] sm:text-[12px] font-medium text-white/70">
                        <Sparkles size={10} className="text-accent" />
                        {category.name}
                      </span>
                    )}
                  </footer>
                )}
              </motion.blockquote>
            </AnimatePresence>
          )}
        </div>

        {/* Bottom row: actions */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Inspire CTA */}
          <motion.button
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            onClick={onReadAgain}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-accent px-6 sm:px-7 py-3 sm:py-3.5 text-[14px] sm:text-[15px] font-semibold text-accent-foreground shadow-lg shadow-accent/25 transition-all duration-200 hover:shadow-xl hover:shadow-accent/35 hover:brightness-105 active:scale-[0.97]"
          >
            <Sparkles size={16} fill="currentColor" />
            Inspire
          </motion.button>

          {/* Secondary actions: Save / Share / Gift */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Save */}
            {quoteId ? (
              <FavoriteButton
                id={quoteId}
                type="quote"
                showText
                size="sm"
                onToggle={(res) => onFavoriteChange && onFavoriteChange(res)}
                className={actionButtonClass}
              />
            ) : (
              <span className={`${actionButtonClass} !text-white/40 !cursor-not-allowed`}>
                <Heart size={13} />
                Save
              </span>
            )}

            {/* Share */}
            <motion.button
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              onClick={onShare}
              aria-label="Share quote"
              className={actionButtonClass}
            >
              <Share2 size={13} />
              <span className="hidden sm:inline">Share</span>
            </motion.button>

            {/* Gift */}
            <motion.button
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              onClick={onGift}
              aria-label="Gift this quote"
              className={actionButtonClass}
            >
              <Gift size={13} />
              <span className="hidden sm:inline">Gift</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
