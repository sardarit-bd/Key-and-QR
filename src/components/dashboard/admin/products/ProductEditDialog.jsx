'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, X, Save, Package } from 'lucide-react';
import QuantityInput from '@/components/ui/QuantityInput';

// Dynamic categories fetched from backend
import { useCategories } from '@/hooks/dynamic-categories/useCategories';

const CategorySelect = () => {
  const { data: categories = [], isLoading } = useCategories();
  return (
    <Select value={category} onValueChange={(val) => { setCategory(val); setErrors((prev) => ({ ...prev, category: null })); }}>
      <SelectTrigger id="prod-category" className={`h-10 rounded-lg ${errors.category ? 'border-destructive' : ''}`}>
        <SelectValue placeholder="Select Category" />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem disabled value="loading">Loading...</SelectItem>
        ) : (
          categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

const STATUS_OPTIONS = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

function validateImageType(file) {
  return file.type.startsWith('image/');
}

function validateImageSize(file, maxBytes = 5 * 1024 * 1024) {
  return file.size <= maxBytes;
}

export default function ProductEditDialog({
  open,
  onOpenChange,
  product,
  onSave,
  isLoading = false,
  mode = 'edit',
}) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState('0');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState('true');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      if (product && mode === 'edit') {
        setName(product.name || '');
        setPrice(String(product.price ?? ''));
        setCategoryId(product.category?.id || product.category || '');
        setBrand(product.brand || '');
        setStock(String(product.stock ?? '0'));
        setDescription(product.description || '');
        setIsActive(product.isActive !== false ? 'true' : 'false');
        setImageFile(null);
        setImagePreview(product.image?.url || null);
        setGalleryFiles([]);
        setGalleryPreviews(product.gallery?.map((g) => g.url) || []);
      } else {
        setName('');
        setPrice('');
        setCategoryId('');
        setBrand('');
        setStock('0');
        setDescription('');
        setIsActive('true');
        setImageFile(null);
        setImagePreview(null);
        setGalleryFiles([]);
        setGalleryPreviews([]);
      }
      setErrors({});
    }
  }, [product, open, mode]);

  useEffect(() => {
    return () => {
      galleryPreviews.forEach((preview) => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [galleryPreviews]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateImageType(file)) {
      setErrors((prev) => ({ ...prev, image: 'Only image files are allowed' }));
      return;
    }

    if (!validateImageSize(file)) {
      setErrors((prev) => ({ ...prev, image: 'Image must be under 5MB' }));
      return;
    }

    if (imagePreview && imageFile && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: null }));
  };

  const removeImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGallerySelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      if (!validateImageType(file)) {
        setErrors((prev) => ({ ...prev, gallery: 'Only image files are allowed' }));
        return false;
      }
      if (!validateImageSize(file)) {
        setErrors((prev) => ({ ...prev, gallery: 'Each gallery image must be under 5MB' }));
        return false;
      }
      return true;
    });

    if (validFiles.length + galleryPreviews.length > 5) {
      setErrors((prev) => ({ ...prev, gallery: 'Maximum 5 gallery images allowed' }));
      return;
    }

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setGalleryFiles((prev) => [...prev, ...validFiles]);
    setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    setErrors((prev) => ({ ...prev, gallery: null }));
  };

  const removeGalleryImage = (index) => {
    const preview = galleryPreviews[index];
    if (preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }

    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));

    const previewIsBlob = preview.startsWith('blob:');
    if (previewIsBlob) {
      const blobIndex = galleryPreviews.slice(0, index).filter((p) => p.startsWith('blob:')).length;
      setGalleryFiles((prev) => prev.filter((_, i) => i !== blobIndex));
    }
  };

  const moveGalleryImage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= galleryPreviews.length) return;

    // Swap previews
    const newPreviews = [...galleryPreviews];
    const tempPreview = newPreviews[index];
    newPreviews[index] = newPreviews[targetIndex];
    newPreviews[targetIndex] = tempPreview;
    setGalleryPreviews(newPreviews);

    // Swap files (only blobs matter for files array)
    const isCurrentBlob = galleryPreviews[index].startsWith('blob:');
    const isTargetBlob = galleryPreviews[targetIndex].startsWith('blob:');

    if (isCurrentBlob && isTargetBlob) {
      const currentBlobIndex = galleryPreviews.slice(0, index).filter((p) => p.startsWith('blob:')).length;
      const targetBlobIndex = galleryPreviews.slice(0, targetIndex).filter((p) => p.startsWith('blob:')).length;

      const newFiles = [...galleryFiles];
      const tempFile = newFiles[currentBlobIndex];
      newFiles[currentBlobIndex] = newFiles[targetBlobIndex];
      newFiles[targetBlobIndex] = tempFile;
      setGalleryFiles(newFiles);
    }
  };

  const handleSave = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Product name required';
    if (!category) newErrors.category = 'Category required';
    if (!price || isNaN(Number(price)) || Number(price) < 0) newErrors.price = 'Valid price required';
    if (stock === '' || isNaN(Number(stock)) || Number(stock) < 0) newErrors.stock = 'Valid stock quantity required';
    if (mode === 'create' && !imageFile && !product?.image?.url) newErrors.image = 'Product image required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('price', Number(price));
    formData.append('category', category);
    formData.append('brand', brand.trim());
    formData.append('stock', Number(stock));
    formData.append('description', description.trim());
    formData.append('isActive', isActive === 'true');

    if (imageFile) {
      formData.append('image', imageFile);
    }

    galleryFiles.forEach((file) => {
      formData.append('gallery', file);
    });

    onSave({ formData, id: product?._id });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto font-sans p-6 rounded-2xl border border-border bg-popover text-popover-foreground">
        <DialogHeader className="mb-4 border-b border-border/40 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Package size={20} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {mode === 'create' ? 'Add Product' : 'Edit Product'}
              </DialogTitle>
              <DialogDescription className="text-xs text-foreground-tertiary">
                {mode === 'create' ? 'Create a new product in the catalog.' : 'Update product details and images.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-2">
          {/* LEFT COLUMN: Uploads & Previews */}
          <div className="md:col-span-5 space-y-4">
            {/* Main Image Upload */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-tertiary">Main Product Image</label>
              <div
                className={`relative w-full h-48 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors ${imagePreview ? 'border-primary/30' : 'border-border'} ${errors.image ? 'border-destructive' : ''}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors cursor-pointer shadow-sm"
                    >
                      <X size={14} className="text-foreground-tertiary" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-foreground-tertiary p-4 text-center">
                    <Upload size={24} />
                    <span className="text-xs font-medium">Click to upload main image</span>
                    <span className="text-[10px] text-foreground-tertiary/75">PNG, JPG or WebP (max 5MB)</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
              {errors.image && <p className="text-xs text-destructive font-medium">{errors.image}</p>}
            </div>

            {/* Gallery Uploads */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-tertiary">Gallery Images</label>
              <div className="grid grid-cols-4 gap-2">
                {galleryPreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg border border-border overflow-hidden group">
                    <img src={preview} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                    {galleryPreviews.length > 1 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {index > 0 && (
                          <button
                            type="button;button"
                            onClick={() => moveGalleryImage(index, -1)}
                            className="w-5 h-5 rounded bg-background/90 flex items-center justify-center hover:bg-background transition-colors cursor-pointer text-xs font-bold text-foreground shadow-sm"
                            title="Move Left"
                          >
                            ←
                          </button>
                        )}
                        {index < galleryPreviews.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveGalleryImage(index, 1)}
                            className="w-5 h-5 rounded bg-background/90 flex items-center justify-center hover:bg-background transition-colors cursor-pointer text-xs font-bold text-foreground shadow-sm"
                            title="Move Right"
                          >
                            →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {galleryPreviews.length < 5 && (
                  <div
                    className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/20"
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-0.5 text-foreground-tertiary">
                      <Upload size={14} />
                      <span className="text-[9px] font-medium">Add</span>
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                multiple
                onChange={handleGallerySelect}
                className="hidden"
              />
              {errors.gallery && <p className="text-xs text-destructive font-medium">{errors.gallery}</p>}
              <p className="text-[10px] text-foreground-tertiary">Upload up to 5 additional gallery images.</p>
            </div>
          </div>

          {/* RIGHT COLUMN: Form details */}
          <div className="md:col-span-7 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="prod-name" className="block text-xs font-semibold text-foreground-secondary">Product Name</label>
              <Input
                id="prod-name"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: null })); }}
                placeholder="Enter product name"
                className={`h-10 rounded-lg ${errors.name ? 'border-destructive' : ''}`}
              />
              {errors.name && <p className="text-xs text-destructive font-medium">{errors.name}</p>}
            </div>

            {/* Category + Brand row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="prod-category" className="block text-xs font-semibold text-foreground-secondary">Category</label>
                <Select value={category} onValueChange={(val) => { setCategory(val); setErrors((prev) => ({ ...prev, category: null })); }}>
                  <SelectTrigger id="prod-category" className={`h-10 rounded-lg ${errors.category ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive font-medium">{errors.category}</p>}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="prod-brand" className="block text-xs font-semibold text-foreground-secondary">Brand</label>
                <Input
                  id="prod-brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Brand (optional)"
                  className="h-10 rounded-lg"
                />
              </div>
            </div>

            {/* Price + Stock row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="prod-price" className="block text-xs font-semibold text-foreground-secondary">Price ($)</label>
                <Input
                  id="prod-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => { setPrice(e.target.value); setErrors((prev) => ({ ...prev, price: null })); }}
                  placeholder="0.00"
                  className={`h-10 rounded-lg ${errors.price ? 'border-destructive' : ''}`}
                />
                {errors.price && <p className="text-xs text-destructive font-medium">{errors.price}</p>}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="prod-stock" className="block text-xs font-semibold text-foreground-secondary">Stock Quantity</label>
                <div>
                  <QuantityInput
                    value={stock}
                    onChange={(val) => { setStock(String(val)); setErrors((prev) => ({ ...prev, stock: null })); }}
                    min={0}
                  />
                </div>
                {errors.stock && <p className="text-xs text-destructive font-medium">{errors.stock}</p>}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label htmlFor="prod-status" className="block text-xs font-semibold text-foreground-secondary">Status</label>
              <Select value={isActive} onValueChange={setIsActive}>
                <SelectTrigger id="prod-status" className="h-10 rounded-lg w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="prod-desc" className="block text-xs font-semibold text-foreground-secondary">Product Description</label>
              <Textarea
                id="prod-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description and specifications..."
                rows={3}
                className="rounded-lg resize-none"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 border-t border-border/40 pt-4 flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="h-10 rounded-lg px-4 cursor-pointer">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="h-10 rounded-lg px-5 flex items-center gap-1.5 cursor-pointer">
            {isLoading ? 'Saving...' : (
              <><Save size={15} /> {mode === 'create' ? 'Create Product' : 'Save Changes'}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
