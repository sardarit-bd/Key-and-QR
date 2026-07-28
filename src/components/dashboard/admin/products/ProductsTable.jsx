'use client';

import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import ActionMenu from '../shared/ActionMenu';

const PLACEHOLDER_IMG = 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`;
}

function StockBadge({ stock }) {
  let style = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (stock <= 0) style = 'bg-red-500/10 text-red-400 border-red-500/20';
  else if (stock <= 2) style = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${style}`}>
      {stock}
    </span>
  );
}

function getActions({ product, viewTrash, onView, onEdit, onStatusToggle, onDelete, onRestore, onPermanentDelete }) {
  if (viewTrash) {
    return [
      { label: 'Restore', onClick: () => onRestore(product._id), icon: null },
      { separator: true },
      { label: 'Delete Permanently', onClick: () => onPermanentDelete(product._id), destructive: true, icon: null },
    ];
  }
  return [
    { label: 'View', onClick: () => onView(product) },
    { label: 'Edit', onClick: () => onEdit(product) },
    { separator: true },
    ...(product.isActive
      ? [{ label: 'Move to Trash', onClick: () => onDelete(product._id), destructive: true, icon: null }]
      : [{ label: 'Restore', onClick: () => onRestore(product._id), icon: null }]),
  ];
}

function ProductRow({ product, viewTrash, onView, onEdit, onDelete, onRestore, onPermanentDelete }) {
  const actions = getActions({ product, viewTrash, onView, onEdit, onStatusToggle: null, onDelete, onRestore, onPermanentDelete });
  const imgSrc = product.image?.url || PLACEHOLDER_IMG;

  return (
    <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,2.5fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,100px)_minmax(0,36px)] items-center gap-2 py-3 px-2 hover:bg-muted/30 rounded-lg transition-colors cursor-pointer">
      {/* Image */}
      <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
        <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
      </div>

      {/* Name */}
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
        {product.brand && (
          <p className="text-[10px] text-foreground-tertiary truncate">{product.brand}</p>
        )}
      </div>

      {/* Category */}
      <div className="text-xs text-foreground-secondary truncate">{product.category}</div>

      {/* Price */}
      <div className="text-sm font-semibold text-foreground">{formatPrice(product.price)}</div>

      {/* Stock */}
      <div><StockBadge stock={product.stock} /></div>

      {/* Date */}
      <div className="hidden md:block text-xs text-foreground-tertiary">{formatDate(product.createdAt)}</div>

      {/* Actions */}
      <div className="flex justify-end">
        <ActionMenu actions={actions} />
      </div>
    </div>
  );
}

export default function ProductsTable({
  products = [],
  viewTrash = false,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
}) {
  if (products.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Package size={18} className="text-indigo-400" />
            {viewTrash ? 'Trash' : 'All Products'}
          </h2>
        </div>

        {/* Column labels */}
        <div className="hidden lg:grid grid-cols-[minmax(0,0.8fr)_minmax(0,2.5fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,100px)_minmax(0,36px)] items-center gap-2 px-2 pb-2 text-[10px] text-foreground-tertiary font-medium uppercase tracking-wider border-b border-border/50 mb-1">
          <span>Image</span>
          <span>Name</span>
          <span>Category</span>
          <span>Price</span>
          <span>Stock</span>
          <span className="hidden md:inline">Created</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="divide-y divide-border/50">
          {products.map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <ProductRow
                product={product}
                viewTrash={viewTrash}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onRestore={onRestore}
                onPermanentDelete={onPermanentDelete}
              />
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
