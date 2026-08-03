'use client';

import Image from 'next/image';
import { Quote, Share2, BookOpen, Sparkles, Heart } from 'lucide-react';
import FavoriteButton from '@/components/favorite/FavoriteButton';

/**
 * Today's Inspiration card — client image:
 * background image, quote preview, premium branding, favorite/share/read again,
 * daily usage badge (e.g. "1 of 1" or "2 of 3").
 *
 * Visual treatment:
 * - Gradient edge: a left border that is strongest on the left and fades into
 *   the card background toward the right — no full outline.
 * - Content centered both axes; image remains visible on the right.
 * - Subtle parallax/scale + brightness on hover (no aggressive zoom).
 */
export default function LatestInspirationCard({
  inspiration,
  onShare,
  onReadAgain,
  onFavoriteChange,
}) {
  const quote = inspiration?.text || '';
  const image = inspiration?.image || null;
  const category = inspiration?.category || null;
  const usedToday = inspiration?.dailyUsage?.usedToday ?? 0;
  const dailyLimit = inspiration?.dailyUsage?.dailyLimit ?? 0;
  const quoteId = inspiration?.quoteId || inspiration?.id || null;

  const usageLabel =
    dailyLimit > 0 ? `${usedToday} of ${dailyLimit} used today` : '';

  return (
    <section className="group relative h-full min-h-[240px] sm:min-h-[260px] lg:min-h-[300px] w-full overflow-hidden rounded-[26px] border border-white/6 bg-card shadow-[0_24px_60px_-18px_rgb(0_0_0/0.6)] light:border-[#E8DFCE]/80 light:bg-[#FBF7EF]/55 light:shadow-[0_32px_70px_-24px_rgba(100,72,24,0.32),0_16px_44px_-20px_rgba(100,72,24,0.16),0_0_44px_-14px_rgba(198,146,45,0.16)] light:backdrop-blur-[2px]">
      {/* ===== Left gradient edge — strong left, fades right ===== */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-30 w-16 sm:w-20 rounded-l-[26px] light:bg-gradient-to-r light:from-[#FFFFFF]/28 light:via-[#FFFFFF]/12 light:to-transparent"
        style={{
          background:
            'linear-gradient(90deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.14) 35%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0) 100%)',
          boxShadow:
            'inset 1px 0 0 rgba(255,255,255,0.18)',
        }}
      />

      {/* ===== Background image (right side) ===== */}
      {image ? (
        <div className="absolute inset-0 overflow-hidden rounded-[26px]">
          <Image
            src={image}
            alt="Today's inspiration"
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-all duration-500 ease-out group-hover:scale-[1.06] group-hover:brightness-[1.1]"
          />
          {/* Layered overlays — readable left, image visible right */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/10 light:via-background/45 light:to-background/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-background/15 light:from-background/30 light:to-background/8" />

          {/* Light-mode premium layered treatment — warm, editorial, image stays visible */}
          <div className="pointer-events-none absolute inset-0 hidden light:block">
            {/* Warm soft tint — image stays clearly visible */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FDFBF6]/42 via-[#F6EFE2]/26 to-[#EFE3CA]/12" />
            {/* Subtle left gradient — text zone melts into the card */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F3E9D6]/46 via-[#EBDCC0]/16 to-transparent" />
            {/* Center scrim behind the quote — readability without hiding the image */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#241A0E]/40 via-[#241A0E]/12 to-transparent" />
            {/* Soft gold glow — top-right above the badge */}
            <div className="absolute -top-28 -right-24 h-[380px] w-[380px] rounded-full bg-[#C6922D]/12 blur-3xl" />
            {/* Subtle purple glow — bottom-left */}
            <div className="absolute -bottom-32 -left-24 h-[400px] w-[400px] rounded-full bg-[#8B6BC8]/8 blur-3xl" />
            {/* Top highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 rounded-[26px]">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-background-secondary/80 via-background to-background-tertiary/40" />
        </div>
      )}

      {/* ===== Daily usage badge ===== */}
      {usageLabel ? (
        <div className="absolute right-4 top-4 z-30 rounded-full border border-white/10 bg-background-secondary/80 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-foreground-secondary backdrop-blur-md shadow-[0_4px_16px_-4px_rgb(0_0_0/0.4)] light:border-[#EFE5D2]/70 light:bg-white/55 light:text-[#4A3B28] light:shadow-[0_4px_16px_-4px_rgba(120,85,30,0.18)] light:backdrop-blur-md">
          {usageLabel}
        </div>
      ) : null}

      {/* ===== Centered content ===== */}
      <div className="relative z-20 flex h-full w-full items-center justify-center px-6 sm:px-8 md:px-10 py-8 sm:py-10">
        <div className="flex w-full max-w-[400px] flex-col items-center text-center">
          {/* Quote icon + label */}
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

          {/* Quote */}
          <h2 className="italic text-[19px] sm:text-[22px] md:text-[25px] lg:text-[28px] leading-[1.35] tracking-wide text-foreground line-clamp-3 text-balance">
            {quote}
          </h2>

          {/* Premium branding — subtle logo + wordmark (replaces "— InspireTag") */}
          <div className="mt-3 flex items-center gap-1.5 opacity-80">
            <Image
              src="/logo/white-logo-1.png"
              alt="MyInspireTag"
              width={16}
              height={16}
              className="h-4 w-4 rounded-full object-contain"
            />
            <span className="text-[11px] font-semibold tracking-[0.08em] text-foreground-secondary">
              MyInspireTag
            </span>
          </div>

          {/* Category pill */}
          {category?.name ? (
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-background-secondary/70 px-3 py-1.5 text-[11px] font-medium text-foreground-secondary backdrop-blur-md light:border-[#EFE5D2]/70 light:bg-white/55 light:text-[#4A3B28] light:shadow-[0_4px_14px_-4px_rgba(120,85,30,0.14)] light:backdrop-blur-md">
              <Sparkles size={11} className="w-2.5 h-2.5 text-accent" />
              {category.name}
            </span>
          ) : null}

          {/* Premium circular actions — centered, equal spacing */}
          <div className="mt-5 flex items-center justify-center gap-3 sm:gap-4">
            {quoteId ? (
              <FavoriteButton
                id={quoteId}
                type="quote"
                onToggle={(res) => onFavoriteChange && onFavoriteChange(res)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-background-secondary/70 text-foreground-secondary backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-pink-500/50 hover:text-pink-400 hover:shadow-[0_8px_24px_-6px_rgba(236,72,153,0.4)] active:scale-95 light:border-[#E9DEC8]/75 light:bg-white/60 light:text-[#5A4A34] light:shadow-[0_6px_18px_-6px_rgba(120,85,30,0.22)] light:backdrop-blur-md"
              />
            ) : (
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-background-secondary/50 text-foreground-tertiary light:border-[#E9DEC8]/75 light:bg-white/60 light:text-[#8A7A62]">
                <Heart size={16} className="w-4 h-4" />
              </span>
            )}

            <button
              onClick={onShare}
              aria-label="Share quote"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-background-secondary/70 text-foreground-secondary backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary hover:shadow-[0_8px_24px_-6px_rgba(168,85,247,0.4)] active:scale-95 light:border-[#E9DEC8]/75 light:bg-white/60 light:text-[#5A4A34] light:shadow-[0_6px_18px_-6px_rgba(120,85,30,0.22)] light:backdrop-blur-md"
            >
              <Share2 size={16} className="w-4 h-4" />
            </button>

            <button
              onClick={onReadAgain}
              aria-label="Read again"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-background-secondary/70 text-foreground-secondary backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent hover:shadow-[0_8px_24px_-6px_rgba(253,182,92,0.4)] active:scale-95 light:border-[#E9DEC8]/75 light:bg-white/60 light:text-[#5A4A34] light:shadow-[0_6px_18px_-6px_rgba(120,85,30,0.22)] light:backdrop-blur-md"
            >
              <BookOpen size={16} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
