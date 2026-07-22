'use client';

import { motion } from 'framer-motion';
import { Copy, Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';

/**
 * Gift Message Share Actions
 * Copy and Share functionality
 */
export default function GiftMessageShare({ message }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success('Message copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
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
      className="flex flex-wrap items-center justify-center gap-3 pt-2"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="border-white/10 text-gray-300 hover:bg-white/5 hover:text-white transition-all"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2 text-emerald-400" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </>
        )}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="border-white/10 text-gray-300 hover:bg-white/5 hover:text-white transition-all"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
    </motion.div>
  );
}