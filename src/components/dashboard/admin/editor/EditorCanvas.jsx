'use client';

import { useRef, useEffect, useState } from 'react';
import { useEditorCanvas } from '@/hooks/editor/useEditorCanvas';
import { useEditorSync } from '@/hooks/editor/useEditorSync';
import useEditorStore from './editorStore';

/**
 * EditorCanvas — the Fabric.js canvas container.
 *
 * Responsibilities:
 * - Holds the <canvas> element ref
 * - Manages zoom controls at the bottom
 * - Delegates all Fabric lifecycle to useEditorCanvas
 * - Delegates object sync to useEditorSync
 */
export default function EditorCanvas() {
  const canvasElRef = useRef(null);
  const containerRef = useRef(null);
  const zoom = useEditorStore((s) => s.canvas.zoom);

  const { handleZoomIn, handleZoomOut, handleZoomFit } = useEditorCanvas(
    canvasElRef,
    containerRef
  );

  // Sync canvas events → store
  useEditorSync();

  return (
    <div className="flex flex-col flex-1 min-w-0 bg-[#1a1a2e] relative">
      {/* Canvas container */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden p-4"
      >
        <canvas ref={canvasElRef} id="editor-canvas" />
      </div>

      {/* Zoom controls */}
      <div className="flex items-center justify-center gap-2 py-2 bg-[#0d0d1a] border-t border-white/10">
        <button
          onClick={handleZoomOut}
          className="w-7 h-7 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm cursor-pointer"
          title="Zoom out"
        >
          −
        </button>
        <span className="text-xs text-white/60 w-12 text-center select-none">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="w-7 h-7 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm cursor-pointer"
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={handleZoomFit}
          className="px-2.5 h-7 flex items-center rounded-md bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors text-xs cursor-pointer"
          title="Fit to screen"
        >
          Fit
        </button>
      </div>
    </div>
  );
}
