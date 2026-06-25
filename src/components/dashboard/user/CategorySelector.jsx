'use client';

import { motion } from 'framer-motion';
import { LayoutGrid, Sparkles, Heart, Quote, RefreshCw } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const CATEGORIES = [
  { id: 'random', label: 'Inspire Random', icon: Sparkles, color: 'text-indigo-400' },
  { id: 'love', label: 'Love', icon: Heart, color: 'text-pink-400' },
  { id: 'strength', label: 'Strength', icon: Sparkles, color: 'text-amber-400' },
  { id: 'healing', label: 'Healing', icon: Heart, color: 'text-emerald-400' },
  { id: 'faith', label: 'Faith', icon: Quote, color: 'text-purple-400' },
  { id: 'gratitude', label: 'Gratitude', icon: Sparkles, color: 'text-yellow-400' },
];

export default function CategorySelector({ selectedCategory, onSelectCategory }) {
  const { theme, colors } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative overflow-hidden rounded-[32px] px-8 py-8 shadow-[0_0_40px_rgba(255,140,0,0.06)] mb-8"
      style={{
        backgroundColor: colors.backgroundSecondary,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-pink-500/5"></div>

      <div className="relative flex flex-col xl:flex-row xl:items-center gap-8">
        {/* Left Text */}
        <div className="min-w-[300px]">
          <h3 className="text-3xl font-serif mb-4" style={{ color: colors.foreground }}>
            Ready for more inspiration?
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: colors.foregroundSecondary }}>
            Choose a category and discover a new quote<br />
            that speaks to your heart.
          </p>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide flex-1 px-4 py-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;

            return (
              <motion.button
                key={cat.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectCategory(cat.id)}
                className={`w-[110px] h-[90px] rounded-[28px] border flex flex-col justify-center items-center transition-all duration-300 flex-shrink-0 cursor-pointer ${
                  isActive
                    ? 'shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                    : 'hover:shadow-md'
                }`}
                style={{
                  backgroundColor: isActive ? `${colors.primary}30` : colors.background,
                  borderColor: isActive ? colors.primary : colors.border,
                }}
              >
                <div className={`mb-3 ${cat.color}`}>
                  <Icon size={20} />
                </div>
                <span 
                  className="text-sm font-medium text-center leading-tight"
                  style={{ color: isActive ? colors.primary : colors.foregroundSecondary }}
                >
                  {cat.id === 'random' ? (
                    <>
                      Inspire
                      <br />
                      <span className="text-xs opacity-60">Random</span>
                    </>
                  ) : (
                    cat.label
                  )}
                </span>
              </motion.button>
            );
          })}

          {/* Divider */}
          <div className="h-24 w-px mx-3 flex-shrink-0" style={{ backgroundColor: colors.border }} />

          {/* View All */}
          <motion.button
            whileHover={{ y: -4 }}
            className="flex items-center justify-center gap-4 flex-shrink-0 cursor-pointer"
          >
            <div 
              className="w-12 h-12 rounded-full border flex items-center justify-center"
              style={{ borderColor: colors.border }}
            >
              <LayoutGrid className="w-5 h-5" style={{ color: colors.foregroundSecondary }} />
            </div>
            <span className="text-sm leading-tight text-center" style={{ color: colors.foregroundSecondary }}>
              View All
              <br />
              Categories
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}