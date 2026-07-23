'use client';

import { motion } from 'framer-motion';
import { Crown, Sparkles, ArrowRight, Shield, Zap, Star, Heart, BookOpen, Check } from 'lucide-react';
import Link from 'next/link';

/**
 * Premium Upgrade CTA
 * Spec Section 4.6: 6-item benefits checklist
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
      icon: Heart,
      title: 'Unlimited Favorites',
      description: 'Save as many quotes as you want to your collection',
    },
    {
      icon: BookOpen,
      title: 'Reflections',
      description: 'Write personal reflections on quotes that resonate',
    },
    {
      icon: Zap,
      title: 'Ad-Free Experience',
      description: 'Enjoy a clean, distraction-free interface',
    },
    {
      icon: Shield,
      title: 'Priority Support',
      description: 'Get faster responses from our support team',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1d35] to-[#121526] border border-white/5 p-8"
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-[#e3ba85]" />
              <h2 className="text-2xl font-bold text-white">Upgrade to Premium</h2>
            </div>
            <p className="text-gray-400 mt-2 max-w-lg">
              Unlock unlimited inspiration and take your experience to the next level.
            </p>
          </div>

          <Link href="/new-dashboard/user/premium">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-[#e3ba85] text-black font-semibold rounded-full shadow-lg hover:bg-[#d4a976] transition flex items-center gap-2"
            >
              Upgrade Now
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>

        {/* 6-Item Benefits Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/5">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-white/5"
            >
              <div className="w-8 h-8 rounded-full bg-[#e3ba85]/10 flex items-center justify-center flex-shrink-0">
                <benefit.icon className="w-4 h-4 text-[#e3ba85]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-green-400" />
                  <p className="text-sm font-medium text-white">{benefit.title}</p>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
