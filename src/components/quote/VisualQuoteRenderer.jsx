'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { renderStaticDesign } from '@/components/dashboard/admin/editor/editorFabric';
import { ensureEditorFontsLoaded } from '@/components/dashboard/admin/editor/editorFonts';
import { Play, Pause, Music, Loader2 } from 'lucide-react';

/**
 * Reusable Visual Quote Renderer Component
 *
 * Renders canvas-based visual designs created in the Admin Quote Editor.
 * Used across:
 * - Public QR Scan page (/t/[tagCode])
 * - User Dashboard (Today's Quote)
 * - Quote Previews & Modals
 *
 * Props:
 * - editorData: The editorData object (containing desktop, mobile, elements)
 * - mode: 'auto' | 'desktop' | 'mobile' (default: 'auto')
 * - showAudioPlayer: boolean (default: true if audio track exists)
 * - maxScale: number (default: 1)
 * - fit: 'contain' | 'cover' (default: 'contain') - 'contain' scales the
 *   design to fit fully inside the container (may letterbox). 'cover' scales
 *   the design to fill the container edge-to-edge, cropping overflow - use
 *   this for full-screen backgrounds (e.g. the public QR scan page).
 * - className: additional wrapper CSS classes
 * - onRenderComplete: callback when canvas finishes rendering
 */
import VisualQuoteAudioPlayer from '@/components/quote/VisualQuoteAudioPlayer';

