'use client';

import Image from 'next/image';
import { Quote, Share2, BookOpen, Sparkles, Heart } from 'lucide-react';
import FavoriteButton from '@/components/favorite/FavoriteButton';

/**
 * Today's Inspiration card — client image:
 * background image, quote preview, author, favorite, share, read again,
 * daily usage badge (e.g. "1 of 1" or "2 of 3").
 */
export default function LatestInspirationCard({
  inspiration,
  onShare,
  onReadAgain,
  onFavoriteChange,
}) {
  const quote = inspiration?.text || '';
  const author = inspiration?.author || 'InspireTag';
  const image = inspiration?.image || null;
  const category = inspiration?.category || null;
  const usedToday = inspiration?.dailyUsage?.usedToday ?? 0;
  const dailyLimit = inspiration?.dailyUsage?.dailyLimit ?? 0;
  const isFavorite = !!inspiration?.favorite;
  const quoteId = inspiration?.quoteId || inspiration?.id || null;

  const usageLabel =
    dailyLimit > 0 ? `${usedToday} of ${dailyLimit} used today` : '';

  return (
    <section className="group relative h-full min-h-[220px] sm:min-h-[240px] lg:min-h-[280px] w-full overflow-hidden rounded-[26px] border border-white/10 bg-card shadow-[0_20px_50px_-16px_rgb(0_0_0/0.55)]">
      {/* Background image */}
      {image ? (
        <div className="absolute inset-0">
          <Image
            src={image}
            alt="Today's inspiration"
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          {/* Layered overlay gradients for depth + readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/10" />
        </div>
      ) : (
        <div className="absolute inset-0">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-background-secondary/80 via-background to-background-tertiary/40" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-8 md:px-10 py-6 sm:py-8">
        <div className="max-w-[380px]">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-accent/25 bg-accent/10 shadow-[0_0_18px_rgba(253,182,92,0.12)]">
              <Quote
                size={14}
                className="text-accent"
                fill="currentColor"
                stroke="none"
              />
            </span>
            <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">
              Today&apos;s Inspiration
            </span>
          </div>

          <h2 className="italic text-[19px] sm:text-[22px] md:text-[25px] lg:text-[29px] leading-[1.3] tracking-wide text-foreground line-clamp-3 text-balance">
            {quote}
          </h2>

          <p className="mt-3 text-[12px] sm:text-[13px] md:text-[14px] font-medium tracking-wide text-foreground-secondary">
            — {author}
          </p>

          {/* Premium circular actions */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:gap-3">
            {quoteId ? (
              <FavoriteButton
                id={quoteId}
                type="quote"
                onToggle={(res) => onFavoriteChange && onFavoriteChange(res)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-background-secondary/70 text-foreground-secondary backdrop-blur-md transition-all duration-300 hover:border-pink-500/50 hover:text-pink-400 hover:shadow-[0_0_20px_rgba(236,72,153,0.25)]"
              />
            ) : (
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-background-secondary/50 text-foreground-tertiary">
                <Heart size={16} className="w-4 h-4" />
              </span>
            )}

            <button
              onClick={onShare}
              aria-label="Share quote"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-background-secondary/70 text-foreground-secondary backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:text-primary hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] active:scale-95"
            >
              <Share2 size={16} className="w-4 h-4" />
            </button>

            <button
              onClick={onReadAgain}
              aria-label="Read again"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-background-secondary/70 text-foreground-secondary backdrop-blur-md transition-all duration-300 hover:border-accent/50 hover:text-accent hover:shadow-[0_0_20px_rgba(253,182,92,0.25)] active:scale-95"
            >
              <BookOpen size={16} className="w-4 h-4" />
            </button>

            {category?.name ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-background-secondary/70 px-3 py-1.5 text-[11px] font-medium text-foreground-secondary backdrop-blur-md">
                <Sparkles size={11} className="w-2.5 h-2.5 text-accent" />
                {category.name}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Daily usage badge */}
      {usageLabel ? (
        <div className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-background-secondary/80 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-foreground-secondary backdrop-blur-md shadow-[0_4px_16px_-4px_rgb(0_0_0/0.4)]">
          {usageLabel}
        </div>
      ) : null}
    </section>
  );
}
