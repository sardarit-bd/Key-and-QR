'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, LogIn, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * QR Activation Component
 * Displayed when tag needs activation
 */
export default function QRActivation({ tagCode, data }) {
  const router = useRouter();

  const handleLogin = () => {
    router.push(`/login?redirect=/tag/${tagCode}`);
  };

  const handleRegister = () => {
    router.push(`/signup?redirect=/tag/${tagCode}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto text-center px-4"
    >
      {/* Icon */}
      <div className="relative">
        <div className="w-32 h-32 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30">
          <Sparkles className="w-16 h-16 text-amber-400" strokeWidth={1.5} />
        </div>
        <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full border-2 border-amber-500/20 animate-ping" />
      </div>

      {/* Content */}
      <h1 className="mt-8 text-3xl font-bold text-white font-serif">
        Activate Your Tag
      </h1>
      
      <p className="mt-3 text-gray-400 max-w-sm mx-auto">
        This QR code needs to be activated before you can view its message. 
        Sign in or create an account to get started.
      </p>

      {data?.tagCode && (
        <div className="mt-4 bg-gray-900/50 rounded-lg p-3 border border-gray-800">
          <p className="text-xs text-gray-500 font-medium mb-1">Tag Code:</p>
          <p className="text-xs font-mono text-gray-400">{data.tagCode}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 space-y-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogin}
          className="w-full px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-full inline-flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/25 transition-shadow"
        >
          <LogIn className="w-4 h-4" />
          Login
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRegister}
          className="w-full px-8 py-3 bg-white/10 text-white font-semibold rounded-full inline-flex items-center justify-center gap-2 hover:bg-white/20 transition-colors border border-white/20"
        >
          <UserPlus className="w-4 h-4" />
          Create Account
        </motion.button>
      </div>
    </motion.div>
  );
}