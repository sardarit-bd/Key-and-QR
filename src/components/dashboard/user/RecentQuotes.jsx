'use client';

import { motion } from 'framer-motion';
import { Calendar, Sparkles, Heart, Quote } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const CATEGORY_ICONS = {
  faith: Quote,
  love: Heart,
  motivation: Sparkles,
  hope: Sparkles,
  success: Sparkles,
  general: Quote,
};

const CATEGORY_COLORS = {
  faith: 'text-purple-400 bg-purple-500/10',
  love: 'text-pink-400 bg-pink-500/10',
  motivation: 'text-orange-400 bg-orange-500/10',
  hope: 'text-emerald-400 bg-emerald-500/10',
  success: 'text-blue-400 bg-blue-500/10',
  general: 'text-gray-400 bg-gray-500/10',
};

export default function RecentQuotes({ quotes }) {
  const { theme, colors } = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-[24px] p-6 shadow-lg"
      style={{
        backgroundColor: colors.backgroundSecondary,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-serif tracking-wide" style={{ color: colors.foreground }}>
          Your Recent Quotes
        </h2>
        <button 
          className="text-xs font-medium px-4 py-2 rounded-full border transition-colors cursor-pointer"
          style={{
            borderColor: colors.border,
            color: colors.foregroundSecondary,
          }}
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {quotes.length === 0 ? (
          <div className="text-center py-8" style={{ color: colors.foregroundSecondary }}>
            No quotes yet. Start your inspiration journey!
          </div>
        ) : (
          quotes.map((quote, idx) => {
            const Icon = CATEGORY_ICONS[quote.category?.toLowerCase()] || Quote;
            const colorClass = CATEGORY_COLORS[quote.category?.toLowerCase()] || CATEGORY_COLORS.general;

            return (
              <motion.div
                key={idx}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-4 rounded-2xl transition-all group"
                style={{
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon size={16} />
                  </div>
                  <p className="text-sm truncate font-medium" style={{ color: colors.foreground }}>
                    {quote.text}
                  </p>
                </div>

                <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                  <span 
                    className="hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border"
                    style={{
                      backgroundColor: `${colors.primary}10`,
                      color: colors.primary,
                      borderColor: `${colors.primary}20`,
                    }}
                  >
                    <span className="capitalize">{quote.category || 'General'}</span>
                  </span>
                  <span className="text-xs flex items-center gap-1.5" style={{ color: colors.foregroundTertiary }}>
                    <Calendar size={12} />
                    {formatDate(quote.date)}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}