'use client';

import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import ActionMenu from '../shared/ActionMenu';
import { CategoryIcon } from './categoryIconRegistry';

const STATUS_STYLES = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  inactive: 'bg-red-500/10 text-red-400 border-red-500/20',
};

// SINGLE column template used by both header and body
// Category | Description | Sort Order | Quotes | Status | Actions
const COLUMNS = 'minmax(0,2fr) minmax(0,2fr) 72px 72px 90px 44px';

function CategoryRow({ category, count, onEdit, onToggle, onDelete }) {
  const isActive = category.isActive;
  const iconColor = category.color || '#6366f1';
  const quoteCount =
    category?.quotesCount ??
    category?.quoteCount ??
    count ??
    category?._count?.quotes ??
    (Array.isArray(category?.quotes) ? category.quotes.length : 0);

  const actions = [
    { label: 'Edit Category', onClick: () => onEdit(category) },
    { separator: true },
    { label: isActive ? 'Deactivate' : 'Activate', onClick: () => onToggle(category), destructive: isActive },
    { separator: true },
    { label: 'Delete Category', onClick: () => onDelete(category), destructive: true },
  ];

  return (
    <div className="grid items-center gap-1.5 py-2.5 px-2" style={{ gridTemplateColumns: COLUMNS }}>
      {/* Category name + slug */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border"
            style={{ backgroundColor: `${iconColor}1A`, borderColor: `${iconColor}33` }}
            aria-hidden="true"
          >
            <CategoryIcon category={category} size={14} color={iconColor} />
          </span>
          <p className="text-sm font-medium text-foreground truncate">{category.name}</p>
          {category.isPremium && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 uppercase tracking-wide flex-shrink-0">
              Premium
            </span>
          )}
        </div>
        <p className="text-[10px] text-foreground-tertiary truncate mt-0.5">/{category.slug}</p>
      </div>

      {/* Description */}
      <p className="text-xs text-foreground-secondary truncate min-w-0">
        {category.description || '—'}
      </p>

      {/* Sort Order */}
      <span className="text-xs text-foreground-secondary text-center tabular-nums">
        {category.sortOrder ?? 0}
      </span>

      {/* Quote count */}
      <span className="text-xs text-foreground-secondary text-center tabular-nums">
        {quoteCount ?? 0}
      </span>

      {/* Status */}
      <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-full border justify-center ${isActive ? STATUS_STYLES.active : STATUS_STYLES.inactive}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>

      {/* Actions */}
      <div className="flex justify-end">
        <ActionMenu actions={actions} />
      </div>
    </div>
  );
}

export default function CategoryTable({ categories = [], counts = {}, onEdit, onToggle, onDelete }) {
  if (categories.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="p-4 sm:p-5 md:p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Layers size={18} className="text-indigo-400" />
            All Categories
          </h2>
        </div>

        {/* Minimal-width wrapper for horizontal scroll on small viewports */}
        <div className="min-w-[600px]">
          {/* Header — same column grid as body */}
          <div className="grid items-center gap-1.5 px-2 pb-2 text-[10px] text-foreground-tertiary font-medium uppercase tracking-wider border-b border-border/50 mb-1" style={{ gridTemplateColumns: COLUMNS }}>
            <span>Category</span>
            <span>Description</span>
            <span className="text-center">Sort</span>
            <span className="text-center">Quotes</span>
            <span className="text-center">Status</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Body */}
          <div className="divide-y divide-border/50">
            {categories.map((category, i) => {
              const count =
                category?.quotesCount ??
                category?.quoteCount ??
                counts[category.slug] ??
                counts[category._id] ??
                category?._count?.quotes ??
                0;
              return (
                <motion.div key={category._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <CategoryRow
                    category={category}
                    count={count}
                    onEdit={onEdit}
                    onToggle={onToggle}
                    onDelete={onDelete}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
