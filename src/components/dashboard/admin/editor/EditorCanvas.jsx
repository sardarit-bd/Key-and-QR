'use client';

import { useRef } from 'react';
import { useEditorCanvas } from '@/hooks/editor/useEditorCanvas';
import { useEditorSync } from '@/hooks/editor/useEditorSync';
import useEditorStore from './editorStore';
import { PREVIEW_MODES } from './editorConstants';

export default function EditorCanvas() {
  const canvasElRef = useRef(null);
  const containerRef = useRef(null);
  const previewMode = useEditorStore((s) => s.previewMode);

  useEditorCanvas(canvasElRef, containerRef);
  useEditorSync();

  // Desktop = canvas natural aspect (800:600 = 4:3)
  // Mobile = vertical phone aspect
  const aspectClass =
    previewMode === PREVIEW_MODES.mobile
      ? 'aspect-[9/19.5]'
      : 'aspect-[4/3]';

  return (
    <div
      ref={containerRef}
      className={`rounded-xl shadow-sm border border-border overflow-hidden bg-muted ${aspectClass}`}
    >
      <canvas
        ref={canvasElRef}
        id="editor-canvas"
        className="block w-full h-full"
        tabIndex={0}
      />
    </div>
  );
}
