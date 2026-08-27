'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';

const VisualQuoteAudioPlayer = forwardRef(function VisualQuoteAudioPlayer({
  track,
  compact = false,
  className = '',
  disableAutoplay = false,
}, ref) {
  // Initialize to false by default to prevent UI desync if browser blocks autoplay
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRef = useRef(null);

  const isVideoSource = Boolean(
    track?.source &&
    (track.source.endsWith('.mp4') ||
     track.source.endsWith('.webm') ||
     track.source.endsWith('.mov') ||
     track.type === 'video')
  );

  const isLooping = Boolean(track?.loop ?? true);

  const attemptPlay = useCallback(async () => {
    if (!mediaRef.current) return false;
    try {
      await mediaRef.current.play();
      setIsPlaying(true);
      return true;
    } catch (err) {
      console.warn('[AudioPlayer] Play attempt warning:', err?.message || err);
      // Attempt muted fallback
      if (mediaRef.current && !mediaRef.current.muted) {
        mediaRef.current.muted = true;
        try {
          await mediaRef.current.play();
          setIsPlaying(true);
          return true;
        } catch (e) {
          setIsPlaying(false);
          return false;
        }
      }
      setIsPlaying(false);
      return false;
    }
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      play: async () => {
        return attemptPlay();
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
    [isPlaying, attemptPlay]
  );

  // Auto-play on mount / track change with strict browser autoplay policy handling
  useEffect(() => {
    const media = mediaRef.current;
    if (!media || !track?.source) return;

    media.src = track.source;
    media.loop = isLooping;
    media.volume = track.volume ?? 1;

    const shouldAutoplay = !disableAutoplay && Boolean(track?.autoplay);

    if (shouldAutoplay) {
      media
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('[AudioPlayer] Autoplay blocked by browser policy:', err?.message || err);
          setIsPlaying(false);
        });
    } else {
      setIsPlaying(false);
    }

    return () => {
      if (media) {
        media.pause();
        media.src = '';
      }
    };
  }, [track?.source, track?.autoplay, isLooping, track?.volume, disableAutoplay]);

  if (!track?.source) return null;

  const togglePlay = () => {
    const media = mediaRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
      setIsPlaying(false);
    } else {
      media.muted = false;
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
  };

  const handleEnded = () => {
    if (isLooping && mediaRef.current) {
      mediaRef.current.currentTime = 0;
      mediaRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <div className={`inline-flex items-center z-30 ${className}`}>
      {isVideoSource ? (
        <video
          ref={mediaRef}
          src={track.source}
          loop={isLooping}
          playsInline={true}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleEnded}
          onError={(err) => console.warn('[AudioPlayer] Video load error:', err)}
          className="hidden"
        />
      ) : (
        <audio
          ref={mediaRef}
          src={track.source}
          loop={isLooping}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleEnded}
          onError={(err) => console.warn('[AudioPlayer] Audio load error:', err)}
        />
      )}

      {/* Main Play/Pause Button */}
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
    </div>
  );
});

export default VisualQuoteAudioPlayer;

