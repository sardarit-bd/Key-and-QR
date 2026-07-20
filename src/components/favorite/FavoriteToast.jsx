'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Favorite Toast Notification
 * Beautiful toast for favorite actions
 */
export default function FavoriteToast({
  isOpen,
  onClose,
  type = 'add', // 'add' or 'remove'
  quote,
  duration = 3000,
}) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, duration]);

  if (!isOpen) return null;

  const isAdd = type === 'add';
  const message = isAdd ? 'Added to favorites!' : 'Removed from favorites';
  const iconColor = isAdd ? 'text-rose-500' : 'text-gray-400';

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm mx-4"
      >
        <div className="bg-[#121526] border border-white/10 rounded-xl shadow-2xl p-4 flex items-center gap-3">
          <div className="flex-shrink-0">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              <Heart className={`w-5 h-5 ${iconColor} ${isAdd ? 'fill-current' : ''}`} />
            </motion.div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium">
              {message}
            </p>
            {quote && (
              <p className="text-xs text-gray-400 truncate">
                "{quote.text?.substring(0, 60)}..."
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-full hover:bg-white/5 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}