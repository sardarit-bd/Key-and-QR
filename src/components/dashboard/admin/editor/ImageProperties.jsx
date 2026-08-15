'use client';

import { useState, useRef, useCallback } from 'react';
import useEditorStore from './editorStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

function FieldLabel({ children }) {
  return (
    <label className="block text-[10px] font-medium text-foreground-tertiary uppercase tracking-widest mb-1.5">
      {children}
    </label>
  );
}

export default function ImageProperties({ selectedEl }) {
  const patchElementData = useEditorStore((s) => s.patchElementData);
  const incrementVersion = useEditorStore((s) => s.incrementVersion);
  const pushHistory = useEditorStore((s) => s.pushHistory);

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const id = selectedEl?.id;
  const imageData = selectedEl?.imageData || {};
  const imageUrl = imageData.source?.url || '';
  const fit = imageData.fit || 'cover';

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.success && response.data?.data?.url) {
        const url = response.data.data.url;
        patchElementData(id, 'imageData', {
          source: {
            type: 'cloudinary',
            publicId: '',
            url,
          },
        });
        pushHistory();
        incrementVersion();
        toast.success('Image uploaded successfully');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFitChange = useCallback(
    (v) => {
      if (!id) return;
      patchElementData(id, 'imageData', {
        fit: v,
      });
      pushHistory();
      incrementVersion();
    },
    [id, patchElementData, incrementVersion, pushHistory]
  );

  return (
    <div className="space-y-5">
      {/* Current Image Preview */}
      <div>
        <FieldLabel>Current Image</FieldLabel>
        <div className="relative group aspect-video rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
          {imageUrl ? (
            <img src={imageUrl} alt="Element" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="text-foreground-tertiary/40" size={32} />
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-background text-foreground text-xs font-medium cursor-pointer shadow flex items-center gap-1.5"
            >
              <Upload size={12} />
              Replace
            </button>
          </div>
        </div>
      </div>

      {/* Upload/Replace Button */}
      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
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
              <span>Uploading Image...</span>
            </>
          ) : (
            <>
              <Upload size={13} />
              <span>Replace Image</span>
            </>
          )}
        </button>
      </div>

      {/* Fit Mode */}
      <div>
        <FieldLabel>Fit Mode (object-fit)</FieldLabel>
        <Select value={fit} onValueChange={handleFitChange}>
          <SelectTrigger className="h-9 text-xs rounded-lg w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cover" className="text-xs">Cover (fill and crop)</SelectItem>
            <SelectItem value="contain" className="text-xs">Contain (letterbox)</SelectItem>
            <SelectItem value="fill" className="text-xs">Stretch to Fit</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
