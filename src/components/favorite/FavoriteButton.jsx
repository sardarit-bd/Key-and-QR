'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import useFavorite from '@/hooks/use-favorite/useFavorite';

/**
 * Reusable Favorite Button
 * Animated heart with loading and error states
 */
export default function FavoriteButton({
  id,
  type = 'quote',
  className = '',
  size = 'default',
  variant = 'ghost',
  showText = false,
  onToggle,
  ...props
}) {
  const { isFavorite, isLoading, toggleFavorite } = useFavorite({
    id,
    type,
    onSuccess: onToggle,
    onError: (error) => {
      console.error('Favorite error:', error);
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite();
  };

  const heartVariants = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.3, 1],
      transition: { duration: 0.3 }
    },
    exit: { scale: 0 },
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-9 w-9',
    lg: 'h-10 w-10',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    default: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        'relative transition-colors',
        isFavorite 
          ? 'text-rose-500 hover:text-rose-600 hover:bg-rose-500/10' 
          : 'text-gray-400 hover:text-white hover:bg-white/5',
        className
      )}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      {...props}
    >
      <motion.div
        key={isFavorite ? 'filled' : 'outline'}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={heartVariants}
        className="relative flex items-center justify-center"
      >
        <Heart
          className={cn(
            iconSizes[size],
            isFavorite && 'fill-current'
          )}
          strokeWidth={isFavorite ? 2 : 1.5}
        />
        
        {showText && (
          <span className="ml-2 text-sm">
            {isFavorite ? 'Saved' : 'Save'}
          </span>
        )}

        {/* Loading spinner overlay */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-4 h-4 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          </motion.div>
        )}
      </motion.div>
    </Button>
  );
}