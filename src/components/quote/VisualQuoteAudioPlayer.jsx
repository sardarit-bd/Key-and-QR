'use client';

import { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, Volume2 } from 'lucide-react';

export default function VisualQuoteAudioPlayer({
  track,
  compact = false,
  className = '',
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    setIsPlaying(false);
    setIsLoaded(false);

    if (audioRef.current && track?.source) {
      const audio = audioRef.current;
      audio.src = track.source;
      audio.loop = track.loop ?? true;
      audio.volume = track.volume ?? 1;

      if (track.autoplay) {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            // Autoplay blocked by browser policy - user interaction required
            console.warn('[AudioPlayer] Autoplay prevented by browser:', err?.message || err);
            setIsPlaying(false);
          });
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [track]);

  if (!track?.source) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('[AudioPlayer] Audio playback prevented:', err?.message || err);
          setIsPlaying(false);
        });
    }
  };

  return (
    <div className={`inline-flex items-center z-30 ${className}`}>
      <audio
        ref={audioRef}
        src={track.source}
        loop={track.loop ?? true}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onCanPlay={() => setIsLoaded(true)}
        onError={(err) => console.warn('[AudioPlayer] Audio load error:', err)}
      />
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause quote audio' : 'Play quote audio'}
        className={`group cursor-pointer flex items-center justify-center gap-2 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white shadow-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent/50 ${
          compact
            ? 'w-11 h-11 min-w-[44px] min-h-[44px] sm:w-10 sm:h-10 sm:min-w-[40px] sm:min-h-[40px]'
            : 'min-h-[44px] px-3.5 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium'
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
            {isPlaying ? 'Pause Music' : 'Play Music'}
          </span>
        )}
      </button>
    </div>
  );
}
