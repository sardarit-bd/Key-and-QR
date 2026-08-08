'use client';

import { Type, Image, Palette, Square, Music, Layers } from 'lucide-react';
import { useState, useCallback, useRef } from 'react';
import useEditorStore from './editorStore';

const TOOLS = [
  { id: 'templates', label: 'Templates', icon: Layers, disabled: true },
  { id: 'text', label: 'Text', icon: Type, disabled: false },
  { id: 'images', label: 'Images', icon: Image, disabled: false },
  { id: 'background', label: 'Background', icon: Palette, disabled: false },
  { id: 'shapes', label: 'Shapes', icon: Square, disabled: false },
  { id: 'audio', label: 'Audio', icon: Music, disabled: false },
];

const SHAPE_SUB = [
  { value: 'rect', label: 'Rectangle' },
  { value: 'circle', label: 'Circle' },
  { value: 'line', label: 'Line' },
];

export default function LeftSidebar() {
  const [activeTool, setActiveTool] = useState(null);
  const [showShapes, setShowShapes] = useState(false);
  const elements = useEditorStore((s) => s.elements);
  const selectedElementIds = useEditorStore((s) => s.selectedElementIds);
  const addElement = useEditorStore((s) => s.addElement);
  const setSelection = useEditorStore((s) => s.setSelection);
  const storeSetActiveTool = useEditorStore((s) => s.setActiveTool);
  const setQuoteText = useEditorStore((s) => s.setQuoteText);
  const fileRef = useRef(null);

  const handleToolClick = useCallback((toolId) => {
    if (toolId === 'templates') return;

    if (toolId === 'background' || toolId === 'audio') {
      storeSetActiveTool(toolId === activeTool ? null : toolId);
      return;
    }

    if (toolId === 'images') {
      fileRef.current?.click();
      return;
    }

    if (toolId === 'shapes') {
      storeSetActiveTool(null);
      setShowShapes(!showShapes);
      setActiveTool(showShapes ? null : 'shapes');
      return;
    }

    storeSetActiveTool(null);
    setActiveTool(toolId === activeTool ? null : toolId);

    if (toolId === 'text') {
      const canvas = useEditorStore.getState().canvas;
      const elWidth = Math.round(canvas.width * 0.7);
      const elHeight = 80;
      const cx = Math.round((canvas.width - elWidth) / 2);
      const cy = Math.round((canvas.height - elHeight) / 2);

      addElement({
        type: 'text',
        x: cx, y: cy, width: elWidth, height: elHeight,
        rotation: 0, scaleX: 1, scaleY: 1,
        opacity: 1, visible: true, locked: false,
        zIndex: elements.length,
        textData: {
          content: 'Type your quote here\u2026',
          fontFamily: 'Inter', fontSize: 24,
          fontWeight: '400', fontStyle: 'normal',
          lineHeight: 1.4, letterSpacing: 0,
          textAlign: 'center', color: '#ffffff', wrap: true,
        },
      });
      setQuoteText('');
    }
  }, [activeTool, elements.length, addElement, setQuoteText, storeSetActiveTool, showShapes]);

  const handleShapeSelect = useCallback((shapeType) => {
    const shapes = {
      rect: { fillColor: '#e2e8f0', strokeColor: null, strokeWidth: 0, borderRadius: 0 },
      circle: { fillColor: '#e2e8f0', strokeColor: null, strokeWidth: 0 },
      line: { fillColor: null, strokeColor: '#000000', strokeWidth: 2 },
    };
    addElement({
      type: 'shape',
      x: 200, y: 200,
      width: shapeType === 'line' ? 200 : 160,
      height: shapeType === 'line' ? 0 : 160,
      rotation: 0, scaleX: 1, scaleY: 1,
      opacity: 1, visible: true, locked: false,
      zIndex: elements.length,
      shapeData: { shapeType, ...shapes[shapeType] },
    });
    setShowShapes(false);
    setActiveTool(null);
  }, [elements.length, addElement]);

  const handleImageSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    addElement({
      type: 'image',
      x: 100, y: 100, width: 600, height: 400,
      rotation: 0, scaleX: 1, scaleY: 1,
      opacity: 1, visible: true, locked: false,
      zIndex: elements.length,
      imageData: { source: { type: 'cloudinary', publicId: '', url }, fit: 'cover' },
    });
    storeSetActiveTool(null);
    setActiveTool(null);
  }, [elements.length, addElement, storeSetActiveTool]);

  const handleLayerClick = useCallback((id) => setSelection(id), [setSelection]);

  return (
    <aside className="w-[260px] shrink-0 border-r border-border bg-background flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <p className="text-[10px] text-foreground-tertiary font-medium uppercase tracking-wider px-1 mb-2">Tools</p>
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            disabled={tool.disabled}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
              activeTool === tool.id
                ? 'bg-primary/10 text-primary'
                : tool.disabled
                  ? 'text-foreground-tertiary/40 cursor-not-allowed'
                  : 'text-foreground-secondary hover:bg-muted hover:text-foreground'
            }`}
          >
            <tool.icon size={16} />
            <span>{tool.label}</span>
            {tool.disabled && <span className="ml-auto text-[9px] text-foreground-tertiary/40">Soon</span>}
          </button>
        ))}
        {showShapes && (
          <div className="ml-4 space-y-0.5 mt-1">
            <p className="text-[9px] text-foreground-tertiary uppercase tracking-wider px-2 py-1">Pick a shape</p>
            {SHAPE_SUB.map((s) => (
              <button key={s.value} onClick={() => handleShapeSelect(s.value)}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-foreground-secondary hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >{s.label}</button>
            ))}
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
      <div className="border-t border-border p-3 max-h-[40%] overflow-y-auto">
        <p className="text-[10px] text-foreground-tertiary font-medium uppercase tracking-wider px-1 mb-2 flex items-center gap-1.5">
          <Layers size={11} /> Layers
        </p>
        {elements.length === 0 ? (
          <p className="text-xs text-foreground-tertiary px-1">No elements yet</p>
        ) : (
          <div className="space-y-0.5">
            {[...elements].sort((a, b) => b.zIndex - a.zIndex).map((el) => {
              const isSelected = selectedElementIds.includes(el.id);
              const label = el.type === 'text' ? (el.textData?.content || '').slice(0, 30)
                : el.type === 'image' ? 'Image'
                : el.type === 'shape' ? (el.shapeData?.shapeType || 'Shape') : 'Element';
              return (
                <button key={el.id} onClick={() => handleLayerClick(el.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    isSelected ? 'bg-primary/10 text-primary' : 'text-foreground-secondary hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span className="capitalize text-[10px] text-foreground-tertiary w-10 shrink-0">{el.type}</span>
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
