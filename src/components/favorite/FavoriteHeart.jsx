'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Animated Heart Component
 * Beautiful heart with scale and burst effects
 */
export default function FavoriteHeart({
  isFavorite,
  size = 'default',
  className = '',
  onClick,
  disabled = false,
}) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const heartVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.1 },
    tap: { scale: 0.9 },
    favorite: {
      scale: [1, 1.4, 1],
      transition: { duration: 0.4, ease: 'easeInOut' },
    },
    unfavorite: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.3, ease: 'easeInOut' },
    },
  };

  // Burst particles effect
  const burstVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: {
      opacity: [1, 0],
      scale: [0, 1.5],
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <motion.button
        whileHover="hover"
        whileTap="tap"
        animate={isFavorite ? 'favorite' : 'idle'}
        variants={heartVariants}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'relative transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/50 rounded-full p-1',
          isFavorite 
            ? 'text-rose-500 hover:text-rose-600' 
            : 'text-gray-400 hover:text-white',
          className
        )}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart
          className={cn(
            sizeClasses[size],
            isFavorite && 'fill-current'
          )}
          strokeWidth={isFavorite ? 2 : 1.5}
        />

        {/* Burst effect when favoriting */}
        <AnimatePresence>
          {isFavorite && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0 }}
                  variants={burstVariants}
                  className="absolute rounded-full bg-rose-500/30"
                  style={{
                    width: '6px',
                    height: '6px',
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 60}deg) translateX(12px)`,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}