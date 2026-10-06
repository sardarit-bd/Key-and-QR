'use client';

import { useState } from 'react';
import { X, Share2, Copy, Calendar, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  getCategoryChipTheme,
  getCategoryLabel,
} from '@/components/public/quote/category';
import VisualQuoteRenderer from '@/components/public/quote/VisualQuoteRenderer';

function resolveQuoteArtwork(quote) {
  if (!quote || typeof quote !== 'object') return null;
  return (
    quote.renderedImages?.desktop?.url ||
    quote.renderedImages?.mobile?.url ||
    quote.quote?.renderedImages?.desktop?.url ||
    quote.quote?.renderedImages?.mobile?.url ||
    (typeof quote.imageUrl === 'string' && quote.imageUrl ? quote.imageUrl : null) ||
    quote.image?.url ||
    (typeof quote.image === 'string' && (quote.image.startsWith('http') || quote.image.startsWith('/')) ? quote.image : null) ||
    null
  );
}

function resolveAuthorName(quote, categoryLabel) {
  const rawAuthor = typeof quote?.author === 'string' ? quote.author.trim() : '';
  if (!rawAuthor) return 'MyInspireTag';
  const lower = rawAuthor.toLowerCase();
  if (
    lower === 'unknown' ||
    lower === 'undefined' ||
    lower === 'null' ||
    (quote?.category && lower === quote.category.toLowerCase()) ||
    (categoryLabel && lower === categoryLabel.toLowerCase())
  ) {
    return 'MyInspireTag';
  }
  return rawAuthor;
}

function getDisplayTitle(quote, categoryLabel) {
  if (quote?.title?.trim()) return quote.title.trim();
  if (quote?.text?.trim()) return quote.text.trim();
  if (quote?.description?.trim()) return quote.description.trim();
  const cat = (categoryLabel || '').trim();
  if (!cat) return 'Visual Quote';
  if (/inspiration/i.test(cat)) return 'Inspirational Quote';
  return `${cat} Quote`;
}

