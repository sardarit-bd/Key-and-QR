'use client';

import { useState, useCallback } from 'react';
import useEditorStore from './editorStore';
import {
  updateTextProperties,
  updateObjectTransform,
  getObjectById,
} from './editorFabric';
import {
  CURATED_FONTS,
  FONT_SIZES,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  CUSTOM_SIZE_VALUE,
  TEXT_ALIGN,
} from './editorConstants';
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Copy,
  Trash2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TextProperties() {
  const selectedId = useEditorStore((s) =>
    s.selectedElementIds.length === 1 ? s.selectedElementIds[0] : null
  );
  const elements = useEditorStore((s) => s.elements);
  const canvas = useEditorStore((s) => s.canvas);

  const selectedEl = selectedId
    ? elements.find((el) => el.id === selectedId && el.type === 'text')
    : null;

  const patchElement = useEditorStore((s) => s.patchElement);
  const patchElementData = useEditorStore((s) => s.patchElementData);
  const duplicateElement = useEditorStore((s) => s.duplicateElement);
  const removeElement = useEditorStore((s) => s.removeElement);
  const updateElementData = useEditorStore((s) => s.updateElementData);

  const [customSize, setCustomSize] = useState('');
  const [customSizeError, setCustomSizeError] = useState('');
  const [isCustomSize, setIsCustomSize] = useState(false);

  if (!selectedEl || !selectedEl.textData) return null;

  const td = selectedEl.textData;

  const currentSize = td.fontSize ?? 24;
  const isPresetSize = FONT_SIZES.includes(currentSize) && !isCustomSize;

  const getFabObj = useCallback((id) => {
    return getObjectById(id);
  }, []);

  const applyStyle = useCallback(
    (key, value) => {
      if (!selectedId) return;
      const fabricMap = {
        fontFamily: 'fontFamily',
        fontSize: 'fontSize',
        fontWeight: 'fontWeight',
        fontStyle: 'fontStyle',
        lineHeight: 'lineHeight',
        letterSpacing: (v) => ({ charSpacing: v * 10 }),
        textAlign: 'textAlign',
        color: 'fill',
      };

      const mapping = fabricMap[key];
      if (typeof mapping === 'function') {
        updateTextProperties(selectedId, mapping(value));
      } else if (mapping) {
        updateTextProperties(selectedId, { [mapping]: value });
      }

      patchElementData(selectedId, 'textData', { [key]: value });
    },
    [selectedId, patchElementData]
  );

  const handleContentChange = useCallback(
    (e) => {
      const newContent = e.target.value;
      if (!selectedId) return;
      const obj = getFabObj(selectedId);
      if (obj) {
        obj.set('text', newContent);
        obj.setCoords();
        obj.canvas?.renderAll();
      }
      patchElementData(selectedId, 'textData', { content: newContent });
    },
    [selectedId, patchElementData, getFabObj]
  );

  const applyFontSize = useCallback(
    (size) => {
      if (!selectedId) return;
      const valid = Math.max(FONT_SIZE_MIN, Math.min(FONT_SIZE_MAX, Number(size) || FONT_SIZE_MIN));
      updateTextProperties(selectedId, { fontSize: valid });
      patchElementData(selectedId, 'textData', { fontSize: valid });
    },
    [selectedId, patchElementData]
  );

  const handlePresetSize = useCallback(
    (val) => {
      if (val === CUSTOM_SIZE_VALUE) {
        setIsCustomSize(true);
        setCustomSize(String(currentSize));
        setCustomSizeError('');
      } else {
        setIsCustomSize(false);
        setCustomSizeError('');
        applyFontSize(Number(val));
      }
    },
    [currentSize, applyFontSize]
  );

  const handleCustomSizeChange = useCallback(
    (e) => {
      setCustomSize(e.target.value);
    },
    []
  );

  const handleCustomSizeCommit = useCallback(() => {
    const raw = customSize.trim();
    if (!raw) {
      setIsCustomSize(false);
      setCustomSizeError('');
      return;
    }
    const num = Number(raw);
    if (!Number.isFinite(num) || num < FONT_SIZE_MIN || num > FONT_SIZE_MAX) {
      setCustomSizeError(`Enter a size between ${FONT_SIZE_MIN}–${FONT_SIZE_MAX}`);
      return;
    }
    setCustomSizeError('');
    applyFontSize(num);
  }, [customSize, applyFontSize]);

  const handleCustomSizeKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        handleCustomSizeCommit();
      }
    },
    [handleCustomSizeCommit]
  );

  const handleDuplicate = useCallback(() => {
    if (selectedId) duplicateElement(selectedId);
  }, [selectedId, duplicateElement]);

  const handleDelete = useCallback(() => {
    if (selectedId) removeElement(selectedId);
  }, [selectedId, removeElement]);

  const sizeDisplayValue = isCustomSize
    ? CUSTOM_SIZE_VALUE
    : isPresetSize
      ? String(currentSize)
      : CUSTOM_SIZE_VALUE;

  return (
    <div className="space-y-4">
      {/* Content */}
      <div>
        <label className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider block mb-1.5">
          Content
        </label>
        <textarea
          value={td.content || ''}
          onChange={handleContentChange}
          rows={3}
          className="w-full px-2.5 py-1.5 rounded-md border border-border bg-background text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
      </div>

      {/* Font family + size row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <label className="text-[10px] text-foreground-tertiary block mb-0.5">
            Font
          </label>
          <Select
            value={td.fontFamily || 'Inter'}
            onValueChange={(v) => applyStyle('fontFamily', v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[260px]">
              {CURATED_FONTS.map((f) => (
                <SelectItem key={f.name} value={f.name} className="text-xs">
                  <span style={{ fontFamily: f.name }}>{f.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[10px] text-foreground-tertiary block mb-0.5">
            Size
          </label>
          {isCustomSize ? (
            <input
              type="number"
              value={customSize}
              onChange={handleCustomSizeChange}
              onBlur={handleCustomSizeCommit}
              onKeyDown={handleCustomSizeKeyDown}
              min={FONT_SIZE_MIN}
              max={FONT_SIZE_MAX}
              placeholder={String(currentSize)}
              className={`w-full h-8 rounded-md border bg-background text-xs text-foreground px-2 focus:outline-none focus:ring-1 focus:ring-primary/40 ${
                customSizeError ? 'border-destructive' : 'border-border'
              }`}
            />
          ) : (
            <Select
              value={sizeDisplayValue}
              onValueChange={handlePresetSize}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[260px]">
                {FONT_SIZES.map((s) => (
                  <SelectItem key={s} value={String(s)} className="text-xs">
                    {s}
                  </SelectItem>
                ))}
                <SelectItem value={CUSTOM_SIZE_VALUE} className="text-xs text-accent">
                  Custom Size
                </SelectItem>
              </SelectContent>
            </Select>
          )}
          {customSizeError && (
            <p className="text-[10px] text-destructive mt-0.5 leading-tight">
              {customSizeError}
            </p>
          )}
        </div>
      </div>

      {/* Weight + Style row */}
      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            applyStyle('fontWeight', td.fontWeight === 'bold' ? 'normal' : 'bold')
          }
          className={`w-8 h-8 flex items-center justify-center rounded-md border text-xs transition-colors cursor-pointer ${
            td.fontWeight === 'bold'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-background text-foreground-secondary hover:bg-muted'
          }`}
          title="Bold"
        >
          <Bold size={14} />
        </button>
        <button
          onClick={() =>
            applyStyle('fontStyle', td.fontStyle === 'italic' ? 'normal' : 'italic')
          }
          className={`w-8 h-8 flex items-center justify-center rounded-md border text-xs transition-colors cursor-pointer ${
            td.fontStyle === 'italic'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-background text-foreground-secondary hover:bg-muted'
          }`}
          title="Italic"
        >
          <Italic size={14} />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        {TEXT_ALIGN.map((a) => (
          <button
            key={a.value}
            onClick={() => applyStyle('textAlign', a.value)}
            className={`w-8 h-8 flex items-center justify-center rounded-md border text-xs transition-colors cursor-pointer ${
              td.textAlign === a.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-foreground-secondary hover:bg-muted'
            }`}
            title={a.label}
          >
            {a.value === 'left' ? (
              <AlignLeft size={14} />
            ) : a.value === 'center' ? (
              <AlignCenter size={14} />
            ) : (
              <AlignRight size={14} />
            )}
          </button>
        ))}
      </div>

      {/* Color */}
      <div>
        <label className="text-[10px] text-foreground-tertiary block mb-0.5">
          Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={td.color || '#ffffff'}
            onChange={(e) => applyStyle('color', e.target.value)}
            className="w-8 h-8 rounded-md border border-border cursor-pointer bg-background p-0.5"
          />
          <span className="text-xs text-foreground-tertiary font-mono">
            {td.color || '#ffffff'}
          </span>
        </div>
      </div>

      {/* Line height + Letter spacing */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-foreground-tertiary block mb-0.5">
            Line Height
          </label>
          <input
            type="number"
            value={td.lineHeight || 1.3}
            onChange={(e) => applyStyle('lineHeight', Number(e.target.value))}
            step={0.1}
            min={0.5}
            max={3}
            className="w-full h-8 rounded-md border border-border bg-background text-xs text-foreground px-2 focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="text-[10px] text-foreground-tertiary block mb-0.5">
            Letter Spacing
          </label>
          <input
            type="number"
            value={td.letterSpacing || 0}
            onChange={(e) => applyStyle('letterSpacing', Number(e.target.value))}
            step={0.5}
            min={-2}
            max={10}
            className="w-full h-8 rounded-md border border-border bg-background text-xs text-foreground px-2 focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Opacity + Rotation */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-foreground-tertiary block mb-0.5">
            Opacity
          </label>
          <input
            type="range"
            value={Math.round(Math.max(0, Math.min(1, selectedEl.opacity ?? 1)) * 100)}
            onChange={(e) => {
              const v = Math.round(Math.max(0, Math.min(100, Number(e.target.value) || 0))) / 100;
              patchElement(selectedId, { opacity: v });
              updateObjectTransform(selectedId, { opacity: v });
            }}
            min={0}
            max={100}
            className="w-full accent-primary"
          />
          <span className="text-[10px] text-foreground-tertiary">
            {Math.round(Math.max(0, Math.min(1, selectedEl.opacity ?? 1)) * 100)}%
          </span>
        </div>
        <div>
          <label className="text-[10px] text-foreground-tertiary block mb-0.5">
            Rotation
          </label>
          <input
            type="number"
            value={Math.round(selectedEl.rotation || 0)}
            onChange={(e) => {
              const v = Math.max(-360, Math.min(360, Number(e.target.value) || 0));
              patchElement(selectedId, { rotation: v });
              updateObjectTransform(selectedId, { angle: v });
            }}
            min={-360}
            max={360}
            className="w-full h-8 rounded-md border border-border bg-background text-xs text-foreground px-2 focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <button
          onClick={handleDuplicate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background text-xs text-foreground-secondary hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <Copy size={13} />
          Duplicate
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-destructive/20 bg-destructive/5 text-xs text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>
    </div>
  );
}
