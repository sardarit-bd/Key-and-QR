'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';

// Standard 44-byte silent PCM WAV data URI used to pre-warm and unlock mobile audio contexts on user gesture
const SILENT_AUDIO_URI = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

const VisualQuoteAudioPlayer = forwardRef(function VisualQuoteAudioPlayer({
  track,
  compact = false,
  className = '',
  disableAutoplay = false,
}, ref) {
  // Initialize to false by default to prevent UI desync if browser blocks autoplay
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRef = useRef(null);
  const prevSourceRef = useRef(track?.source);

  const isVideoSource = Boolean(
    track?.source &&
    (track.source.endsWith('.mp4') ||
     track.source.endsWith('.webm') ||
     track.source.endsWith('.mov') ||
     track.type === 'video')
  );

  const isLooping = Boolean(track?.loop ?? true);

  // Pre-warm the media element synchronously on direct user gesture before async operations
  const prime = useCallback(async () => {
    const media = mediaRef.current;
    if (!media) return false;
    try {
      if (!media.src || media.src === window.location.href) {
        media.src = SILENT_AUDIO_URI;
      }
      media.muted = false;
      await media.play();
      return true;
    } catch (e) {
      console.warn('[AudioPlayer] Prime attempt warning:', e?.message || e);
      return false;
    }
  }, []);

  // Attempt unmuted playback; accurately records state without deceptive muted illusions
  const attemptPlay = useCallback(async (customTrack) => {
    const media = mediaRef.current;
    if (!media) return false;
    try {
      const source = customTrack?.source || (typeof customTrack === 'string' ? customTrack : track?.source);
      if (source && media.src !== source) {
        media.src = source;
        media.loop = isLooping;
        media.volume = customTrack?.volume ?? track?.volume ?? 1;
      }
      if (!media.src || media.src === SILENT_AUDIO_URI || media.src === window.location.href) {
        return false;
      }
      media.muted = false;
      await media.play();
      setIsPlaying(true);
      return true;
    } catch (err) {
      console.warn('[AudioPlayer] Play attempt warning:', err?.message || err);
      setIsPlaying(false);
      return false;
    }
  }, [track?.source, track?.volume, isLooping]);

  const togglePlay = useCallback(() => {
    const media = mediaRef.current;
    if (!media || !track?.source) return;

    if (isPlaying) {
      media.pause();
      setIsPlaying(false);
    } else {
      media.muted = false;
      if (media.src !== track.source) {
        media.src = track.source;
      }
      media
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('[AudioPlayer] User play trigger prevented:', err?.message || err);
          setIsPlaying(false);
        });
    }
  }, [isPlaying, track?.source]);

  const handleEnded = useCallback(() => {
    const media = mediaRef.current;
    if (isLooping && media && track?.source) {
      media.currentTime = 0;
      media
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
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
        if (mediaRef.current) {
          mediaRef.current.pause();
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
    [attemptPlay, prime, togglePlay, isPlaying]
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

  // Teardown when component unmounts
  useEffect(() => {
    return () => {
      if (mediaRef.current) {
        mediaRef.current.pause();
        mediaRef.current.src = '';
      }
    };
  }, []);

  // 2. Handle autoplay trigger when conditions are met WITHOUT tearing down media on prop changes
  useEffect(() => {
    const media = mediaRef.current;
    if (!media || !track?.source) return;

    const shouldAutoplay = !disableAutoplay && Boolean(track?.autoplay);

    if (shouldAutoplay && !isPlaying) {
      media.muted = false;
      media
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('[AudioPlayer] Autoplay blocked by browser policy:', err?.message || err);
          setIsPlaying(false);
        });
    }
  }, [track?.source, track?.autoplay, disableAutoplay, isPlaying]);

  const hasTrack = Boolean(track?.source);

  return (
    <div className={`inline-flex items-center z-30 ${className}`}>
      {isVideoSource ? (
        <video
          ref={mediaRef}
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
          src={track?.source || ''}
          loop={isLooping}
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
