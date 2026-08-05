'use client';

// ============================================================
// Shared design constants for My Quote cards.
// Category chip themes/labels/images now come from the centralized
// @/components/category layer (see MyQuoteCard.jsx) — no per-slug
// constants live here anymore.
// ============================================================

// Overview / Scan History card surface — exact same base recipe.
export const CARD_SURFACE =
  'rounded-2xl bg-card border border-white/6 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)] ' +
  'light:border-[#E8DFCE]/80 light:bg-[#FBF7EF]/55 light:shadow-[0_20px_50px_-20px_rgba(100,72,24,0.28),0_10px_30px_-18px_rgba(100,72,24,0.16)]';

// Hover elevation — soft lift, never aggressive scaling.
export const HOVER_ELEVATION =
  'hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_24px_48px_-16px_rgb(0_0_0/0.55)]';

// Action icon buttons (favorite / share / menu) — Overview hover language.
export const ACTION_ICON_CLASS =
  'h-8 w-8 cursor-pointer rounded-full bg-white/10 text-white/90 backdrop-blur-md transition-all duration-300 ' +
  'hover:-translate-y-0.5 hover:bg-white/15 hover:text-white active:scale-95 ' +
  'dark:hover:bg-white/10 dark:hover:text-white ' +
  'light:bg-white/72 light:text-[#6F5D46] light:backdrop-blur-[12px] ' +
  'light:shadow-[0_4px_16px_-8px_rgba(120,85,30,0.22)] ' +
  'light:hover:bg-white/85 light:hover:text-[#4A3C2D] light:hover:shadow-[0_8px_24px_-10px_rgba(120,85,30,0.3)]';
