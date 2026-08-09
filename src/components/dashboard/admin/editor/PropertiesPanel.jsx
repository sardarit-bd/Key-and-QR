'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useCallback } from 'react';
import TextProperties from './TextProperties';
import useEditorStore from './editorStore';
import { updateObjectTransform, updateIconProperties } from './editorFabric';

function FieldLabel({ children }) {
  return (
    <label className="block text-[10px] font-medium text-foreground-tertiary uppercase tracking-widest mb-1">
      {children}
    </label>
  );
}

function NumberInput({ label, value, onChange, min, max, step = 1 }) {
  const safeValue = Number(value);
  const displayValue = Number.isFinite(safeValue) ? safeValue : '';
  return (
    <div className="mb-3">
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={displayValue}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!Number.isFinite(v)) return;
          const clamped = Math.max(min, Math.min(max, v));
          onChange(clamped);
        }}
        onKeyDown={(e) => {
          if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+' || e.key === '.')
            e.preventDefault();
        }}
        className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}

export default function PropertiesPanel({ selectedEl }) {
  const patchElementData = useEditorStore((s) => s.patchElementData);
  const updateElement = useEditorStore((s) => s.updateElement);
  const incrementVersion = useEditorStore((s) => s.incrementVersion);
  const pushHistory = useEditorStore((s) => s.pushHistory);

  const applyIconProp = useCallback(
    (key, value) => {
      if (!selectedEl?.id) return;
  
      const fabricUpdated = updateIconProperties(selectedEl.id, {
        [key]: value,
      });
  
      patchElementData(selectedEl.id, 'iconData', {
        [key]: value,
      });
  
      pushHistory();
  
      if (!fabricUpdated) {
        incrementVersion();
      }
    },
    [
      selectedEl,
      patchElementData,
      incrementVersion,
      pushHistory,
    ],
  );

  const applyIconTransform = useCallback(
    (key, value) => {
      if (!selectedEl?.id) return;
  
      const fabricKey =
        key === 'x'
          ? 'left'
          : key === 'y'
            ? 'top'
            : key;
  
      updateObjectTransform(selectedEl.id, {
        [fabricKey]: value,
      });
  
      updateElement(selectedEl.id, {
        [key]: value,
      });
    },
    [selectedEl, updateElement],
  );

  // ── Icon Properties ──
  if (selectedEl?.type === 'icon') {
    const el = selectedEl;
    const iconData = el.iconData || {};
    const iconName = iconData.iconName || 'sparkles';
    const iconSize = iconData.size || 48;
    const iconColor = iconData.color || '#1a1a1a';

    return (
      <aside className="w-[280px] shrink-0 border-l border-border bg-background flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-foreground-tertiary" />
            <span className="text-[11px] font-semibold text-foreground-secondary uppercase tracking-wider">
              Icon Properties
            </span>
          </div>
        </div>



        <div className="flex-1 overflow-y-auto p-5">
          {/* Icon type selector */}
          <div className="mb-4">
            <FieldLabel>Icon</FieldLabel>
            <select
              value={iconName}
              onChange={(e) => applyIconProp('iconName', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="sparkles">Sparkles</option>
              <option value="heart">Heart</option>
              <option value="star">Star</option>
              <option value="check">Check</option>
              <option value="plus">Plus</option>
              <option value="minus">Minus</option>
              <option value="arrow-up">Arrow Up</option>
              <option value="arrow-down">Arrow Down</option>
              <option value="arrow-left">Arrow Left</option>
              <option value="arrow-right">Arrow Right</option>
              <option value="circle">Circle</option>
              <option value="triangle">Triangle</option>
              <option value="crown">Crown</option>
              <option value="gift">Gift</option>
              <option value="bell">Bell</option>
              <option value="user">User</option>
              <option value="home">Home</option>
              <option value="calendar">Calendar</option>
              <option value="clock">Clock</option>
              <option value="camera">Camera</option>
              <option value="image">Image</option>
              <option value="music">Music</option>
              <option value="play">Play</option>
              <option value="pause">Pause</option>
              <option value="bookmark">Bookmark</option>
              <option value="share">Share</option>
              <option value="settings">Settings</option>
              <option value="search">Search</option>
              <option value="quote">Quote</option>
              <option value="sun">Sun</option>
              <option value="moon">Moon</option>
            </select>
          </div>

          {/* Size */}
          <NumberInput
            label="Size"
            value={iconSize}
            min={8}
            max={500}
            onChange={(v) => applyIconProp('size', v)}
          />

          {/* Color */}
          <div className="mb-3">
            <FieldLabel>Color</FieldLabel>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={iconColor}
                onChange={(e) => applyIconProp('color', e.target.value)}
                className="w-8 h-7 p-0 border border-border rounded cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={iconColor}
                onChange={(e) => applyIconProp('color', e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Position */}
          <NumberInput
            label="X"
            value={el.x}
            min={0}
            max={2000}
            onChange={(v) => applyIconTransform('x', v)}
          />
          <NumberInput
            label="Y"
            value={el.y}
            min={0}
            max={2000}
            onChange={(v) => applyIconTransform('y', v)}
          />

          {/* Opacity */}
          <div className="mb-3">
            <FieldLabel>Opacity</FieldLabel>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round((el.opacity ?? 1) * 100)}
              onChange={(e) => {
                const pct = parseInt(e.target.value, 10);
                if (!Number.isFinite(pct)) return;
                const v = pct / 100;
                updateObjectTransform(el.id, { opacity: v });
                updateElement(el.id, { opacity: v });
              }}
              className="w-full h-1.5 bg-muted rounded cursor-pointer"
            />
          </div>
        </div>
      </aside>
    );
  }

  // ── Default Properties Panel ──
  return (
    <aside className="w-[280px] shrink-0 border-l border-border bg-background flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-foreground-tertiary" />
          <span className="text-[11px] font-semibold text-foreground-secondary uppercase tracking-wider">
            {selectedEl?.type === 'text' ? 'Text Properties' : 'Properties'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {selectedEl?.type === 'text' ? (
          <TextProperties selectedEl={selectedEl} />
        ) : selectedEl ? (
          <div className="text-xs text-foreground-tertiary">
            {selectedEl.type === 'shape' && 'Shape properties coming soon'}
            {selectedEl.type === 'image' && 'Image properties coming soon'}
            {selectedEl.type === 'audio' && 'Audio properties coming soon'}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <SlidersHorizontal size={22} className="text-foreground-tertiary/30 mb-3" />
            <p className="text-sm text-foreground-tertiary">Select an element</p>
            <p className="text-xs text-foreground-tertiary/60 mt-1">to edit its properties</p>
          </div>
        )}
      </div>
    </aside>
  );
}
