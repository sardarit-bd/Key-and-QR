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
  resolveBackgroundImage,
} from '@/components/category';
import useShareQuote from '@/hooks/useShareQuote';
import ShareQuoteModal from '@/components/quote/ShareQuoteModal';

/**
 * My Quote Card
 * Displays a single received quote with favorite, share, and menu actions.
 * Renders the ReceivedQuote shape:
 * { _id, quote, category, receivedAt, favorite, favoriteId }.
 *
 * The quote ALWAYS stays in the library — the heart only toggles the
 * Favorite bookmark. It never removes the card from My Quotes.
 */
export default function MyQuoteCard({
  receivedQuote,
  view = 'grid',
  onToggleFavorite,
}) {
  const [isToggling, setIsToggling] = useState(false);
  const quote = receivedQuote?.quote;

  if (!quote) return null;

  const category = quote.category || 'motivation';
  const categoryLabel = getCategoryLabel(category);
  const chip = getCategoryChipTheme(category);
  const hasImage = Boolean(quote.image?.url);
  const backgroundImage = hasImage
    ? quote.image.url
    : resolveBackgroundImage(category);

  const isFavorite = !!receivedQuote?.favorite;
  const favoriteId = receivedQuote?.favoriteId || null;

  const formattedDate = receivedQuote.receivedAt
    ? format(new Date(receivedQuote.receivedAt), 'MMM d, yyyy')
    : '';

  const { isShareOpen, shareData, closeShare, shareQuote } = useShareQuote();

  const handleShare = () => {
    shareQuote({
      quoteId: quote._id,
      text: quote.text,
      author: quote.author,
      category: quote.category,
      imageUrl: quote.renderedImages?.desktop?.url || (typeof quote.image === 'string' ? quote.image : quote.image?.url) || null,
    });
  };

  const handleCopy = () => {
    const text = `"${quote.text}" — ${quote.author || 'InspireTag'}`;
    navigator.clipboard?.writeText(text);
    toast.success('Quote copied!');
  };

  const handleToggleFavorite = async () => {
    if (!onToggleFavorite) return;
    setIsToggling(true);
    try {
      await onToggleFavorite({
        quoteId: quote._id,
        isFavorite,
        favoriteId,
      });
    } catch (error) {
      toast.error('Failed to update favorite');
    } finally {
      setIsToggling(false);
    }
  };

  // List view — premium quote row.
  if (view === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`group flex flex-col gap-4 border ${CARD_SURFACE} p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_20px_40px_-16px_rgb(0_0_0/0.5)] sm:flex-row sm:items-center`}
      >
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium text-foreground">
            &ldquo;{quote.text}&rdquo;
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-foreground-tertiary">
              {quote.author || 'InspireTag'}
            </span>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${chip.border} ${chip.bg} ${chip.text} ${chip.lightText}`}
            >
              {categoryLabel}
            </span>
            {formattedDate && (
              <span className="flex items-center gap-1 text-[10px] text-foreground-tertiary">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            disabled={isToggling}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={isFavorite}
            className={`h-8 w-8 cursor-pointer transition-all duration-300 hover:bg-muted/50 ${
              isFavorite
                ? 'text-rose-500 hover:text-rose-500'
                : 'text-foreground-tertiary hover:text-foreground'
            }`}
          >
            {isToggling ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500/30 border-t-rose-500" />
            ) : (
              <svg
                className={`h-4 w-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
                viewBox="0 0 24 24"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={2}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            )}
          </Button>
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
              className="border border-white/6 bg-popover text-foreground shadow-xl backdrop-blur-xl light:border-[#E8DFCE]/80"
            >
              <DropdownMenuItem
                onClick={handleCopy}
                className="cursor-pointer hover:bg-muted/50"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Quote
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    );
  }

  // Grid view — collectible card (image or text variant).
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.015, y: -5 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`group relative overflow-hidden ${CARD_SURFACE} ${HOVER_ELEVATION} transition-all duration-300`}
    >
      {hasImage ? (
        /* ===================== IMAGE VARIANT ===================== */
        <div
          className="relative h-52 bg-cover bg-center sm:h-56"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          {/* Cinematic gradient stack — dark mode only */}
          <div className="absolute inset-0 hidden bg-gradient-to-b from-black/25 via-black/10 to-black/45 dark:block" />
          <div
            className="pointer-events-none absolute inset-0 hidden dark:block"
            style={{
              background:
                'radial-gradient(ellipse 90% 80% at 50% 0%, rgba(0,0,0,0.2) 0%, transparent 60%)',
            }}
          />

          {/* Light-mode warm ivory wash — blends photo into the card surface */}
          <div className="pointer-events-none absolute inset-0 light:bg-gradient-to-b light:from-[#FDFBF6]/40 light:via-[#F8F2E7]/35 light:to-[#FBF7EF]/85" />

          {/* Top chips */}
          <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            {/* Brand */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/95 backdrop-blur-md light:border-[#E8DFCE]/80 light:bg-white/70 light:text-[#4A3C2D]">
              {quote.author || 'MyInspireTag'}
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
              <QuoteIcon
                className="mx-auto mb-2 h-4 w-4 text-white/60 light:text-[#8A7558]"
                strokeWidth={2}
              />
              <p className="line-clamp-4 text-[15px] font-medium leading-[1.6] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] dark:text-white dark:drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] light:text-[#201A15] light:drop-shadow-none">
                &ldquo;{quote.text}&rdquo;
              </p>
            </div>
          </div>

          {/* Glass footer — actions + date */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-white/10 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3.5 pb-2.5 pt-8 dark:border-white/10 light:border-[#E8DFCE]/80 light:from-[#FBF7EF]/95 light:via-[#FBF7EF]/60 light:to-transparent">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[11px] font-medium text-white/80 light:text-[#6F5D46]">
                {formattedDate}
              </span>

              <div className="pointer-events-auto flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShare}
                  aria-label="Share quote"
                  className={ACTION_ICON_CLASS}
                >
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleFavorite}
                  disabled={isToggling}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  aria-pressed={isFavorite}
                  className={`${ACTION_ICON_CLASS} ${
                    isFavorite ? '!text-rose-400' : ''
                  }`}
                >
                  {isToggling ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-500/30 border-t-rose-500" />
                  ) : (
                    <svg
                      className={`h-3.5 w-3.5 ${isFavorite ? 'fill-rose-400 text-rose-400' : ''}`}
                      viewBox="0 0 24 24"
                      fill={isFavorite ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth={2}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                      />
                    </svg>
                  )}
                </Button>
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
                    className="border border-white/6 bg-popover text-foreground shadow-xl backdrop-blur-xl light:border-[#E8DFCE]/80"
                  >
                    <DropdownMenuItem
                      onClick={handleCopy}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Quote
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ===================== TEXT VARIANT — intentionally designed, not "missing image" ===================== */
        <div className="relative h-52 sm:h-56">
          {/* Layered premium gradient surface */}
          <div className="absolute inset-0 bg-gradient-to-br from-background-tertiary/90 via-background-secondary to-background" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.07] via-transparent to-accent/[0.05]" />

          {/* Ambient glows */}
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-64 -translate-x-1/2 rounded-full bg-accent/[0.06] blur-[80px]" />

          {/* Soft decorative pattern — repeating radial dots, masked to edges */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05] dark:opacity-[0.07] light:opacity-[0.06]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
              backgroundSize: '18px 18px',
              color: '#E8C985',
              maskImage:
                'radial-gradient(ellipse 90% 90% at 50% 40%, black 40%, transparent 100%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 90% 90% at 50% 40%, black 40%, transparent 100%)',
            }}
          />

          {/* Hairline top highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent light:via-[#E8DFCE]/70" />

          {/* Top chips — same placement as image variant */}
          <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/95 backdrop-blur-md light:border-[#E8DFCE]/80 light:bg-white/70 light:text-[#4A3C2D]">
              {quote.author || 'MyInspireTag'}
            </span>

            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize backdrop-blur-md ${chip.border} ${chip.bg} ${chip.text} ${chip.lightText} ${chip.glow}`}
            >
              {categoryLabel}
            </span>
          </div>

          {/* Quote area with decorative quote mark */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 py-10 pt-14">
            <div className="relative text-center">
              {/* Oversized ghost quote mark */}
              <QuoteIcon
                className="absolute -top-7 left-1/2 h-12 w-12 -translate-x-1/2 text-accent/15 light:text-[#C6922D]/15"
                strokeWidth={1}
                fill="currentColor"
                stroke="none"
              />
              <p className="relative line-clamp-4 text-[15px] font-medium leading-[1.6] text-foreground">
                &ldquo;{quote.text}&rdquo;
              </p>
            </div>
          </div>

          {/* Glass footer — identical treatment to the image variant */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-white/10 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3.5 pb-2.5 pt-8 dark:border-white/10 light:border-[#E8DFCE]/80 light:from-[#FBF7EF]/95 light:via-[#FBF7EF]/60 light:to-transparent">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[11px] font-medium text-white/80 light:text-[#6F5D46]">
                {formattedDate}
              </span>

              <div className="pointer-events-auto flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShare}
                  aria-label="Share quote"
                  className={ACTION_ICON_CLASS}
                >
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleFavorite}
                  disabled={isToggling}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  aria-pressed={isFavorite}
                  className={`${ACTION_ICON_CLASS} ${
                    isFavorite ? '!text-rose-400' : ''
                  }`}
                >
                  {isToggling ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-500/30 border-t-rose-500" />
                  ) : (
                    <svg
                      className={`h-3.5 w-3.5 ${isFavorite ? 'fill-rose-400 text-rose-400' : ''}`}
                      viewBox="0 0 24 24"
                      fill={isFavorite ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth={2}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                      />
                    </svg>
                  )}
                </Button>
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
                    className="border border-white/6 bg-popover text-foreground shadow-xl backdrop-blur-xl light:border-[#E8DFCE]/80"
                  >
                    <DropdownMenuItem
                      onClick={handleCopy}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Quote
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unified Share Quote Modal */}
      <ShareQuoteModal
        isOpen={isShareOpen}
        onClose={closeShare}
        quoteData={shareData}
      />
    </motion.div>
  );
}
