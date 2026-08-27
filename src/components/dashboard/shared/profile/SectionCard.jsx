'use client';

import { motion } from 'framer-motion';

/**
 * SectionCard — premium glass section wrapper used across the profile page.
 * Matches the Overview dashboard card DNA: warm ivory glass in light mode,
 * navy glass in dark, soft shadows, hairline top highlight.
 */
export default function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  action,
  className = '',
  delay = 0,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay }}
      className={`relative overflow-hidden rounded-[22px] border border-white/6 bg-card p-5 sm:p-6 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)] light:border-[#E8DFCE]/80 light:bg-[#FBF7EF]/55 light:shadow-[0_20px_50px_-20px_rgba(100,72,24,0.28),0_10px_30px_-18px_rgba(100,72,24,0.16)] ${className}`}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-accent/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-primary/[0.05] blur-3xl" />
      {/* Hairline top highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent light:via-[#E8DFCE]/70" />

      <div className="relative z-10">
        {(title || action) && (
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {Icon && (
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-accent/10 shadow-[0_0_16px_rgba(253,182,92,0.12)]">
                  <Icon size={14} className="text-accent" />
                </span>
              )}
              <div>
                <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
                  {title}
                </h2>
                {description && (
                  <p className="mt-0.5 text-[12px] text-foreground-tertiary">
                    {description}
                  </p>
                )}
              </div>
            </div>
            {action}
          </div>
        )}
        {children}
      </div>
    </motion.section>
  );
}
