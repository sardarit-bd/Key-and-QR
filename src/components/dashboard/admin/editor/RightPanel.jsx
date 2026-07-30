'use client';

import { Type, Image, Square, Music, Palette, Monitor } from 'lucide-react';
import useEditorStore from './editorStore';
import TextProperties from './TextProperties';
import BackgroundProperties from './BackgroundProperties';
import ImageProperties from './ImageProperties';
import ShapeProperties from './ShapeProperties';

/**
 * RightPanel — contextual property panel.
 *
 * Content changes based on selection state:
 * - No selection → canvas properties (dimensions, background)
 * - Text selected → text properties
 * - Image selected → image properties
 * - Shape selected → shape properties
 * - Background tab → background properties
 * - Audio tab → audio properties
 *
 * Property editing will be implemented in later phases.
 * Phase 3 only renders the panel structure with labels.
 */
export default function RightPanel() {
  const selectedElementIds = useEditorStore((s) => s.selectedElementIds);
  const elements = useEditorStore((s) => s.elements);
  const canvas = useEditorStore((s) => s.canvas);
  const activeToolId = useEditorStore((s) => s.activeToolId);

  // Determine what's selected
  const selectedId =
    selectedElementIds.length === 1 ? selectedElementIds[0] : null;
  const selectedEl = selectedId
    ? elements.find((el) => el.id === selectedId)
    : null;

  const renderCanvasProperties = () => (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Monitor size={13} /> Canvas
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-foreground-tertiary block mb-0.5">Width</label>
            <div className="h-8 rounded-md bg-muted/50 border border-border flex items-center px-2.5 text-xs text-foreground">{canvas.width}</div>
          </div>
          <div>
            <label className="text-[10px] text-foreground-tertiary block mb-0.5">Height</label>
            <div className="h-8 rounded-md bg-muted/50 border border-border flex items-center px-2.5 text-xs text-foreground">{canvas.height}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTextProperties = () => (
    <TextProperties />
  );

  const renderImageProperties = () => (
    <ImageProperties />
  );

  const renderShapeProperties = () => (
    <ShapeProperties />
  );

  const renderEmptyProperties = () => (
    <div className="space-y-4">
      <p className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider flex items-center gap-1.5 mb-3">
        <Monitor size={13} /> Properties
      </p>
      <p className="text-xs text-foreground-tertiary">
        Select an element to edit its properties
      </p>
    </div>
  );

  const renderPanelContent = () => {
    // If background tool is active in sidebar, show background properties
    if (activeToolId === 'background') return <BackgroundProperties />;
    if (!selectedEl) {
      // If background exists, show it; otherwise canvas props
      const bg = useEditorStore.getState().background;
      if (bg) return <BackgroundProperties />;
      return renderCanvasProperties();
    }
    switch (selectedEl.type) {
      case 'text':
        return <TextProperties />;
      case 'image':
        return renderImageProperties();
      case 'shape':
        return renderShapeProperties();
      default:
        return renderEmptyProperties();
    }
  };

  return (
    <aside className="w-[280px] shrink-0 border-l border-border bg-background overflow-y-auto p-4">
      {renderPanelContent()}
    </aside>
  );
}
