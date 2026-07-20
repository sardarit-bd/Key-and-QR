'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Scan } from 'lucide-react';

/**
 * My Quote Empty State
 * Displayed when user has no saved quotes
 */
export default function MyQuoteEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto text-center py-12"
    >
      <div className="relative">
        <div className="w-24 h-24 mx-auto bg-violet-500/10 rounded-full flex items-center justify-center border border-violet-500/20">
          <BookOpen className="w-12 h-12 text-violet-400" strokeWidth={1.5} />
        </div>
        <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-2 border-violet-500/10 animate-pulse" />
      </div>

      <h2 className="mt-6 text-2xl font-semibold text-white font-serif">
        No saved inspiration yet
      </h2>
      
      <p className="mt-3 text-gray-400 max-w-sm mx-auto">
        Start scanning your InspireTag to build your personal inspiration library.
        Every quote you save will appear here.
      </p>

      <Link href="/scan">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium rounded-full inline-flex items-center gap-2 hover:shadow-lg hover:shadow-violet-500/25 transition-shadow"
        >
          <Scan className="w-4 h-4" />
          Scan Your First Tag
        </motion.button>
      </Link>
    </motion.div>
  );
}