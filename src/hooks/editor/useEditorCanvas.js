/**
 * useEditorCanvas — manages Fabric.js canvas lifecycle.
 *
 * Initializes the canvas when the container ref mounts,
 * handles resize, zoom, selection events, keyboard interaction, and cleanup
 * on unmount. Re-renders elements only when renderVersion changes
 * (structural changes). Property updates from Fabric do NOT trigger re-render —
 * they flow one-way: Fabric → useEditorSync → store (no loop).
 */
import { useEffect, useRef, useCallback } from 'react';
import useEditorStore from '@/components/dashboard/admin/editor/editorStore';
import {
  initCanvas,
  getCanvas,
  disposeCanvas,
  isInitialized,
  setCanvasSize,
  setCanvasZoom,
  fitCanvasToContainer,
  renderElements,
  getSelectedObjectIds,
  selectObjectsByIds,
  getObjectById,
} from '@/components/dashboard/admin/editor/editorFabric';

export function useEditorCanvas(canvasElRef, containerRef) {
  const initRef = useRef(false);
  const isRenderingRef = useRef(false);

  const canvas = useEditorStore((s) => s.canvas);
  const renderVersion = useEditorStore((s) => s.renderVersion);
  const elements = useEditorStore((s) => s.elements);
  const background = useEditorStore((s) => s.background);
  const setZoom = useEditorStore((s) => s.setZoom);
  const setSelection = useEditorStore((s) => s.setSelection);
  const removeElements = useEditorStore((s) => s.removeElements);
  const moveElements = useEditorStore((s) => s.moveElements);
  const selectedElementIds = useEditorStore((s) => s.selectedElementIds);

  // ── Initialize canvas once ──
  useEffect(() => {
    const el = canvasElRef?.current;
    if (!el || initRef.current) return;
    initRef.current = true;

    initCanvas(el, canvas.width, canvas.height).then((c) => {
      if (!c) return;

      // Fit to container on init
      if (containerRef?.current) {
        const zoom = fitCanvasToContainer(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
        setZoom(zoom);
      }

      // Render initial elements from store upon canvas ready
      const initialElements = useEditorStore.getState().elements;
      const initialBackground = useEditorStore.getState().background;
      isRenderingRef.current = true;
      renderElements(initialElements, initialBackground).then(() => {
        const initialSelectedIds = useEditorStore.getState().selectedElementIds;
        if (initialSelectedIds.length > 0) {
          const obj = c.getObjects().find((o) => o.data?.elementId === initialSelectedIds[0]);
          if (obj) {
            c.setActiveObject(obj);
            c.renderAll();
          }
        }
        isRenderingRef.current = false;
      });

      // Selection events → sync to store
      c.on('selection:created', () => {
        if (isRenderingRef.current) return;
        const ids = getSelectedObjectIds();
        setSelection(ids);
      });
      c.on('selection:updated', () => {
        if (isRenderingRef.current) return;
        const ids = getSelectedObjectIds();
        setSelection(ids);
      });
      c.on('selection:cleared', () => {
        if (isRenderingRef.current) return;
        setSelection([]);
      });

      // ── Keyboard interaction ──
      const handleKeyDown = (e) => {
        // If focused element is an input, textarea, or contenteditable, ignore shortcuts
        const activeEl = document.activeElement;
        if (
          activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            activeEl.isContentEditable)
        ) {
          return;
        }

        const canvas = getCanvas();
        if (!canvas) return;

        // Don't intercept keys when text is being edited in Fabric
        const activeObj = canvas.getActiveObject();
        if (activeObj && activeObj.isEditing) return;

        // Delete / Backspace — remove selected elements
        if (e.key === 'Delete' || e.key === 'Backspace') {
          const ids = getSelectedObjectIds();
          if (ids.length > 0) {
            e.preventDefault();
            removeElements(ids);
          }
          return;
        }

        // Arrow keys — move selected elements
        if (e.key.startsWith('Arrow')) {
          const ids = getSelectedObjectIds();
          if (ids.length === 0) return;

          e.preventDefault();

          const step = e.shiftKey ? 10 : 1;
          let dx = 0;
          let dy = 0;
          switch (e.key) {
            case 'ArrowUp':
              dy = -step;
              break;
            case 'ArrowDown':
              dy = step;
              break;
            case 'ArrowLeft':
              dx = -step;
              break;
            case 'ArrowRight':
              dx = step;
              break;
          }

          // Move Fabric objects in-place
          ids.forEach((id) => {
            const obj = getObjectById(id);
            if (obj) {
              obj.left += dx;
              obj.top += dy;
              obj.setCoords();
            }
          });
          canvas.renderAll();

          // Update store (single history entry for all selected elements)
          moveElements(ids, dx, dy);
          return;
        }

        // Ctrl/Cmd + D -> Duplicate
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
          const ids = getSelectedObjectIds();
          if (ids.length > 0) {
            e.preventDefault();
            useEditorStore.getState().duplicateElements(ids);
          }
          return;
        }

        // Ctrl/Cmd + Z -> Undo
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
          e.preventDefault();
          useEditorStore.getState().undo();
          return;
        }

        // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y -> Redo
        if (
          ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
          ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y')
        ) {
          e.preventDefault();
          useEditorStore.getState().redo();
          return;
        }

        // Escape -> Deselect
        if (e.key === 'Escape') {
          e.preventDefault();
          canvas.discardActiveObject();
          canvas.renderAll();
          setSelection([]);
          return;
        }

        // Ctrl/Cmd + C -> Copy
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
          const ids = getSelectedObjectIds();
          if (ids.length === 1) {
            e.preventDefault();
            const el = useEditorStore.getState().elements.find((x) => x.id === ids[0]);
            if (el) {
              localStorage.setItem('editor_clipboard', JSON.stringify(el));
            }
          }
          return;
        }

        // Ctrl/Cmd + V -> Paste
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
          e.preventDefault();
          const clipboardData = localStorage.getItem('editor_clipboard');
          if (clipboardData) {
            try {
              const el = JSON.parse(clipboardData);
              const addElement = useEditorStore.getState().addElement;
              const currentElements = useEditorStore.getState().elements;
              const pasted = {
                ...el,
                id: `el_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                x: el.x + 20,
                y: el.y + 20,
                zIndex: currentElements.length,
              };
              addElement(pasted);
            } catch (err) {
              console.warn('Failed to paste element:', err);
            }
          }
          return;
        }
      };

      // Attach keyboard listener to window
      window.addEventListener('keydown', handleKeyDown);

      // Cleanup function returned inside then
      c.handleKeyDownCleanup = () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    });

    return () => {
      const c = getCanvas();
      if (c && c.handleKeyDownCleanup) {
        c.handleKeyDownCleanup();
      }
      disposeCanvas();
      initRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync canvas size when store canvas dimensions change ──
  useEffect(() => {
    if (!isInitialized()) return;
    setCanvasSize(canvas.width, canvas.height);
    if (containerRef?.current) {
      const zoom = fitCanvasToContainer(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
      setZoom(zoom);
    }
  }, [canvas.width, canvas.height, setZoom, containerRef]);

  // ── Re-render elements only on structural version change ──
  useEffect(() => {
    if (!isInitialized()) return;
    isRenderingRef.current = true;
    renderElements(elements, background).then(() => {
      // Restore active selection
      const ids = useEditorStore.getState().selectedElementIds;
      if (ids.length > 0) {
        selectObjectsByIds(ids);
      }
      isRenderingRef.current = false;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderVersion]);

  // ── Sync store selection to Fabric canvas active object ──
  useEffect(() => {
    if (!isInitialized() || isRenderingRef.current) return;
    const c = getCanvas();
    if (!c) return;

    const activeIds = getSelectedObjectIds();
    const storeIds = selectedElementIds || [];

    const isSame =
      activeIds.length === storeIds.length &&
      activeIds.every((id) => storeIds.includes(id));

    if (!isSame) {
      selectObjectsByIds(storeIds);
    }
  }, [selectedElementIds]);

  // ── Handle container resize ──
  useEffect(() => {
    const c = containerRef?.current;
    if (!c) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        const zoom = fitCanvasToContainer(width, height);
        setZoom(zoom);
      }
    });

    observer.observe(c);
    return () => observer.disconnect();
  }, [containerRef, setZoom]);

  // ── Zoom controls ──
  const handleZoomIn = useCallback(() => {
    const cur = useEditorStore.getState().canvas.zoom;
    const newZoom = Math.min(cur + 0.1, 2);
    setZoom(newZoom);
    const c = getCanvas();
    if (c) {
      setCanvasZoom(newZoom, { x: c.width / 2, y: c.height / 2 });
    }
  }, [setZoom]);

  const handleZoomOut = useCallback(() => {
    const cur = useEditorStore.getState().canvas.zoom;
    const newZoom = Math.max(cur - 0.1, 0.25);
    setZoom(newZoom);
    const c = getCanvas();
    if (c) {
      setCanvasZoom(newZoom, { x: c.width / 2, y: c.height / 2 });
    }
  }, [setZoom]);

  const handleZoomFit = useCallback(() => {
    const c = containerRef?.current;
    if (!c) return;
    const zoom = fitCanvasToContainer(c.clientWidth, c.clientHeight);
    setZoom(zoom);
  }, [containerRef, setZoom]);

  return { handleZoomIn, handleZoomOut, handleZoomFit };
}
