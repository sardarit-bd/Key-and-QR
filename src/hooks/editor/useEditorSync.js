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
  const updateMultipleElements = useEditorStore((s) => s.updateMultipleElements);
  const setQuoteText = useEditorStore((s) => s.setQuoteText);

  useEffect(() => {
    let cancelled = false;
    let canvas = null;
    let retryTimer = null;

    const handleTextChanged = (e) => {
      const obj = e.target;
      if (!obj?.data?.elementId) return;
      const el = fabricObjectToElement(obj);
      patchElement(obj.data.elementId, { textData: el.textData });

      const elements = useEditorStore.getState().elements;
      const firstText = elements.find((element) => element.type === 'text');
      if (firstText?.textData?.content) {
        setQuoteText(firstText.textData.content);
      }
    };

    const buildElementUpdates = (obj) => {
      const el = fabricObjectToElement(obj);
      return {
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
        ...(el.iconData ? { iconData: el.iconData } : {}),
      };
    };

    const handleModified = (e) => {
      const obj = e.target;
      if (!obj) return;

      // ActiveSelection (multi-object drag/resize/rotate) — batch into one history entry
      if (obj.type === 'activeSelection') {
        const children = typeof obj.getObjects === 'function' ? obj.getObjects() : [];
        const updatesMap = {};
        children.forEach((child) => {
          if (child?.data?.elementId) {
            updatesMap[child.data.elementId] = buildElementUpdates(child);
          }
        });
        if (Object.keys(updatesMap).length > 0) {
          updateMultipleElements(updatesMap);
        }
        return;
      }

      // Single object
      if (!obj?.data?.elementId) return;
      updateElement(obj.data.elementId, buildElementUpdates(obj));

      const el = fabricObjectToElement(obj);
      if (el.textData?.content) {
        setQuoteText(el.textData.content);
      }
    };

    const handleEditingExited = (e) => {
      const obj = e.target;
      if (!obj?.data?.elementId) return;
      updateElement(obj.data.elementId, buildElementUpdates(obj));
      const el = fabricObjectToElement(obj);
      if (el.textData?.content) {
        setQuoteText(el.textData.content);
      }
    };

    const attachListeners = () => {
      if (cancelled) return;
      canvas = getCanvas();
      if (!canvas) {
        retryTimer = window.setTimeout(attachListeners, 0);
        return;
      }

      canvas.on('text:changed', handleTextChanged);
      canvas.on('object:modified', handleModified);
      canvas.on('text:editing:exited', handleEditingExited);
    };

    attachListeners();

    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
      if (canvas?.off) {
        canvas.off('text:changed', handleTextChanged);
        canvas.off('object:modified', handleModified);
        canvas.off('text:editing:exited', handleEditingExited);
      }
    };
  }, [patchElement, updateElement, updateMultipleElements, setQuoteText]);
}
