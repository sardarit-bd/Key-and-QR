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
      bgTint: 'bg-white/80 dark:bg-slate-900/60',
      borderColor: 'border-border/80',
      iconBg: `${customColor}15`,
      borderHover: 'hover:border-primary/50',
      pillBg: 'bg-muted text-foreground-secondary',
      arrowBg: 'group-hover:bg-primary group-hover:text-white',
    };
  }

  switch (s) {
    case 'love':
      return {
        accentColor: '#e11d48',
        bgTint: 'bg-gradient-to-b from-rose-50/70 to-white/90 dark:from-rose-950/20 dark:to-slate-900/60',
        borderColor: 'border-rose-100/90 dark:border-rose-900/30',
        iconBg: 'rgba(225, 29, 72, 0.12)',
        borderHover: 'hover:border-rose-300 dark:hover:border-rose-700',
        pillBg: 'bg-rose-100/70 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
        arrowBg: 'group-hover:bg-rose-500 group-hover:text-white',
      };
    case 'motivation':
    case 'strength':
      return {
        accentColor: '#ea580c',
        bgTint: 'bg-gradient-to-b from-orange-50/70 to-white/90 dark:from-orange-950/20 dark:to-slate-900/60',
        borderColor: 'border-orange-100/90 dark:border-orange-900/30',
        iconBg: 'rgba(234, 88, 12, 0.12)',
        borderHover: 'hover:border-orange-300 dark:hover:border-orange-700',
        pillBg: 'bg-orange-100/70 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300',
        arrowBg: 'group-hover:bg-orange-500 group-hover:text-white',
      };
    case 'inspire':
    case 'inspiration':
    case 'wisdom':
    case 'mindfulness':
      return {
        accentColor: '#9333ea',
        bgTint: 'bg-gradient-to-b from-purple-50/70 to-white/90 dark:from-purple-950/20 dark:to-slate-900/60',
        borderColor: 'border-purple-100/90 dark:border-purple-900/30',
        iconBg: 'rgba(147, 51, 234, 0.12)',
        borderHover: 'hover:border-purple-300 dark:hover:border-purple-700',
        pillBg: 'bg-purple-100/70 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
        arrowBg: 'group-hover:bg-purple-600 group-hover:text-white',
      };
    case 'test':
      return {
        accentColor: '#d97706',
        bgTint: 'bg-gradient-to-b from-amber-50/70 to-white/90 dark:from-amber-950/20 dark:to-slate-900/60',
        borderColor: 'border-amber-100/90 dark:border-amber-900/30',
        iconBg: 'rgba(217, 119, 6, 0.12)',
        borderHover: 'hover:border-amber-300 dark:hover:border-amber-700',
        pillBg: 'bg-amber-100/70 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        arrowBg: 'group-hover:bg-amber-600 group-hover:text-white',
      };
    case 'hope':
    case 'healing':
      return {
        accentColor: '#0d9488',
        bgTint: 'bg-gradient-to-b from-teal-50/70 to-white/90 dark:from-teal-950/20 dark:to-slate-900/60',
        borderColor: 'border-teal-100/90 dark:border-teal-900/30',
        iconBg: 'rgba(13, 148, 136, 0.12)',
        borderHover: 'hover:border-teal-300 dark:hover:border-teal-700',
        pillBg: 'bg-teal-100/70 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300',
        arrowBg: 'group-hover:bg-teal-600 group-hover:text-white',
      };
    default:
      return {
        accentColor: '#6366f1',
        bgTint: 'bg-gradient-to-b from-indigo-50/50 to-white/90 dark:from-indigo-950/20 dark:to-slate-900/60',
        borderColor: 'border-indigo-100/80 dark:border-indigo-900/30',
        iconBg: 'rgba(99, 102, 241, 0.12)',
        borderHover: 'hover:border-indigo-300 dark:hover:border-indigo-700',
        pillBg: 'bg-indigo-100/70 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
        arrowBg: 'group-hover:bg-indigo-600 group-hover:text-white',
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
      className={`group relative flex flex-col justify-between min-h-[100px] sm:min-h-[100px] rounded-3xl border ${theme.borderColor} ${theme.bgTint} ${theme.borderHover} backdrop-blur-md p-5 sm:p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30 overflow-hidden cursor-pointer`}
    >
      {/* Background glow accent */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 sm:h-32 sm:w-32 rounded-full blur-2xl opacity-15 group-hover:opacity-30 transition-opacity duration-300"
        style={{ backgroundColor: theme.accentColor }}
      />

      <div className="space-y-4">
        {/* Top Area: Large category icon & small quote-count pill */}
        <div className="flex items-center justify-between gap-2">


          {quoteCount !== null && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold tracking-tight whitespace-nowrap shadow-2xs ${theme.pillBg}`}>
              {quoteCount} {quoteCount === 1 ? 'Quote' : 'Quotes'}
            </span>
          )}
        </div>

        {/* Main Area: Category Name & Short Description */}
        <div className="flex justify-center items-center gap-10">

          <div
            className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
            style={{
              // backgroundColor: theme.iconBg,
              color: theme.accentColor,
            }}
          >
            {category?.iconUrl ? (
              <img src={category.iconUrl} alt={label} className="h-10 w-10 sm:h-10 sm:w-10 object-contain" />
            ) : (
              <IconComponent className="h-10 w-10 sm:h-10 sm:w-10" strokeWidth={2.2} />
            )}
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
            {label}
          </h3>
          {/* <p className="mt-2 line-clamp-2 text-xs sm:text-sm text-foreground-secondary leading-relaxed">
            {category?.description || `Explore meaningful ${label.toLowerCase()} inspiration and empowering daily wisdom.`}
          </p> */}
        </div>
      </div>

      {/* Bottom Area: Divider + Explore Quotes + Right Arrow */}
      <div className="mt-6 pt-3.5 border-t border-border/60 flex items-center justify-between">
        <span className="text-xs sm:text-sm font-semibold text-foreground-secondary group-hover:text-foreground transition-colors">
          Explore Quotes
        </span>
        <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-muted/80 text-foreground-secondary ${theme.arrowBg} transition-all duration-200 shadow-2xs`}>
          <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
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

