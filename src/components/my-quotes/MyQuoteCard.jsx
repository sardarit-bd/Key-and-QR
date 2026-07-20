'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, MoreVertical, Copy, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import FavoriteButton from '@/components/favorite/FavoriteButton';

const CATEGORY_COLORS = {
  faith: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  love: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
  hope: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  success: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  motivation: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
};

const CATEGORY_LABELS = {
  faith: 'Faith',
  love: 'Love',
  hope: 'Hope',
  success: 'Success',
  motivation: 'Motivation',
};

const DEFAULT_IMAGES = {
  faith: '/images/quote-bg/faith.jpg',
  love: '/images/quote-bg/love.jpg',
  hope: '/images/quote-bg/healing.jpg',
  success: '/images/quote-bg/success.jpg',
  motivation: '/images/quote-bg/strength.jpg',
};

/**
 * My Quote Card
 * Displays a single quote with favorite, share, and remove actions
 */
export default function MyQuoteCard({ favorite, view = 'grid', onRemove }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const quote = favorite?.quote;

  if (!quote) return null;

  const category = quote.category || 'motivation';
  const categoryLabel = CATEGORY_LABELS[category] || category;
  const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.motivation;
  const backgroundImage = quote.image?.url || DEFAULT_IMAGES[category] || DEFAULT_IMAGES.motivation;
  
  const formattedDate = favorite.createdAt
    ? format(new Date(favorite.createdAt), 'MMM d, yyyy')
    : '';

  const handleShare = async () => {
    const shareText = `"${quote.text}" — ${quote.author || 'InspireTag'}`;
    
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
    const text = `"${quote.text}" — ${quote.author || 'InspireTag'}`;
    navigator.clipboard?.writeText(text);
    toast.success('Quote copied!');
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(favorite._id);
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Failed to remove');
    } finally {
      setIsRemoving(false);
    }
  };

  // List view
  if (view === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#121526] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-white/10 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-medium line-clamp-2">
            “{quote.text}”
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-400">{quote.author || 'InspireTag'}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryColor}`}>
              {categoryLabel}
            </span>
            {formattedDate && (
              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <FavoriteButton
            id={quote._id}
            type="quote"
            size="sm"
            variant="ghost"
            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
            aria-label="Share quote"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={isRemoving}
            className="h-8 w-8 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10"
            aria-label="Remove from favorites"
          >
            {isRemoving ? (
              <div className="w-4 h-4 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </Button>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-[#121526] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
    >
      {/* Background Image */}
      <div
        className="relative h-48 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        
        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className={`text-[10px] px-2.5 py-1 rounded-full border ${categoryColor} backdrop-blur-sm`}>
            {categoryLabel}
          </span>
        </div>

        {/* Quote Text */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <p className="text-sm text-white font-medium text-center leading-relaxed line-clamp-4">
            “{quote.text}”
          </p>
        </div>

        {/* Actions Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            {quote.author || 'InspireTag'}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10"
              aria-label="Share quote"
            >
              <Share2 className="w-3.5 h-3.5" />
            </Button>
            <FavoriteButton
              id={quote._id}
              type="quote"
              size="sm"
              variant="ghost"
              className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10"
                  aria-label="More options"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="border-white/10 bg-[#121526] text-gray-200"
              >
                <DropdownMenuItem
                  onClick={handleCopy}
                  className="cursor-pointer hover:bg-white/5"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Quote
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleRemove}
                  disabled={isRemoving}
                  className="cursor-pointer text-rose-400 hover:bg-rose-500/10 hover:text-rose-400"
                >
                  {isRemoving ? (
                    <div className="w-4 h-4 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin mr-2" />
                  ) : (
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Date */}
        {formattedDate && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}