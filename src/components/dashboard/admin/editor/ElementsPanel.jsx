'use client';

import { Type, Sparkles, Square, Image, Music } from 'lucide-react';
import { useCallback, useRef } from 'react';
import useEditorStore from './editorStore';

const ELEMENTS = [
  { id: 'text', label: 'Text', icon: Type },
  { id: 'icon', label: 'Icon', icon: Sparkles },
  { id: 'shape', label: 'Shape', icon: Square },
  { id: 'image', label: 'Image', icon: Image },
  { id: 'audio', label: 'Audio', icon: Music },
];

export default function ElementsPanel() {
  const elements = useEditorStore((s) => s.elements);
  const addElement = useEditorStore((s) => s.addElement);
  const setQuoteText = useEditorStore((s) => s.setQuoteText);
  const fileRef = useRef(null);

  const handleClick = useCallback((elementId) => {
    if (elementId === 'image') {
      fileRef.current?.click();
      return;
    }

    if (elementId === 'icon') {
      const { canvas } = useEditorStore.getState();
      addElement({
        type: 'text',
        x: Math.round((canvas.width - 40) / 2),
        y: Math.round(canvas.height / 2 + 60),
        width: 40, height: 40,
        rotation: 0, scaleX: 1, scaleY: 1,
        opacity: 1, visible: true, locked: false,
        zIndex: elements.length,
        textData: {
          content: '\u2728', fontFamily: 'Inter', fontSize: 28,
          fontWeight: 'normal', fontStyle: 'normal',
          lineHeight: 1, letterSpacing: 0,
          textAlign: 'center', color: '#f59e0b', wrap: false,
        },
      });
      return;
    }

    if (elementId === 'audio') return;

    if (elementId === 'text') {
      const { canvas } = useEditorStore.getState();
      const elWidth = Math.round(canvas.width * 0.7);
      const elHeight = 60;
      const cx = Math.round((canvas.width - elWidth) / 2);
      const cy = Math.round((canvas.height - elHeight) / 2);
      addElement({
        type: 'text', x: cx, y: cy, width: elWidth, height: elHeight,
        rotation: 0, scaleX: 1, scaleY: 1,
        opacity: 1, visible: true, locked: false,
        zIndex: elements.length,
        textData: {
          content: 'Type your quote here\u2026', fontFamily: 'Inter', fontSize: 24,
          fontWeight: '400', fontStyle: 'normal', lineHeight: 1.4, letterSpacing: 0,
          textAlign: 'center', color: '#1a1a1a', wrap: true,
        },
      });
      setQuoteText('');
      return;
    }

    if (elementId === 'shape') {
      addElement({
        type: 'shape', x: 200, y: 200, width: 160, height: 160,
        rotation: 0, scaleX: 1, scaleY: 1,
        opacity: 1, visible: true, locked: false,
        zIndex: elements.length,
        shapeData: { shapeType: 'rect', fillColor: '#e2e8f0', strokeColor: null, strokeWidth: 0, borderRadius: 0 },
      });
    }
  }, [elements.length, addElement, setQuoteText]);

  const handleImageSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    addElement({
      type: 'image', x: 100, y: 100, width: 600, height: 400,
      rotation: 0, scaleX: 1, scaleY: 1,
      opacity: 1, visible: true, locked: false,
      zIndex: elements.length,
      imageData: { source: { type: 'cloudinary', publicId: '', url }, fit: 'cover' },
    });
  }, [elements.length, addElement]);

  const btnClass = 'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-foreground-secondary hover:bg-muted hover:text-foreground';

  return (
    <div className="p-4">
      <div className="rounded-xl border border-border bg-card shadow-sm p-3 w-[152px]">
        <p className="text-[9px] font-semibold text-foreground-tertiary uppercase tracking-widest mb-2 px-1">
          Elements
        </p>
        <div className="space-y-0.5">
          {ELEMENTS.map((el) => (
            <button key={el.id} onClick={() => handleClick(el.id)} className={btnClass}>
              <el.icon size={14} className="text-foreground-tertiary" />
              <span>{el.label}</span>
            </button>
          ))}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
    </div>
  );
}
