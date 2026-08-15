'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Package, Tag, DollarSign, Layers, Calendar, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const PLACEHOLDER_IMG = 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`;
}

function StockDisplay({ stock }) {
  let style = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  let label = 'In Stock';
  let Icon = CheckCircle2;
  
  if (stock <= 0) {
    style = 'text-red-500 bg-red-500/10 border-red-500/20';
    label = 'Out of Stock';
    Icon = AlertCircle;
  } else if (stock <= 2) {
    style = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    label = 'Low Stock';
    Icon = AlertCircle;
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${style}`}>
      <Icon size={12} />
      {stock} — {label}
    </span>
  );
}

function DetailRow({ icon: Icon, label, value, className = '' }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={13} className="text-foreground-tertiary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-foreground-tertiary font-semibold uppercase tracking-wider">{label}</p>
        <div className={`text-sm text-foreground mt-0.5 font-medium ${className}`}>{value || '—'}</div>
      </div>
    </div>
  );
}

export default function ProductViewDialog({ open, onOpenChange, product, isLoading = false }) {
  const imgSrc = product?.image?.url || PLACEHOLDER_IMG;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto font-sans p-6 rounded-2xl border border-border bg-popover text-popover-foreground">
        <DialogHeader className="mb-4 border-b border-border/40 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Package size={20} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">Product Details</DialogTitle>
              <DialogDescription className="text-xs text-foreground-tertiary">Detailed catalog information and availability status.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-4">
            <div className="md:col-span-5">
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
            <div className="md:col-span-7 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
            </div>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-2">
            {/* LEFT COLUMN: Media & Basic Info */}
            <div className="md:col-span-5 space-y-4">
              <div className="w-full h-48 rounded-xl bg-muted overflow-hidden border border-border/50 shadow-inner">
                <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Catalog Status</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${product.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <DetailRow icon={Calendar} label="Created At" value={formatDate(product.createdAt)} />
                {product.updatedAt && <DetailRow icon={Calendar} label="Last Updated" value={formatDate(product.updatedAt)} />}
              </div>
            </div>

            {/* RIGHT COLUMN: Metadata & Details */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1 leading-snug">{product.name}</h3>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
                    <Tag size={10} />
                    {product.category}
                  </span>
                  {product.brand && (
                    <span className="inline-flex items-center gap-1 text-xs bg-muted text-foreground-secondary border border-border px-2 py-0.5 rounded-full font-medium">
                      <Layers size={10} />
                      {product.brand}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <DetailRow icon={DollarSign} label="List Price" value={formatPrice(product.price)} className="text-base font-extrabold text-primary" />
                <DetailRow icon={Package} label="Inventory Stock" value={<StockDisplay stock={product.stock} />} />
                {product.description && (
                  <DetailRow icon={FileText} label="Description / Specs" value={product.description} className="text-foreground-secondary whitespace-pre-line leading-relaxed" />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center bg-muted/10 border border-dashed border-border rounded-xl">
            <p className="text-sm text-foreground-tertiary">Product not found.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
