'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Loader2, X } from 'lucide-react';
import VisualQuoteRenderer from '@/components/public/quote/VisualQuoteRenderer';

const LOADING_MESSAGES = [
  'Finding today\'s message...',
  'Preparing your inspiration...',
  'Receiving today\'s message...',
];

/**
 * Category receive & Read Again flow:
 * Click category/Read Again → loading screen (~1s) → reveal quote artwork.
 * Strictly preserves the 800×450 (16:9) quote artwork aspect ratio on both desktop and mobile.
 */
export default function ReceiveOverlay({ isOpen, quote, categoryName, onClose }) {
  // Clean body scroll lock — sets overflow: hidden while modal is open and resets on unmount/close
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow || '';
    };
  }, [isOpen]);

  const renderedDesktopUrl =
    quote?.renderedImages?.desktop?.url ||
    quote?.quote?.renderedImages?.desktop?.url ||
    null;

  const renderedMobileUrl =
    quote?.renderedImages?.mobile?.url ||
    quote?.quote?.renderedImages?.mobile?.url ||
    null;

  const hasRenderedImage = Boolean(renderedDesktopUrl || renderedMobileUrl);

  const editorData = quote?.editorData || quote?.quote?.editorData;
  const hasVisualDesign = Boolean(
    hasRenderedImage ||
    (editorData &&
      ((editorData.desktop?.elements && editorData.desktop.elements.length > 0) ||
        (editorData.mobile?.elements && editorData.mobile.elements.length > 0) ||
        (editorData.elements && editorData.elements.length > 0)))
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 touch-none overscroll-none select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={quote && onClose ? onClose : undefined}
        >
          {quote ? (
            /* ---------- Reveal Modal Card ---------- */
            <motion.div
              key="reveal"
              className="relative w-full max-w-[420px] sm:max-w-[860px] max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-48px)] overflow-y-auto overscroll-contain touch-auto rounded-[24px] sm:rounded-[32px] border border-white/15 bg-card text-card-foreground p-4 sm:p-6 shadow-2xl"
              initial={{ scale: 0.94, opacity: 0, y: 14 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 140, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Header Bar: Category Badge (left) & Close Button (right) */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-border/60">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
                  <Sparkles size={12} className="text-accent fill-current" />
                  <span>{categoryName || 'Inspiration'}</span>
                </div>

                {onClose && (
                  <button
                    onClick={onClose}
                    aria-label="Close modal"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-background/80 text-foreground-secondary hover:text-foreground hover:bg-muted transition-colors active:scale-95"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Responsive Artwork Canvas / Preview Stage (Portrait on mobile, 16:9 on sm+) */}
              <div className="mt-3.5 sm:mt-4 w-full">
                {hasVisualDesign ? (
                  <div className="w-full aspect-[375/667] sm:aspect-[16/9] max-h-[70vh] sm:max-h-none relative rounded-2xl overflow-hidden bg-black/80 border border-white/10 shadow-xl flex items-center justify-center">
                    {editorData ? (
                      <VisualQuoteRenderer
                        editorData={editorData}
                        mode="auto"
                        showAudioPlayer={true}
                        className="w-full h-full"
                      />
                    ) : hasRenderedImage ? (
                      <picture className="w-full h-full flex items-center justify-center">
                        {renderedMobileUrl && (
                          <source media="(max-width: 639px)" srcSet={renderedMobileUrl} />
                        )}
                        {renderedDesktopUrl && (
                          <source media="(min-width: 640px)" srcSet={renderedDesktopUrl} />
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={renderedMobileUrl || renderedDesktopUrl}
                          alt={quote?.text || 'Inspiration'}
                          className="w-full h-full object-contain rounded-2xl"
                        />
                      </picture>
                    ) : null}
                  </div>
                ) : (
                  /* Legacy non-canvas Quote text styled in responsive canvas stage */
                  <div className="w-full aspect-[375/667] sm:aspect-[16/9] flex flex-col justify-center items-center p-6 sm:p-10 relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-center border border-white/10 shadow-xl">
                    <motion.blockquote
                      className="text-[20px] sm:text-[28px] md:text-[34px] leading-[1.25] italic text-white font-light max-w-[680px]"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.4 }}
                    >
                      &ldquo;{quote?.text}&rdquo;
                    </motion.blockquote>

                    {quote?.author && (
                      <motion.p
                        className="mt-4 sm:mt-6 text-xs sm:text-sm font-medium text-amber-300 tracking-wide"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                      >
                        — {quote.author}
                      </motion.p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* ---------- Loading State ---------- */
            <motion.div
              key="loading"
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl animate-pulse" />
                <Loader2 size={36} className="relative z-10 animate-spin text-accent" />
              </div>
              <LoadingMessages />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Rotating loading messages — each shows for ~700ms.
 */
function LoadingMessages() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 700);
    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={index}
        className="text-[15px] sm:text-[16px] font-medium text-white drop-shadow-md"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        {LOADING_MESSAGES[index]}
      </motion.p>
    </AnimatePresence>
  );
}