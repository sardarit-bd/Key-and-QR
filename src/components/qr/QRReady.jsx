'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Heart, Share2, Compass, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const DEFAULT_IMAGES = {
  faith: '/images/quote-bg/faith.jpg',
  love: '/images/quote-bg/love.jpg',
  hope: '/images/quote-bg/healing.jpg',
  success: '/images/quote-bg/success.jpg',
  motivation: '/images/quote-bg/strength.jpg',
  personal: '/images/quote-bg/peace.jpg',
};

const CATEGORY_LABELS = {
  faith: 'Faith ☾',
  love: 'Love ♥',
  hope: 'Healing ✦',
  success: 'Success ☆',
  motivation: 'Strength ◐',
  personal: 'Personal ♥',
};

/**
 * QR Ready Component
 * Displays the quote with beautiful UI and actions
 */
export default function QRReady({
  data,
  isFavorite,
  onToggleFavorite,
  isAuthenticated,
  tagCode,
  user,
}) {
  const router = useRouter();
  const [showPersonalMessage, setShowPersonalMessage] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const quote = data?.quote || null;
  const hasPersonalMessage = data?.hasPersonalMessage || false;
  const personalMessage = data?.personalMessage || null;
  
  const category = quote?.category || 'faith';
  const backgroundImage = quote?.image?.url || DEFAULT_IMAGES[category] || DEFAULT_IMAGES.faith;
  const categoryLabel = CATEGORY_LABELS[category] || CATEGORY_LABELS.faith;

  /**
   * Handle share
   */
  const handleShare = async () => {
    const shareText = `"${quote?.text || ''}" — ${quote?.author || 'InspireTag'}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'InspireTag Quote',
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  /**
   * Handle copy
   */
  const handleCopy = () => {
    const text = `"${quote?.text || ''}" — ${quote?.author || 'InspireTag'}`;
    navigator.clipboard?.writeText(text);
    toast.success('Quote copied to clipboard!');
  };

  /**
   * Handle favorite toggle
   */
  const handleFavoriteToggle = async () => {
    if (favoriteLoading) return;
    
    if (!isAuthenticated) {
      router.push(`/login?redirect=/tag/${tagCode}`);
      return;
    }

    setFavoriteLoading(true);
    const success = await onToggleFavorite();
    setFavoriteLoading(false);
    
    if (success) {
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    }
  };

  /**
   * Handle discover more
   */
  const handleDiscoverMore = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/tag/${tagCode}`);
      return;
    }
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-gray-900 border border-gray-800"
      >
        {/* Background Image with Overlay */}
        <div
          className="relative min-h-[400px] sm:min-h-[500px] bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          {/* Dark overlays for readability */}
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-[400px] sm:min-h-[500px] px-6 py-12 text-center">
            {/* Category */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs sm:text-sm tracking-widest text-amber-400/80 font-light uppercase"
            >
              {categoryLabel}
            </motion.p>

            {/* Quote */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-2xl sm:text-3xl md:text-4xl text-white font-serif font-light leading-relaxed max-w-2xl"
            >
              “{quote?.text || ''}”
            </motion.h1>

            {/* Author */}
            {quote?.author && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-sm sm:text-base text-amber-300/60 font-serif"
              >
                — {quote.author} —
              </motion.p>
            )}

            {/* Personal Message Gift Icon */}
            {hasPersonalMessage && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                onClick={() => setShowPersonalMessage(true)}
                className="mt-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                aria-label="View personal message"
              >
                <Gift className="w-5 h-5 text-amber-400" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-6 py-4 bg-gray-900/95 border-t border-gray-800"
        >
          {/* Share */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors group"
            aria-label="Share quote"
          >
            <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px]">Share</span>
          </button>

          {/* Save/Favorite */}
          <button
            onClick={handleFavoriteToggle}
            disabled={favoriteLoading}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors group disabled:opacity-50"
            aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart
              className={`w-5 h-5 group-hover:scale-110 transition-transform ${
                isFavorite ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
            <span className="text-[10px]">{isFavorite ? 'Saved' : 'Save'}</span>
          </button>

          {/* Discover More */}
          <button
            onClick={handleDiscoverMore}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors group"
            aria-label="Discover more quotes"
          >
            <Compass className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px]">Discover</span>
          </button>
        </motion.div>
      </motion.div>

      {/* Personal Message Modal */}
      {showPersonalMessage && personalMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowPersonalMessage(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={() => setShowPersonalMessage(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close personal message"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Gift Icon */}
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-amber-500/10 rounded-full">
                <Gift className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-white text-center font-serif">
              Personal Message
            </h2>

            {/* Message */}
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-gray-200 text-center italic leading-relaxed">
                “{personalMessage}”
              </p>
            </div>

            {/* Footer */}
            <p className="mt-4 text-xs text-gray-500 text-center">
              A special message for you 💝
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}