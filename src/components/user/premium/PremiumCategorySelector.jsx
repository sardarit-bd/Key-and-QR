'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const CATEGORIES = [
  { id: 'random', label: 'Random', icon: '✨' },
  { id: 'faith', label: 'Faith', icon: '🙏' },
  { id: 'love', label: 'Love', icon: '❤️' },
  { id: 'hope', label: 'Hope', icon: '🌟' },
  { id: 'success', label: 'Success', icon: '🏆' },
  { id: 'motivation', label: 'Motivation', icon: '💪' },
];

/**
 * Premium Category Selector
 */
export default function PremiumCategorySelector({
  selectedCategory,
  onCategoryChange,
  isPremium,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Choose Category</h3>
        {!isPremium && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Premium Feature
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.id;
          const isLocked = !isPremium && category.id !== 'random';

          return (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (isLocked) return;
                onCategoryChange(category.id);
              }}
              disabled={isLocked}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${isSelected 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25' 
                  : isLocked
                    ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
                }
              `}
            >
              <span className="flex items-center gap-1.5">
                <span>{category.icon}</span>
                {category.label}
                {isLocked && <Lock className="w-3 h-3 ml-1" />}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}