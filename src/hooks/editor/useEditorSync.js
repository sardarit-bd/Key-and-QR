/**
 * useEditorSync — syncs Fabric.js canvas object changes back to Zustand store.
 *
 * Two sync modes:
 * - text:changed → patchElement (no history entry) — fires on every keystroke
 * - object:modified → updateElement (creates history entry) — fires on mouse-up after drag/resize/rotate
 * - editing:exited → updateElement — fires when text editing finishes (user clicks outside)
 *
 * This prevents flooding the undo history with keystroke-level changes while
 * still keeping the store synchronized for live canvas ↔ property panel sync.
 */
import { useEffect } from 'react';
import useEditorStore from '@/components/dashboard/admin/editor/editorStore';
import {
  getCanvas,
  fabricObjectToElement,
} from '@/components/dashboard/admin/editor/editorFabric';

export function useEditorSync() {
  const patchElement = useEditorStore((s) => s.patchElement);
  const updateElement = useEditorStore((s) => s.updateElement);
  const updateElementData = useEditorStore((s) => s.updateElementData);
  const setQuoteText = useEditorStore((s) => s.setQuoteText);

  useEffect(() => {
    const canvas = getCanvas();
    if (!canvas) return;

    // Fire on every keystroke — no history entry
    const handleTextChanged = (e) => {
      const obj = e.target;
      if (!obj?.data?.elementId) return;
      const el = fabricObjectToElement(obj);
      patchElement(obj.data.elementId, { textData: el.textData });

      const elements = useEditorStore.getState().elements;
      const firstText = elements.find((el) => el.type === 'text');
      if (firstText?.textData?.content) {
        setQuoteText(firstText.textData.content);
      }
    };

    // Fire on mouse-up after drag/resize/rotate/transform — creates history entry
    const handleModified = (e) => {
      const obj = e.target;
      if (!obj?.data?.elementId) return;
      const el = fabricObjectToElement(obj);
      updateElement(obj.data.elementId, {
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        rotation: el.rotation,
        scaleX: el.scaleX,
        scaleY: el.scaleY,
        opacity: el.opacity,
        ...(el.textData ? { textData: el.textData } : {}),
        ...(el.imageData ? { imageData: el.imageData } : {}),
        ...(el.shapeData ? { shapeData: el.shapeData } : {}),
      });

      // Also sync quoteText on completion
      if (el.textData?.content) {
        setQuoteText(el.textData.content);
      }
    };

    // Fire when text editing exits (user clicks outside textbox or presses Escape)
    const handleEditingExited = (e) => {
      const obj = e.target;
      if (!obj?.data?.elementId) return;
      const el = fabricObjectToElement(obj);
      updateElement(obj.data.elementId, { textData: el.textData });
    };

    canvas.on('text:changed', handleTextChanged);
    canvas.on('object:modified', handleModified);
    canvas.on('text:editing:exited', handleEditingExited);

    return () => {
      if (canvas.off) {
        canvas.off('text:changed', handleTextChanged);
        canvas.off('object:modified', handleModified);
        canvas.off('text:editing:exited', handleEditingExited);
      }
    };
  }, [patchElement, updateElement, updateElementData, setQuoteText]);
}
