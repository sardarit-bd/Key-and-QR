'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Package, Tag, DollarSign, Layers, Calendar, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const PLACEHOLDER_IMG = 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`;
}

function StockDisplay({ stock }) {
  let style = 'text-emerald-400';
  let label = 'In Stock';
  if (stock <= 0) { style = 'text-red-400'; label = 'Out of Stock'; }
  else if (stock <= 2) { style = 'text-amber-400'; label = 'Low Stock'; }

  return (
    <span className={`text-sm font-medium ${style}`}>
      {stock} — {label}
    </span>
  );
}

function DetailRow({ icon: Icon, label, value, className = '' }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-foreground-tertiary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider">{label}</p>
        <p className={`text-sm text-foreground mt-0.5 ${className}`}>{value || '—'}</p>
      </div>
    </div>
  );
}

export default function ProductViewDialog({ open, onOpenChange, product, isLoading = false }) {
  const imgSrc = product?.image?.url || PLACEHOLDER_IMG;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
          </div>
        ) : product ? (
          <div className="py-2 space-y-4">
            {/* Image */}
            <div className="w-full h-44 rounded-xl bg-muted overflow-hidden">
              <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
            </div>

            {/* Name + status badge */}
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-foreground">{product.name}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${product.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {product.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <DetailRow icon={Tag} label="Category" value={product.category} />
            <DetailRow icon={Layers} label="Brand" value={product.brand || '—'} />
            <DetailRow icon={DollarSign} label="Price" value={formatPrice(product.price)} className="text-base font-bold" />
            <DetailRow icon={Package} label="Stock" value={<StockDisplay stock={product.stock} />} />
            {product.description && (
              <DetailRow icon={FileText} label="Description" value={product.description} />
            )}
            <DetailRow icon={Calendar} label="Created" value={formatDate(product.createdAt)} />
            {product.updatedAt && <DetailRow icon={Calendar} label="Updated" value={formatDate(product.updatedAt)} />}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-foreground-tertiary">Product not found.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
