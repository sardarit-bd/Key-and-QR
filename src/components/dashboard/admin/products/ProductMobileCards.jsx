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

  return <span className={`text-[10px] px-2 py-0.5 rounded-full border ${style}`}>{stock}</span>;
}

function getActions({ product, viewTrash, onView, onEdit, onDelete, onRestore, onPermanentDelete }) {
  if (viewTrash) {
    return [
      { label: 'Restore', onClick: () => onRestore(product._id) },
      { separator: true },
      { label: 'Delete Permanently', onClick: () => onPermanentDelete(product._id), destructive: true },
    ];
  }
  return [
    { label: 'View', onClick: () => onView(product) },
    { label: 'Edit', onClick: () => onEdit(product) },
    { separator: true },
    ...(product.isActive
      ? [{ label: 'Move to Trash', onClick: () => onDelete(product._id), destructive: true }]
      : [{ label: 'Restore', onClick: () => onRestore(product._id) }]),
  ];
}

function ProductCard({ product, viewTrash, onView, onEdit, onDelete, onRestore, onPermanentDelete }) {
  const actions = getActions({ product, viewTrash, onView, onEdit, onDelete, onRestore, onPermanentDelete });
  const imgSrc = product.image?.url || PLACEHOLDER_IMG;

  return (
    <div className="flex items-start gap-3 py-3 px-1 hover:bg-muted/30 rounded-lg transition-colors cursor-pointer">
      <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0 mt-0.5">
        <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
          <ActionMenu actions={actions} />
        </div>
        <p className="text-xs text-foreground-tertiary truncate mt-0.5">{product.category}</p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-sm font-semibold text-foreground">{formatPrice(product.price)}</span>
          <StockBadge stock={product.stock} />
          <span className="text-[10px] text-foreground-tertiary ml-auto">{formatDate(product.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

export default function ProductMobileCards({ products = [], viewTrash = false, onView, onEdit, onDelete, onRestore, onPermanentDelete }) {
  if (products.length === 0) return null;

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
            <Package size={18} className="text-indigo-400" />
            {viewTrash ? 'Trash' : 'All Products'}
          </h2>
        </div>
        <div className="divide-y divide-border/50">
          {products.map((product, i) => (
            <motion.div key={product._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
              <ProductCard product={product} viewTrash={viewTrash} onView={onView} onEdit={onEdit} onDelete={onDelete} onRestore={onRestore} onPermanentDelete={onPermanentDelete} />
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
