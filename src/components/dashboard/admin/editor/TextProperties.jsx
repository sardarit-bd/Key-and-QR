'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import useEditorStore from './editorStore';
import {
  updateTextProperties,
  updateObjectTransform,
  getObjectById,
} from './editorFabric';
import {
  CURATED_FONTS,
  FONT_SIZES,
  FONT_WEIGHTS,
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

/**
 * TextProperties — right panel for editing the selected text element.
 *
 * Every property change updates:
 * 1. The Fabric object in-place (via updateTextProperties) — instant visual feedback
 * 2. The Zustand store (via patchElementData) — no history entry
 * 3. History entry is created on mouse-up/exit via object:modified in useEditorSync
 */
export default function TextProperties() {
  const selectedId = useEditorStore((s) =>
    s.selectedElementIds.length === 1 ? s.selectedElementIds[0] : null
  );
  const elements = useEditorStore((s) => s.elements);

  const selectedEl = selectedId
    ? elements.find((el) => el.id === selectedId && el.type === 'text')
    : null;

  const patchElementData = useEditorStore((s) => s.patchElementData);
  const duplicateElement = useEditorStore((s) => s.duplicateElement);
  const removeElement = useEditorStore((s) => s.removeElement);
  const updateElementData = useEditorStore((s) => s.updateElementData);

  if (!selectedEl || !selectedEl.textData) return null;

  const td = selectedEl.textData;

  // Lazy accessor for Fabric object (declared BEFORE useCallback closures that reference it)
  const getFabObj = useCallback((id) => {
    return getObjectById(id);
  }, []);

  const applyStyle = useCallback(
    (key, value) => {
      if (!selectedId) return;
      // Convert store key → Fabric key
      const fabricMap = {
        fontFamily: 'fontFamily',
        fontSize: 'fontSize',
        fontWeight: 'fontWeight',
        fontStyle: 'fontStyle',
        lineHeight: 'lineHeight',
        letterSpacing: (v) => ({ charSpacing: v * 10 }),
        textAlign: 'textAlign',
        color: 'fill',
        opacity: 'opacity',
        rotation: 'angle',
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

      // Update Fabric in-place
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

  const handleDuplicate = useCallback(() => {
    if (selectedId) duplicateElement(selectedId);
  }, [selectedId, duplicateElement]);

  const handleDelete = useCallback(() => {
    if (selectedId) removeElement(selectedId);
  }, [selectedId, removeElement]);

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
          <select
            value={td.fontFamily || 'Inter'}
            onChange={(e) => applyStyle('fontFamily', e.target.value)}
            className="w-full h-8 rounded-md border border-border bg-background text-xs text-foreground px-2 focus:outline-none focus:ring-1 focus:ring-primary/40"
          >
            {CURATED_FONTS.map((f) => (
              <option key={f.name} value={f.name}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-foreground-tertiary block mb-0.5">
            Size
          </label>
          <select
            value={td.fontSize || 48}
            onChange={(e) => applyStyle('fontSize', Number(e.target.value))}
            className="w-full h-8 rounded-md border border-border bg-background text-xs text-foreground px-2 focus:outline-none focus:ring-1 focus:ring-primary/40"
          >
            {FONT_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
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
            value={td.color || '#000000'}
            onChange={(e) => applyStyle('color', e.target.value)}
            className="w-8 h-8 rounded-md border border-border cursor-pointer bg-background p-0.5"
          />
          <span className="text-xs text-foreground-tertiary font-mono">
            {td.color || '#000000'}
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
            value={Math.round((selectedEl.opacity ?? 1) * 100)}
            onChange={(e) => {
              const v = Number(e.target.value) / 100;
              patchElementData(selectedId, 'opacity', v);
              if (selectedId) {
                updateObjectTransform(selectedId, { opacity: v });
              }
            }}
            min={0}
            max={100}
            className="w-full accent-primary"
          />
          <span className="text-[10px] text-foreground-tertiary">
            {Math.round((selectedEl.opacity ?? 1) * 100)}%
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
              const v = Number(e.target.value);
              patchElementData(selectedId, 'rotation', v);
              if (selectedId) {
                updateObjectTransform(selectedId, { angle: v });
              }
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
