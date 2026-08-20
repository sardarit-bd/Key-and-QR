'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Calendar, Quote as QuoteIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  ACTION_ICON_CLASS,
  CARD_SURFACE,
  HOVER_ELEVATION,
} from './myQuoteCard.constants';
import {
  getCategoryChipTheme,
  getCategoryLabel,
} from '@/components/category';
import useShareQuote from '@/hooks/useShareQuote';
import ShareQuoteModal from '@/components/quote/ShareQuoteModal';
import FavoriteButton from '@/components/favorite/FavoriteButton';
import VisualQuoteRenderer from '@/components/quote/VisualQuoteRenderer';

/**
 * Normalizes any incoming received quote document into a safe, consistent representation.
 * Prevents [Object Object] rendering, filters corrupt/empty cards, and resolves artwork.
 */
function normalizeQuoteData(receivedQuote) {
  if (!receivedQuote) return null;
  const quote = receivedQuote.quote || receivedQuote;
  if (!quote) return null;

  const quoteId = quote._id || quote.id || receivedQuote._id;
  const text = typeof quote.text === 'string' ? quote.text.trim() : '';
  const author = typeof quote.author === 'string' && quote.author.trim() ? quote.author.trim() : 'MyInspireTag';

  // Category normalization (prevent [Object Object])
  const rawCat = receivedQuote.category || quote.category;
  let categorySlug = 'inspire';
  let categoryName = 'Inspire';

  if (typeof rawCat === 'string' && rawCat.trim() && rawCat.toLowerCase() !== '[object object]') {
    categorySlug = rawCat.toLowerCase().trim();
    categoryName = getCategoryLabel(categorySlug);
  } else if (rawCat && typeof rawCat === 'object') {
    categoryName = rawCat.name || getCategoryLabel(rawCat.slug || rawCat.id);
    categorySlug = (rawCat.slug || rawCat.id || categoryName).toLowerCase();
  }

  // Artwork resolution
  const artworkUrl =
    quote.renderedImages?.desktop?.url ||
    quote.renderedImages?.mobile?.url ||
    quote.quote?.renderedImages?.desktop?.url ||
    quote.quote?.renderedImages?.mobile?.url ||
    quote.imageUrl ||
    quote.image?.url ||
    (typeof quote.image === 'string' && (quote.image.startsWith('http') || quote.image.startsWith('/')) ? quote.image : null) ||
    null;

  const editorData = quote.editorData || quote.quote?.editorData || null;
  const hasCanvasElements = Boolean(
    editorData &&
      ((editorData.desktop?.elements && editorData.desktop.elements.length > 0) ||
        (editorData.mobile?.elements && editorData.mobile.elements.length > 0) ||
        (editorData.elements && editorData.elements.length > 0))
  );

  // Must have at least valid text or valid artwork
  if (!text && !artworkUrl && !hasCanvasElements) {
    return null;
  }

  return {
    quoteId,
    text,
    author,
    categorySlug,
    categoryName,
    artworkUrl,
    editorData,
    hasCanvasElements,
    hasArtwork: Boolean(artworkUrl || hasCanvasElements),
    receivedAt: receivedQuote.receivedAt || receivedQuote.createdAt || null,
  };
}

