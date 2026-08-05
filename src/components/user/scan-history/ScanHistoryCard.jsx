'use client';

import { motion } from 'framer-motion';
import { Calendar, Tag, Eye, Share2, Quote as QuoteIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import FavoriteButton from '@/components/favorite/FavoriteButton';
import { format } from 'date-fns';
import {
  getCategoryChipTheme,
  getCategoryLabel,
  resolveBackgroundImage,
} from '@/components/category';

// Overview card DNA: EXACT match to the Summary Statistics card surface —
// same radius, bg-card + border-white/6, warm ivory glass in light mode,
// identical warm shadows and elevation.
const CARD_SURFACE =
  'rounded-2xl bg-card border border-white/6 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)] ' +
  'light:border-[#E8DFCE]/80 light:bg-[#FBF7EF]/55 light:shadow-[0_20px_50px_-20px_rgba(100,72,24,0.28),0_10px_30px_-18px_rgba(100,72,24,0.16)]';

/**
 * Scan History Card — collectible card
 * Shares the Overview card DNA (surface, shadows, chips, typography).
 */
export default function ScanHistoryCard({
  item,
  onViewDetail,
  view = 'grid',
}) {
  const quote = item?.quote;
  const tag = item?.tag;
  const category = quote?.category || 'motivation';
  const categoryLabel = getCategoryLabel(category);
  const chip = getCategoryChipTheme(category);
  const backgroundImage = quote?.image?.url || resolveBackgroundImage(category);

  const formattedDate = item.createdAt
    ? format(new Date(item.createdAt), 'MMM d, yyyy')
    : '';
  const formattedTime = item.createdAt
    ? format(new Date(item.createdAt), 'h:mm a')
    : '';

  const handleShare = async (e) => {
    e.stopPropagation();
    e.preventDefault();
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

  const handleView = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onViewDetail(item);
  };

  // Action icons — Overview hover language: subtle lift, soft bg tint.
  // NOTE: no text color here so the FavoriteButton's own active rose state
  // (text-rose-500 + fill) is never overridden by twMerge.
  const actionIconClass =
    'h-8 w-8 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15 active:scale-95 dark:hover:bg-white/10 light:hover:bg-[#E8DFCE]/60';

  if (view === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`group flex flex-col gap-4 border ${CARD_SURFACE} p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_20px_40px_-16px_rgb(0_0_0/0.5)] sm:flex-row sm:items-center`}
      >
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium text-foreground">
            &ldquo;{quote?.text || ''}&rdquo;
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-foreground-tertiary">
              {quote?.author || 'InspireTag'}
            </span>
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${chip.border} ${chip.bg} ${chip.text} ${chip.lightText}`}>
              {categoryLabel}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-foreground-tertiary">
              <Tag className="h-3 w-3" />
              {tag?.tagCode || 'N/A'}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-foreground-tertiary">
              <Calendar className="h-3 w-3" />
              {formattedDate} at {formattedTime}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <FavoriteButton
            id={quote?._id}
            type="quote"
            size="sm"
            variant="ghost"
            className="h-8 w-8 text-foreground-tertiary hover:text-foreground hover:bg-muted/50"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="h-8 w-8 cursor-pointer text-foreground-tertiary hover:text-foreground hover:bg-muted/50"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleView}
            className="h-8 w-8 cursor-pointer text-foreground-tertiary hover:text-foreground hover:bg-muted/50"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  // Grid view — collectible card
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.015, y: -5 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`group relative overflow-hidden ${CARD_SURFACE} transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_24px_48px_-16px_rgb(0_0_0/0.55)]`}
    >
      {/* Clickable image area — opens detail modal */}
      <div
        className="relative h-52 cursor-pointer bg-cover bg-center sm:h-56"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        onClick={() => onViewDetail(item)}
      >
        {/* Cinematic gradient stack — dark mode only, for text readability */}
        <div className="absolute inset-0 hidden bg-gradient-to-b from-black/25 via-black/10 to-black/45 dark:block" />
        <div
          className="pointer-events-none absolute inset-0 hidden dark:block"
          style={{
            background:
              'radial-gradient(ellipse 90% 80% at 50% 0%, rgba(0,0,0,0.2) 0%, transparent 60%)',
          }}
        />

        {/* Light-mode warm ivory wash — blends the photo into the Summary-card surface */}
        <div className="pointer-events-none absolute inset-0 light:bg-gradient-to-b light:from-[#FDFBF6]/40 light:via-[#F8F2E7]/35 light:to-[#FBF7EF]/85" />

        {/* Top chips (display-only, not clickable) */}
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {/* Tag chip — matches category chip height/padding/border */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/95 backdrop-blur-md light:border-[#E8DFCE]/80 light:bg-white/70 light:text-[#4A3C2D]">
            <Tag className="h-3 w-3" />
            {tag?.tagCode || 'N/A'}
          </span>

          {/* Category chip — readable in both themes */}
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize backdrop-blur-md ${chip.border} ${chip.bg} ${chip.text} ${chip.lightText} ${chip.glow}`}
          >
            {categoryLabel}
          </span>
        </div>

        {/* Quote area */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 py-10 pt-14">
          <div className="text-center">
            <QuoteIcon className="mx-auto mb-2 h-4 w-4 text-white/60 dark:text-white/60 light:text-[#8A7558]" strokeWidth={2} />
            <p className="line-clamp-4 text-[15px] font-medium leading-[1.6] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] dark:text-white dark:drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] light:text-[#201A15] light:drop-shadow-none">
              &ldquo;{quote?.text || ''}&rdquo;
            </p>
          </div>
        </div>

        {/* Glass footer */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-white/10 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3.5 pb-2.5 pt-8 dark:border-white/10 light:border-[#E8DFCE]/80 light:from-[#FBF7EF]/95 light:via-[#FBF7EF]/60 light:to-transparent">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            {/* Brand — left */}
            <span className="truncate text-[11px] font-medium text-white/80 light:text-[#6F5D46]">
              {quote?.author || 'MyInspireTag'}
            </span>

            {/* Date — center */}
            <span className="flex items-center gap-1 text-[10px] font-medium whitespace-nowrap text-white/65 light:text-[#8A7558]">
              <Calendar className="h-3 w-3" />
              {formattedDate} · {formattedTime}
            </span>

            {/* Actions — right (interactive, re-enable pointer events) */}
            <div className="pointer-events-auto flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                aria-label="Share quote"
                className={`${actionIconClass} rounded-full bg-white/10 text-white/90 backdrop-blur-md hover:text-white light:text-[#6F5D46] light:hover:text-[#4A3C2D]`}
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>
              <FavoriteButton
                id={quote?._id}
                type="quote"
                size="sm"
                variant="ghost"
                aria-label="Favorite quote"
                className={`${actionIconClass} rounded-full bg-white/10 text-white/90 backdrop-blur-md hover:text-white light:text-[#6F5D46] light:hover:text-[#4A3C2D]`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleView}
                aria-label="View quote details"
                className={`${actionIconClass} rounded-full bg-white/10 text-white/90 backdrop-blur-md hover:text-white light:text-[#6F5D46] light:hover:text-[#4A3C2D]`}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
