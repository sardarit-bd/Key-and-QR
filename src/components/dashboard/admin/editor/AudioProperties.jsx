'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import useEditorStore from './editorStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Music, Upload, Play, Pause, Loader2, Volume2 } from 'lucide-react';

function FieldLabel({ children }) {
  return (
    <label className="block text-[10px] font-medium text-foreground-tertiary uppercase tracking-widest mb-1.5">
      {children}
    </label>
  );
}

export default function AudioProperties({ selectedEl }) {
  const patchElementData = useEditorStore((s) => s.patchElementData);
  const incrementVersion = useEditorStore((s) => s.incrementVersion);
  const pushHistory = useEditorStore((s) => s.pushHistory);

  const [uploading, setUploading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  const id = selectedEl?.id;
  const audioData = selectedEl?.audioData || {};
  const audioUrl = audioData.source || '';
  const title = audioData.title || '';
  const autoplay = audioData.autoplay ?? false;
  const loop = audioData.loop ?? false;
  const volume = audioData.volume ?? 1;

  // Sync volume of audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume, audioUrl]);

  // Pause preview player if URL changes or selected item changes
  useEffect(() => {
    setPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [audioUrl, id]);

  const applyAudioProp = useCallback(
    (key, value) => {
      if (!id) return;
      patchElementData(id, 'audioData', {
        [key]: value,
      });
      pushHistory();
      incrementVersion();
    },
    [id, patchElementData, incrementVersion, pushHistory]
  );

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Please select an audio file (MP3, WAV, etc.)');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file); // Multer expects field name "image"

    try {
      const response = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.success && response.data?.data?.url) {
        const url = response.data.data.url;
        applyAudioProp('source', url);
        if (!title) {
          applyAudioProp('title', file.name.replace(/\.[^/.]+$/, ""));
        }
        toast.success('Audio file uploaded successfully');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to upload audio');
    } finally {
      setUploading(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setPlaying(true))
        .catch(err => {
          console.error(err);
          toast.error('Failed to play audio preview');
        });
    }
  };

  return (
    <div className="space-y-5">
      {/* Audio player block */}
      <div>
        <FieldLabel>Audio Track</FieldLabel>
        <div className="p-3.5 rounded-xl border border-border bg-muted flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Music size={18} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground truncate">
              {title || 'No audio selected'}
            </p>
            <p className="text-[10px] text-foreground-tertiary truncate">
              {audioUrl ? 'Ready to play' : 'Upload file to start'}
            </p>
          </div>
          {audioUrl && (
            <button
              type="button"
              onClick={togglePlayback}
              className="w-8 h-8 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground flex items-center justify-center shadow cursor-pointer transition-colors"
            >
              {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} className="ml-0.5" fill="currentColor" />}
            </button>
          )}
        </div>
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            loop={loop}
            onEnded={() => setPlaying(false)}
            className="hidden"
          />
        )}
      </div>

      {/* Upload/Replace Input */}
      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="audio/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-9 flex items-center justify-center gap-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground-secondary text-xs font-medium cursor-pointer transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Uploading Audio...</span>
            </>
          ) : (
            <>
              <Upload size={13} />
              <span>{audioUrl ? 'Replace Audio File' : 'Upload Audio File'}</span>
            </>
          )}
        </button>
      </div>

      {/* Title */}
      <div>
        <FieldLabel>Track Title</FieldLabel>
        <input
          type="text"
          value={title}
          onChange={(e) => applyAudioProp('title', e.target.value)}
          placeholder="e.g. Morning Inspiration"
          className="w-full px-2.5 py-1.5 text-xs border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
        />
      </div>

      {/* Autoplay & Loop toggles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-foreground">Autoplay</p>
            <p className="text-[10px] text-foreground-tertiary">Start playing automatically on scan</p>
          </div>
          <input
            type="checkbox"
            checked={autoplay}
            onChange={(e) => applyAudioProp('autoplay', e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-foreground">Loop Track</p>
            <p className="text-[10px] text-foreground-tertiary">Restart automatically when ended</p>
          </div>
          <input
            type="checkbox"
            checked={loop}
            onChange={(e) => applyAudioProp('loop', e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
          />
        </div>
      </div>

      {/* Volume slider */}
      <div>
        <FieldLabel>Volume</FieldLabel>
        <div className="flex items-center gap-2.5 h-9">
          <Volume2 size={14} className="text-foreground-tertiary shrink-0" />
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(volume * 100)}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (Number.isFinite(val)) {
                applyAudioProp('volume', val / 100);
              }
            }}
            className="w-full h-1.5 bg-muted rounded cursor-pointer accent-primary"
          />
          <span className="text-[10px] font-mono w-8 text-right shrink-0">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
