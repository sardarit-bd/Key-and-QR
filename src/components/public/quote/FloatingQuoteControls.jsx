'use client';

import React from 'react';
import Link from 'next/link';
import { Share2, Sparkles, BookOpen, Heart, Bookmark, Trash2 } from 'lucide-react';
import FavoriteButton from '@/components/ui/FavoriteButton';

/**
 * FloatingQuoteControls
 *
 * Glassmorphic Quote Card Action Controls matching design specification:
 * 1. Layout Structure:
 *    - Primary "Inspire" action button clearly separated on the left.
 *    - Secondary actions (Save/Favorite, Share, Reflect/Read, Collection)
 *      grouped inside a single, elegant, pill-shaped frosted glass capsule dock.
 * 2. Styling & Theme Adaptation:
 *    - Refined translucent frosted glass aesthetic (`backdrop-blur-md`).
 *    - Light theme: Crisp frosted whitish glass (`bg-white/75 border-white/40 shadow-black/10`).
 *    - Dark theme: Deep translucent obsidian glass (`dark:bg-neutral-950/75 dark:border-white/15 dark:shadow-black/40`).
 *    - Clean line-art icons with consistent stroke and hover transitions.
 * 3. Positioning & Touch Accessibility:
 *    - Absolute positioning (`absolute bottom-4 left-4 right-4 z-20`) directly over the artwork image.
 *    - Fully visible on mobile touch devices (`opacity-100`) without relying on hover states.
 *    - `e.stopPropagation()` bound to prevent triggering underlying card navigation.
 */
export default function FloatingQuoteControls({
  quoteId,
  detailHref,
  onShare,
  onViewDetail,
  onReadAgain,
  onRemove,
  isRemoving = false,
  showFavorite = true,
  favoriteType = 'quote',
  onFavoriteChange,
  // Collection navigation
  showCollection = true,
  collectionHref = '/dashboard/user/favorites',
  onCollection,
  // Dashboard Hero card actions
  onInspire,
  isReceiving = false,
  isLimitReached = false,
  usedToday,
  dailyLimit,
  // Custom slots
  customLeftContent = null,
  customRightContent = null,
  className = '',
}) {
  const hasLeftSection = Boolean(customLeftContent || onInspire);

  const actionIconClass =
    'flex h-8 w-8 sm:h-8.5 sm:w-8.5 cursor-pointer items-center justify-center rounded-full text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all duration-150';

  return (
    <div
      className={`absolute bottom-4 left-4 right-4 z-20 pointer-events-auto flex items-center ${
        hasLeftSection ? 'justify-between' : 'justify-center'
      } gap-2 sm:gap-3 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Left Section: Primary "Inspire" Action Button & Usage Indicator */}
      {hasLeftSection && (
        <div className="flex items-center gap-2 shrink-0">
          {customLeftContent}

          {onInspire && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isLimitReached) onInspire(e);
                }}
                disabled={isReceiving || isLimitReached}
                aria-disabled={isLimitReached}
                title={isLimitReached ? 'Daily limit reached — come back tomorrow' : undefined}
                className={`inline-flex h-9 sm:h-9.5 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 sm:px-4.5 text-[12px] sm:text-[13px] font-semibold transition-all duration-150 active:scale-[0.97] select-none shadow-md ${
                  isLimitReached
                    ? 'bg-neutral-800/80 text-white/40 cursor-not-allowed border border-white/10 backdrop-blur-md'
                    : `bg-accent text-accent-foreground border border-accent/40 shadow-accent/25 hover:brightness-105 ${
                        usedToday === 0 ? 'ring-2 ring-accent/60 shadow-accent/30' : ''
                      }`
                }`}
              >
                <Sparkles size={14} fill={isLimitReached ? 'none' : 'currentColor'} />
                <span className="truncate">
                  {isReceiving
                    ? 'Inspiring...'
                    : isLimitReached
                    ? 'Limit reached'
                    : usedToday === 0
                    ? 'Receive Inspiration'
                    : 'Inspire'}
                </span>
              </button>

              {dailyLimit !== undefined && (
                <div className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-white/30 dark:border-white/15 bg-white/75 dark:bg-neutral-950/75 backdrop-blur-md px-3 py-1.5 text-[11px] font-medium text-neutral-700 dark:text-neutral-200 select-none shadow-sm">
                  <Sparkles size={11} className="text-accent shrink-0" />
                  <span>
                    {dailyLimit === 0 ? 'Unlimited' : `${usedToday} of ${dailyLimit} used today`}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 2. Secondary Actions: Elegant Pill-Shaped Frosted Glass Capsule Dock */}
      <div
        className="flex items-center gap-0.5 sm:gap-1 rounded-full border border-white/35 dark:border-white/15 bg-white/75 dark:bg-neutral-950/75 backdrop-blur-md p-1 sm:p-1.5 shadow-lg shadow-black/10 dark:shadow-black/40 text-neutral-800 dark:text-neutral-100 transition-all shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {customRightContent}

        {/* 1. Save / Favorite */}
        {showFavorite && (
          quoteId ? (
            <div onClick={(e) => e.stopPropagation()}>
              <FavoriteButton
                id={quoteId}
                type={favoriteType}
                onToggle={onFavoriteChange}
                className={actionIconClass}
                size="sm"
              />
            </div>
          ) : (
            <span
              aria-hidden="true"
              className="flex h-8 w-8 sm:h-8.5 sm:w-8.5 cursor-not-allowed items-center justify-center rounded-full text-neutral-400 dark:text-white/30"
              title="Save"
            >
              <Heart size={16} strokeWidth={1.75} />
            </span>
          )
        )}

        {/* 2. Share */}
        {onShare && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onShare(e);
            }}
            aria-label="Share quote"
            title="Share"
            className={actionIconClass}
          >
            <Share2 size={16} strokeWidth={1.75} />
          </button>
        )}

        {/* 3. Reflect / Read */}
        {onReadAgain ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onReadAgain(e);
            }}
            aria-label="Reflect on quote"
            title="Reflect / Read"
            className={actionIconClass}
          >
            <BookOpen size={16} strokeWidth={1.75} />
          </button>
        ) : onViewDetail ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onViewDetail(e);
            }}
            aria-label="Reflect on quote"
            title="Reflect / Read"
            className={actionIconClass}
          >
            <BookOpen size={16} strokeWidth={1.75} />
          </button>
        ) : detailHref ? (
          <Link
            href={detailHref}
            onClick={(e) => e.stopPropagation()}
            aria-label="Reflect on quote"
            title="Reflect / Read"
            className={actionIconClass}
          >
            <BookOpen size={16} strokeWidth={1.75} />
          </Link>
        ) : null}

        {/* 4. Collection */}
        {showCollection && (
          <Link
            href={collectionHref}
            onClick={(e) => {
              e.stopPropagation();
              if (onCollection) onCollection(e);
            }}
            aria-label="View Collection"
            title="Collection"
            className={actionIconClass}
          >
            <Bookmark size={16} strokeWidth={1.75} />
          </Link>
        )}

        {/* 5. Remove (Collection management) */}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(e);
            }}
            disabled={isRemoving}
            aria-label="Remove Quote"
            title="Remove from Collection"
            className="flex h-8 w-8 sm:h-8.5 sm:w-8.5 cursor-pointer items-center justify-center rounded-full text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-500/15 active:scale-95 transition-all disabled:opacity-50"
          >
            {isRemoving ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-400/30 border-t-rose-400" />
            ) : (
              <Trash2 size={16} strokeWidth={1.75} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
