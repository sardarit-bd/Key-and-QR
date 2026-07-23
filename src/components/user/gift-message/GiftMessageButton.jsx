'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import GiftMessageModal from './GiftMessageModal';

/**
 * Gift Message Button
 * Premium gift button that opens the gift message modal
 */
export default function GiftMessageButton({
  tagCode,
  hasPersonalMessage = false,
  personalMessage = null,
  className = '',
  size = 'default',
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    default: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpen}
        className={`
          inline-flex items-center gap-2 
          bg-gradient-to-r from-amber-500 to-orange-500 
          text-black font-semibold rounded-full 
          shadow-lg hover:shadow-amber-500/25 
          transition-all duration-300
          ${sizeClasses[size]}
          ${className}
        `}
        aria-label="View gift message"
      >
        <Gift className="w-4 h-4" />
        <span>
          {hasPersonalMessage ? 'View Gift Message' : 'Send a Gift Message'}
        </span>
      </motion.button>

      <GiftMessageModal
        isOpen={isOpen}
        onClose={handleClose}
        tagCode={tagCode}
        initialData={{
          hasPersonalMessage,
          personalMessage,
        }}
      />
    </>
  );
}