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
      className="bg-card border border-border rounded-xl p-4 hover:border-border transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-foreground">{feature.title}</h4>
          <p className="text-xs text-muted-foreground">{feature.description}</p>
        </div>
      </div>
    </motion.div>
  );
}
