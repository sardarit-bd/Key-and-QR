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
import { Upload, X, Save, Package, GripVertical } from 'lucide-react';

const CATEGORIES = [
  'Smart NFC Keychain',
  'Digital Keychain',
  'RFID Card',
  'Smart Tag',
  'Accessories',
  'Other',
];

const STATUS_OPTIONS = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

function getInitials(name) {
  return name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'P';
}

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
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState('');
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
        setCategory(product.category || '');
        setBrand(product.brand || '');
        setStock(String(product.stock ?? ''));
        setDescription(product.description || '');
        setIsActive(product.isActive !== false ? 'true' : 'false');
        setImageFile(null);
        setImagePreview(product.image?.url || null);
        setGalleryFiles([]);
        setGalleryPreviews(product.gallery?.map((g) => g.url) || []);
      } else {
        setName('');
        setPrice('');
        setCategory('');
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
  }, []);

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
        setErrors((prev) => ({ ...prev, gallery: 'Each image must be under 5MB' }));
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setGalleryFiles((prev) => [...prev, ...validFiles]);
    setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    setErrors((prev) => ({ ...prev, gallery: null }));
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const removeGalleryImage = (index) => {
    const preview = galleryPreviews[index];
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const moveGalleryImage = (fromIndex, direction) => {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= galleryPreviews.length) return;

    const newFiles = [...galleryFiles];
    const newPreviews = [...galleryPreviews];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    const [movedPreview] = newPreviews.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    newPreviews.splice(toIndex, 0, movedPreview);
    setGalleryFiles(newFiles);
    setGalleryPreviews(newPreviews);
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) newErrors.price = 'Valid price required';
    if (!category) newErrors.category = 'Category is required';
    if (stock === '' || isNaN(Number(stock)) || Number(stock) < 0) newErrors.stock = 'Valid stock required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (mode === 'create' && !imageFile && !product?.image?.url) newErrors.image = 'Product image required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('price', price);
    formData.append('category', category);
    formData.append('brand', brand.trim());
    formData.append('stock', stock);
    formData.append('description', description.trim());
    formData.append('isActive', isActive === 'true' ? 'true' : 'false');

    if (imageFile) {
      formData.append('image', imageFile);
    }

    // Append gallery files
    galleryFiles.forEach((file) => {
      formData.append('gallery', file);
    });

    onSave({ formData, id: product?._id });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
            <Package size={24} className="text-primary" />
          </div>
          <DialogTitle>{mode === 'create' ? 'Add Product' : 'Edit Product'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Create a new product in the catalog.' : 'Update product information.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Main Image upload */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground-secondary">Main Image</label>
            <div
              className={`relative w-full h-36 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors ${imagePreview ? 'border-primary/30' : 'border-border'} ${errors.image ? 'border-destructive' : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors cursor-pointer"
                  >
                    <X size={14} className="text-foreground-tertiary" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-foreground-tertiary">
                  <Upload size={24} />
                  <span className="text-xs">Click to upload main image</span>
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
            {errors.image && <p className="text-[11px] text-destructive">{errors.image}</p>}
          </div>

          {/* Gallery Images */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground-secondary">Gallery Images (optional)</label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {galleryPreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-lg border border-border overflow-hidden group">
                  <img src={preview} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center hover:bg-red-500 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                  {galleryPreviews.length > 1 && (
                    <div className="absolute top-1 left-1 flex gap-0.5">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => moveGalleryImage(index, -1)}
                          className="w-5 h-5 rounded bg-background/80 flex items-center justify-center hover:bg-background transition-colors cursor-pointer text-[10px] text-foreground"
                          title="Move left"
                        >
                          ←
                        </button>
                      )}
                      {index < galleryPreviews.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveGalleryImage(index, 1)}
                          className="w-5 h-5 rounded bg-background/80 flex items-center justify-center hover:bg-background transition-colors cursor-pointer text-[10px] text-foreground"
                          title="Move right"
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
                  className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => galleryInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-1 text-foreground-tertiary">
                    <Upload size={16} />
                    <span className="text-[10px]">Add</span>
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
            {errors.gallery && <p className="text-[11px] text-destructive">{errors.gallery}</p>}
            <p className="text-[10px] text-foreground-tertiary">Up to 5 images. Drag to reorder after adding.</p>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="prod-name" className="block text-xs font-medium text-foreground-secondary">Product Name</label>
            <Input id="prod-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter product name" className={errors.name ? 'border-destructive' : ''} />
            {errors.name && <p className="text-[11px] text-destructive">{errors.name}</p>}
          </div>

          {/* Category + Brand row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="prod-category" className="block text-xs font-medium text-foreground-secondary">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="prod-category" className="w-full h-9">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-[11px] text-destructive">{errors.category}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="prod-brand" className="block text-xs font-medium text-foreground-secondary">Brand</label>
              <Input id="prod-brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand (optional)" />
            </div>
          </div>

          {/* Price + Stock row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="prod-price" className="block text-xs font-medium text-foreground-secondary">Price ($)</label>
              <Input id="prod-price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className={errors.price ? 'border-destructive' : ''} />
              {errors.price && <p className="text-[11px] text-destructive">{errors.price}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="prod-stock" className="block text-xs font-medium text-foreground-secondary">Stock</label>
              <Input id="prod-stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" className={errors.stock ? 'border-destructive' : ''} />
              {errors.stock && <p className="text-[11px] text-destructive">{errors.stock}</p>}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label htmlFor="prod-status" className="block text-xs font-medium text-foreground-secondary">Status</label>
            <Select value={isActive} onValueChange={setIsActive}>
              <SelectTrigger id="prod-status" className="w-full h-9">
                <SelectValue placeholder="Select" />
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
            <label htmlFor="prod-desc" className="block text-xs font-medium text-foreground-secondary">Description</label>
            <Textarea id="prod-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Product description..." rows={3} className={errors.description ? 'border-destructive' : ''} />
            {errors.description && <p className="text-[11px] text-destructive">{errors.description}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : (
              <><Save size={15} className="mr-1" /> {mode === 'create' ? 'Create Product' : 'Save Changes'}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
