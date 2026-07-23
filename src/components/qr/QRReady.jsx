'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Compass } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import FavoriteButton from '@/components/favorite/FavoriteButton';
import GiftMessageButton from '@/components/gift-message/GiftMessageButton';
import useFavorite from '@/hooks/useFavorite';

const DEFAULT_IMAGES = {
  love: '/images/quote-bg/love.jpg',
  strength: '/images/quote-bg/strength.jpg',
  healing: '/images/quote-bg/healing.jpg',
  faith: '/images/quote-bg/faith.jpg',
  gratitude: '/images/quote-bg/gratitude.jpg',
  personal: '/images/quote-bg/peace.jpg',
};

const CATEGORY_LABELS = {
  love: 'Love ♥',
  strength: 'Strength ◐',
  healing: 'Healing ✦',
  faith: 'Faith ☾',
  gratitude: 'Gratitude ☀',
  motivation: 'Strength ◐',
  personal: 'Personal ♥',
};

/**
 * QR Ready Component
 * Displays the quote with beautiful UI and actions
 */
export default function QRReady({
  data,
  isAuthenticated,
  tagCode,
  user,
}) {
  const router = useRouter();
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

  const quote = data?.quote || null;
  const hasPersonalMessage = data?.hasPersonalMessage || false;
  const personalMessage = data?.personalMessage || null;
  
  const category = quote?.category || 'faith';
  const backgroundImage = quote?.image?.url || DEFAULT_IMAGES[category] || DEFAULT_IMAGES.faith;
  const categoryLabel = CATEGORY_LABELS[category] || CATEGORY_LABELS.faith;

  // Use favorite hook for the quote
  const { isFavorite } = useFavorite({
    id: quote?._id,
    type: 'quote',
    onSuccess: ({ action }) => {
      toast.success(action === 'add' ? 'Added to favorites!' : 'Removed from favorites');
    },
    onError: (error) => {
      if (error?.status === 401) {
        router.push(`/login?redirect=/tag/${tagCode}`);
      }
    },
  });

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
   * Handle discover more
   */
  const handleDiscoverMore = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/tag/${tagCode}`);
      return;
    }
    router.push('/dashboard/my-quotes');
  };

  /**
   * Handle gift message open
   */
  const handleGiftOpen = () => {
    setIsGiftModalOpen(true);
  };

  /**
   * Handle gift message close
   */
  const handleGiftClose = () => {
    setIsGiftModalOpen(false);
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

            {/* Gift Message Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-6"
            >
              <GiftMessageButton
                tagCode={tagCode}
                hasPersonalMessage={hasPersonalMessage}
                personalMessage={personalMessage}
                size="default"
              />
            </motion.div>
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
          <div className="flex flex-col items-center gap-1">
            <FavoriteButton
              id={quote?._id}
              type="quote"
              size="default"
              variant="ghost"
              className="w-8 h-8 p-0 text-gray-400 hover:text-white"
              onToggle={({ action }) => {
                toast.success(action === 'add' ? 'Added to favorites!' : 'Removed from favorites');
              }}
            />
            <span className="text-[10px] text-gray-400">{isFavorite ? 'Saved' : 'Save'}</span>
          </div>

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
    </div>
  );
}