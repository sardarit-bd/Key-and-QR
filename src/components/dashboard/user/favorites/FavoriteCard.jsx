'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Calendar, Quote as QuoteIcon, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  FAVORITE_CARD_SURFACE, FAVORITE_HOVER, ACTION_ICON_CLASS,
} from './favorites.constants';
import {
  getCategoryChipTheme,
  getCategoryLabel,
} from '@/components/public/quote/category';
import VisualQuoteRenderer from '@/components/public/quote/VisualQuoteRenderer';
import FloatingQuoteControls from '@/components/public/quote/FloatingQuoteControls';

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

export default function FavoriteCard({ favorite, view = 'grid', onRemove, onViewDetail, onShare }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [imageError, setImageError] = useState(false);
  const quote = favorite?.quote;

  if (!quote || typeof quote !== 'object') return null;

  const category = quote.category || 'motivation';
  const categoryLabel = getCategoryLabel(category);
  const chip = getCategoryChipTheme(category);

  // Clean author fallback (never duplicates category label)
  const authorName = resolveAuthorName(quote, categoryLabel);

  // Clean text and title fallbacks without string concatenation duplication
  const quoteText = quote.text?.trim() || '';
  const fallbackTitle = getDisplayTitle(quote, categoryLabel);

  const rawArtworkUrl = resolveQuoteArtwork(quote);
  const artworkUrl = imageError ? null : rawArtworkUrl;

  const editorData = quote.editorData || quote.quote?.editorData;
  const hasCanvasElements = Boolean(
    editorData &&
      ((editorData.desktop?.elements && editorData.desktop.elements.length > 0) ||
        (editorData.mobile?.elements && editorData.mobile.elements.length > 0) ||
        (editorData.elements && editorData.elements.length > 0))
  );

  const hasVisualArtwork = Boolean(artworkUrl || hasCanvasElements);
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
      : `"${fallbackTitle}" — ${authorName}`;
    navigator.clipboard?.writeText(textToCopy);
    toast.success('Quote copied!');
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(favorite._id);
    } finally {
      setIsRemoving(false);
    }
  };

  if (view === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`group flex flex-col gap-4 border ${FAVORITE_CARD_SURFACE} p-3.5 sm:p-4 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_20px_40px_-16px_rgb(0_0_0/0.5)] sm:flex-row sm:items-center`}
      >
        <div className="relative h-28 w-full sm:h-20 sm:w-32 aspect-[16/9] sm:aspect-auto rounded-xl overflow-hidden shrink-0 bg-muted/40 border border-border/50 flex items-center justify-center">
          {artworkUrl ? (
            <img
              src={artworkUrl}
              alt={quoteText || fallbackTitle}
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

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium text-foreground">
            {quoteText ? `“${quoteText}”` : quote.description?.trim() || fallbackTitle}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-foreground-tertiary">{authorName}</span>
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${chip.border} ${chip.bg} ${chip.text} ${chip.lightText}`}>{categoryLabel}</span>
            {formattedDate && <span className="flex items-center gap-1 text-[10px] text-foreground-tertiary"><Calendar className="h-3 w-3" />{formattedDate}</span>}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
          <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share" className="h-8 w-8 cursor-pointer text-foreground-tertiary hover:text-foreground hover:bg-muted/50"><Share2 className="h-4 w-4" /></Button>
          {onViewDetail && <Button variant="ghost" size="icon" onClick={() => onViewDetail(favorite)} aria-label="View" className="h-8 w-8 cursor-pointer text-foreground-tertiary hover:text-foreground hover:bg-muted/50"><Eye className="h-4 w-4" /></Button>}
          <Button variant="ghost" size="icon" onClick={handleRemove} disabled={isRemoving} aria-label="Remove" className="h-8 w-8 cursor-pointer text-foreground-tertiary hover:text-rose-500 hover:bg-rose-500/10">
            {isRemoving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500/30 border-t-rose-500" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.015, y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`group relative overflow-hidden ${FAVORITE_CARD_SURFACE} ${FAVORITE_HOVER} transition-all duration-300 w-full aspect-[375/667] sm:aspect-[16/9] sm:min-h-[240px] flex flex-col justify-between`}
    >
      {hasVisualArtwork ? (
        <>
          <div className="absolute inset-0 z-0 bg-black/60 overflow-hidden flex items-center justify-center">
            {artworkUrl ? (
              <img
                src={artworkUrl}
                alt={quoteText || fallbackTitle}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover sm:object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02]"
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
            ) : null}
          </div>

          <div className="pointer-events-none relative z-10 p-3 flex items-start justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/95 backdrop-blur-md light:border-[#E8DFCE]/80 light:bg-white/70 light:text-[#4A3C2D]">
              {authorName}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize backdrop-blur-md shadow-sm ${chip.border} ${chip.bg} ${chip.text} ${chip.lightText}`}>
              {categoryLabel}
            </span>
          </div>

          <FloatingQuoteControls
            quoteId={quote._id}
            onShare={handleShare}
            onViewDetail={onViewDetail ? () => onViewDetail(favorite) : undefined}
            onRemove={handleRemove}
            isRemoving={isRemoving}
            showFavorite={false}
            showCollection={false}
            customLeftContent={
              formattedDate ? (
                <span className="truncate text-[10px] sm:text-[11px] font-semibold text-[#18181B] select-none">
                  {formattedDate}
                </span>
              ) : null
            }
          />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-background-tertiary/90 via-background-secondary to-background" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.07] via-transparent to-accent/[0.05]" />
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

          <div className="pointer-events-none relative z-10 p-3 flex items-start justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/95 backdrop-blur-md light:border-[#E8DFCE]/80 light:bg-white/70 light:text-[#4A3C2D]">
              {authorName}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize backdrop-blur-md ${chip.border} ${chip.bg} ${chip.text} ${chip.lightText} ${chip.glow}`}>
              {categoryLabel}
            </span>
          </div>

          <div className="pointer-events-none relative z-10 flex flex-1 items-center justify-center px-6 py-4 text-center">
            <div className="relative">
              <QuoteIcon className="absolute -top-5 left-1/2 h-8 w-8 -translate-x-1/2 text-accent/15 light:text-[#C6922D]/15" strokeWidth={1} fill="currentColor" stroke="none" />
              <p className="relative line-clamp-4 text-[14px] sm:text-[15px] font-medium leading-[1.6] text-foreground">
                {quoteText ? `“${quoteText}”` : quote.description?.trim() || fallbackTitle}
              </p>
            </div>
          </div>

          <FloatingQuoteControls
            quoteId={quote._id}
            onShare={handleShare}
            onViewDetail={onViewDetail ? () => onViewDetail(favorite) : undefined}
            onRemove={handleRemove}
            isRemoving={isRemoving}
            showFavorite={false}
            showCollection={false}
            customLeftContent={
              formattedDate ? (
                <span className="truncate text-[10px] sm:text-[11px] font-semibold text-[#18181B] select-none">
                  {formattedDate}
                </span>
              ) : null
            }
          />
        </>
      )}
    </motion.div>
  );
}
