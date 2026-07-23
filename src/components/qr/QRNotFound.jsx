'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { QrCode, Home } from 'lucide-react';

/**
 * QR Not Found Component
 * Displayed when tag doesn't exist
 */
export default function QRNotFound({ tagCode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto text-center px-4"
    >
      {/* Illustration */}
      <div className="relative">
        <div className="w-32 h-32 mx-auto bg-gray-900/50 rounded-full flex items-center justify-center border border-gray-800">
          <QrCode className="w-16 h-16 text-gray-600" strokeWidth={1.5} />
        </div>
        {/* Decorative ring */}
        <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full border-2 border-gray-800/30 animate-pulse" />
      </div>

      {/* Content */}
      <h1 className="mt-8 text-3xl font-bold text-white font-serif">
        Tag Not Found
      </h1>
      
      <p className="mt-3 text-gray-400 max-w-sm mx-auto">
        The QR code you scanned is invalid or no longer exists. 
        Please check the code and try again.
      </p>

      {tagCode && (
        <div className="mt-4 bg-gray-900/50 rounded-lg p-3 border border-gray-800">
          <p className="text-xs text-gray-500 font-medium mb-1">Scanned code:</p>
          <p className="text-xs font-mono text-gray-400 break-all">{tagCode}</p>
        </div>
      )}

      {/* Action */}
      <Link href="/">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-8 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-full inline-flex items-center gap-2 hover:shadow-lg hover:shadow-amber-500/25 transition-shadow"
        >
          <Home className="w-4 h-4" />
          Return Home
        </motion.button>
      </Link>
    </motion.div>
  );
}