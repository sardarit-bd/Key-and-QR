'use client';

import { motion } from 'framer-motion';
import { Sparkles, Compass, BookOpen, Crown } from 'lucide-react';

const ICON_MAP = {
  Sparkles,
  Compass,
  BookOpen,
  Crown,
};

/**
 * Premium Feature Card
 */
export default function PremiumFeatureCard({ feature }) {
  const Icon = ICON_MAP[feature.icon] || Sparkles;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-[#121526] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-white">{feature.title}</h4>
          <p className="text-xs text-gray-400">{feature.description}</p>
        </div>
      </div>
    </motion.div>
  );
}