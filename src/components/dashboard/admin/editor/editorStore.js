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
import {
  CANVAS_DEFAULTS,
  CANVAS_SIZES,
  MAX_ELEMENTS,
  EDITOR_VERSION,
  PREVIEW_MODES,
  DEFAULT_ICON_SIZE,
  DEFAULT_ICON_COLOR,
} from './editorConstants';

let elementCounter = 0;
const generateId = () => `el_${Date.now()}_${++elementCounter}`;

const defaultDesktopDesign = {
  canvas: { width: CANVAS_SIZES.desktop.width, height: CANVAS_SIZES.desktop.height, zoom: 1 },
  background: null,
  elements: [],
  audio: null,
  history: [],
  historyIndex: -1,
};

const defaultMobileDesign = {
  canvas: { width: CANVAS_SIZES.mobile.width, height: CANVAS_SIZES.mobile.height, zoom: 1 },
  background: null,
  elements: [],
  audio: null,
  history: [],
  historyIndex: -1,
};

const initialState = {
  // Editor document state
  editorVersion: '2.0',
  activeDesignVersion: 'desktop', // 'desktop' | 'mobile'

  // Independent design storage
  desktopDesign: JSON.parse(JSON.stringify(defaultDesktopDesign)),
  mobileDesign: JSON.parse(JSON.stringify(defaultMobileDesign)),

  // Active canvas configuration (mirrors activeDesignVersion)
  canvas: {
    width: CANVAS_SIZES.desktop.width,
    height: CANVAS_SIZES.desktop.height,
    zoom: 1,
  },

  // Active background config
  background: null,

  // Active elements
  elements: [],

  // Selection
  selectedElementIds: [],
  activeToolId: null,

  // Active audio
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

  // Undo/Redo (active version)
  history: [],
  historyIndex: -1,
  maxHistory: 50,

  // Structural version for Fabric sync
  renderVersion: 0,
  activeSidebarTab: 'properties',
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

  // Sidebar tab state (properties or layers)
  activeSidebarTab: 'properties',

  setActiveSidebarTab: (tab) => {
    set({ activeSidebarTab: tab });
  },

  duplicateElement: (id) => {
    const state = get();
    state.duplicateElements([id]);
  },

  duplicateElements: (ids) => {
    const state = get();
    if (!ids || ids.length === 0) return;
    const idSet = new Set(ids);
    const sources = state.elements.filter((el) => idSet.has(el.id));
    if (sources.length === 0 || state.elements.length + sources.length > MAX_ELEMENTS) return;
    state.pushHistory();
    const clones = sources.map((source, i) =>
      JSON.parse(
        JSON.stringify({
          ...source,
          id: generateId(),
          x: source.x + 20,
          y: source.y + 20,
          zIndex: state.elements.length + i,
        })
      )
    );
    set({
      elements: [...state.elements, ...clones],
      selectedElementIds: clones.map((c) => c.id),
      renderVersion: state.renderVersion + 1,
      isDirty: true,
    });
  },

  bringForward: (ids) => {
    const state = get();
    const targetIds = Array.isArray(ids) ? ids : (ids ? [ids] : state.selectedElementIds);
    if (!targetIds || targetIds.length === 0) return;
    const idSet = new Set(targetIds);
    const arr = [...state.elements];

    // Traverse from right to left (top to bottom) so elements move up without leapfrogging each other
    for (let i = arr.length - 2; i >= 0; i--) {
      if (idSet.has(arr[i].id) && !idSet.has(arr[i + 1].id)) {
        const temp = arr[i];
        arr[i] = arr[i + 1];
        arr[i + 1] = temp;
      }
    }

    const reindexed = arr.map((el, idx) => ({ ...el, zIndex: idx }));
    state.pushHistory();
    set({
      elements: reindexed,
      renderVersion: state.renderVersion + 1,
      isDirty: true,
    });
  },

  sendBackward: (ids) => {
    const state = get();
    const targetIds = Array.isArray(ids) ? ids : (ids ? [ids] : state.selectedElementIds);
    if (!targetIds || targetIds.length === 0) return;
    const idSet = new Set(targetIds);
    const arr = [...state.elements];

    // Traverse from left to right (bottom to top)
    for (let i = 1; i < arr.length; i++) {
      if (idSet.has(arr[i].id) && !idSet.has(arr[i - 1].id)) {
        const temp = arr[i];
        arr[i] = arr[i - 1];
        arr[i - 1] = temp;
      }
    }

    const reindexed = arr.map((el, idx) => ({ ...el, zIndex: idx }));
    state.pushHistory();
    set({
      elements: reindexed,
      renderVersion: state.renderVersion + 1,
      isDirty: true,
    });
  },

  bringToFront: (ids) => {
    const state = get();
    const targetIds = Array.isArray(ids) ? ids : (ids ? [ids] : state.selectedElementIds);
    if (!targetIds || targetIds.length === 0) return;
    const idSet = new Set(targetIds);
    const nonSelected = state.elements.filter((el) => !idSet.has(el.id));
    const selected = state.elements.filter((el) => idSet.has(el.id));
    const reindexed = [...nonSelected, ...selected].map((el, idx) => ({ ...el, zIndex: idx }));
    state.pushHistory();
    set({
      elements: reindexed,
      renderVersion: state.renderVersion + 1,
      isDirty: true,
    });
  },

  sendToBack: (ids) => {
    const state = get();
    const targetIds = Array.isArray(ids) ? ids : (ids ? [ids] : state.selectedElementIds);
    if (!targetIds || targetIds.length === 0) return;
    const idSet = new Set(targetIds);
    const nonSelected = state.elements.filter((el) => !idSet.has(el.id));
    const selected = state.elements.filter((el) => idSet.has(el.id));
    const reindexed = [...selected, ...nonSelected].map((el, idx) => ({ ...el, zIndex: idx }));
    state.pushHistory();
    set({
      elements: reindexed,
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

  setSelectedElementIds: (ids) => {
    set({ selectedElementIds: Array.isArray(ids) ? ids : (ids ? [ids] : []) });
  },

  selectElement: (id) => {
    set({ selectedElementIds: id ? [id] : [] });
  },

  toggleSelection: (id) => {
    const state = get();
    if (state.selectedElementIds.includes(id)) {
      set({ selectedElementIds: state.selectedElementIds.filter((sid) => sid !== id) });
    } else {
      set({ selectedElementIds: [...state.selectedElementIds, id] });
    }
  },

  selectAll: () => {
    set({ selectedElementIds: get().elements.map((el) => el.id) });
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
  // Design Version & Viewport Switching (Desktop / Mobile)
  // ============================================================

  switchDesignVersion: (targetVersion) => {
    const state = get();
    if (state.activeDesignVersion === targetVersion) return;

    // 1. Snapshot the CURRENT active design in memory
    const currentDesignSnapshot = {
      canvas: { ...state.canvas },
      background: state.background ? JSON.parse(JSON.stringify(state.background)) : null,
      elements: JSON.parse(JSON.stringify(state.elements)),
      audio: state.audio ? JSON.parse(JSON.stringify(state.audio)) : null,
      history: JSON.parse(JSON.stringify(state.history)),
      historyIndex: state.historyIndex,
    };

    const isCurrentDesktop = state.activeDesignVersion === 'desktop';
    const updatedDesktop = isCurrentDesktop ? currentDesignSnapshot : state.desktopDesign;
    const updatedMobile = !isCurrentDesktop ? currentDesignSnapshot : state.mobileDesign;

    // 2. Retrieve the TARGET design
    const targetDesign = targetVersion === 'desktop' ? updatedDesktop : updatedMobile;

    let targetElements = targetDesign.elements ? JSON.parse(JSON.stringify(targetDesign.elements)) : [];
    let targetBg = targetDesign.background ? JSON.parse(JSON.stringify(targetDesign.background)) : null;
    let targetAudio = targetDesign.audio ? JSON.parse(JSON.stringify(targetDesign.audio)) : null;
    let targetCanvas = targetDesign.canvas || (targetVersion === 'desktop' ? CANVAS_SIZES.desktop : CANVAS_SIZES.mobile);

    // If mobile design is empty and desktop has elements, create a starter mobile layout
    if (targetVersion === 'mobile' && targetElements.length === 0 && updatedDesktop.elements?.length > 0) {
      targetBg = updatedDesktop.background ? JSON.parse(JSON.stringify(updatedDesktop.background)) : null;
      targetAudio = updatedDesktop.audio ? JSON.parse(JSON.stringify(updatedDesktop.audio)) : null;
      const scaleFactor = CANVAS_SIZES.mobile.width / CANVAS_SIZES.desktop.width;

      targetElements = updatedDesktop.elements.map((el) => {
        const copy = JSON.parse(JSON.stringify(el));
        copy.id = `el_mob_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        copy.x = Math.round((el.x || 0) * scaleFactor);
        copy.y = Math.round((el.y || 0) * scaleFactor);
        copy.width = Math.min(340, Math.round((el.width || 100) * scaleFactor));
        copy.height = Math.round((el.height || 100) * scaleFactor);

        if (copy.textData) {
          copy.textData.fontSize = Math.max(16, Math.round((el.textData.fontSize || 36) * 0.7));
          if (copy.width > 320) copy.width = 320;
        }
        return copy;
      });
    }

    set({
      activeDesignVersion: targetVersion,
      previewMode: targetVersion,
      desktopDesign: updatedDesktop,
      mobileDesign:
        targetVersion === 'mobile' && targetDesign.elements?.length === 0
          ? {
              canvas: targetCanvas,
              background: targetBg,
              elements: targetElements,
              audio: targetAudio,
              history: [],
              historyIndex: -1,
            }
          : updatedMobile,

      canvas: { ...targetCanvas, zoom: 1 },
      background: targetBg,
      elements: targetElements,
      audio: targetAudio,
      selectedElementIds: [],
      history: targetDesign.history || [],
      historyIndex: targetDesign.historyIndex ?? -1,
      renderVersion: state.renderVersion + 1,
    });
  },

  setPreviewMode: (mode) => {
    const state = get();
    state.switchDesignVersion(mode);
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
      isDirty: true,
    });
  },

  clearBackground: () => {
    const state = get();
    state.pushHistory();
    set({
      background: null,
      renderVersion: state.renderVersion + 1,
      isDirty: true,
    });
  },

  incrementVersion: () => {
    set((state) => ({ renderVersion: state.renderVersion + 1 }));
  },

  // ============================================================
  // Audio
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
    const history = state.history.slice(0, state.historyIndex + 1);
    const snapshot = {
      elements: JSON.parse(JSON.stringify(state.elements)),
      background: state.background ? JSON.parse(JSON.stringify(state.background)) : null,
    };
    history.push(snapshot);
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

    let desktopData = null;
    let mobileData = null;

    if (editorData.desktop && editorData.mobile) {
      desktopData = editorData.desktop;
      mobileData = editorData.mobile;
    } else if (editorData.desktop) {
      desktopData = editorData.desktop;
      mobileData = {
        canvas: CANVAS_SIZES.mobile,
        background: null,
        elements: [],
        audio: null,
      };
    } else {
      // Legacy format (elements and canvas at top level)
      desktopData = {
        canvas: editorData.canvas || CANVAS_SIZES.desktop,
        background: editorData.background || null,
        elements: Array.isArray(editorData.elements) ? editorData.elements : [],
        audio: editorData.audio || null,
      };
      mobileData = {
        canvas: CANVAS_SIZES.mobile,
        background: null,
        elements: [],
        audio: null,
      };
    }

    const desktopSnapshot = {
      canvas: {
        width: desktopData.canvas?.width || CANVAS_SIZES.desktop.width,
        height: desktopData.canvas?.height || CANVAS_SIZES.desktop.height,
        zoom: 1,
      },
      background: desktopData.background ? JSON.parse(JSON.stringify(desktopData.background)) : null,
      elements: Array.isArray(desktopData.elements) ? JSON.parse(JSON.stringify(desktopData.elements)) : [],
      audio: desktopData.audio ? JSON.parse(JSON.stringify(desktopData.audio)) : null,
      history: [],
      historyIndex: -1,
    };

    const mobileSnapshot = {
      canvas: {
        width: mobileData.canvas?.width || CANVAS_SIZES.mobile.width,
        height: mobileData.canvas?.height || CANVAS_SIZES.mobile.height,
        zoom: 1,
      },
      background: mobileData.background ? JSON.parse(JSON.stringify(mobileData.background)) : null,
      elements: Array.isArray(mobileData.elements) ? JSON.parse(JSON.stringify(mobileData.elements)) : [],
      audio: mobileData.audio ? JSON.parse(JSON.stringify(mobileData.audio)) : null,
      history: [],
      historyIndex: -1,
    };

    set((state) => ({
      editorVersion: '2.0',
      activeDesignVersion: 'desktop',
      previewMode: 'desktop',
      desktopDesign: desktopSnapshot,
      mobileDesign: mobileSnapshot,

      canvas: { ...desktopSnapshot.canvas },
      background: desktopSnapshot.background,
      elements: desktopSnapshot.elements,
      audio: desktopSnapshot.audio,
      selectedElementIds: [],
      history: [],
      historyIndex: -1,
      isDirty: false,
      isLoading: false,
      renderVersion: state.renderVersion + 1,
    }));
  },

  toEditorData: () => {
    const state = get();
    // Flush current active design snapshot
    const currentSnapshot = {
      canvas: { ...state.canvas },
      background: state.background ? JSON.parse(JSON.stringify(state.background)) : null,
      elements: JSON.parse(JSON.stringify(state.elements)),
      audio: state.audio ? JSON.parse(JSON.stringify(state.audio)) : null,
    };

    const isCurrentDesktop = state.activeDesignVersion === 'desktop';
    const desktop = isCurrentDesktop ? currentSnapshot : state.desktopDesign;
    const mobile = !isCurrentDesktop ? currentSnapshot : state.mobileDesign;

    return {
      version: '2.0',
      desktop: {
        canvas: { width: desktop.canvas.width, height: desktop.canvas.height },
        background: desktop.background,
        elements: desktop.elements,
        audio: desktop.audio,
      },
      mobile: {
        canvas: { width: mobile.canvas.width, height: mobile.canvas.height },
        background: mobile.background,
        elements: mobile.elements,
        audio: mobile.audio,
      },
    };
  },

  reset: () => {
    set({ ...initialState });
  },
}));

export default useEditorStore;
