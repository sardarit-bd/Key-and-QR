'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, X, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import useFavorite from '@/hooks/use-favorite/useFavorite';

/**
 * Reusable Favorite Button
 * Animated heart with loading and error states.
 * When a free user clicks Save on a quote, an upgrade prompt is shown
 * instead of sending a doomed POST /favorites request.
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
  const router = useRouter();
  const { isFavorite, isLoading, toggleFavorite, showUpgrade, dismissUpgrade } = useFavorite({
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
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          'relative cursor-pointer',
          isFavorite
            ? '!text-rose-400 hover:!text-rose-300'
            : '',
          !showText && (isFavorite
            ? 'hover:bg-rose-500/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'),
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
            <span className="ml-1.5 text-inherit text-[13px] font-medium">
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

      {/* Upgrade prompt (P1.1) — free user clicked Save on a quote */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-2xl relative">
            <button
              onClick={dismissUpgrade}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10">
                <Crown size={18} className="text-accent" />
              </span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Premium required to save quotes
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Free accounts can&apos;t save quotes to favorites. Upgrade to Premium for unlimited saves.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push('/new-dashboard/user/premium')}
                className="h-11 rounded-xl bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition"
              >
                Upgrade Now
              </button>
              <button
                onClick={dismissUpgrade}
                className="h-11 rounded-xl border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
