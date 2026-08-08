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
      label: 'Saved Quotes',
      value: savedCount,
      icon: Heart,
      href: '/new-dashboard/user/favorites',
    },
    {
      id: 'recent',
      label: 'Recent Quotes',
      value: recentCount,
      icon: Clock,
      href: '/new-dashboard/user/my-quotes',
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
            className="group flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-2xl bg-card border border-border shadow-sm cursor-pointer transition-all duration-200 hover:border-accent/25 hover:shadow-md"
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
