'use client';

import Image from 'next/image';
import { Quote, Share2, BookOpen, Sparkles, Heart } from 'lucide-react';
import FavoriteButton from '@/components/favorite/FavoriteButton';

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
    <section className="group relative h-full min-h-[280px] sm:min-h-[320px] lg:min-h-[360px] w-full overflow-hidden rounded-[26px] border border-white/6 bg-card shadow-[0_24px_60px_-18px_rgb(0_0_0/0.6)] transition-[box-shadow,border-color] duration-500 ease-out group-hover:border-white/15 group-hover:shadow-[0_32px_80px_-20px_rgb(0_0_0/0.7)] light:border-[#E8D5AF]/80 light:bg-[#FDF8F0]/70 light:shadow-[0_24px_60px_-18px_rgba(120,85,30,0.28),0_8px_24px_-8px_rgba(120,85,30,0.14),0_0_32px_-10px_rgba(232,201,133,0.22)] light:backdrop-blur-[2px] light:group-hover:border-[#DCB878]/90 light:group-hover:shadow-[0_32px_80px_-20px_rgba(120,85,30,0.36),0_12px_32px_-10px_rgba(120,85,30,0.18),0_0_48px_-10px_rgba(232,201,133,0.3)]">

      {/* ===== Layer 1: Full-bleed background image (fills entire card) ===== */}
      {image ? (
        <div className="absolute inset-0">
          <Image
            src={image}
            alt="Today's inspiration"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center transition-all "
          />
        </div>
      ) : (
        <div className="absolute inset-0">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-background-secondary/80 via-background to-background-tertiary/40" />
        </div>
      )}

      {image ? (
        <>
          {/* ===== Layer 2: Strong horizontal dark gradient from left ===== */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/95 via-black/55 to-black/10" />

          {/* ===== Layer 3: Radial vignette, center-left ===== */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 90% at 20% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 45%, transparent 75%)',
            }}
          />

          {/* ===== Layer 4: Secondary soft gradient for smooth blend ===== */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.28) 55%, rgba(0,0,0,0.05) 80%, transparent 100%)',
            }}
          />

          {/* ===== Layer 5: Top/bottom cinematic grade ===== */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45" />

          {/* ===== Layer 6: Very soft warm accent glow (premium touch) ===== */}
          <div className="pointer-events-none absolute -top-24 -left-10 h-72 w-72 rounded-full bg-accent/10 blur-[100px]" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />

          {/* ============================================
              LIGHT MODE ONLY — separate warm overlay system
              (Dark mode never renders these)
              ============================================ */}
          <div className="pointer-events-none absolute inset-0 hidden light:block">
            {/* L2 — very soft warm ivory tint */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFFDF9]/30 via-[#FCF7EF]/22 to-[#FCF7EF]/16" />

            {/* L3 — large radial gradient from the left */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 75% 95% at 18% 50%, rgba(255,250,243,0.90) 0%, rgba(255,247,236,0.55) 40%, transparent 75%)',
              }}
            />

            {/* L4 — soft horizontal blend, left → right */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, rgba(255,250,242,0.95) 0%, rgba(255,248,240,0.60) 40%, transparent 75%)',
              }}
            />

            {/* L5 — very subtle gold glow */}
            <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[#E8C985]/15 blur-[100px]" />
            <div className="absolute -right-16 -top-10 h-64 w-64 rounded-full bg-[#E8C985]/12 blur-[90px]" />

            {/* L6 — very subtle lavender glow */}
            <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-[#C7B8E8]/10 blur-[100px]" />

            {/* Frosted glass sheen across the top */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
          </div>
        </>
      ) : null}

      {/* ===== Daily usage badge ===== */}
      {usageLabel ? (
        <div className="absolute right-4 top-4 z-30 rounded-full border border-white/10 bg-background-secondary/80 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-foreground-secondary backdrop-blur-md shadow-[0_4px_16px_-4px_rgb(0_0_0/0.4)] light:border-[#E8DCC7]/80 light:bg-white/90 light:text-[#4A3C2D] light:shadow-[0_4px_16px_-6px_rgba(120,85,30,0.18)] light:backdrop-blur-md">
          {usageLabel}
        </div>
      ) : null}

      {/* ===== Layer 6: Content — sits on top of everything, left-aligned ===== */}
      <div className="relative z-20 flex h-full w-full items-center px-6 sm:px-8 md:px-10 lg:px-12 py-8 sm:py-10">
        <div className="flex w-full max-w-[420px] lg:max-w-[440px] flex-col items-start text-left">
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
          <h2 className="italic text-[19px] sm:text-[22px] md:text-[25px] lg:text-[28px] leading-[1.35] tracking-wide text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] line-clamp-3 text-balance light:text-[#201A15] light:drop-shadow-none">
            {quote}
          </h2>

          {/* Premium branding */}
          <div className="mt-3 flex items-center gap-1.5 opacity-85">
            <Image
              src="/logo/white-logo-1.png"
              alt="MyInspireTag"
              width={16}
              height={16}
              className="h-4 w-4 rounded-full object-contain"
            />
            <span className="text-[11px] font-semibold tracking-[0.08em] text-white/80 light:text-[#6F5D46]">
              MyInspireTag
            </span>
          </div>

          {/* Category pill */}
          {category?.name ? (
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/90 backdrop-blur-md light:border-[#E9DFC9]/80 light:bg-white/80 light:text-[#4A3B2C] light:shadow-[0_4px_14px_-6px_rgba(120,85,30,0.14)] light:backdrop-blur-md">
              <Sparkles size={11} className="w-2.5 h-2.5 text-accent" />
              {category.name}
            </span>
          ) : null}

          {/* Actions */}
          <div className="mt-5 flex items-center justify-start gap-3 sm:gap-4">
            {quoteId ? (
              <FavoriteButton
                id={quoteId}
                type="quote"
                onToggle={(res) => onFavoriteChange && onFavoriteChange(res)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-md transition-all duration-300 hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgb(0_0_0/0.4)] active:scale-95 light:border-[#E9DFC9]/80 light:bg-white/72 light:text-[#6F5D46] light:shadow-[0_4px_16px_-8px_rgba(120,85,30,0.22)] light:backdrop-blur-[12px] light:hover:bg-white/85 light:hover:-translate-y-0.5 light:hover:shadow-[0_8px_24px_-10px_rgba(120,85,30,0.3)]"
              />
            ) : (
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/60 light:border-[#E9DFC9]/80 light:bg-white/72 light:text-[#A08A6A]">
                <Heart size={16} className="w-4 h-4" />
              </span>
            )}

            <button
              onClick={onShare}
              aria-label="Share quote"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/90 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary hover:shadow-[0_8px_24px_-6px_rgba(168,85,247,0.4)] active:scale-95 light:border-[#E9DFC9]/80 light:bg-white/72 light:text-[#6F5D46] light:shadow-[0_4px_16px_-8px_rgba(120,85,30,0.22)] light:backdrop-blur-[12px] light:hover:bg-white/85 light:hover:-translate-y-0.5 light:hover:shadow-[0_8px_24px_-10px_rgba(120,85,30,0.3)]"
            >
              <Share2 size={16} className="w-4 h-4" />
            </button>

            <button
              onClick={onReadAgain}
              aria-label="Read again"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/90 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent hover:shadow-[0_8px_24px_-6px_rgba(253,182,92,0.4)] active:scale-95 light:border-[#E9DFC9]/80 light:bg-white/72 light:text-[#6F5D46] light:shadow-[0_4px_16px_-8px_rgba(120,85,30,0.22)] light:backdrop-blur-[12px] light:hover:bg-white/85 light:hover:-translate-y-0.5 light:hover:shadow-[0_8px_24px_-10px_rgba(120,85,30,0.3)]"
            >
              <BookOpen size={16} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}