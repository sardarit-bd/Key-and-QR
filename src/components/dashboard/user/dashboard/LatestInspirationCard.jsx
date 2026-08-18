"use client";

import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, Heart, Share2, BookOpen } from "lucide-react";
import FavoriteButton from "@/components/favorite/FavoriteButton";
import VisualQuoteRenderer from "@/components/quote/VisualQuoteRenderer";
import VisualQuoteAudioPlayer from "@/components/quote/VisualQuoteAudioPlayer";

export default function LatestInspirationCard({
  inspiration,
  onShare,
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

  const renderedImageUrl =
    inspiration?.renderedImages?.desktop?.url ||
    inspiration?.quote?.renderedImages?.desktop?.url ||
    inspiration?.renderedImages?.mobile?.url ||
    inspiration?.quote?.renderedImages?.mobile?.url ||
    null;

  const audioTrack =
    inspiration?.editorData?.desktop?.elements?.find((e) => e.type === 'audio' && e.audioData?.source)?.audioData ||
    inspiration?.editorData?.mobile?.elements?.find((e) => e.type === 'audio' && e.audioData?.source)?.audioData ||
    inspiration?.editorData?.desktop?.audio ||
    inspiration?.editorData?.mobile?.audio ||
    inspiration?.quote?.editorData?.desktop?.elements?.find((e) => e.type === 'audio' && e.audioData?.source)?.audioData ||
    inspiration?.quote?.editorData?.mobile?.elements?.find((e) => e.type === 'audio' && e.audioData?.source)?.audioData ||
    inspiration?.quote?.editorData?.desktop?.audio ||
    inspiration?.quote?.editorData?.mobile?.audio ||
    null;

  const editorData = inspiration?.editorData || inspiration?.quote?.editorData;
  const hasVisualDesign = Boolean(
    renderedImageUrl ||
    (editorData &&
      ((editorData.desktop?.elements && editorData.desktop.elements.length > 0) ||
        (editorData.mobile?.elements && editorData.mobile.elements.length > 0) ||
        (editorData.elements && editorData.elements.length > 0)))
  );

  const actionButtonClass =
    "inline-flex h-8.5 sm:h-9 cursor-pointer items-center gap-1.5 rounded-full border border-white/15 bg-black/40 backdrop-blur-md px-3 sm:px-3.5 text-[12px] sm:text-[13px] font-medium text-white/90 transition-all duration-150 ease-out hover:bg-white/15 hover:border-white/30 hover:text-white active:scale-[0.97]";

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative w-full sm:max-w-[800px] mx-auto overflow-hidden rounded-[24px] sm:rounded-[28px] md:rounded-[32px] bg-card border border-white/10  transition-all duration-300 ${hasVisualDesign
          ? 'aspect-[375/667] sm:aspect-[16/9]'
          : 'aspect-[16/9] min-h-[380px]'
        }`}
    >
      {/* ===== Full Visual Quote Stage (Visual Quotes) ===== */}
      {hasVisualDesign ? (
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          {editorData ? (
            <VisualQuoteRenderer
              editorData={editorData}
              mode="auto"
              showAudioPlayer={false}
              className="w-full h-full"
            />
          ) : renderedImageUrl ? (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <img
                src={renderedImageUrl}
                alt={quote || "Daily Inspiration"}
                className="w-full h-full object-contain"
              />
            </div>
          ) : null}
        </div>
      ) : (
        /* ===== Full-bleed background image (Legacy Quotes only) ===== */
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

      {/* ===== Controls & Legacy Text Overlay ===== */}
      <div className="relative z-10 flex flex-col justify-between h-full p-4 sm:p-5 md:p-6 pointer-events-none">
        {/* Top row: Today's Quote badge (left) & Floating Audio Button (right) */}
        <div className="flex items-center justify-between pointer-events-auto">
          {/* Today's Quote badge */}
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-3.5 py-1.5"
          >
            <Sparkles size={12} className="text-accent" fill="currentColor" />
            <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.12em] text-white/90">
              Today&apos;s Quote
            </span>
          </motion.span>

          {/* Floating Audio Control */}
          {audioTrack?.source && (
            <div className="pointer-events-auto">
              <VisualQuoteAudioPlayer track={audioTrack} compact />
            </div>
          )}
        </div>

        {/* Middle: Legacy Quote Block (only shown if not a visual design) */}
        {!hasVisualDesign && (
          <div className="flex-1 flex flex-col justify-center items-center my-2 w-full min-h-0 overflow-hidden pointer-events-auto">
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
          </div>
        )}

        {/* Bottom row: Action Buttons (left) & Usage Status Pill (right) */}
        <div className="flex items-center justify-between flex-wrap gap-2.5 sm:gap-3 pointer-events-auto">
          {/* Left Actions: Inspire + Favorite + Share + Read Again */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            {/* Primary Action: Inspire */}
            <motion.button
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={reduceMotion ? undefined : { scale: 1.02 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              onClick={onReadAgain}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-accent px-4 sm:px-4.5 py-2 text-[12px] sm:text-[13px] font-semibold text-accent-foreground shadow-md shadow-accent/20 transition-all duration-150 hover:brightness-105 active:scale-[0.97]"
            >
              <Sparkles size={14} fill="currentColor" />
              <span>Inspire</span>
            </motion.button>

            {/* Favorite */}
            {quoteId ? (
              <FavoriteButton
                id={quoteId}
                type="quote"
                showText
                activeText="Favorited"
                inactiveText="Favorite"
                size="sm"
                onToggle={(res) => onFavoriteChange && onFavoriteChange(res)}
                className={actionButtonClass}
              />
            ) : (
              <span className={`${actionButtonClass} !text-white/40 !cursor-not-allowed`}>
                <Heart size={14} />
                <span>Favorite</span>
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
              <Share2 size={14} />
              <span>Share</span>
            </motion.button>

            {/* Read Again */}
            <motion.button
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              onClick={onReadAgain}
              aria-label="Read quote again"
              className={actionButtonClass}
            >
              <BookOpen size={14} />
              <span className="hidden sm:inline">Read Again</span>
              <span className="sm:hidden">Read</span>
            </motion.button>
          </div>

          {/* Right: Consolidated Usage Status Pill */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 backdrop-blur-md px-3 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-[12px] font-medium text-white/85 select-none"
          >
            <Sparkles size={13} className="text-accent shrink-0" />
            <span>
              {dailyLimit === 0
                ? "Unlimited"
                : `${usedToday} of ${dailyLimit} used today`}
            </span>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
