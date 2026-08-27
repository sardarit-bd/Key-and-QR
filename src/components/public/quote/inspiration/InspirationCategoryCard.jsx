'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getCategoryIcon, getCategoryLabel } from '@/components/public/quote/category';

function getCategoryTheme(slug, customColor) {
  const s = (slug || '').toLowerCase();

  if (customColor && customColor.startsWith('#')) {
    return {
      accentColor: customColor,
      iconBg: `${customColor}15`,
      pillBg: 'bg-muted text-foreground-secondary',
      arrowBg: 'group-hover:bg-primary group-hover:text-white',
    };
  }

  switch (s) {
    case 'love':
      return {
        accentColor: '#e11d48',
        iconBg: 'rgba(225, 29, 72, 0.12)',
        pillBg: 'bg-rose-100/70 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
        arrowBg: 'group-hover:bg-rose-500 group-hover:text-white',
      };
    case 'motivation':
    case 'strength':
      return {
        accentColor: '#ea580c',
        iconBg: 'rgba(234, 88, 12, 0.12)',
        pillBg: 'bg-orange-100/70 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300',
        arrowBg: 'group-hover:bg-orange-500 group-hover:text-white',
      };
    case 'inspire':
    case 'inspiration':
    case 'wisdom':
    case 'mindfulness':
      return {
        accentColor: '#9333ea',
        iconBg: 'rgba(147, 51, 234, 0.12)',
        pillBg: 'bg-purple-100/70 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
        arrowBg: 'group-hover:bg-purple-600 group-hover:text-white',
      };
    case 'test':
      return {
        accentColor: '#d97706',
        iconBg: 'rgba(217, 119, 6, 0.12)',
        pillBg: 'bg-amber-100/70 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        arrowBg: 'group-hover:bg-amber-600 group-hover:text-white',
      };
    case 'hope':
    case 'healing':
      return {
        accentColor: '#0d9488',
        iconBg: 'rgba(13, 148, 136, 0.12)',
        pillBg: 'bg-teal-100/70 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300',
        arrowBg: 'group-hover:bg-teal-600 group-hover:text-white',
      };
    default:
      return {
        accentColor: '#6366f1',
        iconBg: 'rgba(99, 102, 241, 0.12)',
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
      className="group relative flex flex-col justify-between w-full rounded-3xl border border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-900/50 backdrop-blur-md p-4.5 sm:p-5 md:p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:border-primary/40 dark:hover:border-primary/40 overflow-hidden cursor-pointer"
    >
      {/* Background soft ambient glow */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 sm:h-28 sm:w-28 rounded-full blur-2xl opacity-15 group-hover:opacity-30 transition-opacity duration-300"
        style={{ backgroundColor: theme.accentColor }}
      />

      <div className="space-y-4">
        {/* Top Header: Badge if quoteCount is available */}
        {quoteCount !== null && (
          <div className="flex items-center justify-end">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-tight whitespace-nowrap shadow-2xs ${theme.pillBg}`}>
              {quoteCount} {quoteCount === 1 ? 'Quote' : 'Quotes'}
            </span>
          </div>
        )}

        {/* Main Content Area: Perfectly Aligned Icon & Category Name */}
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div
            className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 shadow-2xs"
            style={{
              backgroundColor: theme.iconBg,
              color: theme.accentColor,
            }}
          >
            {category?.iconUrl ? (
              <img src={category.iconUrl} alt={label} className="h-6 w-6 sm:h-7 sm:w-7 object-contain" />
            ) : (
              <IconComponent className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.2} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-sans font-semibold text-base sm:text-lg text-foreground tracking-tight group-hover:text-primary transition-colors truncate">
              {label}
            </h3>
            {category?.description ? (
              <p className="mt-0.5 line-clamp-1 text-xs text-foreground-secondary">
                {category.description}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Bottom Area: Subtle Divider + Explore Quotes + Circular Arrow Button */}
      <div className="mt-5 pt-3.5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
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
