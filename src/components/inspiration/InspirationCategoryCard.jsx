'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getCategoryIcon, getCategoryLabel } from '@/components/category';

function getCategoryTheme(slug, customColor) {
  const s = (slug || '').toLowerCase();
  
  if (customColor && customColor.startsWith('#')) {
    return {
      accentColor: customColor,
      bgTint: 'bg-card/75 dark:bg-slate-900/50',
      iconBg: `${customColor}18`,
      borderHover: 'hover:border-accent/40',
      pillBg: 'bg-muted/80 text-foreground-secondary',
    };
  }

  switch (s) {
    case 'love':
      return {
        accentColor: '#f43f5e',
        bgTint: 'bg-rose-500/[0.03] dark:bg-rose-950/[0.12]',
        iconBg: 'rgba(244, 63, 94, 0.12)',
        borderHover: 'hover:border-rose-500/40',
        pillBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
      };
    case 'motivation':
    case 'strength':
      return {
        accentColor: '#f97316',
        bgTint: 'bg-orange-500/[0.03] dark:bg-orange-950/[0.12]',
        iconBg: 'rgba(249, 115, 22, 0.12)',
        borderHover: 'hover:border-orange-500/40',
        pillBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-300',
      };
    case 'wisdom':
    case 'mindfulness':
      return {
        accentColor: '#a855f7',
        bgTint: 'bg-purple-500/[0.03] dark:bg-purple-950/[0.12]',
        iconBg: 'rgba(168, 85, 247, 0.12)',
        borderHover: 'hover:border-purple-500/40',
        pillBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-300',
      };
    case 'hope':
    case 'healing':
      return {
        accentColor: '#14b8a6',
        bgTint: 'bg-teal-500/[0.03] dark:bg-teal-950/[0.12]',
        iconBg: 'rgba(20, 184, 166, 0.12)',
        borderHover: 'hover:border-teal-500/40',
        pillBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-300',
      };
    case 'success':
      return {
        accentColor: '#eab308',
        bgTint: 'bg-amber-500/[0.03] dark:bg-amber-950/[0.12]',
        iconBg: 'rgba(234, 179, 8, 0.12)',
        borderHover: 'hover:border-amber-500/40',
        pillBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
      };
    case 'faith':
      return {
        accentColor: '#f59e0b',
        bgTint: 'bg-amber-500/[0.03] dark:bg-amber-950/[0.12]',
        iconBg: 'rgba(245, 158, 11, 0.12)',
        borderHover: 'hover:border-amber-500/40',
        pillBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
      };
    default:
      return {
        accentColor: '#6366f1',
        bgTint: 'bg-indigo-500/[0.03] dark:bg-indigo-950/[0.12]',
        iconBg: 'rgba(99, 102, 241, 0.12)',
        borderHover: 'hover:border-indigo-500/40',
        pillBg: 'bg-muted/80 text-foreground-secondary',
      };
  }
}

export default function InspirationCategoryCard({ category, index = 0 }) {
  const reduceMotion = useReducedMotion();
  const slug = category?.slug || category?.name?.toLowerCase() || '';
  const label = category?.name || getCategoryLabel(slug);
  const IconComponent = getCategoryIcon(slug);
  const quoteCount = typeof category?.quoteCount === 'number' ? category.quoteCount : null;
  const theme = getCategoryTheme(slug, category?.color);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: Math.min(index * 0.03, 0.25),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={!reduceMotion ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={`group relative flex flex-col justify-between rounded-2xl border border-border/80 ${theme.bgTint} ${theme.borderHover} backdrop-blur-md p-4 sm:p-5 md:p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40 overflow-hidden cursor-pointer`}
    >
      {/* Background glow accent */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 sm:h-32 sm:w-32 rounded-full blur-2xl opacity-15 group-hover:opacity-30 transition-opacity duration-300"
        style={{ backgroundColor: theme.accentColor }}
      />

      <div className="space-y-3 sm:space-y-4">
        {/* Top Area: Large category icon & small quote-count pill */}
        <div className="flex items-center justify-between gap-2">
          <div
            className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
            style={{
              backgroundColor: theme.iconBg,
              color: theme.accentColor,
            }}
          >
            {category?.iconUrl ? (
              <img src={category.iconUrl} alt={label} className="h-5 w-5 sm:h-6 sm:w-6 object-contain" />
            ) : (
              <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />
            )}
          </div>

          {quoteCount !== null && (
            <span className={`rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-medium tracking-tight whitespace-nowrap ${theme.pillBg}`}>
              {quoteCount} {quoteCount === 1 ? 'Quote' : 'Quotes'}
            </span>
          )}
        </div>

        {/* Main Area: Category Name & Short Description */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
            {label}
          </h3>
          <p className="mt-1 line-clamp-2 text-[11px] sm:text-xs md:text-sm text-foreground-tertiary leading-relaxed">
            {category?.description || `Explore meaningful ${label.toLowerCase()} inspiration and empowering daily wisdom.`}
          </p>
        </div>
      </div>

      {/* Bottom Area: Divider + Explore Quotes + Right Arrow */}
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-3.5 border-t border-border/60 flex items-center justify-between">
        <span className="text-[11px] sm:text-xs font-semibold text-foreground-secondary group-hover:text-foreground transition-colors">
          Explore Quotes
        </span>
        <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-muted/60 text-foreground-secondary group-hover:bg-accent group-hover:text-white transition-all duration-200">
          <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>
      </div>

      {/* Card clickable overlay link */}
      <Link
        href={`/inspiration/${slug}`}
        className="absolute inset-0 z-10"
        aria-label={`Explore ${label} quotes`}
      />
    </motion.div>
  );
}
