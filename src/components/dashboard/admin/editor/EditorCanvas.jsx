'use client';

import { useRef } from 'react';
import { useEditorCanvas } from '@/hooks/editor/useEditorCanvas';
import { useEditorSync } from '@/hooks/editor/useEditorSync';
import useEditorStore from './editorStore';
import { PREVIEW_MODES } from './editorConstants';

export default function EditorCanvas() {
  const canvasElRef = useRef(null);
  const containerRef = useRef(null);
  const activeDesignVersion = useEditorStore((s) => s.activeDesignVersion);
  const canvasConfig = useEditorStore((s) => s.canvas);

  useEditorCanvas(canvasElRef, containerRef);
  useEditorSync();

  const isMobile = activeDesignVersion === 'mobile';
  const width = canvasConfig?.width || (isMobile ? 375 : 800);
  const height = canvasConfig?.height || (isMobile ? 667 : 600);

  return (
    <div
      ref={containerRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
      className="relative rounded-2xl shadow-xl border border-border overflow-hidden bg-white shrink-0 transition-all duration-300"
    >
      <canvas
        ref={canvasElRef}
        id="editor-canvas"
        className="block"
        tabIndex={0}
      />
    </div>
  );
}
