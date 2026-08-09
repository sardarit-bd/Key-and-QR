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
  getObjectById,
} from '@/components/dashboard/admin/editor/editorFabric';

export function useEditorCanvas(canvasElRef, containerRef) {
  const initRef = useRef(false);

  const canvas = useEditorStore((s) => s.canvas);
  const renderVersion = useEditorStore((s) => s.renderVersion);
  const elements = useEditorStore((s) => s.elements);
  const background = useEditorStore((s) => s.background);
  const setZoom = useEditorStore((s) => s.setZoom);
  const setSelection = useEditorStore((s) => s.setSelection);
  const removeElements = useEditorStore((s) => s.removeElements);
  const moveElements = useEditorStore((s) => s.moveElements);

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

      // Selection events → sync to store
      c.on('selection:created', () => {
        const ids = getSelectedObjectIds();
        setSelection(ids);
      });
      c.on('selection:updated', () => {
        const ids = getSelectedObjectIds();
        setSelection(ids);
      });
      c.on('selection:cleared', () => {
        setSelection([]);
      });

      // ── Keyboard interaction ──
      const handleKeyDown = (e) => {
        const canvas = getCanvas();
        if (!canvas) return;

        // Don't intercept keys when text is being edited
        const active = canvas.getActiveObject();
        if (active && active.isEditing) return;

        // Delete / Backspace — remove selected elements
        if (e.key === 'Delete' || e.key === 'Backspace') {
          const ids = getSelectedObjectIds();
          if (ids.length > 0) {
            e.preventDefault();
            e.stopPropagation();
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
        }
      };

      // Attach keyboard listener to the canvas element
      el.addEventListener('keydown', handleKeyDown);
    });

    return () => {
      disposeCanvas();
      initRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync canvas size when store canvas dimensions change ──
  useEffect(() => {
    if (!isInitialized()) return;
    setCanvasSize(canvas.width, canvas.height);
  }, [canvas.width, canvas.height]);

  // ── Re-render elements only on structural version change ──
  useEffect(() => {
    if (!isInitialized()) return;
    renderElements(elements, background);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderVersion]);

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
