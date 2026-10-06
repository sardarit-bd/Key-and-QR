"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, Play, Pause, Gift } from "lucide-react";
import VisualQuoteRenderer from "@/components/public/quote/VisualQuoteRenderer";
import VisualQuoteAudioPlayer from "@/components/public/quote/VisualQuoteAudioPlayer";
import GiftDedicationCard from "@/components/common/GiftDedicationCard";
import FloatingQuoteControls from "@/components/public/quote/FloatingQuoteControls";

const SESSION_INTERACTION_KEY = "myinspire_user_interacted";

export default function LatestInspirationCard({
  inspiration,
  onInspire,
  onShare,
  onReadAgain,
  onFavoriteChange,
  isReceiving,
  isMuted = false,
  disableAutoplay = false,
}) {
  const reduceMotion = useReducedMotion();
  const quote = inspiration?.text || "";
  const author = inspiration?.author || "";
  const image = inspiration?.image || null;
  const category = inspiration?.category || null;
  const usedToday = inspiration?.dailyUsage?.usedToday ?? 0;
  const dailyLimit = inspiration?.dailyUsage?.dailyLimit ?? 0;
  const quoteId = inspiration?.quoteId || inspiration?.id || null;
  // 0 dailyLimit means unlimited (premium); only block when limit > 0 and reached.
  const isLimitReached = dailyLimit > 0 && usedToday >= dailyLimit;

  // Gift Dedication Metadata
  const rawGiftDedication = inspiration?.giftDedication || inspiration?.quote?.giftDedication || null;
  const giftDedication = (rawGiftDedication && (rawGiftDedication.text || rawGiftDedication.message)) ? rawGiftDedication : null;
  const isGift = Boolean(inspiration?.isGift || inspiration?.quote?.isGift || giftDedication);
  const isPersonalGift = Boolean(inspiration?.isPersonalGift || inspiration?.quote?.isPersonalGift);
  const hasGiftDedication = Boolean(giftDedication || isGift || isPersonalGift);

  // Dedicated quote text extraction for the gift dedication modal
  const actualDedicationText =
    giftDedication?.text ||
    giftDedication?.message ||
    giftDedication?.quote ||
    inspiration?.giftDedication?.text ||
    inspiration?.giftDedication?.message ||
    inspiration?.latestQuote?.giftDedication?.text ||
    inspiration?.latestQuote?.giftDedication?.message ||
    inspiration?.giftMessage ||
    inspiration?.personalMessage ||
    (isGift ? (inspiration?.text || inspiration?.quote || inspiration?.latestQuote?.text || inspiration?.latestQuote?.quote || inspiration?.fullText) : null) ||
    inspiration?.text ||
    inspiration?.quote ||
    inspiration?.latestQuote?.text ||
    inspiration?.latestQuote?.quote ||
    inspiration?.fullText ||
    inspiration?.previewText ||
    quote ||
    "";

  const actualSenderName =
    giftDedication?.senderName ||
    inspiration?.giftDedication?.senderName ||
    inspiration?.latestQuote?.giftDedication?.senderName ||
    inspiration?.giftSenderName ||
    inspiration?.latestQuote?.giftSenderName ||
    author ||
    "";

  const recipientName =
    giftDedication?.recipientName ||
    inspiration?.giftDedication?.recipientName ||
    inspiration?.latestQuote?.giftDedication?.recipientName ||
    null;

  const dedicationQuoteId =
    giftDedication?.quoteId ||
    inspiration?.giftDedication?.quoteId ||
    (isGift ? (inspiration?.quoteId || inspiration?.id) : null);

  const dedicationText = actualDedicationText;
  const senderName = actualSenderName;

  const [showDedicationModal, setShowDedicationModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Video and Media Detection
  const videoUrl =
    inspiration?.videoUrl ||
    inspiration?.video ||
    inspiration?.mediaUrl ||
    inspiration?.media?.url ||
    inspiration?.quote?.videoUrl ||
    inspiration?.quote?.video ||
    inspiration?.quote?.mediaUrl ||
    (typeof image === "string" && (image.endsWith(".mp4") || image.endsWith(".webm") || image.endsWith(".mov")) ? image : null) ||
    null;

  const audioTrack =
    inspiration?.editorData?.desktop?.elements?.find((e) => e.type === "audio" && e.audioData?.source)?.audioData ||
    inspiration?.editorData?.mobile?.elements?.find((e) => e.type === "audio" && e.audioData?.source)?.audioData ||
    inspiration?.editorData?.desktop?.audio ||
    inspiration?.editorData?.mobile?.audio ||
    inspiration?.quote?.editorData?.desktop?.elements?.find((e) => e.type === "audio" && e.audioData?.source)?.audioData ||
    inspiration?.quote?.editorData?.mobile?.elements?.find((e) => e.type === "audio" && e.audioData?.source)?.audioData ||
    inspiration?.quote?.editorData?.desktop?.audio ||
    inspiration?.quote?.editorData?.mobile?.audio ||
    null;

  // Dynamic Quote Media Configuration (from Admin Quote Editor / Schema)
  const shouldAutoplay = !disableAutoplay && !isMuted && Boolean(
    inspiration?.autoplay ??
    inspiration?.quote?.autoplay ??
    audioTrack?.autoplay ??
    false
  );

  const shouldLoop = Boolean(
    inspiration?.loop ??
    inspiration?.quote?.loop ??
    audioTrack?.loop ??
    true
  );

  // Initialize playback state to false to avoid UI desync if browser blocks autoplay
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const videoRef = useRef(null);

  const renderedDesktopUrl =
    inspiration?.renderedImages?.desktop?.url ||
    inspiration?.quote?.renderedImages?.desktop?.url ||
    null;

  const renderedMobileUrl =
    inspiration?.renderedImages?.mobile?.url ||
    inspiration?.quote?.renderedImages?.mobile?.url ||
    null;

  const hasRenderedImage = Boolean(renderedDesktopUrl || renderedMobileUrl);

  const editorData = inspiration?.editorData || inspiration?.quote?.editorData;
  const hasVisualDesign = Boolean(
    hasRenderedImage ||
    (editorData &&
      ((editorData.desktop?.elements && editorData.desktop.elements.length > 0) ||
        (editorData.mobile?.elements && editorData.mobile.elements.length > 0) ||
        (editorData.elements && editorData.elements.length > 0)))
  );

  // Initialize session interaction state on mount & register global unlock listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    const alreadyInteracted = sessionStorage.getItem(SESSION_INTERACTION_KEY) === "true";
    if (alreadyInteracted) {
      setHasInteracted(true);
    }

    const handleFirstInteraction = () => {
      sessionStorage.setItem(SESSION_INTERACTION_KEY, "true");
      setHasInteracted(true);

      // If video is active and muted, safely unmute it on user interaction
      if (videoRef.current && videoRef.current.muted) {
        videoRef.current.muted = false;
        videoRef.current.play().catch((err) => {
          console.warn("[Video] Unmuted playback warning:", err);
        });
      }
    };

    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("touchstart", handleFirstInteraction, { once: true });
    window.addEventListener("keydown", handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  // Video Autoplay & Dynamic Sound Logic
  useEffect(() => {
    if (!videoRef.current || !videoUrl) return;

    const video = videoRef.current;
    video.loop = shouldLoop;

    if (isMuted || !shouldAutoplay) {
      video.pause();
      setIsVideoPlaying(false);
      return;
    }

    // If user has interacted in this session, attempt unmuted playback; otherwise start muted
    const canPlayWithSound = hasInteracted || (typeof window !== "undefined" && sessionStorage.getItem(SESSION_INTERACTION_KEY) === "true");
    video.muted = !canPlayWithSound;

    video
      .play()
      .then(() => {
        setIsVideoPlaying(true);
      })
      .catch((err) => {
        console.warn("[Video] Play with sound prevented by browser policy, falling back to muted:", err?.message || err);
        // Fallback to muted autoplay
        video.muted = true;
        video
          .play()
          .then(() => setIsVideoPlaying(true))
          .catch((e) => {
            console.warn("[Video] Muted autoplay prevented:", e);
            setIsVideoPlaying(false);
          });
      });

    return () => {
      if (video) {
        video.pause();
      }
    };
  }, [videoUrl, shouldAutoplay, shouldLoop, hasInteracted, isMuted]);

  const toggleVideoPlay = useCallback(() => {
    if (!videoRef.current) return;

    // Record interaction
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_INTERACTION_KEY, "true");
      setHasInteracted(true);
    }

    if (isVideoPlaying) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    } else {
      // Unmute on explicit user trigger
      videoRef.current.muted = false;
      videoRef.current
        .play()
        .then(() => setIsVideoPlaying(true))
        .catch((err) => {
          console.warn("[Video] Play error:", err);
          setIsVideoPlaying(false);
        });
    }
  }, [isVideoPlaying]);

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { scale: 1.008 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group relative w-full sm:max-w-[800px] mx-auto overflow-hidden rounded-2xl md:rounded-[32px] transition-all duration-300 hover:shadow-2xl hover:shadow-black/35 aspect-[375/667] sm:aspect-[16/9]"
    >
      {/* ===== Full Visual Quote Stage (Visual Quotes) ===== */}
      {hasVisualDesign ? (
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          {editorData ? (
            <VisualQuoteRenderer
              editorData={editorData}
              mode="auto"
              showAudioPlayer={false}
              fit="cover"
              className="w-full h-full"
            />
          ) : hasRenderedImage ? (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <picture className="w-full h-full flex items-center justify-center">
                {renderedMobileUrl && (
                  <source media="(max-width: 639px)" srcSet={renderedMobileUrl} />
                )}
                {renderedDesktopUrl && (
                  <source media="(min-width: 640px)" srcSet={renderedDesktopUrl} />
                )}
                <img
                  src={renderedMobileUrl || renderedDesktopUrl}
                  alt={quote || "Daily Inspiration"}
                  className="w-full h-full object-cover object-center select-none"
                />
              </picture>
            </div>
          ) : null}
        </div>
      ) : (
        /* ===== Full-bleed Media Stage (Video or Background Image) ===== */
        <>
          {videoUrl ? (
            <div className="absolute inset-0 z-0 overflow-hidden">
              <video
                ref={videoRef}
                src={videoUrl}
                autoPlay={shouldAutoplay}
                loop={shouldLoop}
                playsInline={true}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.015]"
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
              />
            </div>
          ) : image ? (
            <div className="absolute inset-0 z-0">
              <Image
                src={image}
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 80vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.015]"
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
          )}

          {/* Dark gradient overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/35 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent pointer-events-none" />
        </>
      )}

      {/* Subtle bottom gradient scrim softened on mobile to preserve natural artwork clarity */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-90 sm:opacity-0 transition-opacity duration-300 ease-out sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 z-[5]"
      />

      {/* Top bar: Quote badge & Gift Dedication (left) & Floating Media Controls (right) */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-20 flex items-center justify-between pointer-events-auto gap-2">
        {/* Quote badge & Gift Dedication Pill */}
        <div className="flex items-center gap-2 flex-wrap">
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-3 sm:px-3.5 py-1.5 shadow-sm"
          >
            <Sparkles size={12} className="text-accent" fill="currentColor" />
            <span className="text-[10.5px] sm:text-[12px] font-semibold uppercase tracking-[0.1em] sm:tracking-[0.12em] text-white/90">
              {usedToday > 0 ? "Today's Quote" : "Daily Inspiration Available"}
            </span>
          </motion.span>

          {hasGiftDedication && (
            <motion.button
              type="button"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowDedicationModal(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-black/40 hover:bg-black/55 hover:border-white/30 backdrop-blur-md px-3 sm:px-3.5 py-1.5 shadow-sm transition-all"
              title="View personal gift dedication"
            >
              <Gift size={13} className="text-accent" />
              <span className="text-[10.5px] sm:text-[12px] font-semibold uppercase tracking-[0.1em] sm:tracking-[0.12em] text-white/90">
                Gift Dedication
              </span>
            </motion.button>
          )}
        </div>

        {/* Floating Media Controls — Clean single Play/Pause trigger */}
        <div className="pointer-events-auto flex items-center gap-2">
          {videoUrl ? (
            <button
              type="button"
              onClick={toggleVideoPlay}
              aria-label={isVideoPlaying ? "Pause video" : "Play video"}
              className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] sm:min-w-[40px] min-h-[36px] sm:min-h-[40px] rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white shadow-xl flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer"
            >
              {isVideoPlaying ? (
                <Pause size={15} className="fill-current text-accent" />
              ) : (
                <Play size={15} className="fill-current text-white translate-x-0.5" />
              )}
            </button>
          ) : audioTrack?.source ? (
            <VisualQuoteAudioPlayer
              track={audioTrack}
              compact
              disableAutoplay={disableAutoplay}
              paused={isMuted}
            />
          ) : null}
        </div>
      </div>

      {/* Middle: Legacy Quote Block (only shown if not a visual design) */}
      {!hasVisualDesign && (
        <div className="absolute inset-x-4 sm:inset-x-8 top-16 bottom-20 z-10 flex flex-col justify-center items-center pointer-events-auto px-2 sm:px-4 text-center overflow-y-auto hide-scrollbar">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={quote}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="max-w-[340px] sm:max-w-[720px] mx-auto"
            >
              <p className="text-[20px] sm:text-[28px] md:text-[36px] lg:text-[44px] leading-[1.28] sm:leading-[1.2] tracking-tight text-white font-medium sm:font-light text-pretty break-words drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
                {quote}
              </p>

              {(author || category?.name) && (
                <footer className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  {author && (
                    <cite className="not-italic text-[13px] sm:text-[15px] md:text-[16px] text-amber-300/90 font-medium tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                      &mdash; {author} &mdash;
                    </cite>
                  )}
                  {category?.name && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 backdrop-blur-md px-2.5 py-0.5 text-[10.5px] sm:text-[12px] font-medium text-white/80">
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

      {/* Floating Glassmorphic Action Controls directly over the artwork image */}
      <FloatingQuoteControls
        quoteId={quoteId}
        onInspire={onInspire}
        isReceiving={isReceiving}
        isLimitReached={isLimitReached}
        usedToday={usedToday}
        dailyLimit={dailyLimit}
        onReadAgain={onReadAgain}
        onShare={onShare}
        onFavoriteChange={onFavoriteChange}
        showCollection={true}
        className="absolute bottom-4 left-4 right-4 z-20"
      />

      {/* Persistent Gift Dedication Modal */}
      <GiftDedicationCard
        isOpen={showDedicationModal && hasGiftDedication}
        onClose={() => setShowDedicationModal(false)}
        senderName={giftDedication?.senderName || actualSenderName || inspiration?.latestQuote?.author || author || "A Loved One"}
        message={giftDedication?.text || actualDedicationText || inspiration?.latestQuote?.quote || inspiration?.latestQuote?.text || quote || ""}
        dedicationData={giftDedication}
        giftDedication={giftDedication}
        activeQuote={inspiration?.latestQuote || inspiration}
        inspiration={inspiration}
        quoteText={giftDedication?.text || actualDedicationText || quote}
        text={giftDedication?.text || actualDedicationText || quote}
        quote={quote}
        onSave={() => onFavoriteChange && onFavoriteChange({ quoteId: dedicationQuoteId || quoteId })}
        isSaved={inspiration?.favorite}
      />
    </motion.section>
  );
}