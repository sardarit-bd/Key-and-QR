'use client';

import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { useQuoteCategories } from '@/hooks/category/useQuoteCategories';
import { resolveCategory } from '@/components/dashboard/admin/categories/categoryIconRegistry';

/**
 * Premium Category Selector
 * Loads categories from the backend (GET /categories) — the chip design
 * stays exactly the same, only the source of the category list changed.
 * Icons resolve through the centralized category icon registry, so the same
 * category shows the same icon here as everywhere else.
 */
export default function PremiumCategorySelector({
  selectedCategory,
  onCategoryChange,
  isPremium,
}) {
  const { data: backendCategories = [] } = useQuoteCategories();

  // Build the chip list: "Random" first, then all active backend categories.
  const categories = [
    { id: 'random', label: 'Random' },
    ...backendCategories.map((category) => ({
      id: category?.slug || category?._id,
      label: category?.name || category?.slug,
      doc: category,
    })),
  ];

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
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          const isLocked = !isPremium && category.id !== 'random';
          // Resolve the canonical icon through the central registry
          // (uses the saved icon NAME, falls back to slug alias → fallback).
          const resolved = category.doc ? resolveCategory(category.doc) : null;
          const isCustomIcon = resolved?.iconType === 'custom' && Boolean(resolved?.iconUrl);
          const Icon = category.id === 'random' ? Sparkles : (resolved?.Icon || Sparkles);

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
                {isCustomIcon && resolved?.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resolved.iconUrl} alt="" width={14} height={14} className="object-contain flex-shrink-0" />
                ) : (
                  <Icon size={14} className="flex-shrink-0" />
                )}
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
