'use client';

import { motion } from 'framer-motion';
import { Calendar, Tag, Eye, Share2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import FavoriteButton from '@/components/favorite/FavoriteButton';
import { format } from 'date-fns';

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
 * Scan History Card
 */
export default function ScanHistoryCard({
  item,
  onViewDetail,
  view = 'grid',
}) {
  const quote = item?.quote;
  const tag = item?.tag;
  const category = quote?.category || 'motivation';
  const categoryLabel = CATEGORY_LABELS[category] || category;
  const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.motivation;
  const backgroundImage = quote?.image?.url || DEFAULT_IMAGES[category] || DEFAULT_IMAGES.motivation;
  
  const formattedDate = item.createdAt
    ? format(new Date(item.createdAt), 'MMM d, yyyy')
    : '';
  const formattedTime = item.createdAt
    ? format(new Date(item.createdAt), 'h:mm a')
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

  if (view === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#121526] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-white/10 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-medium line-clamp-2">
            “{quote?.text || ''}”
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs text-gray-400">{quote?.author || 'InspireTag'}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryColor}`}>
              {categoryLabel}
            </span>
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {tag?.tagCode || 'N/A'}
            </span>
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate} at {formattedTime}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <FavoriteButton
            id={quote?._id}
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
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewDetail(item)}
            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
          >
            <Eye className="w-4 h-4" />
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
        className="relative h-48 bg-cover bg-center cursor-pointer"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        onClick={() => onViewDetail(item)}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        
        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className={`text-[10px] px-2.5 py-1 rounded-full border ${categoryColor} backdrop-blur-sm`}>
            {categoryLabel}
          </span>
        </div>

        {/* Tag Code */}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-black/50 border border-white/10 text-gray-300 backdrop-blur-sm">
            {tag?.tagCode || 'N/A'}
          </span>
        </div>

        {/* Quote Text */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <p className="text-sm text-white font-medium text-center leading-relaxed line-clamp-4">
            “{quote?.text || ''}”
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            {quote?.author || 'InspireTag'}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10"
            >
              <Share2 className="w-3.5 h-3.5" />
            </Button>
            <FavoriteButton
              id={quote?._id}
              type="quote"
              size="sm"
              variant="ghost"
              className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewDetail(item)}
              className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10"
            >
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Date/Time */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <span className="text-[10px] text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formattedDate} · {formattedTime}
          </span>
        </div>
      </div>
    </motion.div>
  );
}