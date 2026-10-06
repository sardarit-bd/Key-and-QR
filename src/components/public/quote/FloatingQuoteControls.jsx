'use client';

import React from 'react';
import Link from 'next/link';
import { Share2, Sparkles, BookOpen, Heart, Bookmark, Trash2 } from 'lucide-react';
import FavoriteButton from '@/components/ui/FavoriteButton';

/**
 * FloatingQuoteControls
 *
 * Lightweight, compact floating controls over the quote artwork image:
 * - Visual direction: image → soft translucent/whitish glass background → buttons/icons
 * - Increased transparency (bg-white/35 dark:bg-black/35) with rich backdrop blur (backdrop-blur-xl)
 *   so the quote/image underneath remains visually readable.
 * - Compact capsule dock for secondary actions (Save, Share, Reflect, Collection).
 * - Primary "Inspire" button clearly accessible on the left when present.
 * - All actions preserve full functionality with e.stopPropagation().
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

  const actionItemClass =
    'flex min-w-[44px] sm:min-w-[54px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 sm:px-2 py-1 sm:py-1.5 text-[#18181B] hover:text-black hover:bg-black/10 active:scale-95 transition-all duration-150 cursor-pointer select-none';

  const favoriteActionClass = `${actionItemClass} [&>div]:flex-col [&>div]:gap-0.5 [&>div>span]:!ml-0 [&>div>span]:!text-[10px] [&>div>span]:!font-medium [&>div>span]:!leading-none [&>div>span]:!text-[#18181B] [&>div>svg]:!text-[#18181B]`;

  return (
    <>
      <div
        className={`floating-quote-controls-dock flex items-center ${
          hasLeftSection ? 'justify-between' : 'justify-center w-fit'
        } gap-1.5 sm:gap-3 rounded-2xl border border-white/30 bg-white/20 backdrop-blur-[10px] px-2 py-1.5 sm:px-3 sm:py-2 shadow-[0_4px_20px_rgba(0,0,0,0.04)] text-[#18181B] select-none ${
          className ||
          (hasLeftSection
            ? 'absolute bottom-3 sm:bottom-4 left-2.5 sm:left-4 right-2.5 sm:right-4 z-20'
            : 'absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 max-w-[calc(100%-1.5rem)]')
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Left Section: Primary "Inspire" Action Button */}
        {hasLeftSection && (
          <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 sm:flex-initial">
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
                  className={`inline-flex h-8 sm:h-8.5 cursor-pointer items-center justify-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3.5 text-[11px] sm:text-[12.5px] font-semibold transition-all duration-150 active:scale-[0.97] select-none shadow-sm backdrop-blur-sm min-w-0 max-w-full ${
                    isLimitReached
                      ? 'bg-black/[0.08] text-[#3F3F46] border border-black/[0.08] cursor-not-allowed'
                      : isReceiving
                      ? 'bg-white/20 text-[#18181B] border border-white/30 cursor-wait'
                      : `bg-white/25 hover:bg-white/40 active:scale-[0.97] border border-white/40 text-[#18181B] shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${
                          usedToday === 0 ? 'ring-1 ring-black/10 border-white/60' : ''
                        }`
                  }`}
                >
                  <Sparkles
                    size={13}
                    className={isLimitReached ? 'text-zinc-600 shrink-0' : 'text-amber-600 shrink-0'}
                    fill={isLimitReached ? 'none' : 'currentColor'}
                  />
                  <span className="truncate">
                    {isReceiving ? (
                      'Inspiring...'
                    ) : isLimitReached ? (
                      'Limit reached'
                    ) : usedToday === 0 ? (
                      <>
                        <span className="hidden sm:inline">Receive Inspiration</span>
                        <span className="sm:hidden">Inspire</span>
                      </>
                    ) : (
                      'Inspire'
                    )}
                  </span>
                </button>

                {dailyLimit !== undefined && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-[#27272A] select-none px-1 shrink-0">
                    <Sparkles size={11} className="text-amber-600 shrink-0" />
                    <span>
                      {dailyLimit === 0 ? 'Unlimited' : `${usedToday} of ${dailyLimit} used`}
                    </span>
                  </span>
                )}
              </>
            )}
          </div>
        )}

        {/* 2. Secondary Actions: Balanced Horizontal Action Group with Priority Width */}
        <div
          className="flex items-center justify-end sm:justify-evenly gap-0.5 sm:gap-1.5 shrink-0 ml-auto"
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
                  className={favoriteActionClass}
                  size="sm"
                  showText={true}
                  activeText="Saved"
                  inactiveText="Save"
                />
              </div>
            ) : (
              <span
                aria-hidden="true"
                className="flex min-w-[44px] sm:min-w-[54px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 sm:px-2 py-1 sm:py-1.5 text-zinc-400 cursor-not-allowed select-none"
                title="Save"
              >
                <Heart size={16} strokeWidth={1.75} />
                <span className="text-[10px] font-medium leading-none text-zinc-400">Save</span>
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
              className={actionItemClass}
            >
              <Share2 size={16} strokeWidth={1.75} />
              <span className="text-[10px] font-medium leading-none text-[#18181B]">Share</span>
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
              title="Reflect"
              className={actionItemClass}
            >
              <BookOpen size={16} strokeWidth={1.75} />
              <span className="text-[10px] font-medium leading-none text-[#18181B]">Reflect</span>
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
              title="Reflect"
              className={actionItemClass}
            >
              <BookOpen size={16} strokeWidth={1.75} />
              <span className="text-[10px] font-medium leading-none text-[#18181B]">Reflect</span>
            </button>
          ) : detailHref ? (
            <Link
              href={detailHref}
              onClick={(e) => e.stopPropagation()}
              aria-label="Reflect on quote"
              title="Reflect"
              className={actionItemClass}
            >
              <BookOpen size={16} strokeWidth={1.75} />
              <span className="text-[10px] font-medium leading-none text-[#18181B]">Reflect</span>
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
              className={actionItemClass}
            >
              <Bookmark size={16} strokeWidth={1.75} />
              <span className="text-[10px] font-medium leading-none text-[#18181B]">Collection</span>
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
              title="Remove"
              className="flex min-w-[44px] sm:min-w-[54px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 sm:px-2 py-1 sm:py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 active:scale-95 transition-all cursor-pointer select-none disabled:opacity-50"
            >
              {isRemoving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-400/30 border-t-rose-400" />
              ) : (
                <Trash2 size={16} strokeWidth={1.75} />
              )}
              <span className="text-[10px] font-medium leading-none text-rose-600">Remove</span>
            </button>
          )}
        </div>
      </div>

      <style>{`
        /* Mobile / Tablet / Touch devices: ALWAYS visible, NEVER hidden, NO hover required */
        .floating-quote-controls-dock {
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
        }

        /* Desktop / Mouse devices ONLY: hidden by default, smoothly revealed when user hovers the Quote Card */
        @media (hover: hover) and (pointer: fine) {
          .floating-quote-controls-dock {
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
            transition: opacity 220ms ease-out, visibility 220ms ease-out !important;
          }
          .group:hover .floating-quote-controls-dock,
          .group:focus-within .floating-quote-controls-dock {
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
          }
        }
      `}</style>
    </>
  );
}
