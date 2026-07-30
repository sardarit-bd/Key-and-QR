/**
 * Editor shared constants
 * Single source of truth for editor configuration values.
 */

export const EDITOR_VERSION = '1.0';

export const CANVAS_DEFAULTS = {
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  safeArea: { x: 40, y: 40, width: 720, height: 520 },
  aspectRatio: { width: 4, height: 3 },
};

export const ZOOM = {
  min: 0.25,
  max: 2,
  step: 0.1,
  fitMargin: 40,
};

export const CURATED_FONTS = [
  { name: 'Inter', label: 'Inter', category: 'sans-serif' },
  { name: 'Playfair Display', label: 'Playfair Display', category: 'serif' },
  { name: 'Georgia', label: 'Georgia', category: 'serif' },
  { name: 'Montserrat', label: 'Montserrat', category: 'sans-serif' },
  { name: 'Pacifico', label: 'Pacifico', category: 'handwriting' },
  { name: 'Courier New', label: 'Monospace', category: 'monospace' },
];

export const FONT_SIZES = [24, 32, 48, 64, 72];

export const FONT_WEIGHTS = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Bold' },
];

export const TEXT_ALIGN = [
  { value: 'left', label: 'Left', icon: 'AlignLeft' },
  { value: 'center', label: 'Center', icon: 'AlignCenter' },
  { value: 'right', label: 'Right', icon: 'AlignRight' },
];

export const IMAGE_FIT_OPTIONS = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Fill' },
  { value: 'none', label: 'Original' },
];

export const SHAPE_TYPES = [
  { value: 'rect', label: 'Rectangle', icon: 'Square' },
  { value: 'circle', label: 'Circle', icon: 'Circle' },
  { value: 'line', label: 'Line', icon: 'Minus' },
];

export const BACKGROUND_PRESET_COLORS = [
  '#ffffff', '#000000', '#1a1a2e', '#16213e',
  '#0f3460', '#e3ba85', '#667eea', '#764ba2',
  '#f5af19', '#f12711', '#11998e', '#38ef7d',
  '#fc5c7d', '#6a82fb', '#141e30', '#243b55',
  '#2c3e50', '#3498db', '#e74c3c', '#f39c12',
];

export const GRADIENT_PRESETS = [
  { label: 'Sunset', colors: ['#f5af19', '#f12711'], angle: 135 },
  { label: 'Ocean', colors: ['#667eea', '#764ba2'], angle: 135 },
  { label: 'Forest', colors: ['#11998e', '#38ef7d'], angle: 135 },
  { label: 'Night', colors: ['#141e30', '#243b55'], angle: 180 },
  { label: 'Amber', colors: ['#e3ba85', '#c99552'], angle: 135 },
  { label: 'Rose', colors: ['#fc5c7d', '#6a82fb'], angle: 135 },
];

export const MAX_ELEMENTS = 50;
export const MIN_ELEMENT_SIZE = 20;
export const SNAP_THRESHOLD = 5;
export const GRID_SIZE = 20;
export const ROTATION_SNAP = 15;
export const AUTO_SAVE_DELAY = 30000;
export const DEFAULT_FONT_SIZE = 48;
export const DEFAULT_FONT = 'Playfair Display';
