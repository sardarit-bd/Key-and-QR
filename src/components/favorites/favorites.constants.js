// Premium Favorites card design constants.
// Reuses the same card surface, action icon, and category chip DNA
// from the My Quotes / Scan History / Overview pages.

export const FAVORITE_CARD_SURFACE =
  'rounded-2xl bg-card border border-white/6 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)] ' +
  'light:border-[#E8DFCE]/80 light:bg-[#FBF7EF]/55 light:shadow-[0_20px_50px_-20px_rgba(100,72,24,0.28),0_10px_30px_-18px_rgba(100,72,24,0.16)]';

export const FAVORITE_HOVER =
  'hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_24px_48px_-16px_rgb(0_0_0/0.55)]';

export const ACTION_ICON_CLASS =
  'h-8 w-8 cursor-pointer rounded-full bg-white/10 text-white/90 backdrop-blur-md transition-all duration-300 ' +
  'hover:-translate-y-0.5 hover:bg-white/15 hover:text-white active:scale-95 ' +
  'dark:hover:bg-white/10 dark:hover:text-white ' +
  'light:bg-white/72 light:text-[#6F5D46] light:backdrop-blur-[12px] ' +
  'light:shadow-[0_4px_16px_-8px_rgba(120,85,30,0.22)] ' +
  'light:hover:bg-white/85 light:hover:text-[#4A3C2D] light:hover:shadow-[0_8px_24px_-10px_rgba(120,85,30,0.3)]';

export const CATEGORY_CHIPS = {
  love: { border: 'border-rose-500/35', bg: 'bg-rose-500/20', text: 'text-rose-300 dark:text-rose-200', lightText: 'light:text-rose-800', glow: 'shadow-[0_0_16px_-4px_rgba(251,113,133,0.4)]' },
  strength: { border: 'border-orange-500/35', bg: 'bg-orange-500/20', text: 'text-orange-300 dark:text-orange-200', lightText: 'light:text-orange-800', glow: 'shadow-[0_0_16px_-4px_rgba(251,146,60,0.4)]' },
  healing: { border: 'border-emerald-500/35', bg: 'bg-emerald-500/20', text: 'text-emerald-300 dark:text-emerald-200', lightText: 'light:text-emerald-800', glow: 'shadow-[0_0_16px_-4px_rgba(52,211,153,0.4)]' },
  faith: { border: 'border-amber-500/35', bg: 'bg-amber-500/20', text: 'text-amber-300 dark:text-amber-200', lightText: 'light:text-amber-800', glow: 'shadow-[0_0_16px_-4px_rgba(251,191,36,0.4)]' },
  gratitude: { border: 'border-yellow-500/35', bg: 'bg-yellow-500/20', text: 'text-yellow-300 dark:text-yellow-200', lightText: 'light:text-yellow-800', glow: 'shadow-[0_0_16px_-4px_rgba(250,204,21,0.4)]' },
};

export const CATEGORY_LABELS = {
  love: 'Love', strength: 'Strength', healing: 'Healing', faith: 'Faith', gratitude: 'Gratitude',
};

export const DEFAULT_IMAGES = {
  love: '/images/quote-bg/love.jpg', strength: '/images/quote-bg/strength.jpg',
  healing: '/images/quote-bg/healing.jpg', faith: '/images/quote-bg/faith.jpg',
  gratitude: '/images/quote-bg/gratitude.jpg', motivation: '/images/quote-bg/strength.jpg',
};
