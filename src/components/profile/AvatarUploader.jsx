'use client';

import { useCallback, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Loader2, Trash2, UploadCloud, CheckCircle2, X, AlertCircle, CloudUpload } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { getUserInitials } from '@/utils/sidebar.utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

// Ring circumference for the circular progress indicator (r=54 → 2πr).
const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * AvatarUploader
 *
 * Premium drag & drop avatar uploader with:
 * - Click to upload + drag & drop
 * - Local preview before saving
 * - Replace / Remove actions
 * - Live upload progress via axios onUploadProgress (circular ring + %)
 * - "Processing…" state after the transfer hits 100% while the server saves
 * - File validation + error handling
 * - Auto-refreshes the auth store user after a successful upload (no reload)
 *
 * The avatar image stays fully visible during upload — only a subtle glass
 * overlay + a circular progress ring around the border are shown. After the
 * upload resolves, the success check animates briefly, the store user is
 * updated (sidebar/navbar/profile header re-render instantly), and the
 * upload state clears automatically.
 *
 * Modes:
 * - `editing=false` (view mode): a chosen file uploads immediately.
 * - `editing=true` (edit mode): the file is staged (preview + pending) and
 *   the parent page calls the exposed `save()` handle together with the
 *   profile save.
 *
 * Imperative handle: `save()`, `reset()`, `remove()`, `hasPending()`,
 * `hasRemoval()`, `isUploading()`.
 *
 * Uses the existing POST /auth/upload-avatar endpoint — no auth changes.
 */
