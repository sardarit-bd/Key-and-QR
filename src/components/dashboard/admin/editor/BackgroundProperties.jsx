'use client';

import { useCallback, useRef, useState } from 'react';
import useEditorStore from './editorStore';
import {
  BACKGROUND_PRESET_COLORS,
  GRADIENT_PRESETS,
} from './editorConstants';
import { Palette, Upload, X } from 'lucide-react';

export default function BackgroundProperties() {
  const background = useEditorStore((s) => s.background);
  const setBackground = useEditorStore((s) => s.setBackground);
  const [tab, setTab] = useState('solid');
  const fileRef = useRef(null);

  const handleSolid = useCallback(
    (color) => {
      if (background?.type === 'solid' && background.color === color) {
        setBackground(null);
      } else {
        setBackground({ type: 'solid', color });
      }
    },
    [background, setBackground]
  );

  const handleGradient = useCallback(
    (g) => {
      setBackground({
        type: 'gradient',
        gradient: 'linear',
        colors: g.colors,
        angle: g.angle,
      });
    },
    [setBackground]
  );

  const handleImageUpload = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      setBackground({ type: 'image', source: { url }, fit: 'cover' });
    },
    [setBackground]
  );

  const handleRemove = useCallback(() => {
    setBackground(null);
  }, [setBackground]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider flex items-center gap-1.5">
          <Palette size={13} /> Background
        </p>
        {background && (
          <button
            onClick={handleRemove}
            className="text-[10px] text-destructive hover:text-destructive/80 cursor-pointer"
          >
            Remove
          </button>
        )}
      </div>

      <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
        {['solid', 'gradient', 'image'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              tab === t
                ? 'bg-background text-foreground shadow-sm'
                : 'text-foreground-tertiary hover:text-foreground'
            }`}
          >
            {t === 'solid' ? 'Solid' : t === 'gradient' ? 'Gradient' : 'Image'}
          </button>
        ))}
      </div>

      {tab === 'solid' && (
        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            {BACKGROUND_PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleSolid(color)}
                className={`w-full aspect-square rounded-lg border-2 transition-all cursor-pointer ${
                  background?.type === 'solid' && background.color === color
                    ? 'border-primary scale-105'
                    : 'border-border hover:border-foreground/30'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={background?.type === 'solid' ? background.color : '#000000'}
              onChange={(e) => handleSolid(e.target.value)}
              className="w-8 h-8 rounded-md border border-border cursor-pointer bg-background p-0.5"
            />
            <input
              type="text"
              value={background?.type === 'solid' ? background.color : '#000000'}
              onChange={(e) => handleSolid(e.target.value)}
              className="flex-1 h-8 rounded-md border border-border bg-background text-xs text-foreground px-2 font-mono"
            />
          </div>
        </div>
      )}

      {tab === 'gradient' && (
        <div className="grid grid-cols-2 gap-2">
          {GRADIENT_PRESETS.map((g) => (
            <button
              key={g.label}
              onClick={() => handleGradient(g)}
              className={`h-16 rounded-lg border-2 transition-all cursor-pointer ${
                background?.type === 'gradient' &&
                JSON.stringify(background.colors) === JSON.stringify(g.colors)
                  ? 'border-primary'
                  : 'border-border hover:border-foreground/30'
              }`}
              style={{
                background: `linear-gradient(${g.angle}deg, ${g.colors[0]}, ${g.colors[1]})`,
              }}
              title={g.label}
            />
          ))}
        </div>
      )}

      {tab === 'image' && (
        <div className="space-y-3">
          {background?.type === 'image' ? (
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img
                src={background.source.url}
                alt="Background"
                className="w-full h-24 object-cover"
              />
              <button
                onClick={handleRemove}
                className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 cursor-pointer"
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors cursor-pointer"
            >
              <Upload size={18} className="text-foreground-tertiary" />
              <span className="text-[10px] text-foreground-tertiary">
                Upload background image
              </span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
