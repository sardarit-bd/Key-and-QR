'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Loader2, X } from 'lucide-react';

import VisualQuoteRenderer from '@/components/quote/VisualQuoteRenderer';

const LOADING_MESSAGES = [
  'Finding today\'s message...',
  'Preparing your inspiration...',
  'Receiving today\'s message...',
];

/**
 * Category receive flow — client image:
 * click category → loading screen (~1s) → reveal quote.
 */
export default function ReceiveOverlay({ isOpen, quote, categoryName, onClose }) {
  const hasVisualDesign = Boolean(
    quote?.editorData &&
      ((quote.editorData.desktop?.elements && quote.editorData.desktop.elements.length > 0) ||
        (quote.editorData.mobile?.elements && quote.editorData.mobile.elements.length > 0) ||
        (quote.editorData.elements && quote.editorData.elements.length > 0))
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={quote && onClose ? onClose : undefined}
        >
          {quote ? (
            /* ---------- Reveal ---------- */
            <motion.div
              key="reveal"
              className="relative max-w-xl w-full overflow-hidden rounded-[24px] border border-accent/20 bg-card shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              {onClose && (
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute right-3 top-3 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-background-secondary/80 text-foreground-secondary backdrop-blur-sm transition-colors hover:text-foreground"
                >
                  <X size={16} className="w-4 h-4" />
                </button>
              )}

              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
                <div className="absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
              </div>

              <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-12 text-center">
                <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-accent">
                  <Sparkles size={12} className="w-3 h-3" />
                  {categoryName || 'Inspiration'}
                </div>

                {hasVisualDesign ? (
                  <div className="w-full flex items-center justify-center min-h-[300px] max-h-[400px]">
                    <VisualQuoteRenderer
                      editorData={quote.editorData}
                      mode="auto"
                      showAudioPlayer={true}
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <>
                    <motion.blockquote
                      className="text-[22px] sm:text-[26px] md:text-[30px] leading-[1.35] italic text-foreground"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.5 }}
                    >
                      &ldquo;{quote.text}&rdquo;
                    </motion.blockquote>

                    <motion.p
                      className="mt-4 text-[13px] sm:text-[14px] text-foreground-secondary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                    >
                      — {quote.author || 'MyInspireTag'}
                    </motion.p>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            /* ---------- Loading ---------- */
            <motion.div
              key="loading"
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-accent/10 blur-xl" />
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
        className="text-[15px] sm:text-[16px] font-medium text-foreground"
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