const AvatarUploader = forwardRef(function AvatarUploader(
  {
    size = 'lg',
    editing = false,
    compact = false,
    onPendingChange,
    onRemoved,
    onUploadStateChange,
  },
  ref
) {
  const { user, setUser } = useAuthStore();
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(null);         // blob URL preview
  const [pendingFile, setPendingFile] = useState(null); // staged File (edit mode)
  const [avatarRemovedFlag, setAvatarRemovedFlag] = useState(false); // edit-mode removal pending save
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);  // transfer done, server saving
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const successTimerRef = useRef(null);

  const currentImage = user?.profileImage?.url || user?.profileImage || null;
  const displayImage = avatarRemovedFlag ? null : preview || currentImage;
  const isPending = !!pendingFile || avatarRemovedFlag;
  const isUploading = uploading || processing;

  // Notify parent of staged-file state (edit mode)
  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  // Notify parent of upload state (so the page can disable Save)
  useEffect(() => {
    onUploadStateChange?.(isUploading);
  }, [isUploading, onUploadStateChange]);

  // Clear any pending success timer on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  const resetLocal = useCallback(() => {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setPendingFile(null);
    setAvatarRemovedFlag(false);
    setError(null);
    setProgress(0);
    setProcessing(false);
    setSuccess(false);
    setUploading(false);
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
    onRemoved?.(false);
  }, [preview, onRemoved]);

  const validateFile = useCallback((file) => {
    if (!file) return 'No file selected';
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please choose a JPG, PNG, WEBP, or GIF image.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Image must be smaller than 5MB.';
    }
    return null;
  }, []);

  const stageFile = useCallback(
    (file) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        toast.error(validationError);
        return;
      }
      setError(null);
      setSuccess(false);
      setUploading(false);
      setProcessing(false);
      setProgress(0);
      setAvatarRemovedFlag(false);
      onRemoved?.(false);

      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setPendingFile(file);

      if (!editing) {
        performUpload(file);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editing, preview, validateFile]
  );

  const handleInputChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) stageFile(file);
      if (e.target) e.target.value = '';
    },
    [stageFile]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) stageFile(file);
    },
    [stageFile]
  );

  const handleRemove = useCallback(() => {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setPendingFile(null);
    setError(null);

    // Persist removal through the existing PATCH /auth/update-profile
    // endpoint (profileImage: null clears the avatar on the server).
    if (!editing) {
      performRemove();
    } else {
      setAvatarRemovedFlag(true);
      onRemoved?.(true);
      toast.success('Avatar removed. Save to apply.');
    }
  }, [preview, editing, onRemoved]);

  const performRemove = useCallback(async () => {
    setUploading(true);
    setError(null);
    try {
      await api.patch('/auth/update-profile', { profileImage: null });
      setUser({ ...user, profileImage: null });
      setAvatarRemovedFlag(true);
      setUploading(false);
      setSuccess(true);
      onRemoved?.(true);
      toast.success('Avatar removed.');
      successTimerRef.current = setTimeout(() => setSuccess(false), 700);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to remove avatar.';
      setError(message);
      toast.error(message);
      setUploading(false);
    }
  }, [setUser, user, onRemoved]);

  // Called by the parent page's Save button (edit mode) or directly (view mode).
  const performUpload = useCallback(
    async (file = pendingFile) => {
      if (!file) return false;
      setUploading(true);
      setProcessing(false);
      setProgress(0);
      setSuccess(false);
      setError(null);

      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await api.post('/auth/upload-avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (event) => {
            if (!event.total) return;
            // Smoothly clamp so we never sit at 100% while the server is
            // still processing the multipart body (avoids a "stuck" state).
            const pct = Math.round((event.loaded / event.total) * 100);
            setProgress(Math.min(pct, 99));
          },
        });

        // Transfer complete — the backend is still saving the file. Show
        // "Processing…" until the response resolves (usually instant).
        setProgress(100);
        setProcessing(true);

        const imageData = res.data?.data;
        if (imageData) {
          const newImageUrl = imageData?.url || imageData?.secure_url || imageData;
          // Update the auth store user → sidebar, navbar, profile header all
          // re-render instantly with the new avatar (no page reload).
          setUser({ ...user, profileImage: newImageUrl });
          setAvatarRemovedFlag(false);
          // Exit the upload state FIRST so the success check renders, then
          // auto-clear the success animation after a short delay.
          setProcessing(false);
          setUploading(false);
          setSuccess(true);
          toast.success('Avatar updated!');
          if (preview && preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
          }
          setPreview(null);
          setPendingFile(null);
          onPendingChange?.(false);
          onRemoved?.(false);
          // Brief success animation (500–800ms), then return to normal view.
          successTimerRef.current = setTimeout(() => {
            setSuccess(false);
          }, 700);
          return true;
        }
        setProcessing(false);
        setUploading(false);
        return false;
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to upload avatar. Please try again.';
        setError(message);
        toast.error(message);
        setProcessing(false);
        setUploading(false);
        return false;
      }
    },
    [pendingFile, preview, setUser, user, onPendingChange, onRemoved]
  );

  const avatarSizes = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
    xl: 'h-40 w-40',
  };
  const avatarClass = avatarSizes[size] || avatarSizes.lg;

  // Expose save()/reset()/remove() to the parent page (edit-mode coordination).
  useImperativeHandle(ref, () => ({
    save: () => performUpload(),
    reset: resetLocal,
    hasPending: () => isPending,
    hasRemoval: () => avatarRemovedFlag,
    remove: () => performRemove(),
    isUploading: () => isUploading,
  }), [performUpload, resetLocal, isPending, avatarRemovedFlag, performRemove, isUploading]);

  // Progress ring — stroke-dashoffset drives the circular indicator.
  const ringOffset = RING_CIRCUMFERENCE - (progress / 100) * RING_CIRCUMFERENCE;

  return (
    <div className="flex flex-col items-center">
      {/* Avatar circle + overlays */}
      <div className="relative">
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-primary/40 via-accent/20 to-primary/20 blur-md" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 18 }}
          className={`relative ${avatarClass} rounded-full overflow-hidden ring-1 ring-white/10 shadow-[0_0_32px_rgba(168,85,247,0.2)] bg-gradient-to-tr from-primary via-primary/70 to-primary/40 flex items-center justify-center`}
        >
          {displayImage ? (
            <img
              src={displayImage}
              alt={user?.name || 'Profile avatar'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <span className="text-foreground text-3xl font-semibold">
              {getUserInitials(user?.name)}
            </span>
          )}

          {/* ===== Upload overlay — subtle glass, avatar stays visible ===== */}
          <AnimatePresence>
            {isUploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1.5 bg-black/15 backdrop-blur-[2px] pointer-events-none"
              >
                {processing && progress >= 100 ? (
                  <>
                    <Loader2 className="w-6 h-6 text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)] animate-spin" />
                    <span className="text-[11px] font-semibold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                      Processing…
                    </span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-5 h-5 text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]" />
                    <span className="text-[11px] font-semibold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                      Uploading… {progress}%
                    </span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===== Success check animation (auto-clears) ===== */}
          <AnimatePresence>
            {success && !isUploading && (
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-500/25 backdrop-blur-[2px] pointer-events-none"
              >
                <motion.span
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/90 shadow-[0_0_24px_rgba(52,211,153,0.5)]"
                >
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drag active highlight */}
          {dragActive && (
            <div className="absolute inset-0 bg-accent/20 border-2 border-dashed border-accent/60 rounded-full z-10 flex items-center justify-center">
              <UploadCloud className="w-8 h-8 text-accent" />
            </div>
          )}
        </motion.div>

        {/* ===== Circular progress ring around the avatar border ===== */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-none absolute -inset-1.5 z-20"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 120 120"
                className="w-full h-full -rotate-90"
                fill="none"
              >
                {/* Track */}
                <circle
                  cx="60"
                  cy="60"
                  r={RING_RADIUS}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Progress */}
                <circle
                  cx="60"
                  cy="60"
                  r={RING_RADIUS}
                  stroke="url(#avatar-progress-gradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={ringOffset}
                  style={{
                    transition: 'stroke-dashoffset 0.2s ease-out',
                    filter: 'drop-shadow(0 0 6px rgba(253,182,92,0.6))',
                  }}
                />
                <defs>
                  <linearGradient id="avatar-progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camera badge — hidden while uploading so the avatar can't be re-triggered */}
        {(editing || !compact) && !isUploading && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload a new profile photo"
            className="absolute bottom-1 right-1 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-background text-foreground-secondary shadow-[0_4px_14px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:text-accent hover:border-accent/40 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ===== Percentage below the avatar (clean modern style) ===== */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-3 flex items-center gap-2"
            role="status"
            aria-live="polite"
          >
            {processing && progress >= 100 ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
                <span className="text-[12px] font-medium text-foreground-secondary">
                  Processing…
                </span>
              </>
            ) : (
              <>
                <span className="text-[12px] font-medium text-foreground-tertiary">
                  Uploading
                </span>
                <span className="tabular-nums text-[13px] font-semibold text-accent">
                  {progress}%
                </span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Drag & drop target (only in edit mode, non-compact) */}
      {editing && !compact && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Drop an image here or click to upload"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`mt-4 w-full max-w-[260px] rounded-xl border border-dashed px-4 py-3 text-center text-xs transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
            dragActive
              ? 'border-accent/60 bg-accent/10 text-accent'
              : 'border-white/10 bg-background-secondary/40 text-foreground-tertiary hover:border-accent/30 hover:text-foreground-secondary'
          }`}
        >
          {dragActive ? (
            <span className="flex items-center justify-center gap-1.5">
              <UploadCloud className="w-4 h-4" /> Drop to upload
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <UploadCloud className="w-4 h-4" /> Drag &amp; drop or click to upload
            </span>
          )}
        </div>
      )}

      {/* Pending / action row */}
      <div className="mt-2 flex items-center gap-2">
        {isPending && !isUploading && editing && (
          <>
            <span className="inline-flex items-center gap-1 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] font-medium text-accent">
              New avatar staged — save to apply
            </span>
            <button
              type="button"
              onClick={resetLocal}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-background-secondary/40 px-3 py-1 text-[11px] font-medium text-foreground-tertiary transition-all duration-300 hover:text-foreground cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Discard
            </button>
          </>
        )}

        {!isPending && !isUploading && displayImage && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove avatar"
            className="inline-flex items-center gap-1 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-[11px] font-medium text-red-400/90 transition-all duration-300 hover:bg-red-500/20 hover:text-red-400 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove
          </button>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 flex items-center gap-1.5 text-[11px] text-red-400"
            role="alert"
          >
            <AlertCircle className="w-3.5 h-3.5" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

export default AvatarUploader;
