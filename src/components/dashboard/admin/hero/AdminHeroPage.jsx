'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ImageIcon, Eye, Save, Loader2, ChevronDown } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import {
  useHeroContent,
  useUpdateHero,
  useUploadHeroImage,
  DEFAULT_HERO,
} from '@/hooks/dashboard/useAdminHero';
import { ALL_CATEGORY_ICON_NAMES } from '@/components/dashboard/admin/categories/categoryIconRegistry';
import { getCategoryIcon } from '@/components/category';

const INPUT_CLASS =
  'w-full h-10 px-3.5 rounded-xl border border-border/80 bg-background/80 text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all';
const TEXTAREA_CLASS =
  'w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background/80 text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all min-h-[90px]';
const LABEL_CLASS =
  'block text-[13px] font-medium text-foreground-secondary mb-1.5';
const SECTION_TITLE_CLASS =
  'text-[15px] font-semibold text-foreground flex items-center gap-2';

function Field({ label, children, hint }) {
  return (
    <div>
      <label className={LABEL_CLASS}>{label}</label>
      {children}
      {hint && <p className="text-[11px] text-foreground-tertiary mt-1">{hint}</p>}
    </div>
  );
}

function FeatureRow({ feature, index, onChange, onToggle }) {
  const IconComponent = getCategoryIcon(feature.icon);

  return (
    <div className="rounded-2xl border border-border/70 bg-card/40 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 border border-primary/20">
            <IconComponent size={16} className="text-primary" />
          </span>
          <span className="text-sm font-semibold text-foreground">Feature {index + 1}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <ChevronDown size={16} className="text-foreground-tertiary" />
            <input
              type="number"
              min={0}
              value={feature.order ?? index + 1}
              onChange={(e) => onChange(index, { ...feature, order: Number(e.target.value) || 0 })}
              aria-label={`Feature ${index + 1} order`}
              className="w-14 h-8 px-2 rounded-lg border border-border/80 bg-background/80 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={feature.enabled !== false}
              onChange={(e) => onChange(index, { ...feature, enabled: e.target.checked })}
              aria-label={`Feature ${index + 1} enabled`}
              className="h-4 w-4 rounded border-border accent-accent cursor-pointer"
            />
            <span className="text-xs text-foreground-secondary">Enabled</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label={`Icon`}>
          <div className="relative">
            <IconComponent
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary pointer-events-none"
            />
            <select
              value={feature.icon || 'Sparkles'}
              onChange={(e) => onChange(index, { ...feature, icon: e.target.value })}
              aria-label={`Feature ${index + 1} icon`}
              className={`${INPUT_CLASS} pl-9 appearance-none cursor-pointer`}
            >
              {ALL_CATEGORY_ICON_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </Field>
        <Field label="Title">
          <input
            type="text"
            value={feature.title || ''}
            onChange={(e) => onChange(index, { ...feature, title: e.target.value })}
            aria-label={`Feature ${index + 1} title`}
            maxLength={150}
            placeholder="Feature title"
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          value={feature.description || ''}
          onChange={(e) => onChange(index, { ...feature, description: e.target.value })}
          aria-label={`Feature ${index + 1} description`}
          maxLength={500}
          placeholder="Optional feature description"
          className={`${TEXTAREA_CLASS} min-h-[60px]`}
        />
      </Field>
    </div>
  );
}

export default function AdminHeroPage() {
  const { data: heroData, isLoading, isError, error, refetch } = useHeroContent();
  const updateHero = useUpdateHero();
  const uploadImage = useUploadHeroImage();

  const [form, setForm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize form from fetched data (or defaults)
  useEffect(() => {
    if (!form && heroData) {
      setForm({
        eyebrow: heroData.eyebrow ?? DEFAULT_HERO.eyebrow,
        title: heroData.title ?? DEFAULT_HERO.title,
        description: heroData.description ?? DEFAULT_HERO.description,
        primaryCta: {
          label: heroData.primaryCta?.label ?? DEFAULT_HERO.primaryCta.label,
          href: heroData.primaryCta?.href ?? DEFAULT_HERO.primaryCta.href,
        },
        secondaryCta: {
          label: heroData.secondaryCta?.label ?? DEFAULT_HERO.secondaryCta.label,
          href: heroData.secondaryCta?.href ?? DEFAULT_HERO.secondaryCta.href,
        },
        heroImage: {
          url: heroData.heroImage?.url ?? DEFAULT_HERO.heroImage.url,
          publicId: heroData.heroImage?.publicId ?? '',
          alt: heroData.heroImage?.alt ?? '',
        },
        features: Array.isArray(heroData.features) && heroData.features.length > 0
          ? heroData.features.map((f, i) => ({
              icon: f.icon || 'Sparkles',
              title: f.title || '',
              description: f.description || '',
              enabled: f.enabled !== false,
              order: f.order ?? i + 1,
            }))
          : DEFAULT_HERO.features.map((f, i) => ({ ...f, order: i + 1 })),
        enabled: heroData.enabled !== false,
      });
    }
  }, [heroData, form]);

  const set = useCallback((field) => (value) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  }, []);

  const setCta = useCallback((which, field) => (value) => {
    setForm((prev) =>
      prev
        ? { ...prev, [which]: { ...prev[which], [field]: value } }
        : prev
    );
  }, []);

  const setHeroImage = useCallback((patch) => {
    setForm((prev) => (prev ? { ...prev, heroImage: { ...prev.heroImage, ...patch } } : prev));
  }, []);

  const setFeature = useCallback((index, updated) => {
    setForm((prev) => {
      if (!prev) return prev;
      const features = [...prev.features];
      features[index] = updated;
      return { ...prev, features };
    });
  }, []);

  const toggleFeature = useCallback((index) => {
    setForm((prev) => {
      if (!prev) return prev;
      const features = [...prev.features];
      features[index] = { ...features[index], enabled: features[index].enabled !== false ? false : true };
      return { ...prev, features };
    });
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadImage.mutateAsync(file);
      setHeroImage({ url: result.url, publicId: result.publicId || '' });
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setHeroImage({ url: '', publicId: '', alt: form?.heroImage?.alt || '' });
  };

  const handleSave = async () => {
    if (!form) return;
    setIsSaving(true);
    try {
      const payload = {
        eyebrow: form.eyebrow,
        title: form.title,
        description: form.description,
        primaryCta: form.primaryCta,
        secondaryCta: form.secondaryCta,
        heroImage: form.heroImage,
        features: form.features
          .filter((f) => f.enabled !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map(({ icon, title, description, enabled, order }) => ({
            icon: icon || 'Sparkles',
            title: title || '',
            description: description || '',
            enabled: true,
            order: order ?? 0,
          })),
        enabled: form.enabled,
      };
      await updateHero.mutateAsync(payload);
      toast.success('Hero section saved successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save hero section');
    } finally {
      setIsSaving(false);
    }
  };

  // ---------- Loading ----------
  if (isLoading && !form) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 animate-pulse">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="h-10 bg-card rounded-2xl border border-border w-72" />
          <div className="h-[400px] bg-card rounded-[22px] border border-border" />
        </div>
      </div>
    );
  }

  // ---------- Error ----------
  if (isError && !form) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <ImageIcon size={28} className="text-destructive" />
          </div>
          <p className="text-destructive text-sm mb-2 font-medium">Failed to load hero section</p>
          <p className="text-foreground-tertiary text-xs mb-6">{error?.message || 'An unexpected error occurred.'}</p>
          <button onClick={() => refetch()} className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors cursor-pointer">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!form) return null;

  const orderedFeatures = [...form.features].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
                  <ImageIcon size={20} className="text-primary" />
                </span>
                Hero Section
              </h1>
              <p className="text-sm text-foreground-secondary mt-2 ml-[52px]">
                Manage the homepage hero content, image, and features.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2.5 border border-border text-foreground-secondary font-medium rounded-xl hover:bg-muted transition-colors text-sm cursor-pointer inline-flex items-center gap-2"
              >
                <Eye size={15} />
                {showPreview ? 'Hide Preview' : 'Preview'}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || updateHero.isPending}
                className="px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors text-sm cursor-pointer inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving || updateHero.isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Visibility */}
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Hero Section Visible</p>
              <p className="text-xs text-foreground-tertiary mt-0.5">
                When disabled, the homepage hero is hidden.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.enabled !== false}
                onChange={(e) => set('enabled')(e.target.checked)}
                aria-label="Enable hero section"
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>
        </Card>

        {/* Content */}
        <Card className="p-5 sm:p-6 space-y-4">
          <h2 className={SECTION_TITLE_CLASS}>Content</h2>
          <Field label="Eyebrow text">
            <input
              type="text"
              value={form.eyebrow || ''}
              onChange={(e) => set('eyebrow')(e.target.value)}
              maxLength={200}
              placeholder="ONE SCAN. A BETTER YOU."
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Heading">
            <textarea
              value={form.title || ''}
              onChange={(e) => set('title')(e.target.value)}
              maxLength={300}
              placeholder="Carry inspiration. Share what matters."
              className={`${TEXTAREA_CLASS} min-h-[70px]`}
            />
          </Field>
          <Field label="Description">
            <textarea
              value={form.description || ''}
              onChange={(e) => set('description')(e.target.value)}
              maxLength={1000}
              placeholder="Describe your product..."
              className={TEXTAREA_CLASS}
            />
          </Field>
        </Card>

        {/* Call To Actions */}
        <Card className="p-5 sm:p-6 space-y-4">
          <h2 className={SECTION_TITLE_CLASS}>Call To Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Primary CTA Label">
              <input
                type="text"
                value={form.primaryCta.label || ''}
                onChange={(e) => setCta('primaryCta', 'label')(e.target.value)}
                maxLength={100}
                placeholder="Shop Collection"
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Primary CTA Link">
              <input
                type="text"
                value={form.primaryCta.href || ''}
                onChange={(e) => setCta('primaryCta', 'href')(e.target.value)}
                maxLength={500}
                placeholder="/shop"
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Secondary CTA Label">
              <input
                type="text"
                value={form.secondaryCta.label || ''}
                onChange={(e) => setCta('secondaryCta', 'label')(e.target.value)}
                maxLength={100}
                placeholder="How It Works"
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Secondary CTA Link">
              <input
                type="text"
                value={form.secondaryCta.href || ''}
                onChange={(e) => setCta('secondaryCta', 'href')(e.target.value)}
                maxLength={500}
                placeholder="/how-it-works"
                className={INPUT_CLASS}
              />
            </Field>
          </div>
        </Card>

        {/* Hero Image */}
        <Card className="p-5 sm:p-6 space-y-4">
          <h2 className={SECTION_TITLE_CLASS}>Hero Image</h2>

          <div className="rounded-2xl border border-border/70 bg-card/40 p-4">
            {form.heroImage.url ? (
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.heroImage.url}
                  alt={form.heroImage.alt || 'Hero image preview'}
                  className="w-full sm:w-64 h-40 object-cover rounded-xl border border-border/60"
                />
                <div className="flex-1 space-y-3 w-full">
                  <Field label="Alt text">
                    <input
                      type="text"
                      value={form.heroImage.alt || ''}
                      onChange={(e) => setHeroImage({ alt: e.target.value })}
                      maxLength={300}
                      placeholder="Describe the hero image"
                      className={INPUT_CLASS}
                    />
                  </Field>
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-foreground-secondary font-medium text-sm hover:bg-muted transition-colors cursor-pointer">
                      {uploading ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <ImageIcon size={15} />
                      )}
                      {uploading ? 'Uploading...' : 'Upload New Image'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                        aria-label="Upload hero image"
                      />
                    </label>
                    <button
                      onClick={handleRemoveImage}
                      disabled={uploading}
                      className="px-4 py-2 rounded-xl border border-destructive/30 text-destructive font-medium text-sm hover:bg-destructive/10 transition-colors cursor-pointer disabled:opacity-60"
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center">
                  <ImageIcon size={28} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-foreground-tertiary">No hero image set</p>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-foreground-secondary font-medium text-sm hover:bg-muted transition-colors cursor-pointer">
                  {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImageIcon size={15} />}
                  {uploading ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                    aria-label="Upload hero image"
                  />
                </label>
              </div>
            )}
          </div>
        </Card>

        {/* Features */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={SECTION_TITLE_CLASS}>Features</h2>
            <button
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  features: [
                    ...prev.features,
                    { icon: 'Sparkles', title: '', description: '', enabled: true, order: prev.features.length + 1 },
                  ],
                }))
              }
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground-secondary hover:bg-muted transition-colors cursor-pointer"
            >
              + Add Feature
            </button>
          </div>
          <p className="text-xs text-foreground-tertiary -mt-2">
            Features shown below the CTA buttons. Disabled features are hidden from the homepage.
          </p>
          <div className="space-y-4">
            {orderedFeatures.map((feature, i) => (
              <FeatureRow
                key={`${feature.order}-${feature.title || i}`}
                feature={feature}
                index={i}
                onChange={setFeature}
                onToggle={toggleFeature}
              />
            ))}
            {form.features.length === 0 && (
              <p className="text-sm text-foreground-tertiary py-4 text-center">
                No features. Add one above.
              </p>
            )}
          </div>
        </Card>

        {/* Preview modal */}
        {showPreview && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 backdrop-blur-sm px-4 py-8 overflow-y-auto"
            onClick={() => setShowPreview(false)}
          >
            <div
              className="relative w-full max-w-3xl rounded-[24px] border border-accent/20 bg-card shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
                <h3 className="text-sm font-semibold text-foreground">Hero Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-1.5 rounded-lg hover:bg-muted text-foreground-secondary transition-colors cursor-pointer"
                  aria-label="Close preview"
                >
                  ✕
                </button>
              </div>
              <div className="p-5 sm:p-6 bg-[#FAF9F7] dark:bg-background">
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-border/40">
                  {form.heroImage.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.heroImage.url}
                      alt={form.heroImage.alt || 'Hero preview'}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FAF9F7] via-[#FAF9F7]/95 to-transparent" />
                  <div className="relative z-10 h-full flex flex-col justify-center gap-3 p-6 sm:p-8 max-w-lg">
                    <span className="text-[10px] sm:text-xs tracking-[0.25em] text-[#C8A06B] font-bold uppercase">
                      {form.eyebrow || 'EYEBROW TEXT'}
                    </span>
                    <h3 className="text-xl sm:text-3xl xl:text-4xl leading-[1.15] tracking-[-0.01em] text-gray-900 dark:text-foreground font-semibold">
                      {form.title || 'Heading'}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-foreground-secondary leading-relaxed max-w-md">
                      {form.description || 'Description'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      <span className="inline-flex items-center justify-center px-5 py-2.5 bg-gray-900 dark:bg-primary text-white text-xs font-medium tracking-wide rounded-xl">
                        {form.primaryCta.label || 'Primary CTA'}
                      </span>
                      <span className="inline-flex items-center justify-center px-5 py-2.5 border border-gray-300 text-gray-800 dark:text-foreground text-xs font-medium tracking-wide rounded-xl">
                        {form.secondaryCta.label || 'Secondary CTA'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 pt-2">
                      {orderedFeatures
                        .filter((f) => f.enabled !== false)
                        .slice(0, 3)
                        .map((f, i) => {
                          const Icon = getCategoryIcon(f.icon);
                          return (
                            <div key={i} className="flex items-center gap-2">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-muted shadow-sm">
                                <Icon size={15} className="text-black dark:text-foreground" />
                              </span>
                              <span className="text-xs font-medium text-gray-900 dark:text-foreground">
                                {f.title || 'Feature'}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sticky bottom save bar (mobile-friendly) */}
        <div className="lg:hidden flex items-center justify-between gap-3 sticky bottom-4 bg-card border border-border/70 rounded-2xl p-3 shadow-lg backdrop-blur-md">
          <p className="text-xs text-foreground-secondary">Changes apply to the live site.</p>
          <button
            onClick={handleSave}
            disabled={isSaving || updateHero.isPending}
            className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-xl text-sm cursor-pointer inline-flex items-center gap-2 disabled:opacity-60"
          >
            {isSaving || updateHero.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>

      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: 'var(--popover)', color: 'var(--popover-foreground)', border: '1px solid var(--border)' }, success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } }, error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } } }} />
    </div>
  );
}
