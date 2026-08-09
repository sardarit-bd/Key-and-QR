/**
 * Editor font loader — loads Google Fonts required by the editor canvas.
 * Deduplicated: call once per document, safe to call on every mount.
 */
import { CURATED_FONTS } from './editorConstants';

let _loaded = false;

export function ensureEditorFontsLoaded() {
  if (_loaded || typeof document === 'undefined') return;
  _loaded = true;

  const existing = document.querySelector('link[data-editor-fonts]');
  if (existing) return;

  const families = CURATED_FONTS
    .filter((f) => f.name !== 'Georgia' && f.name !== 'Courier New')
    .map((f) => {
      const name = f.name.replace(/ /g, '+');
      const weights = f.category === 'serif' || f.category === 'sans-serif'
        ? ':wght@400;700'
        : '';
      return `${name}${weights}`;
    });

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${families.join('&family=')}&display=swap`;
  link.setAttribute('data-editor-fonts', 'true');
  document.head.appendChild(link);
}
