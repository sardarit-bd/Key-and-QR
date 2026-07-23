'use client';

import { motion } from 'framer-motion';

/**
 * QR Loading Skeleton
 * Elegant loading state with shimmer effect
 */
export default function QRLoading() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Skeleton Card */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
        {/* Category skeleton */}
        <div className="flex justify-center mb-8">
          <div className="h-4 w-24 bg-gray-800 rounded-full animate-pulse" />
        </div>

        {/* Quote skeleton */}
        <div className="space-y-4 text-center">
          <div className="h-8 w-3/4 mx-auto bg-gray-800 rounded-lg animate-pulse" />
          <div className="h-8 w-1/2 mx-auto bg-gray-800 rounded-lg animate-pulse" />
          <div className="h-8 w-2/3 mx-auto bg-gray-800 rounded-lg animate-pulse" />
        </div>

        {/* Author skeleton */}
        <div className="mt-8 flex justify-center">
          <div className="h-5 w-32 bg-gray-800 rounded-lg animate-pulse" />
        </div>

        {/* Actions skeleton */}
        <div className="mt-12 flex justify-center gap-6">
          <div className="h-10 w-10 bg-gray-800 rounded-full animate-pulse" />
          <div className="h-10 w-10 bg-gray-800 rounded-full animate-pulse" />
          <div className="h-10 w-10 bg-gray-800 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Loading text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-gray-500 text-center mt-6 text-sm"
      >
        Loading your inspiration...
      </motion.p>
    </div>
  );
}