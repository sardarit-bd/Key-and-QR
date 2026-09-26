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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tag, Save } from 'lucide-react';

function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function ProductCategoryDialog({
  open,
  onOpenChange,
  category,
  onSave,
  isLoading = false,
}) {
  const isEdit = !!category;

  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState('true');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (category) {
        setName(category.name || '');
        setIsActive(category.isActive !== false ? 'true' : 'false');
      } else {
        setName('');
        setIsActive('true');
      }
      setErrors({});
    }
  }, [category, open]);

  const handleNameChange = (e) => {
    setName(e.target.value);
    setErrors((prev) => ({ ...prev, name: null }));
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrors({ name: 'Category name is required' });
      return;
    }

    // Auto-generate slug silently from name
    const autoSlug = generateSlug(trimmedName);

    onSave({
      id: category?._id || category?.id,
      name: trimmedName,
      slug: autoSlug,
      isActive: isActive === 'true',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md font-sans p-6 rounded-2xl border border-border bg-popover text-popover-foreground">
        <DialogHeader className="mb-4 border-b border-border/40 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Tag size={20} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {isEdit ? 'Edit Product Category' : 'Add Product Category'}
              </DialogTitle>
              <DialogDescription className="text-xs text-foreground-tertiary">
                {isEdit
                  ? 'Update physical product category details.'
                  : 'Create a new physical product category for merchandise.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Category Name */}
          <div className="space-y-1.5">
            <label htmlFor="cat-name" className="block text-xs font-semibold text-foreground-secondary">
              Category Name *
            </label>
            <Input
              id="cat-name"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. NFC Keychains, Smart Cards, Tags"
              className={`h-10 rounded-xl bg-background/50 border-border/70 ${errors.name ? 'border-destructive' : ''}`}
            />
            {errors.name && <p className="text-xs text-destructive font-medium">{errors.name}</p>}
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label htmlFor="cat-status" className="block text-xs font-semibold text-foreground-secondary">
              Status
            </label>
            <Select value={isActive} onValueChange={setIsActive}>
              <SelectTrigger id="cat-status" className="h-10 rounded-xl bg-background/50 border-border/70 w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="w-full flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="h-10 px-4 rounded-lg border border-[#2A2D35] bg-transparent text-[#9BA1AD] hover:bg-[#24272D] hover:text-white font-medium transition-colors cursor-pointer select-none"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="h-10 px-5 rounded-lg bg-[#1E2025] hover:bg-[#282B32] text-white border border-[#323640] font-medium shadow-sm transition-all cursor-pointer select-none flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
          >
            {isLoading ? 'Saving...' : (
              <><Save size={15} /> {isEdit ? 'Save Changes' : 'Create Category'}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
