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

const btnClass =
  'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-foreground-secondary hover:bg-muted hover:text-foreground';

export default function ElementsPanel() {
  const elements = useEditorStore((s) => s.elements);
  const addElement = useEditorStore((s) => s.addElement);
  const setQuoteText = useEditorStore((s) => s.setQuoteText);
  const fileRef = useRef(null);

  const handleClick = useCallback(
    (elementId) => {
      const { canvas } = useEditorStore.getState();
      const cx = Math.round(canvas.width / 2);
      const cy = Math.round(canvas.height / 2);
      const offset = (elements.length % 10) * 20;

      if (elementId === 'image') {
        fileRef.current?.click();
        return;
      }

      if (elementId === 'icon') {
        addElement({
          type: 'icon',
          x: cx + offset,
          y: cy + offset,
          width: 48,
          height: 48,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          visible: true,
          locked: false,
          zIndex: elements.length,
          iconData: {
            iconType: 'library',
            iconName: 'Sparkles',
            size: 48,
            color: '#1a1a1a',
          },
        });
        return;
      }

      if (elementId === 'audio') {
        addElement({
          type: 'audio',
          x: cx + offset,
          y: cy + offset,
          width: 300,
          height: 70,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          visible: true,
          locked: false,
          zIndex: elements.length,
          audioData: {
            source: '',
            title: 'New Track',
            autoplay: false,
            loop: false,
            volume: 1,
          },
        });
        return;
      }

      if (elementId === 'text') {
        addElement({
          type: 'text',
          x: cx + offset,
          y: cy + offset,
          width: 560,
          height: 80,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          visible: true,
          locked: false,
          zIndex: elements.length,
          textData: {
            content: 'Type your quote here\u2026',
            fontFamily: 'Inter',
            fontSize: 24,
            fontWeight: 'normal',
            fontStyle: 'normal',
            underline: false,
            lineHeight: 1.4,
            letterSpacing: 0,
            textAlign: 'center',
            color: '#1a1a1a',
            wrap: true,
          },
        });
        setQuoteText('');
        return;
      }

      if (elementId === 'shape') {
        addElement({
          type: 'shape',
          x: cx + offset,
          y: cy + offset,
          width: 160,
          height: 160,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          visible: true,
          locked: false,
          zIndex: elements.length,
          shapeData: {
            shapeType: 'rect',
            fillColor: '#cbd5e1',
            strokeColor: '#334155',
            strokeWidth: 0,
            borderRadius: 0,
          },
        });
      }
    },
    [elements.length, addElement, setQuoteText]
  );

  const handleImageSelect = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      const { canvas } = useEditorStore.getState();
      const cx = Math.round(canvas.width / 2);
      const cy = Math.round(canvas.height / 2);
      const offset = (elements.length % 10) * 20;

      addElement({
        type: 'image',
        x: cx + offset,
        y: cy + offset,
        width: 300,
        height: 200,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: elements.length,
        imageData: {
          source: {
            type: 'cloudinary',
            publicId: '',
            url,
          },
          fit: 'cover',
        },
      });
    },
    [elements.length, addElement]
  );

  return (
    <div className="p-4">
      <div className="rounded-xl border border-border bg-card shadow-sm p-3 w-[152px]">
        <p className="text-[9px] font-semibold text-foreground-tertiary uppercase tracking-widest mb-2 px-1">
          Elements
        </p>
        <div className="space-y-0.5">
          {ELEMENTS.map((el) => (
            <button
              key={el.id}
              onClick={() => handleClick(el.id)}
              className={btnClass}
            >
              <el.icon size={14} className="text-foreground-tertiary" />
              <span>{el.label}</span>
            </button>
          ))}
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
    </div>
  );
}
