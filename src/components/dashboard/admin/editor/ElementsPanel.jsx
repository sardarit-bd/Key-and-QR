'use client';

import { Type, Sparkles, Square, Image, Music } from 'lucide-react';
import { useCallback, useRef, useMemo } from 'react';
import useEditorStore from './editorStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useQuoteCategories } from '@/hooks/category/useQuoteCategories';
import { getCategoryLabel } from '@/components/category';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ELEMENTS = [
  { id: 'text', label: 'Text', icon: Type },
  { id: 'icon', label: 'Icon', icon: Sparkles },
  { id: 'shape', label: 'Shape', icon: Square },
  { id: 'image', label: 'Image', icon: Image },
  { id: 'audio', label: 'Audio', icon: Music },
];

const btnClass =
  'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-foreground-secondary hover:bg-muted hover:text-foreground';

export default function ElementsPanel() {
  const elements = useEditorStore((s) => s.elements);
  const addElement = useEditorStore((s) => s.addElement);
  const setQuoteText = useEditorStore((s) => s.setQuoteText);
  const quoteCategory = useEditorStore((s) => s.quoteCategory);
  const setQuoteCategory = useEditorStore((s) => s.setQuoteCategory);
  const quoteAuthor = useEditorStore((s) => s.quoteAuthor);
  const setQuoteAuthor = useEditorStore((s) => s.setQuoteAuthor);

  const { data: categories = [], isLoading: isCategoriesLoading, isError } = useQuoteCategories();
  const fileRef = useRef(null);

  const categoryOptions = useMemo(() => {
    const map = new Map();

    // 1. Dynamic categories strictly from centralized MongoDB categories collection
    if (Array.isArray(categories)) {
      categories
        .filter((cat) => cat && cat.isActive !== false)
        .forEach((cat) => {
          const slug = cat.slug || cat._id || (cat.name ? String(cat.name).toLowerCase().replace(/\s+/g, '-').trim() : null);
          if (slug) {
            map.set(slug, {
              value: slug,
              label: cat.name || getCategoryLabel(slug),
            });
          }
        });
    }

    // 2. Ensure loaded quote's category is available in the dropdown if editing an existing quote
    if (quoteCategory && !map.has(quoteCategory)) {
      map.set(quoteCategory, {
        value: quoteCategory,
        label: getCategoryLabel(quoteCategory),
      });
    }

    return Array.from(map.values());
  }, [categories, quoteCategory]);

  const handleClick = useCallback(
    (elementId) => {
      const { canvas } = useEditorStore.getState();
      const cx = Math.round(canvas.width / 2);
      const cy = Math.round(canvas.height / 2);
      const offset = (elements.length % 10) * 20;

      if (elementId === 'image') {
        fileRef.current?.click();
        return;
      }

      if (elementId === 'icon') {
        addElement({
          type: 'icon',
          x: cx + offset,
          y: cy + offset,
          width: 48,
          height: 48,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          visible: true,
          locked: false,
          zIndex: elements.length,
          iconData: {
            iconType: 'library',
            iconName: 'Sparkles',
            size: 48,
            color: '#1a1a1a',
          },
        });
        return;
      }

      if (elementId === 'audio') {
        addElement({
          type: 'audio',
          x: cx + offset,
          y: cy + offset,
          width: 260,
          height: 56,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          visible: true,
          locked: false,
          zIndex: elements.length,
          audioData: {
            source: '',
            title: 'Audio Track',
            autoplay: false,
            loop: false,
            volume: 1,
          },
        });
        return;
      }

      if (elementId === 'text') {
        const currentQuoteText = useEditorStore.getState().quoteText;
        addElement({
          type: 'text',
          x: cx + offset,
          y: cy + offset,
          width: 560,
          height: 80,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          visible: true,
          locked: false,
          zIndex: elements.length,
          textData: {
            role: 'quote',
            content: currentQuoteText || 'Enter quote text...',
            fontFamily: 'Inter',
            fontSize: 24,
            fontWeight: 'normal',
            fontStyle: 'normal',
            underline: false,
            lineHeight: 1.4,
            letterSpacing: 0,
            textAlign: 'center',
            color: '#1a1a1a',
            wrap: true,
          },
        });
        return;
      }

      if (elementId === 'shape') {
        addElement({
          type: 'shape',
          x: cx + offset,
          y: cy + offset,
          width: 160,
          height: 160,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          visible: true,
          locked: false,
          zIndex: elements.length,
          shapeData: {
            shapeType: 'rect',
            fillColor: '#cbd5e1',
            strokeColor: '#334155',
            strokeWidth: 0,
            borderRadius: 0,
          },
        });
      }
    },
    [elements.length, addElement, setQuoteText]
  );

  const handleImageSelect = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      const toastId = toast.loading('Uploading image...');
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await api.post('/upload/single', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data?.success && response.data?.data?.url) {
          const url = response.data.data.url;
          const publicId = response.data.data.public_id || '';
          const { canvas } = useEditorStore.getState();
          const cx = Math.round(canvas.width / 2);
          const cy = Math.round(canvas.height / 2);
          const offset = (elements.length % 10) * 20;

          addElement({
            type: 'image',
            x: cx + offset,
            y: cy + offset,
            width: 300,
            height: 200,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            visible: true,
            locked: false,
            zIndex: elements.length,
            imageData: {
              source: {
                type: 'cloudinary',
                publicId,
                url,
              },
              fit: 'cover',
            },
          });
          toast.success('Image added', { id: toastId });
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        console.error('Image upload failed:', err);
        toast.error(
          err?.response?.data?.message || err?.message || 'Failed to upload image',
          { id: toastId }
        );
      } finally {
        if (e.target) e.target.value = '';
      }
    },
    [elements.length, addElement]
  );

  return (
    <div className="p-4 space-y-4">
      {/* Elements Palette */}
      <div className="rounded-xl border border-border bg-card shadow-xs p-3 w-[168px]">
        <p className="text-[9px] font-semibold text-foreground-tertiary uppercase tracking-widest mb-2 px-1">
          Elements
        </p>
        <div className="space-y-0.5">
          {ELEMENTS.map((el) => (
            <button
              key={el.id}
              onClick={() => handleClick(el.id)}
              className={btnClass}
            >
              <el.icon size={14} className="text-foreground-tertiary" />
              <span>{el.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quote Details (Category & Author) */}
      <div className="rounded-xl border border-border bg-card shadow-xs p-3 w-[168px] space-y-3">
        <p className="text-[9px] font-semibold text-foreground-tertiary uppercase tracking-widest px-1">
          Quote Details
        </p>

        {/* Dynamic Category Selector */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-foreground-secondary block px-1">
            Category *
          </label>
          <Select
            value={quoteCategory || ''}
            onValueChange={(val) => setQuoteCategory(val)}
            disabled={isCategoriesLoading || isError || categoryOptions.length === 0}
          >
            <SelectTrigger className="w-full h-8 text-xs rounded-lg border-border bg-background px-2">
              <SelectValue
                placeholder={
                  isCategoriesLoading
                    ? 'Loading categories...'
                    : isError
                    ? 'Unable to load categories'
                    : categoryOptions.length === 0
                    ? 'No categories available'
                    : 'Select Category'
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-[220px]">
              {categoryOptions.map((opt) => (
                <SelectItem
                  key={`quote-cat-${opt.value}`}
                  value={opt.value}
                  className="text-xs"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Author Input */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-foreground-secondary block px-1">
            Author
          </label>
          <input
            type="text"
            value={quoteAuthor || ''}
            onChange={(e) => setQuoteAuthor(e.target.value)}
            placeholder="Author Name"
            className="w-full h-8 px-2 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
    </div>
  );
}
