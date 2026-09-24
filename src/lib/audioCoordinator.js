// Lightweight Global Audio Coordinator for Key-and-QR
// Ensures only one audio stream can play at a time across dashboard, modals, history, and scans.

export const STOP_ALL_AUDIO_EVENT = 'myinspiretag:stop-all-audio';

let activeAudioId = null;

export function getActiveAudioId() {
  return activeAudioId;
}

export function setActiveAudioId(id) {
  activeAudioId = id;
}

export function stopAllAudio(exceptId = null) {
  activeAudioId = exceptId;
  if (typeof window === 'undefined') return;

  try {
    window.dispatchEvent(
      new CustomEvent(STOP_ALL_AUDIO_EVENT, {
        detail: { exceptId },
      })
    );
  } catch (err) {
    console.warn('[AudioCoordinator] Failed to dispatch stop event:', err);
  }

  // Fallback direct sweep: pause any playing HTMLMediaElement across the DOM except the active one
  try {
    const mediaElements = document.querySelectorAll('audio, video');
    mediaElements.forEach((el) => {
      if (!exceptId || el.dataset?.audioId !== exceptId) {
        if (!el.paused) {
          try {
            el.pause();
          } catch {
            // Silently catch pause errors
          }
        }
      }
    });
  } catch {
    // Ignore DOM query issues
  }
}
