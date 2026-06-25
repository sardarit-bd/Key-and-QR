'use client';

import { motion } from 'framer-motion';
import { Quote, Heart, QrCode, Gift } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const STATS_CONFIG = [
  { key: 'totalOrders', icon: Quote, label: 'Total Quotes', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { key: 'totalFavorites', icon: Heart, label: 'Favorites', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', animate: true },
  { key: 'totalScans', icon: QrCode, label: 'Total Scans', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { key: 'giftedMessages', icon: Gift, label: 'Gifted Messages', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
];

export default function StatsCards({ stats }) {
  const { theme, colors } = useTheme();

  const heartbeatPulse = {
    scale: [1, 1.15, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  // Map stats data
  const statsData = [
    { ...STATS_CONFIG[0], value: stats.totalOrders },
    { ...STATS_CONFIG[1], value: stats.totalFavorites },
    { ...STATS_CONFIG[2], value: stats.totalScans },
    { ...STATS_CONFIG[3], value: 3 }, // Static for now
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
    >
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        const isAnimated = stat.animate;

        return (
          <div
            key={index}
            className="rounded-[24px] p-5 shadow-lg flex items-center gap-5 hover:shadow-xl transition-all cursor-default"
            style={{
              backgroundColor: colors.backgroundSecondary,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div 
              className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${stat.bg} ${stat.border}`}
            >
              {isAnimated ? (
                <motion.div animate={heartbeatPulse}>
                  <Icon size={24} className={stat.color} />
                </motion.div>
              ) : (
                <Icon size={24} className={stat.color} />
              )}
            </div>
            <div>
              <p className="text-sm mb-1" style={{ color: colors.foregroundSecondary }}>
                {stat.label}
              </p>
              <h4 className="text-2xl font-bold leading-none mb-1" style={{ color: colors.foreground }}>
                {stat.value}
              </h4>
              <p className="text-[10px]" style={{ color: colors.foregroundTertiary }}>
                {stat.label === 'Total Quotes' && 'Quotes received'}
                {stat.label === 'Favorites' && 'Your favorite quotes'}
                {stat.label === 'Total Scans' && 'QR & NFC scans'}
                {stat.label === 'Gifted Messages' && 'Messages received'}
              </p>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}