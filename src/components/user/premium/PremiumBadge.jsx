'use client';

import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

/**
 * Premium Badge
 * Reusable premium indicator
 */
export default function PremiumBadge({ size = 'default', className = '' }) {
  const sizeClasses = {
    sm: 'text-[8px] px-1.5 py-0.5 gap-1',
    default: 'text-[10px] px-2 py-0.5 gap-1.5',
    lg: 'text-xs px-3 py-1 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    default: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center font-semibold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 ${sizeClasses[size]} ${className}`}
    >
      <Crown className={iconSizes[size]} />
      Premium
    </motion.span>
  );
}