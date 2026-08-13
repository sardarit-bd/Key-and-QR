/**
 * Editor Zustand Store
 *
 * Manages all editor state:
 * - Canvas configuration
 * - Elements (Fabric.js serializable data)
 * - Selection
 * - Background
 * - Audio
 * - Undo/Redo history
 * - Saving/loading state
 *
 * Business logic stays in editorUtils.js — this store only holds state.
 */
import { create } from 'zustand';
import { CANVAS_DEFAULTS, MAX_ELEMENTS, EDITOR_VERSION, PREVIEW_MODES, DEFAULT_ICON_SIZE, DEFAULT_ICON_COLOR } from './editorConstants';

let elementCounter = 0;
const generateId = () => `el_${Date.now()}_${++elementCounter}`;

const initialState = {
  // Editor document state
  editorVersion: EDITOR_VERSION,

  // Canvas configuration
  canvas: {
    width: CANVAS_DEFAULTS.width,
    height: CANVAS_DEFAULTS.height,
    zoom: 1,
  },

  // Background config
  background: null,

  // All elements
  elements: [],

  // Selection
  selectedElementIds: [],
  activeToolId: null,

  // Audio
  audio: null,

  // Preview mode (desktop/mobile viewport toggle)
  previewMode: PREVIEW_MODES.desktop,

  // Metadata
  quoteId: null,
  quoteText: '',
  quoteCategory: 'love',
  isDirty: false,
  isSaving: false,
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,

  // Undo/Redo
  history: [],
  historyIndex: -1,
  maxHistory: 50,

  // Structural version — increments ONLY on add/remove/reorder/clear.
  // The canvas hook watches this to avoid infinite re-render
  // when Fabric events push property updates back to the store.
  renderVersion: 0,
};

