'use client';

import { useRef } from 'react';
import { useEditorCanvas } from '@/hooks/editor/useEditorCanvas';
import { useEditorSync } from '@/hooks/editor/useEditorSync';

export default function EditorCanvas() {
  const canvasElRef = useRef(null);
  const containerRef = useRef(null);

  useEditorCanvas(canvasElRef, containerRef);
  useEditorSync();

  return (
    <div
      ref={containerRef}
      className="rounded-xl shadow-sm border border-border overflow-hidden"
    >
      <canvas ref={canvasElRef} id="editor-canvas" className="block" />
    </div>
  );
}