export default function FavoriteDetailModal({ favorite, onClose, onRemove, onShare }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const quote = favorite?.quote;

  if (!favorite || !quote || typeof quote !== 'object') return null;

  const category = quote.category || 'motivation';
  const categoryLabel = getCategoryLabel(category);
  const chip = getCategoryChipTheme(category);

  // Author attribution with sanitized fallback to 'MyInspireTag'
  const authorName = resolveAuthorName(quote, categoryLabel);

  // Text content and title helpers without duplicate strings
  const quoteText = quote.text?.trim() || '';
  const fallbackTitle = getDisplayTitle(quote, categoryLabel);

  // Artwork resolution
  const artworkUrl = resolveQuoteArtwork(quote);
  const editorData = quote.editorData || quote.quote?.editorData;
  const hasCanvasElements = Boolean(
    editorData &&
      ((editorData.desktop?.elements && editorData.desktop.elements.length > 0) ||
        (editorData.mobile?.elements && editorData.mobile.elements.length > 0) ||
        (editorData.elements && editorData.elements.length > 0))
  );

  const hasVisualArtwork = Boolean(artworkUrl || hasCanvasElements);

  // Safe date formatting
  let formattedDate = '';
  if (favorite?.createdAt) {
    try {
      const parsed = new Date(favorite.createdAt);
      if (!isNaN(parsed.getTime())) {
        formattedDate = format(parsed, 'MMM d, yyyy');
      }
    } catch {
      formattedDate = '';
    }
  }

  const handleShare = () => {
    if (onShare) {
      onShare({
        quoteId: quote._id,
        text: quoteText || quote.description?.trim() || fallbackTitle,
        author: authorName,
        category: quote.category,
        imageUrl: artworkUrl,
      });
    }
  };

  const handleCopy = () => {
    const textToCopy = quoteText
      ? `"${quoteText}" — ${authorName}`
      : quote.description?.trim()
      ? `${quote.description.trim()} — ${authorName}`
      : artworkUrl
      ? `"${fallbackTitle}" — ${authorName}`
      : `"${fallbackTitle}" — ${authorName}`;
    navigator.clipboard?.writeText(textToCopy);
    toast.success('Quote copied!');
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove?.(favorite._id);
      onClose?.();
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-black/85 backdrop-blur-md p-3 sm:p-6 pb-[calc(4rem+env(safe-area-inset-bottom,0px)+24px)] sm:pb-6 flex flex-col items-center justify-start sm:justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        {hasVisualArtwork ? (
          /* ========================================================= */
          /* CONDITION 1: FULL-COVER ARTWORK LAYOUT (VISUAL / IMAGE)    */
          /* ========================================================= */
          <motion.div
            className="my-auto relative w-full max-w-3xl rounded-[24px] overflow-hidden border border-white/15 bg-black/95 shadow-2xl flex flex-col items-center justify-center shrink-0"
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 130, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Overlay: Glass Floating Header Controls */}
            <div className="absolute top-0 inset-x-0 z-30 p-4 sm:p-5 flex items-center justify-between pointer-events-none bg-gradient-to-b from-black/85 via-black/40 to-transparent">
              {/* Badges on Top-Left */}
              <div className="pointer-events-auto flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-semibold capitalize tracking-wide text-white backdrop-blur-md shadow-md ${chip.border} ${chip.bg} ${chip.text}`}
                >
                  {categoryLabel}
                </span>
                <span className="inline-flex items-center rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-md shadow-md">
                  {authorName}
                </span>
              </div>

              {/* Close Button Top-Right */}
              <button
                onClick={onClose}
                aria-label="Close"
                className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/90 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Immersive Centerstage Visual Artwork */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black/95">
              {artworkUrl ? (
                <img
                  src={artworkUrl}
                  alt={quoteText || quote.description?.trim() || fallbackTitle}
                  className="w-full h-auto sm:max-h-[82vh] object-contain select-none transition-transform duration-300"
                />
              ) : hasCanvasElements ? (
                <div className="w-full min-h-[50vh] sm:h-[75vh] flex items-center justify-center p-4">
                  <VisualQuoteRenderer
                    editorData={editorData}
                    mode="desktop"
                    showAudioPlayer={false}
                    className="w-full h-full"
                  />
                </div>
              ) : null}
            </div>

            {/* Bottom Overlay: Glass Floating Actions */}
            <div className="absolute bottom-0 inset-x-0 z-30 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 pointer-events-none bg-gradient-to-t from-black/90 via-black/50 to-transparent">
              {/* Date Left */}
              {formattedDate ? (
                <div className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white/80 backdrop-blur-md shadow-md">
                  <Calendar size={13} className="opacity-75" />
                  <span>Saved {formattedDate}</span>
                </div>
              ) : <div />}

              {/* Floating Glass Action Buttons Right */}
              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  onClick={handleShare}
                  aria-label="Share"
                  className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                >
                  <Share2 size={13} />
                  <span>Share</span>
                </button>
                <button
                  onClick={handleCopy}
                  aria-label="Copy"
                  className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                >
                  <Copy size={13} />
                  <span>Copy</span>
                </button>
                <button
                  onClick={handleRemove}
                  disabled={isRemoving}
                  aria-label="Remove"
                  className="flex items-center gap-1.5 rounded-full border border-rose-500/35 bg-rose-950/50 px-3.5 py-1.5 text-xs font-medium text-rose-300 backdrop-blur-md transition-all hover:bg-rose-500/25 hover:scale-105 active:scale-95 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isRemoving ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-400/30 border-t-rose-400" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ========================================================= */
          /* CONDITION 2: CLEAN TYPOGRAPHY LAYOUT (TEXT-ONLY QUOTE)     */
          /* ========================================================= */
          <motion.div
            className="my-auto relative max-w-xl w-full flex flex-col overflow-hidden rounded-[24px] border border-accent/20 bg-card shadow-2xl p-6 sm:p-10 text-center light:border-[#E8DFCE]/80 shrink-0"
            initial={{ scale: 0.9, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Ambient Lighting */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
              <div className="absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background-secondary/80 text-foreground-secondary backdrop-blur-sm transition-colors hover:text-foreground cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Category Tag Top Center */}
            <div className="relative z-10 flex items-center justify-center">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold capitalize ${chip.border} ${chip.bg} ${chip.text} ${chip.lightText} ${chip.glow}`}
              >
                {categoryLabel}
              </span>
            </div>

            {/* Elegant Blockquote or Description */}
            <div className="relative z-10 my-auto py-6 overflow-y-auto overscroll-contain">
              {quoteText ? (
                <motion.blockquote
                  className="max-h-56 overflow-y-auto px-4 text-[20px] sm:text-[24px] md:text-[28px] leading-[1.45] italic font-serif text-foreground break-words whitespace-pre-wrap [scrollbar-width:thin]"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  &ldquo;{quoteText}&rdquo;
                </motion.blockquote>
              ) : quote.description?.trim() ? (
                <motion.p
                  className="max-h-52 overflow-y-auto px-4 text-[15px] sm:text-[17px] leading-[1.6] text-foreground-secondary break-words whitespace-pre-wrap [scrollbar-width:thin]"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  {quote.description.trim()}
                </motion.p>
              ) : (
                <motion.p
                  className="text-[18px] sm:text-[20px] font-medium text-foreground"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  {fallbackTitle}
                </motion.p>
              )}

              {/* Author Attribution */}
              <motion.p
                className="mt-5 text-sm sm:text-base font-medium text-foreground-secondary tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                — {authorName}
              </motion.p>

              {/* Saved Date */}
              {formattedDate && (
                <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-foreground-tertiary">
                  <Calendar size={13} />
                  <span>Saved {formattedDate}</span>
                </div>
              )}
            </div>

            {/* Bottom Actions for Text Layout */}
            <div className="relative z-10 pt-4 flex items-center justify-center gap-3 flex-wrap border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="cursor-pointer gap-1.5 text-foreground-secondary hover:text-foreground"
              >
                <Share2 size={14} /> Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="cursor-pointer gap-1.5 text-foreground-secondary hover:text-foreground"
              >
                <Copy size={14} /> Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={isRemoving}
                className="cursor-pointer gap-1.5 text-rose-400 border-rose-500/25 hover:bg-rose-500/10 dark:hover:bg-rose-500/15"
              >
                {isRemoving ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-500/30 border-t-rose-500" />
                ) : (
                  <Trash2 size={14} />
                )}
                Remove
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
