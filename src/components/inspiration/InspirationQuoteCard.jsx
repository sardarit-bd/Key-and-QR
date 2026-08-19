'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Heart, Quote as QuoteIcon, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  FAVORITE_CARD_SURFACE,
  FAVORITE_HOVER,
  ACTION_ICON_CLASS,
} from '@/components/favorites/favorites.constants';
import {
  getCategoryChipTheme,
  getCategoryLabel,
  resolveBackgroundImage,
} from '@/components/category';
import useShareQuote from '@/hooks/useShareQuote';
import ShareQuoteModal from '@/components/quote/ShareQuoteModal';
import { useAuthStore } from '@/store/authStore';
import { favoriteService } from '@/services/favorite-service/favorite.service';

export default function InspirationQuoteCard({ quote, view = 'grid' }) {
  const { user } = useAuthStore();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [isFavoriting, setIsFavoriting] = useState(false);

  const { isShareOpen, shareData, closeShare, shareQuote } = useShareQuote();

  if (!quote) return null;

  const category = quote.category || 'motivation';
  const categoryLabel = getCategoryLabel(category);
  const chip = getCategoryChipTheme(category);

  // Artwork resolution
  const hasImage = Boolean(quote.renderedImages?.desktop?.url || quote.image?.url || (typeof quote.image === 'string' ? quote.image : null));
  const backgroundImage = quote.renderedImages?.desktop?.url || quote.image?.url || (typeof quote.image === 'string' ? quote.image : null) || resolveBackgroundImage(category);

  const handleShare = (e) => {
    e?.stopPropagation();
    shareQuote({
      quoteId: quote._id,
      text: quote.text,
      author: quote.author,
      category: quote.category,
      imageUrl: hasImage ? backgroundImage : null,
    });
  };

  const handleCopy = (e) => {
    e?.stopPropagation();
    navigator.clipboard?.writeText(`"${quote.text}" — ${quote.author || 'InspireTag'}`);
    toast.success('Quote copied to clipboard!');
  };

  const handleToggleFavorite = async (e) => {
    e?.stopPropagation();
    if (!user) {
      toast('Sign in to save quotes to your collection', { icon: '✨' });
      return;
    }
    setIsFavoriting(true);
    try {
      if (isFavorited && favoriteId) {
        await favoriteService.removeFavorite(favoriteId);
        setIsFavorited(false);
        setFavoriteId(null);
        toast.success('Removed from collection');
      } else {
        const res = await favoriteService.addFavorite({ quote: quote._id });
        if (res.success) {
          setIsFavorited(true);
          setFavoriteId(res.data?._id || res.data?.id);
          toast.success('Saved to collection!');
        }
      }
    } catch {
      toast.error('Failed to update collection');
    } finally {
      setIsFavoriting(false);
    }
  };

  if (view === 'list') {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`group flex flex-col gap-4 border ${FAVORITE_CARD_SURFACE} p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-lg sm:flex-row sm:items-center`}
        >
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-medium text-foreground">&ldquo;{quote.text}&rdquo;</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-foreground-tertiary">{quote.author || 'InspireTag'}</span>
              <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${chip.border} ${chip.bg} ${chip.text} ${chip.lightText}`}>
                {categoryLabel}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" onClick={handleCopy} aria-label="Copy" className="h-8 w-8 cursor-pointer text-foreground-tertiary hover:text-foreground hover:bg-muted/50">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share" className="h-8 w-8 cursor-pointer text-foreground-tertiary hover:text-foreground hover:bg-muted/50">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              disabled={isFavoriting}
              aria-label="Save to favorites"
              className={`h-8 w-8 cursor-pointer ${isFavorited ? 'text-rose-500 hover:text-rose-600' : 'text-foreground-tertiary hover:text-rose-500'}`}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
            <Link href={`/q/${quote._id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground-tertiary hover:text-foreground hover:bg-muted/50">
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
        <ShareQuoteModal isOpen={isShareOpen} onClose={closeShare} quote={shareData} />
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.015, y: -4 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`group relative overflow-hidden ${FAVORITE_CARD_SURFACE} ${FAVORITE_HOVER} transition-all duration-300 flex flex-col justify-between`}
      >
        {hasImage ? (
          <div className="relative h-56 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
            <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/95 backdrop-blur-md">
                {quote.author || 'InspireTag'}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize backdrop-blur-md ${chip.border} ${chip.bg} ${chip.text} ${chip.lightText} ${chip.glow}`}>
                {categoryLabel}
              </span>
            </div>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 py-10 pt-12">
              <div className="text-center">
                <QuoteIcon className="mx-auto mb-2 h-4 w-4 text-white/70" strokeWidth={2} />
                <p className="line-clamp-4 text-[15px] font-medium leading-[1.6] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]">
                  &ldquo;{quote.text}&rdquo;
                </p>
              </div>
            </div>

            <div className="relative z-20 mt-auto border-t border-white/10 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3.5 pb-3 pt-6">
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={`/q/${quote._id}`}
                  className="text-[11px] font-medium text-white/80 hover:text-white inline-flex items-center gap-1 transition-colors"
                >
                  <span>View Details</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={handleCopy} aria-label="Copy" className={ACTION_ICON_CLASS}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share" className={ACTION_ICON_CLASS}>
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleFavorite}
                    disabled={isFavoriting}
                    aria-label="Save to collection"
                    className={`${ACTION_ICON_CLASS} ${isFavorited ? '!text-rose-400' : ''}`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative h-56 flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-br from-background-tertiary/90 via-background-secondary to-background" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.07] via-transparent to-accent/[0.05]" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.05] dark:opacity-[0.07]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                backgroundSize: '18px 18px',
                color: '#E8C985',
              }}
            />

            <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground-secondary backdrop-blur-md">
                {quote.author || 'InspireTag'}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize backdrop-blur-md ${chip.border} ${chip.bg} ${chip.text} ${chip.lightText} ${chip.glow}`}>
                {categoryLabel}
              </span>
            </div>

            <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-8 pt-12">
              <div className="relative text-center">
                <QuoteIcon className="absolute -top-6 left-1/2 h-10 w-10 -translate-x-1/2 text-accent/15" strokeWidth={1} fill="currentColor" stroke="none" />
                <p className="relative line-clamp-4 text-[15px] font-medium leading-[1.6] text-foreground">
                  &ldquo;{quote.text}&rdquo;
                </p>
              </div>
            </div>

            <div className="relative z-20 mt-auto border-t border-border/40 bg-gradient-to-t from-background via-background/60 to-transparent px-3.5 pb-3 pt-6">
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={`/q/${quote._id}`}
                  className="text-[11px] font-medium text-foreground-secondary hover:text-foreground inline-flex items-center gap-1 transition-colors"
                >
                  <span>View Details</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={handleCopy} aria-label="Copy" className="h-8 w-8 cursor-pointer rounded-full bg-muted/60 text-foreground-secondary hover:text-foreground hover:bg-muted">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share" className="h-8 w-8 cursor-pointer rounded-full bg-muted/60 text-foreground-secondary hover:text-foreground hover:bg-muted">
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleFavorite}
                    disabled={isFavoriting}
                    aria-label="Save to collection"
                    className={`h-8 w-8 cursor-pointer rounded-full bg-muted/60 ${isFavorited ? 'text-rose-500 hover:text-rose-600' : 'text-foreground-secondary hover:text-rose-500'}`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
      <ShareQuoteModal isOpen={isShareOpen} onClose={closeShare} quote={shareData} />
    </>
  );
}
