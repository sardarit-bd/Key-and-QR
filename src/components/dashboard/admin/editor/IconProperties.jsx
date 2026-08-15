'use client';

import { useState, useCallback } from 'react';
import useEditorStore from './editorStore';
import { updateIconProperties } from './editorFabric';
import CategoryIconPicker from '@/components/dashboard/admin/categories/CategoryIconPicker';
import categoryService from '@/services/category-service/category.service';
import toast from 'react-hot-toast';

function FieldLabel({ children }) {
  return (
    <label className="block text-[10px] font-medium text-foreground-tertiary uppercase tracking-widest mb-1.5">
      {children}
    </label>
  );
}

function NumberInput({ label, value, onChange, min, max }) {
  const safeValue = Number(value);
  const displayValue = Number.isFinite(safeValue) ? safeValue : '';
  return (
    <div className="mb-3">
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        min={min}
        max={max}
        value={displayValue}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!Number.isFinite(v)) return;
          const clamped = Math.max(min, Math.min(max, v));
          onChange(clamped);
        }}
        className="w-full px-2.5 py-1.5 text-xs border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
      />
    </div>
  );
}

export default function IconProperties({ selectedEl }) {
  const patchElementData = useEditorStore((s) => s.patchElementData);
  const incrementVersion = useEditorStore((s) => s.incrementVersion);
  const pushHistory = useEditorStore((s) => s.pushHistory);

  const [uploading, setUploading] = useState(false);

  const id = selectedEl?.id;
  const iconData = selectedEl?.iconData || {};
  const iconName = iconData.iconName || 'Sparkles';
  const iconSize = iconData.size || 48;
  const iconColor = iconData.color || '#1a1a1a';
  const iconType = iconData.iconType || 'library';
  const iconUrl = iconData.iconUrl || null;

  const applyIconProp = useCallback(
    (key, value) => {
      if (!id) return;

      const fabricUpdated = updateIconProperties(id, {
        [key]: value,
      });

      patchElementData(id, 'iconData', {
        [key]: value,
      });

      pushHistory();

      if (!fabricUpdated) {
        incrementVersion();
      }
    },
    [id, patchElementData, incrementVersion, pushHistory]
  );

  const handleCustomIconUpload = async (file) => {
    if (!file) {
      applyIconProp('iconUrl', null);
      applyIconProp('iconType', 'library');
      return;
    }

    setUploading(true);
    try {
      const result = await categoryService.uploadCategoryIcon(file);
      const url = result?.url;
      if (!url) throw new Error('Upload failed');
      
      applyIconProp('iconUrl', url);
      applyIconProp('iconType', 'custom');
      toast.success('Custom SVG uploaded successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'SVG upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>Select Icon</FieldLabel>
        <CategoryIconPicker
          value={iconName}
          onSelect={(name) => {
            applyIconProp('iconName', name || 'Sparkles');
            applyIconProp('iconType', 'library');
            applyIconProp('iconUrl', null);
          }}
          color={iconColor}
          iconType={iconType}
          iconUrl={iconUrl}
          onCustomUpload={handleCustomIconUpload}
          uploading={uploading}
        />
      </div>

      <NumberInput
        label="Icon Size"
        value={iconSize}
        min={8}
        max={500}
        onChange={(v) => applyIconProp('size', v)}
      />

      <div>
        <FieldLabel>Icon Color</FieldLabel>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={iconColor}
            onChange={(e) => applyIconProp('color', e.target.value)}
            className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-background p-0.5"
          />
          <span className="text-xs text-foreground-tertiary font-mono">{iconColor}</span>
        </div>
      </div>
    </div>
  );
}
