'use client';

import { useCallback } from 'react';
import useEditorStore from './editorStore';
import { Square, Copy, Trash2 } from 'lucide-react';
import { SHAPE_TYPES } from './editorConstants';

export default function ShapeProperties() {
  const selectedId = useEditorStore((s) =>
    s.selectedElementIds.length === 1 ? s.selectedElementIds[0] : null
  );
  const elements = useEditorStore((s) => s.elements);
  const selectedEl = selectedId
    ? elements.find((el) => el.id === selectedId && el.type === 'shape')
    : null;
  const patchElementData = useEditorStore((s) => s.patchElementData);
  const duplicateElement = useEditorStore((s) => s.duplicateElement);
  const removeElement = useEditorStore((s) => s.removeElement);
  const updateObjectTransform = async (...args) => {
    const { updateObjectTransform: u } = await import('./editorFabric');
    u(...args);
  };

  if (!selectedEl || !selectedEl.shapeData) return null;
  const sd = selectedEl.shapeData;
  const shapeType = sd.shapeType;

  const updateShapeData = (key, value) => {
    patchElementData(selectedId, 'shapeData', { [key]: value });
    if (selectedId) {
      import('./editorFabric').then(({ getObjectById }) => {
        const obj = getObjectById(selectedId);
        if (!obj) return;
        if (key === 'fillColor') obj.set('fill', value);
        if (key === 'strokeColor') obj.set('stroke', value);
        if (key === 'strokeWidth') obj.set('strokeWidth', value);
        if (key === 'borderRadius' && shapeType === 'rect') {
          obj.set('rx', value);
          obj.set('ry', value);
        }
        obj.setCoords();
        obj.canvas?.renderAll();
      });
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider flex items-center gap-1.5 mb-3">
        <Square size={13} /> {shapeType === 'rect' ? 'Rectangle' : shapeType === 'circle' ? 'Circle' : 'Line'}
      </p>

      {/* Color */}
      <div>
        <label className="text-[10px] text-foreground-tertiary block mb-0.5">Fill Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={sd.fillColor || '#cccccc'}
            onChange={(e) => updateShapeData('fillColor', e.target.value)}
            className="w-8 h-8 rounded-md border border-border cursor-pointer bg-background p-0.5"
          />
          <span className="text-xs text-foreground-tertiary font-mono">{sd.fillColor || '#cccccc'}</span>
        </div>
      </div>

      {/* Stroke Color */}
      <div>
        <label className="text-[10px] text-foreground-tertiary block mb-0.5">Stroke Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={sd.strokeColor || '#000000'}
            onChange={(e) => updateShapeData('strokeColor', e.target.value)}
            className="w-8 h-8 rounded-md border border-border cursor-pointer bg-background p-0.5"
          />
          <span className="text-xs text-foreground-tertiary font-mono">{sd.strokeColor || '#000000'}</span>
        </div>
      </div>

      {/* Stroke Width */}
      <div>
        <label className="text-[10px] text-foreground-tertiary block mb-0.5">Stroke Width</label>
        <input
          type="number"
          value={sd.strokeWidth || 0}
          onChange={(e) => updateShapeData('strokeWidth', Number(e.target.value))}
          min={0} max={20}
          className="w-full h-8 rounded-md border border-border bg-background text-xs text-foreground px-2"
        />
      </div>

      {/* Border Radius (rect only) */}
      {shapeType === 'rect' && (
        <div>
          <label className="text-[10px] text-foreground-tertiary block mb-0.5">Border Radius</label>
          <input
            type="range"
            value={sd.borderRadius || 0}
            onChange={(e) => updateShapeData('borderRadius', Number(e.target.value))}
            min={0} max={40}
            className="w-full accent-primary"
          />
        </div>
      )}

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
