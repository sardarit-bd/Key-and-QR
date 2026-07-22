'use client';

import { motion } from 'framer-motion';
import { Crown, Sparkles, ArrowRight, Shield, Zap, Star } from 'lucide-react';
import Link from 'next/link';

/**
 * Premium Upgrade CTA
 * Shown to free users
 */
export default function PremiumUpgradeCTA() {
  const benefits = [
    {
      icon: Sparkles,
      title: 'Unlimited Quotes',
      description: 'Get unlimited inspirational quotes every day',
    },
    {
      icon: Star,
      title: 'Category Explorer',
      description: 'Browse quotes by your favorite categories',
    },
    {
      icon: Zap,
      title: 'Unlimited Discover',
      description: 'Explore endless inspiration without limits',
    },
    {
      icon: Shield,
      title: 'Premium Experience',
      description: 'Ad-free, premium UI, and exclusive content',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-8"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-amber-400" />
              <h2 className="text-2xl font-bold text-white">Upgrade to Premium</h2>
            </div>
            <p className="text-white/80 mt-2 max-w-lg">
              Unlock unlimited inspiration and take your experience to the next level.
            </p>
          </div>

          <Link href="/subscription">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
            >
              Upgrade Now
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <benefit.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{benefit.title}</p>
                <p className="text-xs text-white/70">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}