const useEditorStore = create((set, get) => ({
  ...initialState,

  // ============================================================
  // Canvas actions
  // ============================================================

  setCanvasSize: (width, height) => {
    const state = get();
    state.pushHistory();
    set({
      canvas: { ...state.canvas, width, height },
      renderVersion: state.renderVersion + 1,
      isDirty: true
    });
  },

  setZoom: (zoom) => {
    set({ canvas: { ...get().canvas, zoom: Math.max(0.25, Math.min(2, zoom)) } });
  },

  // ============================================================
  // Element actions
  // ============================================================

  addElement: (element) => {
    const state = get();
    if (state.elements.length >= MAX_ELEMENTS) return null;
    const newElement = JSON.parse(JSON.stringify({ ...element, id: element.id || generateId() }));
    state.pushHistory();
    set({
      elements: [...state.elements, newElement],
      selectedElementIds: [newElement.id],
      renderVersion: state.renderVersion + 1,
      isDirty: true,
    });
    return newElement;
  },

  updateElement: (id, updates) => {
    const state = get();
    state.pushHistory();
    set({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
      isDirty: true,
    });
  },

  /** Update element WITHOUT creating a history entry (for live keystroke sync) */
  patchElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
      isDirty: true,
    }));
  },

  updateElementData: (id, dataKey, dataValue) => {
    const state = get();
    state.pushHistory();
    set({
      elements: state.elements.map((el) =>
        el.id === id
          ? { ...el, [dataKey]: { ...el[dataKey], ...dataValue } }
          : el
      ),
      isDirty: true,
    });
  },

  /** Update element sub-data WITHOUT creating a history entry */
  patchElementData: (id, dataKey, dataValue) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id
          ? { ...el, [dataKey]: { ...el[dataKey], ...dataValue } }
          : el
      ),
      isDirty: true,
    }));
  },

  removeElement: (id) => {
    const state = get();
    state.pushHistory();
    set({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementIds: state.selectedElementIds.filter((sid) => sid !== id),
      renderVersion: state.renderVersion + 1,
      isDirty: true,
    });
  },

  removeElements: (ids) => {
    const state = get();
    const idSet = new Set(ids);
    state.pushHistory();
    set({
      elements: state.elements.filter((el) => !idSet.has(el.id)),
      selectedElementIds: state.selectedElementIds.filter((sid) => !idSet.has(sid)),
      renderVersion: state.renderVersion + 1,
      isDirty: true,
    });
  },

  /** Update x/y for keyboard arrow-key movement (Fabric is updated separately) */
  moveElement: (id, dx, dy) => {
    const state = get();
    state.pushHistory();
    set({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, x: el.x + dx, y: el.y + dy } : el
      ),
      isDirty: true,
    });
  },

  moveElements: (ids, dx, dy) => {
    const state = get();
    state.pushHistory();
    const idSet = new Set(ids);
    set({
      elements: state.elements.map((el) =>
        idSet.has(el.id) ? { ...el, x: el.x + dx, y: el.y + dy } : el
      ),
      isDirty: true,
    });
  },

  /** Batch-update multiple elements in a SINGLE history entry (for multi-selection drag) */
  updateMultipleElements: (updatesMap) => {
    const state = get();
    state.pushHistory();
    set({
      elements: state.elements.map((el) =>
        updatesMap[el.id] ? { ...el, ...updatesMap[el.id] } : el
      ),
      isDirty: true,
    });
  },

  clearElements: () => {
    const state = get();
    state.pushHistory();
    set({
      elements: [],
      selectedElementIds: [],
      renderVersion: state.renderVersion + 1,
      isDirty: true
    });
  },

  reorderElement: (fromIndex, toIndex) => {
    const state = get();
    if (fromIndex === toIndex) return;
    state.pushHistory();
    const elements = [...state.elements];
    const [moved] = elements.splice(fromIndex, 1);
    elements.splice(toIndex, 0, moved);
    const reindexed = elements.map((el, i) => ({ ...el, zIndex: i }));
    set({
      elements: reindexed,
      renderVersion: state.renderVersion + 1,
      isDirty: true
    });
  },

  duplicateElement: (id) => {
    const state = get();
    const source = state.elements.find((el) => el.id === id);
    if (!source || state.elements.length >= MAX_ELEMENTS) return;
    state.pushHistory();
    const clone = JSON.parse(JSON.stringify({
      ...source,
      id: generateId(),
      x: source.x + 20,
      y: source.y + 20,
      zIndex: state.elements.length,
    }));
    set({
      elements: [...state.elements, clone],
      selectedElementIds: [clone.id],
      renderVersion: state.renderVersion + 1,
      isDirty: true,
    });
  },

  // ============================================================
  // Selection
  // ============================================================

  setSelection: (ids) => {
    set({ selectedElementIds: Array.isArray(ids) ? ids : (ids ? [ids] : []) });
  },

  setActiveTool: (toolId) => {
    set({ activeToolId: toolId });
  },

  addToSelection: (id) => {
    const state = get();
    if (state.selectedElementIds.includes(id)) return;
    set({ selectedElementIds: [...state.selectedElementIds, id] });
  },

  clearSelection: () => {
    set({ selectedElementIds: [] });
  },

  removeFromSelection: (id) => {
    const state = get();
    set({ selectedElementIds: state.selectedElementIds.filter((sid) => sid !== id) });
  },

  // ============================================================
  // Preview mode
  // ============================================================

  setPreviewMode: (mode) => {
    set({ previewMode: mode, isDirty: true });
  },

  // ============================================================
  // Background
  // ============================================================

  setBackground: (bg) => {
    const state = get();
    state.pushHistory();
    set({
      background: bg,
      renderVersion: state.renderVersion + 1,
      isDirty: true
    });
  },

  clearBackground: () => {
    const state = get();
    state.pushHistory();
    set({
      background: null,
      renderVersion: state.renderVersion + 1,
      isDirty: true
    });
  },

  incrementVersion: () => {
    set((state) => ({ renderVersion: state.renderVersion + 1 }));
  },
  // ============================================================

  setAudio: (audio) => {
    set({ audio, isDirty: true });
  },

  removeAudio: () => {
    set({ audio: null, isDirty: true });
  },

  // ============================================================
  // Quote metadata
  // ============================================================

  setQuoteText: (text) => {
    set({ quoteText: text });
  },

  setQuoteId: (id) => {
    set({ quoteId: id });
  },

  // ============================================================
  // Loading / Saving
  // ============================================================

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setSaving: (saving) => {
    set({ isSaving: saving });
  },

  setUploading: (uploading, progress = 0) => {
    set({ isUploading: uploading, uploadProgress: progress });
  },

  setDirty: (dirty) => {
    set({ isDirty: dirty });
  },

  // ============================================================
  // Undo / Redo
  // ============================================================

  pushHistory: () => {
    const state = get();
    // Discard any future states (if we undid and then made a change)
    const history = state.history.slice(0, state.historyIndex + 1);
    const snapshot = {
      elements: JSON.parse(JSON.stringify(state.elements)),
      background: state.background ? JSON.parse(JSON.stringify(state.background)) : null,
    };
    history.push(snapshot);
    // Cap history
    if (history.length > state.maxHistory) {
      history.shift();
    }
    set({ history, historyIndex: history.length - 1 });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex < 0) return;
    const snapshot = state.history[state.historyIndex];
    if (!snapshot) return;
    state.incrementVersion();
    set({
      elements: snapshot.elements,
      background: snapshot.background,
      historyIndex: state.historyIndex - 1,
      isDirty: true,
    });
  },

  redo: () => {
    const state = get();
    if (state.historyIndex + 1 >= state.history.length) return;
    const snapshot = state.history[state.historyIndex + 2];
    if (!snapshot) return;
    state.incrementVersion();
    set({
      elements: snapshot.elements,
      background: snapshot.background,
      historyIndex: state.historyIndex + 1,
      isDirty: true,
    });
  },

  canUndo: () => get().historyIndex >= 0,
  canRedo: () => get().historyIndex + 1 < get().history.length,

  // ============================================================
  // Load / Reset
  // ============================================================

  loadQuote: (editorData) => {
    if (!editorData) return;
    set({
      editorVersion: editorData.version || EDITOR_VERSION,
      canvas: {
        width: editorData.canvas?.width || CANVAS_DEFAULTS.width,
        height: editorData.canvas?.height || CANVAS_DEFAULTS.height,
        zoom: 1,
      },
      elements: editorData.elements || [],
      background: editorData.background || null,
      audio: editorData.audio || null,
      history: [],
      historyIndex: -1,
      isDirty: false,
      isLoading: false,
      renderVersion: 0,
    });
  },

  toEditorData: () => {
    const state = get();
    return {
      version: state.editorVersion,
      canvas: {
        width: state.canvas.width,
        height: state.canvas.height,
      },
      elements: state.elements,
      audio: state.audio || undefined,
    };
  },

  reset: () => {
    set({ ...initialState });
  },
}));

export default useEditorStore;