export default function MyQuoteCard({
  receivedQuote,
  view = 'grid',
}) {
  const [imageError, setImageError] = useState(false);
  const data = normalizeQuoteData(receivedQuote);

  // If quote data is invalid or empty, do not render a broken card
  if (!data) return null;

  const {
    quoteId,
    text,
    author,
    categorySlug,
    categoryName,
    artworkUrl: rawArtworkUrl,
    editorData,
    hasCanvasElements,
    receivedAt,
  } = data;

  const artworkUrl = imageError ? null : rawArtworkUrl;
  const hasVisualArtwork = Boolean(artworkUrl || (hasCanvasElements && !imageError));
  const chip = getCategoryChipTheme(categorySlug);

  const formattedDate = receivedAt
    ? format(new Date(receivedAt), 'MMM d, yyyy')
    : '';

  const { isShareOpen, shareData, closeShare, shareQuote } = useShareQuote();

  const handleShare = (e) => {
    e?.stopPropagation();
    shareQuote({
      quoteId,
      text,
      author,
      category: categorySlug,
      imageUrl: artworkUrl,
    });
  };

  const handleCopy = (e) => {
    e?.stopPropagation();
    const copyText = `"${text}" — ${author}`;
    navigator.clipboard?.writeText(copyText);
    toast.success('Quote copied!');
  };

  /* ===================== LIST VIEW ===================== */
  if (view === 'list') {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`group flex flex-col sm:flex-row sm:items-center gap-4 border ${CARD_SURFACE} p-3.5 sm:p-4 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-lg`}
        >
          {/* 16:9 Thumbnail on left */}
          <div className="relative h-24 w-full sm:h-20 sm:w-32 aspect-[16/9] sm:aspect-auto rounded-xl overflow-hidden shrink-0 bg-muted/40 border border-border/50 flex items-center justify-center">
            {artworkUrl ? (
              <img
                src={artworkUrl}
                alt={text || 'Quote artwork'}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : hasCanvasElements ? (
              <div className="w-full h-full pointer-events-none scale-75 flex items-center justify-center overflow-hidden">
                <VisualQuoteRenderer
                  editorData={editorData}
                  mode="desktop"
                  showAudioPlayer={false}
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-accent/10 text-accent">
                <QuoteIcon className="h-6 w-6 opacity-70" />
              </div>
            )}
          </div>

          {/* Text & Meta info */}
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-medium text-foreground">
              &ldquo;{text}&rdquo;
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-foreground-tertiary font-medium">
                {author}
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${chip.border} ${chip.bg} ${chip.text} ${chip.lightText}`}
              >
                {categoryName}
              </span>
              {formattedDate && (
                <span className="flex items-center gap-1 text-[10px] text-foreground-tertiary">
                  <Calendar className="h-3 w-3" />
                  {formattedDate}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
            <FavoriteButton
              id={quoteId}
              type="quote"
              className="h-8 w-8 cursor-pointer rounded-full border border-border/60 text-foreground-secondary hover:bg-muted/80 flex items-center justify-center"
              size="sm"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              aria-label="Share quote"
              className="h-8 w-8 cursor-pointer text-foreground-tertiary hover:text-foreground hover:bg-muted/50"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="More options"
                  className="h-8 w-8 cursor-pointer text-foreground-tertiary hover:text-foreground hover:bg-muted/50"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="border border-border bg-popover text-foreground shadow-xl backdrop-blur-xl"
              >
                <DropdownMenuItem
                  onClick={handleCopy}
                  className="cursor-pointer hover:bg-muted/50 text-xs font-medium"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Quote
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        <ShareQuoteModal
          isOpen={isShareOpen}
          onClose={closeShare}
          quoteData={shareData}
          quote={shareData}
        />
      </>
    );
  }

  /* ===================== GRID VIEW ===================== */
  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`group relative flex flex-col w-full overflow-hidden rounded-2xl border ${CARD_SURFACE} ${HOVER_ELEVATION} transition-all duration-300 shadow-sm`}
      >
        {/* 1. Preview Area (Strict 16:9 aspect ratio) */}
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-black/40 flex items-center justify-center shrink-0">
          {hasVisualArtwork ? (
            artworkUrl ? (
              <img
                src={artworkUrl}
                alt={text || 'Inspirational quote'}
                onError={() => setImageError(true)}
                className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
                <VisualQuoteRenderer
                  editorData={editorData}
                  mode="desktop"
                  showAudioPlayer={false}
                  className="w-full h-full"
                />
              </div>
            )
          ) : (
            /* Text-only quote preview (no image) */
            <div className="relative w-full h-full p-5 sm:p-6 flex flex-col justify-center items-center text-center bg-gradient-to-br from-background-secondary via-background to-background-tertiary">
              <QuoteIcon className="h-6 w-6 text-accent/20 mb-1" />
              <p className="line-clamp-3 text-sm sm:text-[14px] font-medium leading-relaxed text-foreground">
                &ldquo;{text}&rdquo;
              </p>
            </div>
          )}

          {/* Top Badges (Inside preview area) */}
          <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/95 backdrop-blur-md light:border-border light:bg-card/80 light:text-foreground">
              {author}
            </span>

            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize backdrop-blur-md shadow-sm ${chip.border} ${chip.bg} ${chip.text} ${chip.lightText}`}
            >
              {categoryName}
            </span>
          </div>
        </div>

        {/* 2. Card Footer (clean, theme-aware border-t, no dark horizontal line cutting through) */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-card border-t border-border/50 text-foreground-secondary">
          <span className="truncate text-[11px] font-medium text-foreground-tertiary">
            {formattedDate}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              aria-label="Share quote"
              className={ACTION_ICON_CLASS}
            >
              <Share2 className="h-3.5 w-3.5" />
            </Button>
            <FavoriteButton
              id={quoteId}
              type="quote"
              className={ACTION_ICON_CLASS}
              size="sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="More options"
                  className={ACTION_ICON_CLASS}
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="border border-border bg-popover text-foreground shadow-xl backdrop-blur-xl"
              >
                <DropdownMenuItem
                  onClick={handleCopy}
                  className="cursor-pointer hover:bg-muted/50 text-xs font-medium"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Quote
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      <ShareQuoteModal
        isOpen={isShareOpen}
        onClose={closeShare}
        quoteData={shareData}
        quote={shareData}
      />
    </>
  );
}
