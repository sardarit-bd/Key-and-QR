'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';
import { stopAllAudio, STOP_ALL_AUDIO_EVENT } from '@/lib/audioCoordinator';

// Standard 44-byte silent PCM WAV data URI used to pre-warm and unlock mobile audio contexts on user gesture
const SILENT_AUDIO_URI = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

const VisualQuoteAudioPlayer = forwardRef(function VisualQuoteAudioPlayer({
  track,
  compact = false,
  className = '',
  disableAutoplay = false,
  paused = false,
}, ref) {
  // Initialize to false by default to prevent UI desync if browser blocks autoplay
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRef = useRef(null);
  const prevSourceRef = useRef(track?.source);
  const instanceIdRef = useRef(`audio_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`);
  const rafIdRef = useRef(null);

  const isVideoSource = Boolean(
    track?.source &&
    (track.source.endsWith('.mp4') ||
     track.source.endsWith('.webm') ||
     track.source.endsWith('.mov') ||
     track.type === 'video')
  );

  const isLooping = Boolean(track?.loop ?? true);

  // Cancel any active requestAnimationFrame volume ramp
  const cancelFade = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  // Smooth 200ms audio gain / volume ramp-up to eliminate pops and harsh starts
  const fadeAudioIn = useCallback((media, targetVolume = 1, durationMs = 200) => {
    if (!media) return;
    cancelFade();
    try {
      media.volume = 0;
      const startTime = performance.now();
      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        media.volume = Math.min(progress * targetVolume, 1);
        if (progress < 1 && !media.paused) {
          rafIdRef.current = requestAnimationFrame(step);
        } else {
          rafIdRef.current = null;
          if (!media.paused) {
            media.volume = targetVolume;
          }
        }
      };
      rafIdRef.current = requestAnimationFrame(step);
    } catch {
      media.volume = targetVolume;
    }
  }, [cancelFade]);

  // Global Audio Coordinator Listener: pause if another audio player started
  useEffect(() => {
    const handleStopAll = (e) => {
      if (e.detail?.exceptId !== instanceIdRef.current) {
        cancelFade();
        if (mediaRef.current && !mediaRef.current.paused) {
          try {
            mediaRef.current.pause();
          } catch {
            // Silently catch pause errors
          }
        }
        setIsPlaying(false);
      }
    };

    window.addEventListener(STOP_ALL_AUDIO_EVENT, handleStopAll);
    return () => {
      window.removeEventListener(STOP_ALL_AUDIO_EVENT, handleStopAll);
    };
  }, [cancelFade]);

  // Synchronous pause when controlled paused prop becomes true
  useEffect(() => {
    if (paused) {
      cancelFade();
      if (mediaRef.current && !mediaRef.current.paused) {
        try {
          mediaRef.current.pause();
        } catch {
          // Silently catch pause errors
        }
      }
      setIsPlaying(false);
    }
  }, [paused, cancelFade]);

  // Pre-warm the media element synchronously on direct user gesture before async operations
  const prime = useCallback(async () => {
    const media = mediaRef.current;
    if (!media) return false;
    try {
      // If we already have a real track loaded or preloaded, prime directly without resetting the buffer
      const hasRealSource = media.src && media.src !== SILENT_AUDIO_URI && media.src !== window.location.href;
      if (!hasRealSource) {
        media.src = SILENT_AUDIO_URI;
      }
      media.muted = false;
      await media.play();
      return true;
    } catch (e) {
      if (e?.name === 'AbortError') return false;
      console.warn('[AudioPlayer] Prime attempt warning:', e?.message || e);
      return false;
    }
  }, []);

  // Attempt unmuted playback with smooth audio gain ramp-up and zero buffer flushing on same source
  const attemptPlay = useCallback(async (customTrack) => {
    const media = mediaRef.current;
    if (!media) return false;
    try {
      const source = customTrack?.source || (typeof customTrack === 'string' ? customTrack : track?.source);
      const targetVolume = customTrack?.volume ?? track?.volume ?? 1;

      if (source) {
        const currentSrc = media.src || '';
        const isSameSource = currentSrc === source || currentSrc.endsWith(source);
        if (!isSameSource) {
          media.src = source;
          media.loop = isLooping;
        }
      }
      if (!media.src || media.src === SILENT_AUDIO_URI || media.src === window.location.href) {
        return false;
      }

      // Silence all other playing instances before starting playback
      stopAllAudio(instanceIdRef.current);

      media.muted = false;
      fadeAudioIn(media, targetVolume, 200);
      await media.play();
      setIsPlaying(true);
      return true;
    } catch (err) {
      if (err?.name === 'AbortError') {
        // Ignored: interrupted by a subsequent play or pause request
        return false;
      }
      console.warn('[AudioPlayer] Play attempt warning:', err?.message || err);
      setIsPlaying(false);
      return false;
    }
  }, [track?.source, track?.volume, isLooping, fadeAudioIn]);

  const togglePlay = useCallback(() => {
    const media = mediaRef.current;
    if (!media || !track?.source) return;

    if (isPlaying) {
      cancelFade();
      media.pause();
      setIsPlaying(false);
    } else {
      // Silence all other playing instances before starting playback
      stopAllAudio(instanceIdRef.current);

      media.muted = false;
      if (media.src !== track.source) {
        media.src = track.source;
      }
      fadeAudioIn(media, track?.volume ?? 1, 200);
      media
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          if (err?.name === 'AbortError') return;
          console.warn('[AudioPlayer] User play trigger prevented:', err?.message || err);
          setIsPlaying(false);
        });
    }
  }, [isPlaying, track?.source, track?.volume, cancelFade, fadeAudioIn]);

  const handleEnded = useCallback(() => {
    const media = mediaRef.current;
    if (isLooping && media && track?.source) {
      media.currentTime = 0;
      media
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          if (err?.name === 'AbortError') return;
          setIsPlaying(false);
        });
    } else {
      setIsPlaying(false);
    }
  }, [isLooping, track?.source]);

  useImperativeHandle(
    ref,
    () => ({
      play: async (customTrack) => {
        return attemptPlay(customTrack);
      },
      prime: async () => {
        return prime();
      },
      pause: () => {
        cancelFade();
        if (mediaRef.current) {
          try {
            mediaRef.current.pause();
          } catch {
            // Silently catch pause errors
          }
          setIsPlaying(false);
        }
      },
      togglePlay: () => {
        togglePlay();
      },
      get isPlaying() {
        return isPlaying;
      },
      get media() {
        return mediaRef.current;
      },
    }),
    [attemptPlay, prime, togglePlay, isPlaying, cancelFade]
  );

  // 1. Manage media source and volume; clean up ONLY when track source actually changes or unmounts
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    if (track?.source && track.source !== prevSourceRef.current) {
      prevSourceRef.current = track.source;
      media.src = track.source;
      media.loop = isLooping;
      media.volume = track.volume ?? 1;
    } else if (track?.source) {
      media.loop = isLooping;
      media.volume = track.volume ?? 1;
    }
  }, [track?.source, isLooping, track?.volume]);

  // Teardown when component unmounts: cancel volume animation frame and silence media
  useEffect(() => {
    return () => {
      cancelFade();
      if (mediaRef.current) {
        try {
          mediaRef.current.pause();
          mediaRef.current.src = '';
        } catch {
          // Silently catch errors on teardown
        }
      }
    };
  }, [cancelFade]);

  const autoplayFiredRef = useRef(false);

  // 2. Handle initial autoplay trigger once when conditions are met
  useEffect(() => {
    const media = mediaRef.current;
    if (!media || !track?.source || paused || disableAutoplay) return;

    const shouldAutoplay = Boolean(track?.autoplay);

    if (shouldAutoplay && !autoplayFiredRef.current && !isPlaying) {
      autoplayFiredRef.current = true;
      stopAllAudio(instanceIdRef.current);
      media.muted = false;
      fadeAudioIn(media, track?.volume ?? 1, 200);
      media
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          if (err?.name === 'AbortError') return;
          console.warn('[AudioPlayer] Autoplay blocked by browser policy:', err?.message || err);
          setIsPlaying(false);
        });
    }
  }, [track?.source, track?.autoplay, disableAutoplay, isPlaying, paused, fadeAudioIn]);

  const hasTrack = Boolean(track?.source);

  return (
    <div className={`inline-flex items-center z-30 ${className}`}>
      {isVideoSource ? (
        <video
          ref={mediaRef}
          data-audio-id={instanceIdRef.current}
          src={track?.source || ''}
          loop={isLooping}
          playsInline={true}
          crossOrigin="anonymous"
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => {
            if (mediaRef.current?.src !== SILENT_AUDIO_URI) {
              setIsPlaying(false);
            }
          }}
          onEnded={handleEnded}
          onError={(err) => {
            if (track?.source) console.warn('[AudioPlayer] Video load error:', err);
          }}
          className="hidden"
        />
      ) : (
        <audio
          ref={mediaRef}
          data-audio-id={instanceIdRef.current}
          src={track?.source || ''}
          loop={isLooping}
          playsInline={true}
          crossOrigin="anonymous"
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => {
            if (mediaRef.current?.src !== SILENT_AUDIO_URI) {
              setIsPlaying(false);
            }
          }}
          onEnded={handleEnded}
          onError={(err) => {
            if (track?.source) console.warn('[AudioPlayer] Audio load error:', err);
          }}
        />
      )}

      {/* Main Play/Pause Button — visible once an audio track is available */}
      {hasTrack ? (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause media' : 'Play media'}
          className={`group cursor-pointer flex items-center justify-center gap-2 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white shadow-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent/50 ${
            compact
              ? 'w-10 h-10 min-w-[40px] min-h-[40px]'
              : 'min-h-[40px] px-3.5 py-2 text-xs sm:text-sm font-medium'
          }`}
        >
          <div className="relative flex items-center justify-center">
            {isPlaying ? (
              <Pause size={16} className="fill-current text-accent transition-transform group-hover:scale-110" />
            ) : (
              <Play size={16} className="fill-current text-white translate-x-0.5 transition-transform group-hover:scale-110" />
            )}
          </div>
          {!compact && (
            <span className="text-white/90 group-hover:text-white font-medium select-none tracking-wide text-xs">
              {isPlaying ? 'Pause' : 'Play'}
            </span>
          )}
        </button>
      ) : (
        <div className="w-8" />
      )}
    </div>
  );
});

export default VisualQuoteAudioPlayer;
