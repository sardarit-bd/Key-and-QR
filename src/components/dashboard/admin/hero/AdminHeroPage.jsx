'use client';

import { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Eye,
  Save,
  Loader2,
  Plus,
  Trash2,
  Upload,
  RotateCcw,
  ExternalLink,
  Layers,
  MousePointerClick,
  FileText,
  ImageIcon as LucideImageIcon,
} from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import {
  useHeroContent,
  useUpdateHero,
  useUploadHeroImage,
  DEFAULT_HERO,
} from '@/hooks/dashboard/useAdminHero';
import CategoryIconPicker from '@/components/dashboard/admin/categories/CategoryIconPicker';
import { getCategoryIcon } from '@/components/category';

const INPUT_CLASS =
  'w-full h-10 px-3.5 rounded-xl border border-border/80 bg-background/90 text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all';
const TEXTAREA_CLASS =
  'w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background/90 text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all min-h-[90px]';
const LABEL_CLASS =
  'block text-xs font-semibold uppercase tracking-wider text-foreground-secondary mb-1.5';
const SECTION_TITLE_CLASS =
  'text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2';

function FormField({ label, children, hint, required = false }) {
  return (
    <div className="space-y-1">
      <label className={LABEL_CLASS}>
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-foreground-tertiary">{hint}</p>}
    </div>
  );
}

