'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, Suspense } from 'react';
import { initStaticCanvas, renderElements, fitCanvasToContainer } from '@/components/dashboard/admin/editor/editorFabric';
import { ensureEditorFontsLoaded } from '@/components/dashboard/admin/editor/editorFonts';
import { Loader2 } from 'lucide-react';

function QuotePreviewContent() {
  const searchParams = useSearchParams();
  const canvasElRef = useRef(null);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureEditorFontsLoaded();
    
    const dataStr = searchParams.get('data');
    if (!dataStr) {
      setLoading(false);
      return;
    }

    let editorData = null;
    try {
      editorData = JSON.parse(decodeURIComponent(dataStr));
    } catch (err) {
      console.error('Failed to parse quote preview data:', err);
      setLoading(false);
      return;
    }

    const el = canvasElRef.current;
    const container = containerRef.current;
    if (!el || !container) return;

    const width = editorData.canvas?.width || 800;
    const height = editorData.canvas?.height || 600;

    initStaticCanvas(el, width, height).then((canvas) => {
      if (!canvas) return;

      // Fit to container on load
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      fitCanvasToContainer(cw, ch);

      // Render elements
      renderElements(editorData.elements || [], editorData.background)
        .then(() => {
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });

      // Handle window resizing
      const handleResize = () => {
        if (!containerRef.current) return;
        fitCanvasToContainer(containerRef.current.clientWidth, containerRef.current.clientHeight);
      };

      window.addEventListener('resize', handleResize);
      
      // Store cleanup on window object or custom property
      window.handleStaticCanvasResizeCleanup = () => {
        window.removeEventListener('resize', handleResize);
      };
    });

    return () => {
      if (window.handleStaticCanvasResizeCleanup) {
        window.handleStaticCanvasResizeCleanup();
      }
    };
  }, [searchParams]);

  return (
    <div className="w-full h-full flex items-center justify-center relative p-12">
      {loading && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
          <Loader2 className="animate-spin text-primary mb-3" size={32} />
          <p className="text-white/70 text-xs">Loading quote preview...</p>
        </div>
      )}
      <div className="relative shadow-2xl border border-white/5 rounded overflow-hidden bg-white">
        <canvas ref={canvasElRef} className="block" />
      </div>
    </div>
  );
}

export default function QuotePreviewPage() {
  return (
    <div className="w-screen h-screen bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
      {/* Top Header */}
      <div className="absolute top-0 left-0 w-full h-12 bg-black/40 border-b border-white/10 flex items-center justify-between px-6 z-10">
        <span className="text-white text-xs font-semibold uppercase tracking-wider">
          Quote Preview (Read-Only Mode)
        </span>
        <button
          type="button"
          onClick={() => window.close()}
          className="text-white/60 hover:text-white text-xs font-medium cursor-pointer transition-colors"
        >
          Close Preview
        </button>
      </div>

      {/* Main Canvas Workspace Container wrapped in Suspense */}
      <Suspense fallback={
        <div className="w-full h-full flex flex-col items-center justify-center relative p-12">
          <Loader2 className="animate-spin text-primary mb-3" size={32} />
          <p className="text-white/70 text-xs">Preparing preview environment...</p>
        </div>
      }>
        <QuotePreviewContent />
      </Suspense>
    </div>
  );
}
