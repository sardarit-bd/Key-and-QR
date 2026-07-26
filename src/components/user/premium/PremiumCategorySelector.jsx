'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const CATEGORIES = [
  { id: 'random', label: 'Random', icon: '✨' },
  { id: 'love', label: 'Love', icon: '❤️' },
  { id: 'strength', label: 'Strength', icon: '💪' },
  { id: 'healing', label: 'Healing', icon: '🌿' },
  { id: 'faith', label: 'Faith', icon: '🙏' },
  { id: 'gratitude', label: 'Gratitude', icon: '☀️' },
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
        <h3 className="text-sm font-medium text-foreground-secondary">Choose Category</h3>
        {!isPremium && (
          <span className="text-xs text-foreground-tertiary flex items-center gap-1">
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
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                  : isLocked
                    ? 'bg-muted text-foreground-tertiary cursor-not-allowed'
                    : 'bg-muted text-foreground-secondary hover:bg-muted'
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
