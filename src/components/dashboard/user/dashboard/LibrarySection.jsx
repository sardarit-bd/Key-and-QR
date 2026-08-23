'use client';

import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { Heart, Clock, ArrowRight } from 'lucide-react';

export default function LibrarySection({
  savedCount = 0,
  recentCount = 0,
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const cards = [
    {
      id: 'saved',
      label: 'Saved Collection',
      value: savedCount,
      icon: Heart,
      href: '/new-dashboard/user/favorites',
    },
    {
      id: 'history',
      label: 'Scan History',
      value: recentCount,
      icon: Clock,
      href: '/new-dashboard/user/scan-history',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.button
            key={card.id}
            onClick={() => router.push(card.href)}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: index * 0.07,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={reduceMotion ? undefined : { y: -2 }}
            className="group flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-2xl bg-white/75 dark:bg-slate-900/50 backdrop-blur-md dark:backdrop-blur-lg border border-white/80 dark:border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_30px_rgba(0,0,0,0.22)] cursor-pointer transition-all duration-200 hover:bg-white/90 dark:hover:bg-slate-900/65 hover:border-accent/40 dark:hover:border-white/20 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_8px_28px_-6px_rgba(0,0,0,0.08)] dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_12px_36px_rgba(0,0,0,0.32)]"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 min-w-0">
              <span className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-background-secondary flex-shrink-0">
                <Icon size={20} className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 text-accent" />
              </span>
              <div className="text-left min-w-0">
                <p className="text-[22px] sm:text-[26px] md:text-[28px] leading-none font-semibold tracking-tight text-foreground tabular-nums truncate">
                  {card.value}
                </p>
                <p className="text-[11px] sm:text-[12px] md:text-[13px] text-foreground-tertiary mt-0.5 sm:mt-1 truncate">
                  {card.label}
                </p>
              </div>
            </div>
            <ArrowRight
              size={16}
              className="text-foreground-tertiary flex-shrink-0 hidden sm:block opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
            />
          </motion.button>
        );
      })}
    </div>
  );
}
