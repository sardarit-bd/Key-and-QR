/**
 * useEditorSync — syncs Fabric.js canvas object changes back to Zustand store.
 *
 * Attaches listeners to the canvas for:
 * - object:modified → update element position/size/rotation in store
 * - text:changed → update text content in store
 */
import { useEffect } from 'react';
import useEditorStore from '@/components/dashboard/admin/editor/editorStore';
import {
  getCanvas,
  fabricObjectToElement,
} from '@/components/dashboard/admin/editor/editorFabric';

export function useEditorSync() {
  const updateElement = useEditorStore((s) => s.updateElement);
  const setQuoteText = useEditorStore((s) => s.setQuoteText);

  useEffect(() => {
    const canvas = getCanvas();
    if (!canvas) return;

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
    };

    const handleTextChanged = (e) => {
      const obj = e.target;
      if (!obj?.data?.elementId) return;
      const el = fabricObjectToElement(obj);
      updateElement(obj.data.elementId, { textData: el.textData });

      // Sync quoteText from first text element
      const elements = useEditorStore.getState().elements;
      const firstText = elements.find((el) => el.type === 'text');
      if (firstText?.textData?.content) {
        setQuoteText(firstText.textData.content);
      }
    };

    canvas.on('object:modified', handleModified);
    canvas.on('text:changed', handleTextChanged);

    return () => {
      if (canvas.off) {
        canvas.off('object:modified', handleModified);
        canvas.off('text:changed', handleTextChanged);
      }
    };
  }, [updateElement, setQuoteText]);
}
