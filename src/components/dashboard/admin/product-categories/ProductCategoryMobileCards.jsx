'use client';

import { motion } from 'framer-motion';
import { Tag, Edit2, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import ActionMenu from '../shared/ActionMenu';

const STATUS_STYLES = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  inactive: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

function ProductCategoryCard({ category, onEdit, onToggle, onDelete }) {
  const isActive = category.isActive;
  const actions = [
    { label: 'Edit Category', icon: Edit2, onClick: () => onEdit(category) },
    { separator: true },
    {
      label: isActive ? 'Deactivate' : 'Activate',
      icon: isActive ? ToggleLeft : ToggleRight,
      onClick: () => onToggle(category),
      destructive: isActive,
    },
    { separator: true },
    {
      label: 'Delete Category',
      icon: Trash2,
      onClick: () => onDelete(category),
      destructive: true,
    },
  ];

  return (
    <div className="group flex items-start gap-3 py-3 px-1 hover:bg-muted/30 rounded-lg transition-colors cursor-pointer">
      <div className="w-9 h-9 rounded-lg bg-muted/60 border border-border flex items-center justify-center shrink-0 mt-0.5">
        <Tag className="w-4 h-4 text-foreground-secondary group-hover:text-foreground transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground truncate" title={category.name}>
            {category.name}
          </p>
          <ActionMenu actions={actions} />
        </div>
        <p className="text-xs text-foreground-secondary truncate font-mono mt-0.5">
          /{category.slug}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
              isActive ? STATUS_STYLES.active : STATUS_STYLES.inactive
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
          {category.productCount !== undefined && (
            <span className="text-[10px] text-foreground-tertiary ml-auto">
              {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductCategoryMobileCards({
  categories = [],
  onEdit,
  onToggle,
  onDelete,
}) {
  if (categories.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="lg:hidden"
    >
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Tag size={18} className="text-muted-foreground" />
            All Categories
          </h2>
        </div>
        <div className="divide-y divide-border/50">
          {categories.map((category, i) => (
            <motion.div
              key={category._id || category.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <ProductCategoryCard
                category={category}
                onEdit={onEdit}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
