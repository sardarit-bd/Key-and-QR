'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Share2, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import {
  FAVORITE_CARD_SURFACE,
  FAVORITE_HOVER,
} from '@/components/dashboard/user/favorites/favorites.constants';
import {
  getCategoryChipTheme,
  getCategoryLabel,
} from '@/components/public/quote/category';
import useShareQuote from '@/hooks/useShareQuote';
import ShareQuoteModal from '@/components/public/quote/ShareQuoteModal';
import FavoriteButton from '@/components/ui/FavoriteButton';
import VisualQuoteRenderer from '@/components/public/quote/VisualQuoteRenderer';

function resolveQuoteArtwork(quote) {
  if (!quote) return null;
  return (
    quote.renderedImages?.desktop?.url ||
    quote.renderedImages?.mobile?.url ||
    quote.image?.url ||
    (typeof quote.image === 'string' && quote.image.startsWith('http') ? quote.image : null) ||
    (typeof quote.image === 'string' && quote.image.startsWith('/') ? quote.image : null) ||
    null
  );
}

export default function InspirationQuoteCard({ quote, view = 'grid' }) {
  const reduceMotion = useReducedMotion();
  const [imageError, setImageError] = useState(false);

  const { isShareOpen, shareData, closeShare, shareQuote } = useShareQuote();
  const router = useRouter();
  const { user } = useAuthStore();

  if (!quote) return null;

  const category = quote.category || 'motivation';
  const categoryLabel = getCategoryLabel(category);
  const chip = getCategoryChipTheme(category);

  const rawArtworkUrl = resolveQuoteArtwork(quote);
  const artworkUrl = imageError ? null : rawArtworkUrl;

  const editorData = quote.editorData || quote.quote?.editorData;
  const hasCanvasElements = Boolean(
    editorData &&
      ((editorData.desktop?.elements && editorData.desktop.elements.length > 0) ||
        (editorData.mobile?.elements && editorData.mobile.elements.length > 0) ||
        (editorData.elements && editorData.elements.length > 0))
  );

  const handleShare = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!user) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    shareQuote({
      quoteId: quote._id,
      text: quote.text,
      author: quote.author,
      category: quote.category,
      imageUrl: artworkUrl,
    });
  };

  /* ================= LIST VIEW ================= */
  if (view === 'list') {
    return (
      <>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`group flex flex-col sm:flex-row sm:items-center gap-4 border ${FAVORITE_CARD_SURFACE} p-3.5 sm:p-4 rounded-2xl transition-all duration-300 hover:border-accent/30 hover:shadow-md`}
        >
          {/* Thumbnail / Artwork */}
          <div className="relative h-28 w-full sm:h-20 sm:w-32 rounded-xl overflow-hidden shrink-0 bg-muted/40 border border-border/50 flex items-center justify-center">
            {artworkUrl ? (
              <img
                src={artworkUrl}
                alt={quote.text || 'Inspirational quote'}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : hasCanvasElements ? (
              <VisualQuoteRenderer
                editorData={editorData}
                mode="auto"
                showAudioPlayer={false}
                className="w-full h-full pointer-events-none scale-75"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-2 text-center">
                <Sparkles className="h-6 w-6 text-accent/60" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-medium text-foreground">&ldquo;{quote.text}&rdquo;</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-foreground-tertiary">{quote.author || 'InspireTag'}</span>
              <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${chip.border} ${chip.bg} ${chip.text} ${chip.lightText}`}>
                {categoryLabel}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              aria-label="Share Quote"
              className="h-8 w-8 cursor-pointer rounded-full text-foreground-secondary hover:text-foreground hover:bg-muted/80"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <FavoriteButton
              id={quote._id}
              type="quote"
              className="h-8 w-8 cursor-pointer rounded-full border border-border/60 text-foreground-secondary hover:bg-muted/80 flex items-center justify-center"
              size="sm"
            />
            <Link
              href={`/q/${quote._id}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground-secondary hover:text-foreground hover:bg-muted/80 transition-colors"
              aria-label="View Quote Details"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
        <ShareQuoteModal isOpen={isShareOpen} onClose={closeShare} quoteData={shareData} quote={shareData} />
      </>
    );
  }

  /* ================= GRID VIEW (IMAGE / ARTWORK CARD) ================= */
  return (
    <>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={!reduceMotion ? { y: -4, transition: { duration: 0.2 } } : undefined}
        className={`group relative overflow-hidden rounded-2xl border ${FAVORITE_CARD_SURFACE} ${FAVORITE_HOVER} transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/50 aspect-[4/3] flex flex-col justify-between`}
      >
        {/* Full-bleed Quote Artwork */}
        <div className="absolute inset-0 z-0 bg-muted/30 overflow-hidden flex items-center justify-center">
          {artworkUrl ? (
            <img
              src={artworkUrl}
              alt={quote.text || 'Inspirational quote'}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : hasCanvasElements ? (
            <div className="w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
              <VisualQuoteRenderer
                editorData={editorData}
                mode="auto"
                showAudioPlayer={false}
                className="w-full h-full"
              />
            </div>
          ) : (
            /* Fallback clean gradient card when no artwork is available */
            <div className="w-full h-full flex flex-col justify-between p-6 bg-gradient-to-br from-background-secondary via-background to-background-tertiary">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground-tertiary">
                  {quote.author || 'InspireTag'}
                </span>
                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${chip.border} ${chip.bg} ${chip.text} ${chip.lightText}`}>
                  {categoryLabel}
                </span>
              </div>
              <p className="line-clamp-3 text-sm sm:text-base font-medium text-foreground text-center">
                &ldquo;{quote.text}&rdquo;
              </p>
              <div />
            </div>
          )}
        </div>

        {/* Category Pill (Top-Right Badge) */}
        <div className="relative z-10 p-3 flex items-start justify-end pointer-events-none">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold capitalize backdrop-blur-md shadow-sm ${chip.border} ${chip.bg} ${chip.text} ${chip.lightText}`}>
            {categoryLabel}
          </span>
        </div>

        {/* Hover / Mobile Action Overlay */}
        <div className="relative z-20 mt-auto p-3 sm:p-3.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-all duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-between gap-2 pointer-events-auto">
          {/* View Details Link */}
          <Link
            href={`/q/${quote._id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white transition-colors"
          >
            <span>View Details</span>
            <ExternalLink size={13} />
          </Link>

          {/* Action Buttons: Share & Favorite */}
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              aria-label="Share quote"
              className="h-8 w-8 cursor-pointer rounded-full bg-black/40 border border-white/20 text-white backdrop-blur-md hover:bg-white/20 hover:text-white transition-all active:scale-95"
            >
              <Share2 size={14} />
            </Button>

            <FavoriteButton
              id={quote._id}
              type="quote"
              className="h-8 w-8 rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center"
              size="sm"
            />
          </div>
        </div>
      </motion.div>

      <ShareQuoteModal isOpen={isShareOpen} onClose={closeShare} quoteData={shareData} quote={shareData} />
    </>
  );
}
