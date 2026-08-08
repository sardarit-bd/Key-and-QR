'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Crown } from 'lucide-react';

/**
 * Clean editorial greeting — lightweight, premium, no card wrapper.
 * The quote is the hero; this sets the tone without competing.
 */
export default function GreetingSection({ greeting, user, subscription }) {
  const reduceMotion = useReducedMotion();
  const name = greeting?.name || user?.name || 'there';
  const timeGreeting = greeting?.text || 'Welcome';
  const isPremium = !!subscription?.isPremium || subscription?.plan === 'subscriber';

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      <motion.h1 className="text-[28px] sm:text-[32px] md:text-[36px] lg:text-[40px] leading-[1.1] tracking-tight text-foreground font-medium">
        {timeGreeting}, {name}
        {isPremium && (
          <span className="inline-flex items-center align-middle ml-3 -mt-1">
            <Crown size={18} className="text-accent" fill="currentColor" />
          </span>
        )}
      </motion.h1>

      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="mt-2 text-[14px] sm:text-[15px] md:text-[16px] text-foreground-secondary"
      >
        Welcome back to your inspiration journey.
      </motion.p>
    </motion.section>
  );
}