function FeatureItem({ feature, index, total, onChange, onRemove }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-5 space-y-4 transition-all hover:border-border">
      <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
            #{index + 1}
          </span>
          <span className="text-sm font-semibold text-foreground">
            {feature.title || `Feature ${index + 1}`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={feature.enabled !== false}
              onChange={(e) => onChange(index, { ...feature, enabled: e.target.checked })}
              aria-label={`Enable feature ${index + 1}`}
              className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
            />
            <span className="text-xs text-foreground-secondary font-medium">Visible</span>
          </label>

          {total > 1 && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              title="Delete feature"
              className="p-1.5 rounded-lg text-foreground-tertiary hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Feature Icon</label>
          <CategoryIconPicker
            value={feature.icon || 'Sparkles'}
            onSelect={(name) => onChange(index, { ...feature, icon: name || 'Sparkles' })}
            color="#C8A06B"
          />
        </div>

        <FormField label="Feature Title" required>
          <input
            type="text"
            value={feature.title || ''}
            onChange={(e) => onChange(index, { ...feature, title: e.target.value })}
            maxLength={150}
            placeholder="e.g. Discover Daily Inspiration"
            className={INPUT_CLASS}
          />
        </FormField>
      </div>

      <FormField label="Description (Optional)">
        <input
          type="text"
          value={feature.description || ''}
          onChange={(e) => onChange(index, { ...feature, description: e.target.value })}
          maxLength={300}
          placeholder="Brief supplementary text"
          className={INPUT_CLASS}
        />
      </FormField>
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

  // Initialize form state
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
        features:
          Array.isArray(heroData.features) && heroData.features.length > 0
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

  const setField = useCallback((field) => (val) => {
    setForm((prev) => (prev ? { ...prev, [field]: val } : prev));
  }, []);

  const setCta = useCallback((which, field) => (val) => {
    setForm((prev) =>
      prev
        ? {
            ...prev,
            [which]: { ...prev[which], [field]: val },
          }
        : prev
    );
  }, []);

  const setHeroImage = useCallback((patch) => {
    setForm((prev) =>
      prev ? { ...prev, heroImage: { ...prev.heroImage, ...patch } } : prev
    );
  }, []);

  const setFeature = useCallback((index, updated) => {
    setForm((prev) => {
      if (!prev) return prev;
      const features = [...prev.features];
      features[index] = updated;
      return { ...prev, features };
    });
  }, []);

  const addFeature = useCallback(() => {
    setForm((prev) => {
      if (!prev) return prev;
      if (prev.features.length >= 8) {
        toast.error('Maximum of 8 features allowed');
        return prev;
      }
      return {
        ...prev,
        features: [
          ...prev.features,
          {
            icon: 'Sparkles',
            title: '',
            description: '',
            enabled: true,
            order: prev.features.length + 1,
          },
        ],
      };
    });
  }, []);

  const removeFeature = useCallback((index) => {
    setForm((prev) => {
      if (!prev) return prev;
      const features = prev.features.filter((_, i) => i !== index);
      return { ...prev, features };
    });
  }, []);

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
      setHeroImage({ url: result.url, publicId: result.publicId || '' });
      toast.success('Hero image uploaded successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleResetToDefaultImage = () => {
    setHeroImage({
      url: '/hero/hero-bg.png',
      publicId: '',
      alt: 'Luxury QR keychain memory charm',
    });
    toast.success('Reset to default hero image');
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
        features: form.features.map((f, i) => ({
          icon: f.icon || 'Sparkles',
          title: f.title || '',
          description: f.description || '',
          enabled: f.enabled !== false,
          order: i + 1,
        })),
        enabled: form.enabled !== false,
      };

      await updateHero.mutateAsync(payload);
      toast.success('Homepage Hero content saved successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save hero section');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading && !form) {
    return (
      <div className="min-h-screen p-4 sm:p-6 md:p-8 animate-pulse space-y-6 max-w-7xl mx-auto">
        <div className="h-12 bg-card rounded-2xl border border-border w-80" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="h-64 bg-card rounded-2xl border border-border" />
            <div className="h-64 bg-card rounded-2xl border border-border" />
          </div>
          <div className="lg:col-span-5">
            <div className="h-96 bg-card rounded-2xl border border-border" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError && !form) {
    return (
      <div className="min-h-[70vh] p-4 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <LucideImageIcon size={28} />
          </div>
          <h2 className="text-lg font-bold text-foreground">Failed to Load Homepage Hero</h2>
          <p className="text-xs text-foreground-secondary">{error?.message || 'Could not fetch CMS data.'}</p>
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

  if (!form) return null;

  const visibleFeatures = form.features.filter((f) => f.enabled !== false);

  return (
    <div className="min-h-screen p-3 sm:p-5 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Sparkles size={18} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Homepage Hero
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-foreground-secondary mt-1">
            Manage the content, call-to-actions, features, and imagery displayed in the public homepage hero section.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || updateHero.isPending}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving || updateHero.isPending ? (
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

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Editor Form (7 Cols on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION: Visibility Toggle */}
          <Card className="p-5 sm:p-6 border-border/80 bg-card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Hero Section Active</h3>
                <p className="text-xs text-foreground-tertiary mt-0.5">
                  Enable or temporarily hide the hero section on the live homepage.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enabled !== false}
                  onChange={(e) => setField('enabled')(e.target.checked)}
                  aria-label="Toggle hero visibility"
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>
          </Card>

          {/* SECTION 1: Content Texts */}
          <Card className="p-5 sm:p-6 border-border/80 bg-card space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h2 className={SECTION_TITLE_CLASS}>
                <FileText size={16} className="text-primary" />
                Hero Content
              </h2>
              <span className="text-[11px] text-foreground-tertiary">Text & Copy</span>
            </div>

            <FormField label="Eyebrow Badge" hint="Short promotional tag shown above the main title">
              <input
                type="text"
                value={form.eyebrow || ''}
                onChange={(e) => setField('eyebrow')(e.target.value)}
                maxLength={200}
                placeholder="e.g. ONE SCAN. A BETTER YOU."
                className={INPUT_CLASS}
              />
            </FormField>

            <FormField label="Headline Heading" hint="Main title of the homepage" required>
              <textarea
                value={form.title || ''}
                onChange={(e) => setField('title')(e.target.value)}
                maxLength={300}
                placeholder="Carry inspiration. Share what matters."
                className={`${TEXTAREA_CLASS} min-h-[75px]`}
              />
            </FormField>

            <FormField label="Description Text" hint="Engaging summary below the main headline">
              <textarea
                value={form.description || ''}
                onChange={(e) => setField('description')(e.target.value)}
                maxLength={1000}
                placeholder="A meaningful shell charm with a surprise inside..."
                className={`${TEXTAREA_CLASS} min-h-[90px]`}
              />
            </FormField>
          </Card>

          {/* SECTION 2: Call to Actions */}
          <Card className="p-5 sm:p-6 border-border/80 bg-card space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h2 className={SECTION_TITLE_CLASS}>
                <MousePointerClick size={16} className="text-primary" />
                Call to Actions
              </h2>
              <span className="text-[11px] text-foreground-tertiary">Action Buttons</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/60">
                <span className="text-xs font-bold text-foreground">Primary CTA Button</span>
                <FormField label="Button Label">
                  <input
                    type="text"
                    value={form.primaryCta?.label || ''}
                    onChange={(e) => setCta('primaryCta', 'label')(e.target.value)}
                    maxLength={100}
                    placeholder="Shop Collection"
                    className={INPUT_CLASS}
                  />
                </FormField>
                <FormField label="Button Link">
                  <input
                    type="text"
                    value={form.primaryCta?.href || ''}
                    onChange={(e) => setCta('primaryCta', 'href')(e.target.value)}
                    maxLength={500}
                    placeholder="/shop"
                    className={INPUT_CLASS}
                  />
                </FormField>
              </div>

              <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/60">
                <span className="text-xs font-bold text-foreground">Secondary CTA Button</span>
                <FormField label="Button Label">
                  <input
                    type="text"
                    value={form.secondaryCta?.label || ''}
                    onChange={(e) => setCta('secondaryCta', 'label')(e.target.value)}
                    maxLength={100}
                    placeholder="How It Works"
                    className={INPUT_CLASS}
                  />
                </FormField>
                <FormField label="Button Link">
                  <input
                    type="text"
                    value={form.secondaryCta?.href || ''}
                    onChange={(e) => setCta('secondaryCta', 'href')(e.target.value)}
                    maxLength={500}
                    placeholder="/how-it-works"
                    className={INPUT_CLASS}
                  />
                </FormField>
              </div>
            </div>
          </Card>

          {/* SECTION 3: Feature Highlights with CategoryIconPicker */}
          <Card className="p-5 sm:p-6 border-border/80 bg-card space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h2 className={SECTION_TITLE_CLASS}>
                  <Layers size={16} className="text-primary" />
                  Feature Highlights
                </h2>
                <p className="text-[11px] text-foreground-tertiary mt-0.5">
                  Pillars displayed underneath the CTA buttons (icons resolved via icon registry).
                </p>
              </div>
              <button
                type="button"
                onClick={addFeature}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus size={14} /> Add Feature
              </button>
            </div>

            <div className="space-y-3">
              {form.features.map((feature, idx) => (
                <FeatureItem
                  key={idx}
                  feature={feature}
                  index={idx}
                  total={form.features.length}
                  onChange={setFeature}
                  onRemove={removeFeature}
                />
              ))}

              {form.features.length === 0 && (
                <div className="py-8 text-center border-2 border-dashed border-border rounded-xl">
                  <p className="text-xs text-foreground-tertiary">No feature highlights added.</p>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="mt-2 text-xs text-primary font-semibold hover:underline"
                  >
                    + Add first feature
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* SECTION 4: Hero Background Image */}
          <Card className="p-5 sm:p-6 border-border/80 bg-card space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h2 className={SECTION_TITLE_CLASS}>
                <LucideImageIcon size={16} className="text-primary" />
                Hero Background Image
              </h2>
              <span className="text-[11px] text-foreground-tertiary">Cloudinary Storage</span>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="relative w-full sm:w-56 h-36 rounded-xl overflow-hidden border border-border bg-black/5 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.heroImage?.url || '/hero/hero-bg.png'}
                    alt={form.heroImage?.alt || 'Hero background'}
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <FormField label="Image Alt Description">
                    <input
                      type="text"
                      value={form.heroImage?.alt || ''}
                      onChange={(e) => setHeroImage({ alt: e.target.value })}
                      maxLength={300}
                      placeholder="e.g. Luxury QR keychain memory charm"
                      className={INPUT_CLASS}
                    />
                  </FormField>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-xs hover:bg-primary/90 transition-all cursor-pointer shadow-sm">
                      {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      {uploading ? 'Uploading to Cloudinary...' : 'Upload New Image'}
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
                      type="button"
                      onClick={handleResetToDefaultImage}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border text-foreground-secondary font-medium text-xs hover:bg-muted transition-colors cursor-pointer"
                    >
                      <RotateCcw size={13} /> Reset Default
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Live Interactive Preview (5 Cols on desktop, sticky) */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
          <Card className="p-4 sm:p-5 border-border/80 bg-card shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                <Eye size={14} className="text-primary" /> Live Layout Preview
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Interactive
              </span>
            </div>

            {/* Mock Preview Card Container */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden border border-border/80 bg-[#FAF9F7] dark:bg-zinc-900 shadow-inner">
              {/* Background */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.heroImage?.url || '/hero/hero-bg.png'}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-[80%_center]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#FAF9F7] via-[#FAF9F7]/90 to-transparent dark:from-zinc-950 dark:via-zinc-950/90 dark:to-transparent" />

              {/* Content overlay */}
              <div className="relative z-10 h-full p-4 sm:p-6 flex flex-col justify-between overflow-y-auto hide-scrollbar">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5">
                    <span className="text-[#C8A06B] text-xs">✦</span>
                    <span className="text-[9px] tracking-[0.2em] text-[#C8A06B] font-bold uppercase">
                      {form.eyebrow || 'ONE SCAN. A BETTER YOU.'}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">
                    {form.title || 'Carry inspiration. Share what matters.'}
                  </h3>

                  <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                    {form.description || 'A meaningful shell charm with a surprise inside...'}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg text-[10px] font-semibold">
                      {form.primaryCta?.label || 'Shop Collection'}
                    </span>
                    <span className="px-3 py-1.5 border border-gray-300 dark:border-zinc-700 text-gray-800 dark:text-white rounded-lg text-[10px] font-semibold">
                      {form.secondaryCta?.label || 'How It Works'}
                    </span>
                  </div>
                </div>

                {/* Features list */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200/60 dark:border-zinc-800">
                  {visibleFeatures.slice(0, 3).map((feat, idx) => {
                    const IconComp = getCategoryIcon(feat.icon);
                    return (
                      <div key={idx} className="flex flex-col items-center text-center gap-1">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-xs">
                          <IconComp size={12} className="text-black dark:text-white" />
                        </div>
                        <span className="text-[9px] font-medium text-gray-900 dark:text-white line-clamp-1">
                          {feat.title || `Feature ${idx + 1}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-foreground-secondary hover:text-primary transition-colors"
              >
                <span>View Public Homepage</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </Card>
        </div>
      </div>

      {/* Sticky Bottom Bar on Mobile */}
      <div className="lg:hidden sticky bottom-4 z-40 bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3">
        <p className="text-xs text-foreground-secondary font-medium">Unsaved changes</p>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || updateHero.isPending}
          className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-md cursor-pointer disabled:opacity-60"
        >
          {isSaving || updateHero.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

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
