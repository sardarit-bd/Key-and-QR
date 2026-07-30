'use client';

import { useCallback, useRef, useState } from 'react';
import useEditorStore from './editorStore';
import { updateObjectTransform, getObjectById } from './editorFabric';
import { Image, Upload, X, Copy, Trash2 } from 'lucide-react';
import { IMAGE_FIT_OPTIONS } from './editorConstants';

export default function ImageProperties() {
  const selectedId = useEditorStore((s) =>
    s.selectedElementIds.length === 1 ? s.selectedElementIds[0] : null
  );
  const elements = useEditorStore((s) => s.elements);
  const selectedEl = selectedId
    ? elements.find((el) => el.id === selectedId && el.type === 'image')
    : null;
  const patchElementData = useEditorStore((s) => s.patchElementData);
  const duplicateElement = useEditorStore((s) => s.duplicateElement);
  const removeElement = useEditorStore((s) => s.removeElement);

  if (!selectedEl || !selectedEl.imageData) return null;
  const imgData = selectedEl.imageData;

  const updateObj = (props) => {
    if (selectedId) updateObjectTransform(selectedId, props);
  };

  const handleReplace = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    // For demo: replace image source. Real upload will go to Cloudinary later.
    patchElementData(selectedId, 'imageData', {
      source: { type: 'cloudinary', publicId: '', url },
    });
    // Update Fabric object
    const obj = getObjectById(selectedId);
    if (obj) {
      obj.setSrc(url, () => {
        obj.setCoords();
        obj.canvas?.renderAll();
      });
    }
  };

  const updateOpacity = (v) => {
    patchElementData(selectedId, 'opacity', v);
    updateObj({ opacity: v });
  };

  const updateRotation = (v) => {
    patchElementData(selectedId, 'rotation', v);
    updateObj({ angle: v });
  };

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider flex items-center gap-1.5 mb-3">
        <Image size={13} /> Image
      </p>

      {/* Preview */}
      <div className="rounded-lg overflow-hidden border border-border h-24 bg-muted/30 flex items-center justify-center">
        {imgData.source.url ? (
          <img
            src={imgData.source.url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <Image size={24} className="text-foreground-tertiary" />
        )}
      </div>

      {/* Replace */}
      <div>
        <label className="text-[10px] text-foreground-tertiary block mb-1">
          Replace Image
        </label>
        <label className="flex items-center justify-center gap-1.5 h-8 rounded-md border border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors text-xs text-foreground-tertiary hover:text-foreground">
          <Upload size={13} />
          Upload
          <input type="file" accept="image/*" onChange={handleReplace} className="hidden" />
        </label>
      </div>

      {/* Fit */}
      <div>
        <label className="text-[10px] text-foreground-tertiary block mb-0.5">Fit</label>
        <select
          value={imgData.fit || 'cover'}
          onChange={(e) => patchElementData(selectedId, 'imageData', { fit: e.target.value })}
          className="w-full h-8 rounded-md border border-border bg-background text-xs text-foreground px-2"
        >
          {IMAGE_FIT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Opacity */}
      <div>
        <label className="text-[10px] text-foreground-tertiary block mb-0.5">
          Opacity {Math.round((selectedEl.opacity ?? 1) * 100)}%
        </label>
        <input
          type="range"
          value={Math.round((selectedEl.opacity ?? 1) * 100)}
          onChange={(e) => updateOpacity(Number(e.target.value) / 100)}
          min={0} max={100}
          className="w-full accent-primary"
        />
      </div>

      {/* Rotation */}
      <div>
        <label className="text-[10px] text-foreground-tertiary block mb-0.5">Rotation</label>
        <input
          type="number"
          value={Math.round(selectedEl.rotation || 0)}
          onChange={(e) => updateRotation(Number(e.target.value))}
          min={-360} max={360}
          className="w-full h-8 rounded-md border border-border bg-background text-xs text-foreground px-2"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <button onClick={() => duplicateElement(selectedId)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background text-xs text-foreground-secondary hover:bg-muted hover:text-foreground transition-colors cursor-pointer">
          <Copy size={13} /> Duplicate
        </button>
        <button onClick={() => removeElement(selectedId)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-destructive/20 bg-destructive/5 text-xs text-destructive hover:bg-destructive/10 transition-colors cursor-pointer">
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  );
}