export default function VisualQuoteRenderer({
  editorData,
  mode = 'auto',
  showAudioPlayer = true,
  maxScale = 2,
  fit = 'contain',
  className = '',
  onRenderComplete,
}) {
  const containerRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const activeCanvasRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveMode] = useState('desktop');
  const [scale, setScale] = useState(1);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 450 });

  // Audio track state
  const [audioTrack, setAudioTrack] = useState(null);

  // 1. Determine active design based on mode & viewport
  const resolveActiveDesign = useCallback(() => {
    if (!editorData) return null;

    let targetMode = mode;
    if (mode === 'auto') {
      const containerWidth = containerRef.current?.clientWidth || 0;
      const isMobile =
        typeof window !== 'undefined' &&
        (window.innerWidth < 640 || (containerWidth > 0 && containerWidth < 500));
      targetMode = isMobile ? 'mobile' : 'desktop';
    }

    if (targetMode === 'mobile') {
      if (editorData.mobile && editorData.mobile.elements && editorData.mobile.elements.length > 0) {
        return { design: editorData.mobile, resolvedMode: 'mobile' };
      }
      if (editorData.desktop && editorData.desktop.elements && editorData.desktop.elements.length > 0) {
        return { design: editorData.desktop, resolvedMode: 'desktop' };
      }
    } else {
      if (editorData.desktop && editorData.desktop.elements && editorData.desktop.elements.length > 0) {
        return { design: editorData.desktop, resolvedMode: 'desktop' };
      }
      if (editorData.mobile && editorData.mobile.elements && editorData.mobile.elements.length > 0) {
        return { design: editorData.mobile, resolvedMode: 'mobile' };
      }
    }

    // Root-level elements fallback (legacy structure)
    if (editorData.elements && editorData.elements.length > 0) {
      return {
        design: {
          canvas: editorData.canvas || { width: 800, height: 450 },
          background: editorData.background || null,
          elements: editorData.elements,
          audio: editorData.audio || null,
        },
        resolvedMode: 'desktop',
      };
    }

    return null;
  }, [editorData, mode]);

  // 2. Responsive scaling calculation (strictly uniform)
  const updateScaling = useCallback(() => {
    const container = containerRef.current;
    const resolved = resolveActiveDesign();
    if (!container || !resolved?.design) return;

    const isMobileMode = resolved.resolvedMode === 'mobile';
    const canvasW = resolved.design.canvas?.width || (isMobileMode ? 375 : 800);
    const canvasH = resolved.design.canvas?.height || (isMobileMode ? 667 : 450);

    const containerW = container.clientWidth || canvasW;
    const containerH = container.clientHeight || canvasH;

    if (containerW <= 0) return;

    const scaleX = containerW / canvasW;
    const scaleY = containerH > 0 ? containerH / canvasH : scaleX;
    // 'cover' fills the container edge-to-edge (cropping overflow), like
    // CSS object-fit: cover. 'contain' fits the whole design inside the
    // container (may letterbox), like CSS object-fit: contain.
    const uniformScale = fit === 'cover' ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);

    // Don't cap 'cover' scaling - it needs to grow past maxScale on some
    // aspect ratios to fully fill the screen without gaps.
    const computedScale = fit === 'cover' ? uniformScale : Math.min(uniformScale, maxScale);
    setScale(Number.isFinite(computedScale) && computedScale > 0 ? computedScale : 1);
  }, [resolveActiveDesign, maxScale, fit]);

  // 3. Render static Fabric canvas on design change
  useEffect(() => {
    let isMounted = true;
    ensureEditorFontsLoaded();

    const resolved = resolveActiveDesign();
    if (!resolved || !resolved.design) {
      setLoading(false);
      return;
    }

    const { design, resolvedMode } = resolved;
    setActiveMode(resolvedMode);

    const width = design.canvas?.width || (resolvedMode === 'mobile' ? 375 : 800);
    const height = design.canvas?.height || (resolvedMode === 'mobile' ? 667 : 450);
    setCanvasDimensions({ width, height });

    // Comprehensive audio track check across active design, desktop, mobile, and root levels
    const audioEl =
      design.elements?.find((e) => e.type === 'audio' && e.audioData?.source) ||
      editorData?.mobile?.elements?.find((e) => e.type === 'audio' && e.audioData?.source) ||
      editorData?.desktop?.elements?.find((e) => e.type === 'audio' && e.audioData?.source) ||
      editorData?.elements?.find((e) => e.type === 'audio' && e.audioData?.source);

    const audioSource =
      audioEl?.audioData ||
      design.audio ||
      editorData?.mobile?.audio ||
      editorData?.desktop?.audio ||
      editorData?.audio ||
      null;

    if (audioSource?.source) {
      setAudioTrack(audioSource);
    } else {
      setAudioTrack(null);
    }

    const wrapper = canvasWrapperRef.current;
    if (!wrapper) return;

    setLoading(true);

    // Clean up any existing canvas instance
    if (activeCanvasRef.current) {
      activeCanvasRef.current.dispose();
      activeCanvasRef.current = null;
    }

    // Create fresh canvas element to prevent React reconciliation conflicts with Fabric
    wrapper.innerHTML = '';
    const canvasEl = document.createElement('canvas');
    wrapper.appendChild(canvasEl);

    renderStaticDesign(canvasEl, design)
      .then((instance) => {
        if (!isMounted) {
          instance?.dispose();
          return;
        }
        activeCanvasRef.current = instance;
        setLoading(false);
        updateScaling();
        if (onRenderComplete) onRenderComplete();
      })
      .catch((err) => {
        console.warn('[VisualQuoteRenderer] Render error:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      if (activeCanvasRef.current) {
        activeCanvasRef.current.dispose();
        activeCanvasRef.current = null;
      }
    };
  }, [resolveActiveDesign, editorData, onRenderComplete, updateScaling]);

  // Handle resize
  useEffect(() => {
    updateScaling();
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      updateScaling();
    });
    observer.observe(container);

    window.addEventListener('resize', updateScaling);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScaling);
    };
  }, [updateScaling]);

  const resolved = resolveActiveDesign();
  if (!resolved || !resolved.design) {
    return null;
  }

  const canvasWidth = canvasDimensions.width;
  const canvasHeight = canvasDimensions.height;
  const displayWidth = Math.round(canvasWidth * scale);
  const displayHeight = Math.round(canvasHeight * scale);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* Loading Indicator */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-2xs transition-opacity duration-300">
          <Loader2 className="animate-spin text-accent" size={24} />
        </div>
      )}

      {/* Proportional Scaled Canvas Container (Accurately Sized Layout Box) */}
      <div
        className="relative overflow-hidden shrink-0 transition-all duration-150 ease-out"
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
        }}
      >
        <div
          ref={canvasWrapperRef}
          className="absolute top-0 left-0 overflow-hidden shrink-0"
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: '0 0',
          }}
        />
      </div>

      {/* Optional Floating Audio Player */}
      {showAudioPlayer && audioTrack?.source && (
        <div className="absolute top-14 right-4 sm:top-16 sm:right-6 z-30 pointer-events-auto">
          <VisualQuoteAudioPlayer track={audioTrack} compact />
        </div>
      )}
    </div>
  );
}