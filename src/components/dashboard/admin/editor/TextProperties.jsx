'use client';

import { useState, useCallback } from 'react';
import useEditorStore from './editorStore';
import { updateTextProperties, getObjectById } from './editorFabric';
import {
  CURATED_FONTS, FONT_SIZES, FONT_SIZE_MIN, FONT_SIZE_MAX,
  CUSTOM_SIZE_VALUE,
} from './editorConstants';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const FONT_WEIGHTS = [
  { value: 'normal', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: 'bold', label: 'Bold' },
];

export default function TextProperties({ selectedEl }) {
  const patchElementData = useEditorStore((s) => s.patchElementData);
  const [customSize, setCustomSize] = useState(false);
  const [localLineHeight, setLocalLineHeight] = useState(null);
  const [localLetterSpacing, setLocalLetterSpacing] = useState(null);

  const selectedId = selectedEl?.id;
  const td = selectedEl?.textData;
  if (!td) return null;

  const safeNum = (v, fallback) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : (fallback ?? 1);
  };

  const currentSize = safeNum(td.fontSize, 24);
  const currentLineHeight = safeNum(td.lineHeight, 1.3);
  const currentLetterSpacing = safeNum(td.letterSpacing, 0);

  const apply = useCallback((key, value) => {
    if (!selectedId) return;
    const numericKeys = ['fontSize', 'lineHeight', 'letterSpacing'];
    const sanitized = numericKeys.includes(key) ? safeNum(value, td[key]) : value;
    if (numericKeys.includes(key) && sanitized === td[key] && Number(value) !== td[key]) return;

    const fabricMap = {
      fontFamily: 'fontFamily', fontSize: 'fontSize',
      fontWeight: 'fontWeight', fontStyle: 'fontStyle',
      lineHeight: 'lineHeight', textAlign: 'textAlign',
      color: 'fill',
      letterSpacing: (v) => ({ charSpacing: v * 10 }),
    };
    const mapping = fabricMap[key];
    if (typeof mapping === 'function') {
      updateTextProperties(selectedId, mapping(sanitized));
    } else if (mapping) {
      updateTextProperties(selectedId, { [mapping]: sanitized });
    }
    patchElementData(selectedId, 'textData', { [key]: sanitized });
  }, [selectedId, patchElementData, td?.fontSize, td?.lineHeight, td?.letterSpacing]);

  const handleContentChange = useCallback((e) => {
    if (!selectedId) return;
    const obj = getObjectById(selectedId);
    if (obj) { obj.set('text', e.target.value); obj.setCoords(); obj.canvas?.renderAll(); }
    patchElementData(selectedId, 'textData', { content: e.target.value });
  }, [selectedId, patchElementData]);

  const sectionLabel = 'text-[11px] font-semibold text-foreground-tertiary uppercase tracking-wider mb-3';
  const fieldLabel = 'text-[10px] font-medium text-foreground-tertiary block mb-1.5';
  const inputClass = 'w-full h-9 rounded-lg border border-border bg-background text-xs text-foreground px-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-shadow';
  const activeBtn = 'bg-primary text-primary-foreground border-primary';
  const normalBtn = 'bg-background text-foreground-secondary border-border hover:bg-muted hover:text-foreground';
  const btn = 'flex-1 h-8 flex items-center justify-center rounded-lg border text-[11px] font-medium transition-all cursor-pointer';

  return (
    <div className="space-y-6">
      {/* Content */}
      <div>
        <p className={sectionLabel}>Content</p>
        <textarea
          value={td.content || ''}
          onChange={handleContentChange}
          rows={4}
          className={`${inputClass} resize-none`}
          placeholder="Enter quote text..."
        />
      </div>

      {/* Typography */}
      <div>
        <p className={sectionLabel}>Typography</p>
        <div className="space-y-3">
          <div>
            <label className={fieldLabel}>Font Family</label>
            <Select value={td.fontFamily || 'Inter'} onValueChange={(v) => apply('fontFamily', v)}>
              <SelectTrigger className="h-9 text-xs rounded-lg w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[240px]">
                {CURATED_FONTS.map((f) => (
                  <SelectItem key={f.name} value={f.name} className="text-xs">{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className={fieldLabel}>Font Style</label>
            <div className="flex items-center gap-1">
              {FONT_WEIGHTS.map((w) => (
                <button
                  key={w.value}
                  onClick={() => apply('fontWeight', w.value)}
                  className={`${btn} ${td.fontWeight === w.value ? activeBtn : normalBtn}`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={fieldLabel}>Font Size</label>
            {customSize || !FONT_SIZES.includes(currentSize) ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={currentSize}
                  onChange={(e) => {
                    const v = Math.max(FONT_SIZE_MIN, Math.min(FONT_SIZE_MAX, Number(e.target.value) || FONT_SIZE_MIN));
                    apply('fontSize', v);
                  }}
                  min={FONT_SIZE_MIN} max={FONT_SIZE_MAX}
                  className={inputClass}
                />
                <button
                  onClick={() => setCustomSize(false)}
                  className="text-[10px] text-foreground-tertiary hover:text-foreground-secondary cursor-pointer shrink-0"
                >
                  Presets
                </button>
              </div>
            ) : (
              <Select value={String(currentSize)} onValueChange={(v) => {
                if (v === CUSTOM_SIZE_VALUE) { setCustomSize(true); return; }
                apply('fontSize', Number(v));
              }}>
                <SelectTrigger className="h-9 text-xs rounded-lg w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[240px]">
                  {FONT_SIZES.map((s) => (
                    <SelectItem key={s} value={String(s)} className="text-xs">{s}</SelectItem>
                  ))}
                  <SelectItem value={CUSTOM_SIZE_VALUE} className="text-xs text-foreground-tertiary">Custom...</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <label className={fieldLabel}>Text Alignment</label>
            <div className="flex items-center gap-1">
              {[
                { v: 'left', icon: AlignLeft },
                { v: 'center', icon: AlignCenter },
                { v: 'right', icon: AlignRight },
              ].map((a) => (
                <button
                  key={a.v}
                  onClick={() => apply('textAlign', a.v)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg border text-xs transition-all cursor-pointer ${td.textAlign === a.v ? activeBtn : normalBtn}`}
                  title={a.v}
                >
                  <a.icon size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div>
        <p className={sectionLabel}>Appearance</p>
        <div>
          <label className={fieldLabel}>Text Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={td.color || '#000000'}
              onChange={(e) => apply('color', e.target.value)}
              className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-background p-0.5"
            />
            <span className="text-xs text-foreground-tertiary font-mono">{td.color || '#000000'}</span>
          </div>
        </div>
      </div>

      {/* Spacing */}
      <div>
        <p className={sectionLabel}>Spacing</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={fieldLabel}>Line Height</label>
            <input
              type="number"
              value={localLineHeight ?? currentLineHeight}
              onChange={(e) => {
                const raw = e.target.value;
                setLocalLineHeight(raw === '' ? '' : Number(raw));
                const v = Number(raw);
                if (raw !== '' && Number.isFinite(v) && v >= 0.5 && v <= 3) {
                  apply('lineHeight', v);
                }
              }}
              onBlur={() => setLocalLineHeight(null)}
              step={0.1} min={0.5} max={3}
              className={inputClass}
            />
          </div>
          <div>
            <label className={fieldLabel}>Letter Spacing</label>
            <input
              type="number"
              value={localLetterSpacing ?? currentLetterSpacing}
              onChange={(e) => {
                const raw = e.target.value;
                setLocalLetterSpacing(raw === '' ? '' : Number(raw));
                const v = Number(raw);
                if (raw !== '' && Number.isFinite(v) && v >= -2 && v <= 10) {
                  apply('letterSpacing', v);
                }
              }}
              onBlur={() => setLocalLetterSpacing(null)}
              step={0.5} min={-2} max={10}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
