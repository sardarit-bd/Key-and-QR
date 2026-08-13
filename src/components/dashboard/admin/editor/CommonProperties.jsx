'use client';

import { useCallback } from 'react';
import useEditorStore from './editorStore';
import { updateObjectTransform, getObjectById } from './editorFabric';
import {
  ArrowUp, ArrowDown, ChevronsUp, ChevronsDown,
  Lock, Unlock, Eye, EyeOff, Copy, Trash2
} from 'lucide-react';

function FieldLabel({ children }) {
  return (
    <label className="block text-[10px] font-medium text-foreground-tertiary uppercase tracking-widest mb-1.5">
      {children}
    </label>
  );
}

function NumberInput({ label, value, onChange }) {
  const safeValue = Math.round(Number(value));
  const displayValue = Number.isFinite(safeValue) ? safeValue : '';
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        value={displayValue}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (Number.isFinite(v)) {
            onChange(v);
          }
        }}
        className="w-full px-2.5 py-1.5 text-xs border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
      />
    </div>
  );
}

export default function CommonProperties({ selectedEl }) {
  const elements = useEditorStore((s) => s.elements);
  const updateElement = useEditorStore((s) => s.updateElement);
  const reorderElement = useEditorStore((s) => s.reorderElement);
  const duplicateElement = useEditorStore((s) => s.duplicateElement);
  const removeElement = useEditorStore((s) => s.removeElement);
  const pushHistory = useEditorStore((s) => s.pushHistory);

  const id = selectedEl?.id;
  if (!id) return null;

  const selectedIndex = elements.findIndex((el) => el.id === id);

  const applyTransform = useCallback(
    (key, value) => {
      const fabricKey =
        key === 'x'
          ? 'left'
          : key === 'y'
            ? 'top'
            : key === 'rotation'
              ? 'angle'
              : key;

      const fabricProps = { [fabricKey]: value };
      const elementProps = { [key]: value };

      if (key === 'width') {
        fabricProps.scaleX = 1;
        elementProps.scaleX = 1;
      } else if (key === 'height') {
        fabricProps.scaleY = 1;
        elementProps.scaleY = 1;
      }

      updateObjectTransform(id, fabricProps);
      updateElement(id, elementProps);
    },
    [id, updateElement]
  );

  const handleToggleLock = () => {
    const nextLocked = !selectedEl.locked;
    const obj = getObjectById(id);
    updateObjectTransform(id, {
      selectable: !nextLocked,
      evented: !nextLocked,
      data: {
        ...obj?.data,
        locked: nextLocked,
      }
    });
    updateElement(id, { locked: nextLocked });
    pushHistory();
  };

  const handleToggleVisibility = () => {
    const nextVisible = selectedEl.visible === false;
    updateObjectTransform(id, {
      visible: nextVisible,
    });
    updateElement(id, { visible: nextVisible });
    pushHistory();
  };

  return (
    <div className="space-y-6">
      {/* Position */}
      <div>
        <p className="text-[11px] font-semibold text-foreground-tertiary uppercase tracking-wider mb-3">
          Position & Size
        </p>
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="X (Left)"
            value={selectedEl.x}
            onChange={(v) => applyTransform('x', v)}
          />
          <NumberInput
            label="Y (Top)"
            value={selectedEl.y}
            onChange={(v) => applyTransform('y', v)}
          />
          <NumberInput
            label="Width"
            value={selectedEl.width * (selectedEl.scaleX || 1)}
            onChange={(v) => applyTransform('width', v)}
          />
          <NumberInput
            label="Height"
            value={selectedEl.height * (selectedEl.scaleY || 1)}
            onChange={(v) => applyTransform('height', v)}
          />
        </div>
      </div>

      {/* Rotation & Opacity */}
      <div className="grid grid-cols-2 gap-3 items-end">
        <NumberInput
          label="Rotation (°)"
          value={selectedEl.rotation || 0}
          onChange={(v) => applyTransform('rotation', v)}
        />
        <div>
          <FieldLabel>Opacity</FieldLabel>
          <div className="flex items-center gap-2 h-9">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round((selectedEl.opacity ?? 1) * 100)}
              onChange={(e) => {
                const pct = parseInt(e.target.value, 10);
                if (Number.isFinite(pct)) {
                  const v = pct / 100;
                  applyTransform('opacity', v);
                }
              }}
              className="w-full h-1.5 bg-muted rounded cursor-pointer accent-primary"
            />
            <span className="text-[11px] font-mono w-8 text-right shrink-0">
              {Math.round((selectedEl.opacity ?? 1) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Layer Order */}
      <div>
        <p className="text-[11px] font-semibold text-foreground-tertiary uppercase tracking-wider mb-3">
          Layer Arrangement
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => selectedIndex < elements.length - 1 && reorderElement(selectedIndex, selectedIndex + 1)}
            disabled={selectedIndex === elements.length - 1}
            className="flex flex-col items-center justify-center p-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground-secondary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Bring Forward"
          >
            <ArrowUp size={14} />
            <span className="text-[8px] mt-1">Forward</span>
          </button>
          <button
            type="button"
            onClick={() => selectedIndex > 0 && reorderElement(selectedIndex, selectedIndex - 1)}
            disabled={selectedIndex === 0}
            className="flex flex-col items-center justify-center p-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground-secondary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Send Backward"
          >
            <ArrowDown size={14} />
            <span className="text-[8px] mt-1">Backward</span>
          </button>
          <button
            type="button"
            onClick={() => selectedIndex < elements.length - 1 && reorderElement(selectedIndex, elements.length - 1)}
            disabled={selectedIndex === elements.length - 1}
            className="flex flex-col items-center justify-center p-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground-secondary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Bring to Front"
          >
            <ChevronsUp size={14} />
            <span className="text-[8px] mt-1">Front</span>
          </button>
          <button
            type="button"
            onClick={() => selectedIndex > 0 && reorderElement(selectedIndex, 0)}
            disabled={selectedIndex === 0}
            className="flex flex-col items-center justify-center p-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground-secondary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Send to Back"
          >
            <ChevronsDown size={14} />
            <span className="text-[8px] mt-1">Back</span>
          </button>
        </div>
      </div>

      {/* State & Actions */}
      <div>
        <p className="text-[11px] font-semibold text-foreground-tertiary uppercase tracking-wider mb-3">
          State & Actions
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleToggleLock}
            className={`flex-1 h-9 flex items-center justify-center gap-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
              selectedEl.locked
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                : 'bg-background border-border hover:bg-muted text-foreground-secondary'
            }`}
          >
            {selectedEl.locked ? <Lock size={13} /> : <Unlock size={13} />}
            <span>{selectedEl.locked ? 'Locked' : 'Lock'}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleVisibility}
            className={`flex-1 h-9 flex items-center justify-center gap-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
              selectedEl.visible === false
                ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20'
                : 'bg-background border-border hover:bg-muted text-foreground-secondary'
            }`}
          >
            {selectedEl.visible === false ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{selectedEl.visible === false ? 'Hidden' : 'Hide'}</span>
          </button>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => duplicateElement(id)}
            className="flex-1 h-9 flex items-center justify-center gap-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground-secondary text-xs font-medium cursor-pointer transition-colors"
          >
            <Copy size={13} />
            <span>Duplicate</span>
          </button>

          <button
            type="button"
            onClick={() => removeElement(id)}
            className="flex-1 h-9 flex items-center justify-center gap-2 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium cursor-pointer transition-colors"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
