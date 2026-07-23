'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldX, Home } from 'lucide-react';

/**
 * QR Disabled Component
 * Displayed when tag is inactive/disabled
 */
export default function QRDisabled({ tagCode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto text-center px-4"
    >
      {/* Illustration */}
      <div className="relative">
        <div className="w-32 h-32 mx-auto bg-red-900/20 rounded-full flex items-center justify-center border border-red-800/50">
          <ShieldX className="w-16 h-16 text-red-500" strokeWidth={1.5} />
        </div>
      </div>

      {/* Content */}
      <h1 className="mt-8 text-3xl font-bold text-white font-serif">
        This Tag Has Been Disabled
      </h1>
      
      <p className="mt-3 text-gray-400 max-w-sm mx-auto">
        This QR code is no longer available. It may have been deactivated 
        by the owner or administrator.
      </p>

      {/* Action */}
      <Link href="/">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-8 px-8 py-3 bg-white/10 text-white font-semibold rounded-full inline-flex items-center gap-2 hover:bg-white/20 transition-colors border border-white/20"
        >
          <Home className="w-4 h-4" />
          Return Home
        </motion.button>
      </Link>
    </motion.div>
  );
}