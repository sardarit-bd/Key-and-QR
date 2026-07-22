'use client';

import { motion } from 'framer-motion';
import { Crown, Sparkles } from 'lucide-react';
import PremiumBadge from './PremiumBadge';

/**
 * Premium Welcome Banner
 */
export default function PremiumWelcomeBanner({
  isPremium,
  userName,
  subscriptionStatus,
}) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 ${
        isPremium
          ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600'
          : 'bg-gradient-to-r from-gray-800 to-gray-900'
      }`}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {getGreeting()}, {userName || 'InspireTag User'}! 👋
            </h1>
            {isPremium && <PremiumBadge />}
          </div>
          
          <p className="text-white/80 mt-1 text-sm sm:text-base">
            {isPremium
              ? 'You have unlimited access to all premium features. Explore endless inspiration!'
              : 'Upgrade to premium and unlock unlimited inspiration.'}
          </p>
        </div>

        {isPremium && (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm"
          >
            <Crown className="w-4 h-4 text-white" />
            <span className="text-white font-medium text-sm">Premium</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}