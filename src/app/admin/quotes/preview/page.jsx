'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, Suspense, useCallback } from 'react';
import {
  initStaticCanvas,
  renderElements,
  disposeCanvas,
} from '@/components/dashboard/admin/editor/editorFabric';
import { ensureEditorFontsLoaded } from '@/components/dashboard/admin/editor/editorFonts';
import {
  Loader2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music,
  Monitor,
  Smartphone,
  X,
} from 'lucide-react';

import api from '@/lib/api';

function QuotePreviewContent() {
  const searchParams = useSearchParams();
  const canvasElRef = useRef(null);
  const containerRef = useRef(null);
  const audioRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [parsedData, setParsedData] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' | 'mobile'
  const [cardScale, setCardScale] = useState(1);

  // Audio player state
  const [audioTrack, setAudioTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // 1. Resolve quote design on mount / searchParams change
  useEffect(() => {
    ensureEditorFontsLoaded();

    const modeParam = searchParams.get('mode');
    if (modeParam === 'mobile') {
      setPreviewMode('mobile');
    } else {
      setPreviewMode('desktop');
    }

    const previewKey = searchParams.get('previewKey');
    const quoteId = searchParams.get('id');
    const dataStr = searchParams.get('data');

    // Option A: Try reading from sessionStorage (previewKey or quote_preview_<id>)
    if (previewKey) {
      const stored = typeof window !== 'undefined' ? sessionStorage.getItem(previewKey) : null;
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setParsedData(data);
          return;
        } catch (e) {
          console.warn('Failed to parse preview data from sessionStorage:', e);
        }
      }
    }

    if (quoteId) {
      const stored = typeof window !== 'undefined' ? sessionStorage.getItem(`quote_preview_${quoteId}`) : null;
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setParsedData(data);
          return;
        } catch (e) {
          console.warn('Failed to parse stored quote preview:', e);
        }
      }

      // If not in sessionStorage, fetch quote from backend API
      api
        .get(`/quotes/${quoteId}`)
        .then((res) => {
          const quote = res.data?.data;
          if (quote?.editorData) {
            setParsedData(quote.editorData);
          } else {
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error('Failed to load quote from API:', err);
          setLoading(false);
        });
      return;
    }

    // Option B: Legacy fallback if data parameter is present
    if (dataStr) {
      try {
        const data = JSON.parse(decodeURIComponent(dataStr));
        setParsedData(data);
      } catch (err) {
        console.error('Failed to parse quote preview data:', err);
        setLoading(false);
      }
      return;
    }

    setLoading(false);
  }, [searchParams]);

  // 2. Resolve active design from parsedData and previewMode
  const getActiveDesign = useCallback(() => {
    if (!parsedData) return null;

    if (previewMode === 'mobile') {
      return (
        parsedData.mobile || {
          canvas: { width: 375, height: 667 },
          background: null,
          elements: [],
          audio: null,
        }
      );
    }

    return (
      parsedData.desktop ||
      (parsedData.elements
        ? {
            canvas: parsedData.canvas || { width: 800, height: 600 },
            background: parsedData.background || null,
            elements: parsedData.elements || [],
            audio: parsedData.audio || null,
          }
        : null)
    );
  }, [parsedData, previewMode]);

  // 3. Render Canvas on active design change
  useEffect(() => {
    const activeDesign = getActiveDesign();
    if (!activeDesign) {
      setLoading(false);
      return;
    }

    const el = canvasElRef.current;
    if (!el) return;

    setLoading(true);

    const width = activeDesign.canvas?.width || (previewMode === 'mobile' ? 375 : 800);
    const height = activeDesign.canvas?.height || (previewMode === 'mobile' ? 667 : 600);

    // Audio track configuration
    const audioEl = activeDesign.elements?.find(
      (e) => e.type === 'audio' && e.audioData?.source
    );
    const audioSource = audioEl?.audioData || activeDesign.audio;
    if (audioSource?.source) {
      setAudioTrack(audioSource);
      setVolume(audioSource.volume ?? 1);
    } else {
      setAudioTrack(null);
    }

    // Filter out audio elements from visual canvas
    const visualElements = (activeDesign.elements || []).filter(
      (e) => e.type !== 'audio'
    );

    initStaticCanvas(el, width, height).then((canvas) => {
      if (!canvas) {
        setLoading(false);
        return;
      }

      // Render exact elements and background
      renderElements(visualElements, activeDesign.background)
        .then(() => {
          setLoading(false);
        })
        .catch((err) => {
          console.error('[Preview] Render error:', err);
          setLoading(false);
        });
    });

    return () => {
      disposeCanvas();
    };
  }, [getActiveDesign, previewMode]);

  // 4. Responsive viewport scale calculation
  const updateCardScale = useCallback(() => {
    const activeDesign = getActiveDesign();
    const container = containerRef.current;
    if (!activeDesign || !container) return;

    const width = activeDesign.canvas?.width || (previewMode === 'mobile' ? 375 : 800);
    const height = activeDesign.canvas?.height || (previewMode === 'mobile' ? 667 : 600);

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    const availW = Math.max(containerW - 64, 200);
    const availH = Math.max(containerH - (audioTrack ? 160 : 80), 200);

    const scaleX = availW / width;
    const scaleY = availH / height;
    const scale = Math.min(scaleX, scaleY, 1);

    setCardScale(Number.isFinite(scale) && scale > 0 ? scale : 1);
  }, [getActiveDesign, previewMode, audioTrack]);

  useEffect(() => {
    updateCardScale();
    window.addEventListener('resize', updateCardScale);
    return () => window.removeEventListener('resize', updateCardScale);
  }, [updateCardScale]);

  // 5. Audio Player Controls
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn('Playback error:', err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current && Number.isFinite(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (secs) => {
    if (!Number.isFinite(secs) || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const activeDesign = getActiveDesign();
  const canvasWidth = activeDesign?.canvas?.width || (previewMode === 'mobile' ? 375 : 800);
  const canvasHeight = activeDesign?.canvas?.height || (previewMode === 'mobile' ? 667 : 600);

  return (
    <div className="w-full h-full flex flex-col items-center justify-between relative select-none">
      {/* Top Bar with Mode Switcher and Close button */}
      <div className="w-full h-14 bg-slate-900/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-white text-xs font-semibold uppercase tracking-wider">
            Quote Preview
          </span>
          <span className="text-white/40 text-[11px]">
            ({canvasWidth} × {canvasHeight}px)
          </span>
        </div>

        {/* Desktop / Mobile Switcher */}
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setPreviewMode('desktop')}
            className={`h-7 px-3 flex items-center gap-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              previewMode === 'desktop'
                ? 'bg-primary text-white shadow-xs font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Monitor size={13} />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('mobile')}
            className={`h-7 px-3 flex items-center gap-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              previewMode === 'mobile'
                ? 'bg-primary text-white shadow-xs font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Smartphone size={13} />
            <span>Mobile</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => window.close()}
          className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-medium cursor-pointer transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
        >
          <X size={14} />
          <span>Close</span>
        </button>
      </div>

      {/* Main Canvas Workspace Container */}
      <div
        ref={containerRef}
        className="w-full flex-1 flex flex-col items-center justify-center relative p-6 overflow-hidden"
      >
        {loading && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-30">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <p className="text-white/70 text-xs font-medium">Rendering design...</p>
          </div>
        )}

        {/* Scaled Artwork Frame */}
        <div
          className="flex items-center justify-center transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${cardScale})`,
            transformOrigin: 'center center',
          }}
        >
          <div
            className="relative shadow-2xl rounded-2xl overflow-hidden border border-white/15 bg-white shrink-0"
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
            }}
          >
            <canvas ref={canvasElRef} className="block" />
          </div>
        </div>

        {/* Interactive Audio Player Bar */}
        {audioTrack?.source && (
          <div className="mt-4 w-full max-w-md bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 shadow-2xl flex flex-col gap-2 z-10 shrink-0">
            <audio
              ref={audioRef}
              src={audioTrack.source}
              loop={audioTrack.loop}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />

            <div className="flex items-center justify-between text-white text-xs font-medium">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Music size={14} className="text-primary" />
                </div>
                <span className="truncate">
                  {audioTrack.title || 'Quote Audio Track'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-white/50">
                {audioTrack.loop && (
                  <span className="bg-white/10 px-1.5 py-0.5 rounded">Loop</span>
                )}
                {audioTrack.autoplay && (
                  <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                    Autoplay
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
              >
                {isPlaying ? (
                  <Pause size={14} fill="currentColor" />
                ) : (
                  <Play size={14} className="ml-0.5" fill="currentColor" />
                )}
              </button>

              <span className="text-[10px] text-white/60 font-mono w-8 text-right shrink-0">
                {formatTime(currentTime)}
              </span>

              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/20 rounded cursor-pointer accent-primary"
              />

              <span className="text-[10px] text-white/60 font-mono w-8 shrink-0">
                {formatTime(duration)}
              </span>

              <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }}
                  className="text-white/60 hover:text-white cursor-pointer"
                >
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setVolume(val);
                    setIsMuted(val === 0);
                    if (audioRef.current) {
                      audioRef.current.volume = val;
                      audioRef.current.muted = val === 0;
                    }
                  }}
                  className="w-14 h-1 bg-white/20 rounded cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuotePreviewPage() {
  return (
    <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      <Suspense
        fallback={
          <div className="w-full h-full flex flex-col items-center justify-center relative p-12 bg-slate-950">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <p className="text-white/70 text-xs">Preparing preview environment...</p>
          </div>
        }
      >
        <QuotePreviewContent />
      </Suspense>
    </div>
  );
}
