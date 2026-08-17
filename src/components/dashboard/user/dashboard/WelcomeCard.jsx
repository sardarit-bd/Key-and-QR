'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function WelcomeCard({ userName = 'there', onReceive, isReceiving }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full overflow-hidden rounded-2xl bg-white/75 dark:bg-slate-900/50 backdrop-blur-md dark:backdrop-blur-lg border border-white/80 dark:border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.22)]"
    >
      <div className="flex flex-col items-start p-6 sm:p-8 md:p-10 lg:p-12">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 mb-5">
          <Sparkles size={18} className="text-accent" />
        </span>

        <motion.h2
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-[24px] sm:text-[28px] md:text-[34px] lg:text-[40px] leading-[1.1] tracking-tight text-foreground font-medium"
        >
          Welcome{userName && userName !== 'there' ? `, ${userName}` : ''}
        </motion.h2>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-3 text-[14px] sm:text-[15px] leading-6 text-foreground-secondary max-w-[480px]"
        >
          Your inspiration journey begins here. Receive your first message
          and let today&apos;s words speak to your heart.
        </motion.p>

        <motion.button
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          onClick={onReceive}
          disabled={isReceiving}
          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-[13px] font-semibold text-accent-foreground transition-all duration-200 hover:brightness-105 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sparkles size={14} />
          {isReceiving ? 'Finding your message...' : 'Receive Your First Quote'}
        </motion.button>
      </div>
    </motion.section>
  );
}
