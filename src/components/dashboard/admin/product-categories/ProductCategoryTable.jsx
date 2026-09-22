'use client';

import { motion } from 'framer-motion';
import { Tag, Edit2, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import ActionMenu from '../shared/ActionMenu';

const STATUS_STYLES = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  inactive: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

function ProductCategoryRow({ category, onEdit, onToggle, onDelete }) {
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
    <div className="group grid grid-cols-[minmax(0,2.5fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,60px)] items-center gap-2 py-3 px-2 hover:bg-muted/30 rounded-lg transition-colors cursor-pointer">
      {/* Category Name */}
      <div className="min-w-0 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted/60 border border-border flex items-center justify-center shrink-0">
          <Tag className="w-4 h-4 text-foreground-secondary group-hover:text-foreground transition-colors" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate" title={category.name}>
            {category.name}
          </p>
          {category.productCount !== undefined && (
            <p className="text-[10px] text-foreground-tertiary">
              {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
            </p>
          )}
        </div>
      </div>

      {/* Slug */}
      <div className="min-w-0">
        <span
          className="text-xs text-foreground-secondary truncate block font-mono"
          title={`/${category.slug}`}
        >
          /{category.slug}
        </span>
      </div>

      {/* Status */}
      <div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
            isActive ? STATUS_STYLES.active : STATUS_STYLES.inactive
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <ActionMenu actions={actions} />
      </div>
    </div>
  );
}

export default function ProductCategoryTable({
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
    >
      <Card className="p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Tag size={18} className="text-muted-foreground" />
            All Categories
          </h2>
        </div>

        {/* Scrollable table container */}
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            {/* Column labels */}
            <div className="grid grid-cols-[minmax(0,2.5fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,60px)] items-center gap-2 px-2 pb-2 text-[10px] text-foreground-tertiary font-medium uppercase tracking-wider border-b border-border/50 mb-1">
              <span>Category Name</span>
              <span>Slug</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-border/50">
              {categories.map((category, i) => (
                <motion.div
                  key={category._id || category.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <ProductCategoryRow
                    category={category}
                    onEdit={onEdit}
                    onToggle={onToggle}
                    onDelete={onDelete}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
