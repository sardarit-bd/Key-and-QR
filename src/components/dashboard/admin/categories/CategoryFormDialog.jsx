'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layers, Minus, Plus } from 'lucide-react';
import CategoryIconPicker from './CategoryIconPicker';
import categoryService from '@/services/category-service/category.service';

const PRESET_COLORS = [
  '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316',
  '#10b981', '#eab308', '#06b6d4', '#3b82f6', '#ec4899',
];

export default function CategoryFormDialog({ open, onOpenChange, onSave, category = null, isLoading = false }) {
  const isEdit = !!category;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [icon, setIcon] = useState('Sparkles');
  const [iconType, setIconType] = useState('library');
  const [iconUrl, setIconUrl] = useState(null);
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState('');
  const [iconUploading, setIconUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(category?.name || '');
      setDescription(category?.description || '');
      setColor(category?.color || '#6366f1');
      setIcon(category?.icon || 'Sparkles');
      setIconType(category?.iconType === 'custom' ? 'custom' : 'library');
      setIconUrl(category?.iconType === 'custom' ? category?.iconUrl || null : null);
      setSortOrder(category?.sortOrder ?? 0);
      setIsActive(category?.isActive ?? true);
      setIsPremium(category?.isPremium ?? false);
      setError('');
    }
  }, [open, category]);

  const validate = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) { setError('Category name must be at least 2 characters'); return false; }
    if (trimmed.length > 50) { setError('Category name cannot exceed 50 characters'); return false; }
    if (description.length > 500) { setError('Description cannot exceed 500 characters'); return false; }
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) { setError('Color must be a valid hex color'); return false; }
    if (sortOrder < 0) { setError('Sort order cannot be negative'); return false; }
    if (iconType === 'custom' && !iconUrl) { setError('Upload a custom SVG icon or switch back to the library'); return false; }
    return true;
  };

  const handleCustomIconUpload = async (file) => {
    if (!file) return;
    setIconUploading(true);
    setError('');
    try {
      const result = await categoryService.uploadCategoryIcon(file);
      const url = result?.url;
      if (!url) throw new Error('Upload failed');
      setIconUrl(url);
      setIconType('custom');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Icon upload failed');
    } finally {
      setIconUploading(false);
    }
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      name: name.trim(),
      description: description.trim() || null,
      color,
      icon: iconType === 'custom' ? 'custom-svg' : icon,
      iconType,
      iconUrl: iconType === 'custom' ? iconUrl : null,
      sortOrder: Number(sortOrder) || 0,
      isActive,
      isPremium,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
            <Layers size={24} className="text-primary" />
          </div>
          <DialogTitle>{isEdit ? 'Edit Category' : 'Create Category'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the category details below.'
              : 'Add a new quote category. The slug is auto-generated from the name.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="cat-name" className="block text-xs font-medium text-foreground-secondary">Category Name *</label>
            <Input
              id="cat-name" value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="e.g. Motivation"
              className={`text-sm ${error ? 'border-destructive' : ''}`}
              maxLength={50} aria-required="true"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="cat-desc" className="block text-xs font-medium text-foreground-secondary">Description</label>
            <Input
              id="cat-desc" value={description}
              onChange={(e) => { setDescription(e.target.value); setError(''); }}
              placeholder="Short description of this category"
              className="text-sm" maxLength={500}
            />
          </div>

          {/* Icon + Color — full width in the wider modal (no cramped 2-col grid) */}
          <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
            {/* Icon picker — takes available space */}
            <div className="space-y-1.5 min-w-0">
              <label htmlFor="cat-icon" className="block text-xs font-medium text-foreground-secondary">Icon</label>
              <CategoryIconPicker
                value={icon}
                onSelect={(name) => { setIcon(name || 'Sparkles'); setIconType('library'); setIconUrl(null); }}
                color={color}
                iconType={iconType}
                iconUrl={iconUrl}
                onCustomUpload={handleCustomIconUpload}
                uploading={iconUploading}
              />
              {iconType === 'custom' && iconUrl && (
                <p className="text-[10px] text-foreground-tertiary flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40 inline-flex items-center justify-center text-[8px] text-emerald-400">✓</span>
                  Custom SVG uploaded
                </p>
              )}
            </div>

            {/* Color — compact column */}
            <div className="space-y-1.5 pt-0.5">
              <label className="block text-xs font-medium text-foreground-secondary">Color</label>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-5 gap-1 w-fit">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c} type="button"
                      onClick={() => setColor(c)}
                      className={`w-5 h-5 rounded-full border-2 transition-all cursor-pointer ${color.toLowerCase() === c.toLowerCase() ? 'border-foreground scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                      aria-label={`Select color ${c}`}
                    />
                  ))}
                </div>
                <Input
                  type="color" value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-9 h-9 p-0.5 cursor-pointer"
                  aria-label="Custom color picker"
                />
              </div>
            </div>
          </div>

          {/* Sort Order */}
          <div className="space-y-1.5">
            <label htmlFor="cat-sort" className="block text-xs font-medium text-foreground-secondary">Sort Order</label>
            <div className="flex items-center gap-2">
              <div className="flex items-stretch rounded-lg border border-border overflow-hidden">
                <button type="button" aria-label="Decrease sort order" onClick={() => setSortOrder((v) => Math.max(0, (Number(v) || 0) - 1))} disabled={sortOrder <= 0} className="w-9 h-9 flex items-center justify-center text-foreground-secondary hover:bg-muted/60 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <Minus size={14} />
                </button>
                <input id="cat-sort" type="number" min={0} value={sortOrder} onChange={(e) => { setSortOrder(Math.max(0, Number(e.target.value) || 0)); setError(''); }} className="w-14 text-center text-sm bg-transparent border-x border-border outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" aria-describedby="cat-sort-hint" aria-label="Sort order value" />
                <button type="button" aria-label="Increase sort order" onClick={() => setSortOrder((v) => (Number(v) || 0) + 1)} className="w-9 h-9 flex items-center justify-center text-foreground-secondary hover:bg-muted/60 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <p id="cat-sort-hint" className="text-[11px] text-foreground-tertiary">
              Controls the display order. Lower numbers appear first.
            </p>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3 pt-1">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-xs font-medium text-foreground-secondary">Active</span>
              <button type="button" role="switch" aria-checked={isActive} onClick={() => setIsActive((v) => !v)} className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${isActive ? 'bg-primary' : 'bg-muted'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isActive ? 'translate-x-4' : ''}`} />
              </button>
            </label>
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-xs font-medium text-foreground-secondary">Premium (locked for free users)</span>
              <button type="button" role="switch" aria-checked={isPremium} onClick={() => setIsPremium((v) => !v)} className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${isPremium ? 'bg-amber-500' : 'bg-muted'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isPremium ? 'translate-x-4' : ''}`} />
              </button>
            </label>
          </div>

          {error && <p className="text-[11px] text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
