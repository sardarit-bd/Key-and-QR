'use client';

import { memo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, Share2, Copy, Quote as QuoteIcon } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import FavoriteButton from '@/components/favorite/FavoriteButton';
import { format } from 'date-fns';
import {
  getCategoryChipTheme,
  getCategoryLabel,
  resolveBackgroundImage,
} from '@/components/category';

// Light, cheap entrance — no spring physics, no layout thrash.
const BACKDROP_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const PANEL_VARIANTS = {
  hidden: { opacity: 0, scale: 0.97, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 8,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

/**
 * Scan History Detail Modal
 * Optimized: cheap tween animations, lighter backdrop, memoized content.
 * Functionality preserved (Escape, focus trap, scroll lock, portal, actions).
 */
function ScanHistoryDetailModal({ isOpen, onClose, data }) {
  const modalRef = useRef(null);

  // Handle escape key + body scroll lock
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!data) return null;
  if (!isOpen) return null;

  const quote = data?.quote;
  const tag = data?.tag;
  const category = quote?.category || 'motivation';
  const categoryLabel = getCategoryLabel(category);
  const chip = getCategoryChipTheme(category);
  const chipClass = `${chip.border} ${chip.bg} ${chip.text} ${chip.lightText}`.trim();
  const backgroundImage = quote?.image?.url || resolveBackgroundImage(category);

  const formattedDate = data.createdAt
    ? format(new Date(data.createdAt), 'MMMM d, yyyy')
    : '';
  const formattedTime = data.createdAt
    ? format(new Date(data.createdAt), 'h:mm a')
    : '';

  const handleShare = async () => {
    const shareText = `"${quote?.text || ''}" — ${quote?.author || 'InspireTag'}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'InspireTag Quote',
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    const text = `"${quote?.text || ''}" — ${quote?.author || 'InspireTag'}`;
    navigator.clipboard?.writeText(text);
    toast.success('Quote copied!');
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        variants={BACKDROP_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm light:bg-black/30"
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          variants={PANEL_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-lg overflow-hidden rounded-[22px] border border-white/6 bg-card shadow-[0_32px_80px_-24px_rgb(0_0_0/0.6)] max-h-[90vh] light:border-[#E8DFCE]/80 light:bg-[#FBF7EF]/95 light:shadow-[0_32px_80px_-28px_rgba(100,72,24,0.4)]"
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Scan detail"
        >
          {/* Ambient glow orbs — Overview Card DNA */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary/[0.05] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-accent/[0.05] blur-3xl" />
          {/* Top sheen */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/90 backdrop-blur-md transition-all duration-300 hover:rotate-90 hover:bg-black/50 hover:text-white light:border-[#E8DFCE]/80 light:bg-white/80 light:text-[#4A3C2D] light:hover:bg-white"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative z-10 max-h-[90vh] overflow-y-auto">
            {/* Hero image */}
            <div
              className="relative h-56 w-full bg-cover bg-center"
              style={
                backgroundImage
                  ? { backgroundImage: `url(${backgroundImage})` }
                  : { background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%)' }
              }
            >
              {/* Dark-mode cinematic overlay */}
              <div className="absolute inset-0 hidden bg-gradient-to-b from-black/35 via-black/15 to-card dark:block" />
              <div
                className="pointer-events-none absolute inset-0 hidden dark:block"
                style={{
                  background:
                    'radial-gradient(ellipse 90% 70% at 50% 100%, rgba(0,0,0,0.4) 0%, transparent 70%)',
                }}
              />
              {/* Light-mode warm ivory blend into the card body */}
              <div className="pointer-events-none absolute inset-0 light:bg-gradient-to-b light:from-[#FDFBF6]/30 light:via-[#F8F2E7]/20 light:to-[#FBF7EF]" />

              {/* Category chip */}
              <div className="absolute left-5 top-5">
                <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold capitalize backdrop-blur-md ${chipClass}`}>
                  {categoryLabel}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 pb-6 sm:px-8 sm:pb-8">
              {/* Quote */}
              <div className="relative -mt-6 text-center">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/15 shadow-[0_0_20px_-4px_rgba(52,211,153,0.3)] backdrop-blur-sm">
                  <QuoteIcon className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="text-xl leading-[1.55] font-medium text-foreground sm:text-[22px]">
                  &ldquo;{quote?.text || ''}&rdquo;
                </p>

                {/* Author */}
                {quote?.author && (
                  <p className="mt-3 text-sm font-medium text-accent">
                    — {quote.author} —
                  </p>
                )}
              </div>

              {/* Detail rows */}
              <div className="mt-6 space-y-2.5 rounded-2xl border border-white/6 bg-background-secondary/40 p-4 text-sm text-foreground-tertiary light:border-[#E8DFCE]/80 light:bg-[#FBF7EF]/60">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                    <Tag className="h-3.5 w-3.5 text-accent" />
                  </span>
                  <span>
                    Tag: <span className="font-medium text-foreground-secondary">{tag?.tagCode || 'N/A'}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                    <Calendar className="h-3.5 w-3.5 text-accent" />
                  </span>
                  <span>
                    Scanned on: <span className="font-medium text-foreground-secondary">{formattedDate} at {formattedTime}</span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-center gap-2.5 border-t border-white/6 pt-5 light:border-[#E8DFCE]/80">
                <FavoriteButton
                  id={quote?._id}
                  type="quote"
                  size="default"
                  variant="ghost"
                  className="h-10 cursor-pointer rounded-xl px-3 text-foreground-tertiary transition-all duration-300 hover:-translate-y-0.5 hover:text-foreground hover:bg-muted/60"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="h-10 cursor-pointer gap-2 rounded-xl px-4 text-foreground-tertiary transition-all duration-300 hover:-translate-y-0.5 hover:text-foreground hover:bg-muted/60"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-10 cursor-pointer gap-2 rounded-xl px-4 text-foreground-tertiary transition-all duration-300 hover:-translate-y-0.5 hover:text-foreground hover:bg-muted/60"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default memo(ScanHistoryDetailModal);
