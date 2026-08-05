'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function WelcomeCard({ userName = 'there', onReceive, isReceiving }) {
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };

  const item = {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };
  return (
    <section className="relative h-full min-h-[220px] sm:min-h-[240px] lg:min-h-[280px] w-full overflow-hidden rounded-[26px] border border-white/10 bg-card shadow-[0_20px_50px_-16px_rgb(0_0_0/0.55)]">
      {/* Ambient background */}
      <div className="absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-background-secondary/80 via-background to-background-tertiary/30" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Content */}
      <motion.div
        variants={container}
        initial={reduceMotion ? false : 'hidden'}
        animate="show"
        className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-8 md:px-10 py-6 sm:py-8"
      >
        <motion.div variants={item} className="max-w-[400px]">
          <div className="relative mb-4 inline-flex">
            <div className="absolute -inset-2 rounded-full bg-accent/20 blur-md" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 shadow-[0_0_20px_rgba(253,182,92,0.15)]">
              <Sparkles size={18} className="text-accent" />
            </div>
          </div>

          <motion.h2
            variants={item}
            className="text-[22px] sm:text-[26px] md:text-[30px] lg:text-[34px] leading-[1.2] tracking-tight text-foreground"
          >
            Welcome{userName && userName !== 'there' ? `, ${userName}` : ''} ✨
          </motion.h2>

          <motion.p
            variants={item}
            className="mt-3 text-[13px] sm:text-[14px] md:text-[15px] leading-6 text-foreground-secondary max-w-[340px]"
          >
            Your inspiration journey begins here. Receive your first
            message and let today&apos;s words speak to your heart.
          </motion.p>

          <motion.button
            variants={item}
            onClick={onReceive}
            disabled={isReceiving}
            className="group mt-5 sm:mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent/85 px-5 py-2.5 text-[13px] font-semibold text-accent-foreground shadow-[0_8px_24px_-8px_rgba(253,182,92,0.5)] transition-all duration-300 hover:shadow-[0_12px_32px_-8px_rgba(253,182,92,0.6)] hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <Sparkles size={14} className="w-4 h-4" />
            {isReceiving ? 'Finding your message...' : 'Receive Your First Quote'}
            {!isReceiving && (
              <ArrowRight size={14} className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}
