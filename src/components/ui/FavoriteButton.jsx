'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import useFavorite from '@/hooks/use-favorite/useFavorite';

/**
 * Reusable Favorite Button
 * Animated heart with loading and error states.
 * When a free user clicks Save on a quote, a viewport-level portal upgrade prompt
 * is shown instead of sending a doomed POST /favorites request.
 */
export default function FavoriteButton({
  id,
  type = 'quote',
  className = '',
  size = 'default',
  variant = null,
  showText = false,
  activeText = 'Saved',
  inactiveText = 'Save',
  onToggle,
  ...props
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const iconSizes = {
    sm: 'w-4 h-4',
    default: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const buttonContent = (
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
          iconSizes[size] || 'w-4 h-4',
          isFavorite && 'fill-current text-rose-400'
        )}
        strokeWidth={isFavorite ? 2 : 1.5}
      />

      {showText && (
        <span className="ml-1.5 text-inherit text-[12px] sm:text-[13px] font-medium">
          {isFavorite ? activeText : inactiveText}
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
  );

  const upgradeModal = showUpgrade && mounted ? (
    createPortal(
      <AnimatePresence>
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={dismissUpgrade}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md max-h-[calc(100dvh-32px)] overflow-y-auto rounded-3xl border border-white/10 bg-card p-6 sm:p-7 shadow-2xl text-card-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={dismissUpgrade}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-foreground/5 text-foreground/60 hover:bg-foreground/10 hover:text-foreground transition cursor-pointer"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {/* Header Icon + Title */}
            <div className="flex items-center gap-3.5 mb-3.5">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 shadow-[0_0_20px_-4px_rgba(253,182,92,0.3)]">
                <Crown size={20} className="text-accent" />
              </span>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                  MyInspire+
                </span>
                <h3 className="text-lg font-bold text-foreground leading-snug">
                  Premium Required to Save
                </h3>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed mb-6">
              Free accounts can&apos;t save quotes to favorites. Upgrade to MyInspire+ for unlimited saves, category selection, and daily unlimited quotes.
            </p>

            {/* CTA Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  dismissUpgrade();
                  router.push('/dashboard/user/premium');
                }}
                className="h-11 cursor-pointer rounded-xl bg-accent text-accent-foreground font-semibold hover:bg-accent/90 shadow-md shadow-accent/20 transition active:scale-[0.98] text-xs sm:text-sm flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} fill="currentColor" />
                Upgrade Now
              </button>
              <button
                type="button"
                onClick={dismissUpgrade}
                className="h-11 cursor-pointer rounded-xl border border-border bg-background hover:bg-muted font-medium text-foreground-secondary hover:text-foreground transition active:scale-[0.98] text-xs sm:text-sm"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>,
      document.body
    )
  ) : null;

  return (
    <>
      {variant ? (
        <Button
          variant={variant}
          size={size}
          onClick={handleClick}
          disabled={isLoading}
          className={cn(
            'relative cursor-pointer',
            isFavorite ? '!text-rose-400 hover:!text-rose-300' : '',
            !showText && (isFavorite ? 'hover:bg-rose-500/10' : 'text-muted-foreground hover:text-foreground'),
            className
          )}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          {...props}
        >
          {buttonContent}
        </Button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={isLoading}
          className={cn(
            'relative cursor-pointer select-none transition-all duration-150',
            isFavorite ? '!text-rose-400 hover:!text-rose-300' : '',
            className
          )}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          {...props}
        >
          {buttonContent}
        </button>
      )}

      {upgradeModal}
    </>
  );
}
