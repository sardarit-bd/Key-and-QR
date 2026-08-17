'use client';

import { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause } from 'lucide-react';

export default function VisualQuoteAudioPlayer({ track, className = '' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && track?.source) {
      audioRef.current.src = track.source;
      audioRef.current.loop = track.loop ?? true;
      audioRef.current.volume = track.volume ?? 1;
      if (track.autoplay) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.warn('Autoplay prevented:', err));
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
        .catch((err) => console.warn('Audio playback prevented:', err));
    }
  };

  return (
    <div className={`flex items-center gap-2 z-30 ${className}`}>
      <audio
        ref={audioRef}
        src={track.source}
        loop={track.loop ?? true}
        onEnded={() => setIsPlaying(false)}
      />
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-medium transition shadow-lg cursor-pointer active:scale-95"
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
  );
}
