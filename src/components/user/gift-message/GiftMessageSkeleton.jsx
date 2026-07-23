'use client';

import { motion } from 'framer-motion';

/**
 * Gift Message Loading Skeleton
 * Shimmer effect for loading state
 */
export default function GiftMessageSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Icon skeleton */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-gray-800/50 animate-pulse" />
      </div>

      {/* Title skeleton */}
      <div className="space-y-2 text-center">
        <div className="h-7 w-48 mx-auto bg-gray-800/50 rounded-lg animate-pulse" />
        <div className="h-4 w-64 mx-auto bg-gray-800/50 rounded-lg animate-pulse" />
      </div>

      {/* Message skeleton */}
      <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 space-y-3">
        <div className="h-5 w-full bg-gray-700/50 rounded-lg animate-pulse" />
        <div className="h-5 w-3/4 bg-gray-700/50 rounded-lg animate-pulse mx-auto" />
        <div className="h-5 w-2/3 bg-gray-700/50 rounded-lg animate-pulse mx-auto" />
      </div>

      {/* Actions skeleton */}
      <div className="flex justify-center gap-3 pt-2">
        <div className="h-9 w-20 bg-gray-800/50 rounded-lg animate-pulse" />
        <div className="h-9 w-20 bg-gray-800/50 rounded-lg animate-pulse" />
      </div>
    </motion.div>
  );
}