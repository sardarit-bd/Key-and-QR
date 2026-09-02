'use client';

import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import ActionMenu from '../shared/ActionMenu';
import { CategoryIcon } from './categoryIconRegistry';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function CategoryCard({ category, count, onEdit, onToggle, onDelete }) {
  const isActive = category.isActive;
  const iconColor = category.color || '#6366f1';
  const quoteCount =
    count ??
    category?.quotesCount ??
    category?._count?.quotes ??
    category?.quoteCount ??
    (Array.isArray(category?.quotes) ? category.quotes.length : 0);

  const actions = [
    { label: 'Edit Category', onClick: () => onEdit(category) },
    { separator: true },
    { label: isActive ? 'Deactivate' : 'Activate', onClick: () => onToggle(category), destructive: isActive },
    { separator: true },
    { label: 'Delete Category', onClick: () => onDelete(category), destructive: true },
  ];

  return (
    <div className="flex items-start gap-3 py-3 px-1 hover:bg-muted/30 rounded-lg transition-colors">
      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border"
        style={{ backgroundColor: `${iconColor}1A`, borderColor: `${iconColor}33` }}
        aria-hidden="true"
      >
        <CategoryIcon category={category} size={18} color={iconColor} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground truncate">{category.name}</p>
          <ActionMenu actions={actions} />
        </div>
        <p className="text-[10px] text-foreground-tertiary truncate mt-0.5">/{category.slug}</p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
          {category.isPremium && (
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 uppercase tracking-wide">
              Premium
            </span>
          )}
          <span className="text-[10px] text-foreground-tertiary">{quoteCount || 0} quotes</span>
          <span className="text-[10px] text-foreground-tertiary">Sort {category.sortOrder ?? 0}</span>
          <span className="text-[10px] text-foreground-tertiary ml-auto">{formatDate(category.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

export default function CategoryMobileCards({ categories = [], counts = {}, onEdit, onToggle, onDelete }) {
  if (categories.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:hidden">
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Layers size={18} className="text-indigo-400" />
            All Categories
          </h2>
        </div>
        <div className="divide-y divide-border/50">
          {categories.map((category, i) => {
            const count =
              counts[category.slug] ??
              counts[category._id] ??
              category?.quotesCount ??
              category?._count?.quotes ??
              category?.quoteCount ??
              0;
            return (
              <motion.div key={category._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                <CategoryCard
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
      </Card>
    </motion.div>
  );
}
