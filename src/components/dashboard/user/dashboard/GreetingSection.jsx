'use client';

import Image from 'next/image';
import { Crown, Sparkles, Shell } from 'lucide-react';

/**
 * Greeting hero — client-approved:
 * time-based greeting, welcome text, Premium badge.
 * Premium image-based background with layered overlays for readability.
 */
export default function GreetingSection({ greeting, user, subscription }) {
  const name = greeting?.name || user?.name || 'there';
  const timeGreeting = greeting?.text || 'Welcome';
  const isPremium = !!subscription?.isPremium || subscription?.plan === 'subscriber';

  return (
    <section className="relative flex h-full w-full items-center overflow-hidden rounded-[26px] border border-white/8 bg-card px-6 sm:px-9 md:px-12 py-8 sm:py-10 lg:py-12 shadow-[0_20px_50px_-16px_rgb(0_0_0/0.55)] light:border-[#E8DFCE]/80 light:bg-[#FBF7EF]/55 light:shadow-[0_30px_70px_-24px_rgba(100,72,24,0.32),0_16px_40px_-20px_rgba(100,72,24,0.16),0_0_40px_-12px_rgba(198,146,45,0.14)] light:backdrop-blur-[2px]">
      {/* ===== Premium image background ===== */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/images/dashboard/greeting-bg.png"
          alt="Greeting Background"
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 45vw"
          className="object-cover object-center"
        />
      </div>

      {/* ===== Layered overlays for readability ===== */}
      <div className="pointer-events-none absolute inset-0">
        {/* Base dark overlay */}
        <div className="absolute inset-0 bg-black/10" />

        {/* Strong left gradient — keeps the greeting text readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/10 to-transparent" />

        {/* Soft bottom vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

        {/* Subtle golden ambient glow — top-left */}
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

        {/* Soft purple glow — bottom-right */}
        <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />

        {/* Thin white top highlight border */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* ===== Light-mode premium layered treatment ===== */}
      <div className="pointer-events-none absolute inset-0 hidden light:block">
        {/* L1 — Soft warm tint — keeps the image clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FDFBF6]/45 via-[#F8F2E7]/28 to-[#F5EDDE]/15" />

        {/* L2 — Left-to-right warm gradient — soft blend into the card from the left */}
        {/* <div className="absolute inset-0 bg-gradient-to-r from-[#F5ECDC]/42 via-[#EFE2CB]/18 to-[#EBDCC0]/4" /> */}

        {/* L3 — Slightly dark gradient behind the text only — guarantees contrast */}
        {/* <div className="absolute inset-0 bg-gradient-to-r from-[#241A0E]/55 via-[#241A0E]/24 to-transparent" /> */}

        {/* L4 — Soft gold glow — top-left */}
        <div className="absolute -left-28 -top-28 h-[420px] w-[420px] rounded-full bg-[#C6922D]/14 blur-3xl" />

        {/* L5 — Very subtle purple glow — bottom-right */}
        {/* <div className="absolute -bottom-32 -right-24 h-[460px] w-[460px] rounded-full bg-[#8B6BC8]/10 blur-3xl" /> */}

        {/* L6 — Top highlight — crisp premium edge */}
        {/* <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" /> */}
      </div>

      {/* ===== Premium decorative accent — floating golden particles ===== */}


      {/* ===== Content ===== */}
      <div className="relative z-10 flex w-full flex-col items-start justify-center">
        {/* Small premium eyebrow */}
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-accent/25 bg-accent/10 shadow-[0_0_16px_rgba(253,182,92,0.12)]">
            <Sparkles size={13} className="text-accent" fill="currentColor" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
            Daily Inspiration
          </span>
        </div>

        {/* Greeting */}
        <h1 className="text-[28px] sm:text-[34px] md:text-[40px] lg:text-[40px] leading-[1.12] tracking-tight text-foreground">
          {timeGreeting},
          <br />
          {name}!
        </h1>

        {/* Welcome text */}
        <p className="mt-2.5 sm:mt-3 text-[14px] sm:text-[15px] md:text-[16px] font-normal tracking-wide">
          Welcome back to your inspiration journey.
        </p>

        {/* Premium Plan badge */}
        {isPremium ? (
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-gradient-to-r from-accent/15 to-accent/5 px-4 py-1.5 text-[12px] font-semibold tracking-wide text-accent shadow-[0_0_24px_rgba(253,182,92,0.15)] backdrop-blur-sm">
            <Crown size={13} className="w-3.5 h-3.5" />
            Premium Plan
          </div>
        ) : null}
      </div>
    </section>
  );
}
