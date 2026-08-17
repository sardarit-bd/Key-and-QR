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
 * - className: additional wrapper CSS classes
 * - onRenderComplete: callback when canvas finishes rendering
 */
export default function VisualQuoteRenderer({
  editorData,
  mode = 'auto',
  showAudioPlayer = true,
  maxScale = 2,
  className = '',
  onRenderComplete,
}) {
  const containerRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const audioRef = useRef(null);
  const activeCanvasRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveMode] = useState('desktop');
  const [scale, setScale] = useState(1);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });

  // Audio track state
  const [audioTrack, setAudioTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // 1. Determine active design based on mode & viewport
  const resolveActiveDesign = useCallback(() => {
    if (!editorData) return null;

    let targetMode = mode;
    if (mode === 'auto') {
      const containerWidth = containerRef.current?.clientWidth || 0;
      const isMobile =
        typeof window !== 'undefined' &&
        (window.innerWidth < 768 || (containerWidth > 0 && containerWidth < 500));
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
          canvas: editorData.canvas || { width: 800, height: 600 },
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

    const canvasW = resolved.design.canvas?.width || (resolved.resolvedMode === 'mobile' ? 375 : 800);
    const canvasH = resolved.design.canvas?.height || (resolved.resolvedMode === 'mobile' ? 667 : 600);

    const containerW = container.clientWidth || canvasW;
    const containerH = container.clientHeight || canvasH;

    if (containerW <= 0 || containerH <= 0) return;

    const scaleX = containerW / canvasW;
    const scaleY = containerH / canvasH;

    const uniformScale = Math.min(scaleX, scaleY);
    const computedScale = Math.min(uniformScale, maxScale);
    setScale(Number.isFinite(computedScale) && computedScale > 0 ? computedScale : 1);
  }, [resolveActiveDesign, maxScale]);

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
    const height = design.canvas?.height || (resolvedMode === 'mobile' ? 667 : 600);
    setCanvasDimensions({ width, height });

    // Audio source check
    const audioEl = design.elements?.find((e) => e.type === 'audio' && e.audioData?.source);
    const audioSource = audioEl?.audioData || design.audio;
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
  }, [resolveActiveDesign, onRenderComplete, updateScaling]);

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

  // Audio Controls
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn('Audio playback prevented:', err));
    }
  };

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
        className="relative flex items-center justify-center transition-all duration-150 ease-out shrink-0"
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
        }}
      >
        <div
          ref={canvasWrapperRef}
          className="relative shadow-2xl rounded-2xl overflow-hidden bg-black/20 shrink-0"
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        />
      </div>

      {/* Optional Ambient Audio Bar / Toggle */}
      {showAudioPlayer && audioTrack?.source && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <audio
            ref={audioRef}
            src={audioTrack.source}
            loop={audioTrack.loop ?? true}
            onEnded={() => setIsPlaying(false)}
          />
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause music' : 'Play music'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-medium transition shadow-lg cursor-pointer"
          >
            <Music size={13} className={isPlaying ? 'text-accent animate-pulse' : 'text-white/70'} />
            <span>{isPlaying ? 'Pause Music' : 'Play Music'}</span>
            {isPlaying ? (
              <Pause size={12} fill="currentColor" />
            ) : (
              <Play size={12} fill="currentColor" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
