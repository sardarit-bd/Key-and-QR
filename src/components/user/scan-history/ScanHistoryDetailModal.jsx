'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, Share2, Copy } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import FavoriteButton from '@/components/favorite/FavoriteButton';
import { format } from 'date-fns';

const DEFAULT_IMAGES = {
  love: '/images/quote-bg/love.jpg',
  strength: '/images/quote-bg/strength.jpg',
  healing: '/images/quote-bg/healing.jpg',
  faith: '/images/quote-bg/faith.jpg',
  gratitude: '/images/quote-bg/gratitude.jpg',
};

/**
 * Scan History Detail Modal
 */
export default function ScanHistoryDetailModal({ isOpen, onClose, data }) {
  const modalRef = useRef(null);
  
  // ✅ Moved hooks BEFORE any conditional returns
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // ✅ Now we can do conditional returns AFTER all hooks
  if (!data) return null;
  if (!isOpen) return null;

  const quote = data?.quote;
  const tag = data?.tag;
  const category = quote?.category || 'motivation';
  const backgroundImage = quote?.image?.url || DEFAULT_IMAGES[category] || DEFAULT_IMAGES.motivation;
  
  const formattedDate = data.createdAt
    ? format(new Date(data.createdAt), 'MMMM d, yyyy')
    : '';
  const formattedTime = data.createdAt
    ? format(new Date(data.createdAt), 'h:mm a')
    : '';

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

  const handleCopy = () => {
    const text = `"${quote?.text || ''}" — ${quote?.author || 'InspireTag'}`;
    navigator.clipboard?.writeText(text);
    toast.success('Quote copied!');
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[#121526] rounded-2xl border border-gray-800 shadow-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-6 pt-14">
            {/* Background Image */}
            <div
              className="relative h-48 rounded-xl bg-cover bg-center mb-6"
              style={{ backgroundImage: `url(${backgroundImage})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 rounded-xl" />
              
              {/* Category Badge */}
              <div className="absolute top-3 right-3">
                <span className="text-[10px] px-2.5 py-1 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm">
                  {category}
                </span>
              </div>

              {/* Quote Text */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <p className="text-lg text-white font-serif text-center leading-relaxed">
                  “{quote?.text || ''}”
                </p>
              </div>
            </div>

            {/* Author */}
            {quote?.author && (
              <p className="text-center text-amber-400/80 text-sm font-serif mb-4">
                — {quote.author} —
              </p>
            )}

            {/* Details */}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <span>Tag: <span className="text-gray-300 font-mono">{tag?.tagCode || 'N/A'}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>Scanned on: <span className="text-gray-300">{formattedDate} at {formattedTime}</span></span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t border-white/5">
              <FavoriteButton
                id={quote?._id}
                type="quote"
                size="default"
                variant="ghost"
                className="text-gray-400 hover:text-white"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-gray-400 hover:text-white hover:bg-white/5"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="text-gray-400 hover:text-white hover:bg-white/5"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}