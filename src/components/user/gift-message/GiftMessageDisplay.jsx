'use client';

import { motion } from 'framer-motion';
import { Gift, Copy, Share2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';

/**
 * Gift Message Display
 * Shows the gift message with sharing and copying options
 */
export default function GiftMessageDisplay({
  message,
  isOwner,
  tagCode,
  onEdit,
  onSave,
  onRemove,
  saving,
}) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      toast.success('Message copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy message');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Personal Gift Message',
      text: message,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
          <Gift className="w-8 h-8 text-amber-400" />
        </div>
        <h2 id="gift-message-title" className="text-2xl font-serif text-white">
          Someone left you a personal message
        </h2>
      </div>

      {/* Message */}
      <div className="relative p-6 bg-gray-800/50 rounded-xl border border-gray-700">
        <p className="text-gray-200 text-lg leading-relaxed text-center italic">
          “{message}”
        </p>
        
        {/* Decorative quote marks */}
        <div className="absolute top-2 left-3 text-4xl text-amber-500/20 font-serif">“</div>
        <div className="absolute bottom-2 right-3 text-4xl text-amber-500/20 font-serif">”</div>
      </div>

      {/* Tag Code */}
      {tagCode && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            From Tag: <span className="font-mono text-gray-400">{tagCode}</span>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="border-white/10 text-gray-300 hover:bg-white/5 hover:text-white"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="border-white/10 text-gray-300 hover:bg-white/5 hover:text-white"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>

        {isOwner && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="border-white/10 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onRemove}
              disabled={saving}
              className="border-white/10 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}