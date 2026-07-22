'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEFAULT_IMAGES = {
  love: '/images/quote-bg/love.jpg',
  strength: '/images/quote-bg/strength.jpg',
  healing: '/images/quote-bg/healing.jpg',
  faith: '/images/quote-bg/faith.jpg',
  gratitude: '/images/quote-bg/gratitude.jpg',
};

/**
 * Premium Quote Display
 */
export default function PremiumQuoteDisplay({
  quote,
  loading,
  isPremium,
  onLoadNew,
}) {
  const category = quote?.category || 'love';
  const backgroundImage = quote?.image?.url || DEFAULT_IMAGES[category] || DEFAULT_IMAGES.love;

  if (loading) {
    return (
      <div className="bg-[#121526] border border-white/5 rounded-2xl p-8 animate-pulse">
        <div className="h-6 w-24 bg-gray-800/50 rounded-lg mx-auto mb-6" />
        <div className="space-y-4 text-center">
          <div className="h-8 w-3/4 bg-gray-800/50 rounded-lg mx-auto" />
          <div className="h-8 w-1/2 bg-gray-800/50 rounded-lg mx-auto" />
          <div className="h-8 w-2/3 bg-gray-800/50 rounded-lg mx-auto" />
        </div>
        <div className="mt-6 h-5 w-32 bg-gray-800/50 rounded-lg mx-auto" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="bg-[#121526] border border-white/5 rounded-2xl p-8 text-center">
        <p className="text-gray-400">No quote available</p>
        {isPremium && (
          <Button
            onClick={onLoadNew}
            className="mt-4 bg-violet-600 hover:bg-violet-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Load Quote
          </Button>
        )}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={quote._id || 'quote'}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl bg-[#121526] border border-white/5"
      >
        {/* Background Image */}
        <div
          className="relative min-h-[300px] bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />

          {/* Premium Badge Overlay */}
          {isPremium && (
            <div className="absolute top-4 right-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/90 text-black text-xs font-semibold rounded-full shadow-lg">
                <Crown className="w-3.5 h-3.5" />
                Premium
              </span>
            </div>
          )}

          {/* Quote Content */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-[300px] px-6 py-12 text-center">
            {/* Category */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs sm:text-sm tracking-widest text-amber-400/80 font-light uppercase"
            >
              {quote.category || 'Inspiration'}
            </motion.p>

            {/* Quote */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-2xl sm:text-3xl text-white font-serif font-light leading-relaxed max-w-2xl"
            >
              “{quote.text}”
            </motion.h1>

            {/* Author */}
            {quote.author && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-sm sm:text-base text-amber-300/60 font-serif"
              >
                — {quote.author} —
              </motion.p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 py-4 bg-gray-900/95 border-t border-gray-800">
          <Button
            onClick={onLoadNew}
            disabled={!isPremium}
            className={isPremium 
              ? 'bg-violet-600 hover:bg-violet-700 text-white' 
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {isPremium ? 'New Quote' : 'Premium Feature'}
          </Button>

          {!isPremium && (
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <Lock className="w-3 h-3" />
              Upgrade to unlock
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}