'use client';

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Upload,
  Save,
  Loader2,
  RotateCcw,
  ExternalLink,
  ImageIcon as LucideImageIcon,
  CheckCircle2,
} from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import {
  useShopHeroContent,
  useUpdateShopHero,
  useUploadHeroImage,
} from '@/hooks/dashboard/useAdminHero';

export default function AdminShopHeroPage() {
  const { data: shopData, isLoading, isError, error, refetch } = useShopHeroContent();
  const updateShopHero = useUpdateShopHero();
  const uploadImage = useUploadHeroImage();

  const [imageUrl, setImageUrl] = useState('');
  const [publicId, setPublicId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  // Sync initial data from backend
  useEffect(() => {
    if (shopData && !hasChanged) {
      setImageUrl(shopData.imageUrl || '');
      setPublicId(shopData.publicId || '');
    }
  }, [shopData, hasChanged]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WebP)');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadImage.mutateAsync(file);
      setImageUrl(result.url);
      setPublicId(result.publicId || '');
      setHasChanged(true);
      toast.success('Shop banner uploaded. Click "Save Changes" to publish.');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleResetToDefault = () => {
    setImageUrl('');
    setPublicId('');
    setHasChanged(true);
    toast.success('Reset to default shop promotional banner');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateShopHero.mutateAsync({
        imageUrl: imageUrl.trim(),
        publicId: publicId.trim(),
      });
      setHasChanged(false);
      toast.success('Shop Hero image saved successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save Shop Hero image');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading skeleton
  if (isLoading && imageUrl === '' && !hasChanged) {
    return (
      <div className="min-h-screen p-4 sm:p-6 md:p-8 max-w-4xl mx-auto animate-pulse space-y-6">
        <div className="h-12 bg-card rounded-2xl border border-border w-72" />
        <div className="h-[420px] bg-card rounded-2xl border border-border" />
      </div>
    );
  }

  // Error state
  if (isError && !imageUrl && !hasChanged) {
    return (
      <div className="min-h-[70vh] p-4 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <LucideImageIcon size={28} />
          </div>
          <h2 className="text-lg font-bold text-foreground">Failed to Load Shop Hero</h2>
          <p className="text-xs text-foreground-secondary">{error?.message || 'Could not fetch Shop Hero data.'}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors text-sm cursor-pointer"
          >
            Retry Loading
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-5 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <ShoppingBag size={18} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Shop Hero Image
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-foreground-secondary mt-1">
            Manage the promotional campaign image displayed in the Shop page hero section.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || updateShopHero.isPending || (!hasChanged && imageUrl === (shopData?.imageUrl || ''))}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving || updateShopHero.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Main Image Management Card */}
      <Card className="p-5 sm:p-8 border-border/80 bg-card space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <LucideImageIcon size={16} className="text-primary" />
              Current Shop Hero Banner
            </h2>
            <p className="text-xs text-foreground-tertiary mt-0.5">
              Recommended dimensions: 1200 × 300px (or 4:1 / 3:1 aspect ratio) for optimal desktop & mobile display.
            </p>
          </div>

          {imageUrl ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              <CheckCircle2 size={13} /> Custom Banner Set
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground-tertiary bg-muted px-2.5 py-1 rounded-full">
              Default Branded Banner
            </span>
          )}
        </div>

        {/* Banner Preview Area */}
        <div className="space-y-3">
          <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden border-2 border-dashed border-border/80 bg-[#2E2A24] flex items-center justify-center shadow-inner group">
            {imageUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Shop Hero Banner Preview"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-[11px] text-white/90 font-medium">
                  Live Preview
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-[#A99B7F]">
                <div className="w-14 h-14 rounded-2xl bg-[#3E3830] flex items-center justify-center mb-3 text-[#C6922D]">
                  <LucideImageIcon size={26} />
                </div>
                <p className="text-sm font-semibold text-[#EDE4D0]">Default Warm Branded Gradient Active</p>
                <p className="text-xs text-[#A99B7F] mt-1 max-w-xs">
                  No custom image uploaded yet. The shop page will render the default theme banner.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Controls & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <label className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-xs hover:bg-primary/90 transition-all cursor-pointer shadow-sm w-full sm:w-auto">
              {uploading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Uploading to Cloudinary...
                </>
              ) : (
                <>
                  <Upload size={15} />
                  {imageUrl ? 'Change Image' : 'Upload Image'}
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
                aria-label="Upload shop hero image"
              />
            </label>

            {imageUrl && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-foreground-secondary font-medium text-xs hover:bg-muted transition-colors cursor-pointer w-full sm:w-auto"
              >
                <RotateCcw size={13} /> Reset to Default
              </button>
            )}
          </div>

          <a
            href="/shop"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-foreground-secondary hover:text-primary transition-colors"
          >
            <span>View Public Shop Page</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </Card>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: 'var(--popover)',
            color: 'var(--popover-foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </div>
  );
}
