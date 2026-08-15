'use client';

import { SlidersHorizontal } from 'lucide-react';
import useEditorStore from './editorStore';
import TextProperties from './TextProperties';
import IconProperties from './IconProperties';
import ShapeProperties from './ShapeProperties';
import ImageProperties from './ImageProperties';
import AudioProperties from './AudioProperties';
import CommonProperties from './CommonProperties';

export default function PropertiesPanel({ selectedEl }) {
  const selectedElementIds = useEditorStore((s) => s.selectedElementIds);
  const elements = useEditorStore((s) => s.elements);

  const activeEl = selectedEl || (selectedElementIds.length === 1
    ? elements.find((el) => el.id === selectedElementIds[0])
    : null);

  return (
    <aside className="w-[280px] shrink-0 border-l border-border bg-background flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-foreground-tertiary" />
          <span className="text-[11px] font-semibold text-foreground-secondary uppercase tracking-wider">
            {activeEl ? `${activeEl.type.toUpperCase()} Properties` : 'Properties'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {activeEl ? (
          <div className="space-y-6">
            {/* Type-Specific Panels */}
            <div>
              {activeEl.type === 'text' && <TextProperties selectedEl={activeEl} />}
              {activeEl.type === 'icon' && <IconProperties selectedEl={activeEl} />}
              {activeEl.type === 'shape' && <ShapeProperties selectedEl={activeEl} />}
              {activeEl.type === 'image' && <ImageProperties selectedEl={activeEl} />}
              {activeEl.type === 'audio' && <AudioProperties selectedEl={activeEl} />}
            </div>

            {/* Divider */}
            <div className="h-px bg-border/60 my-6" />

            {/* Unified Transform Controls */}
            <CommonProperties selectedEl={activeEl} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <SlidersHorizontal size={22} className="text-foreground-tertiary/30 mb-3" />
            <p className="text-sm text-foreground-tertiary">Select an element</p>
            <p className="text-xs text-foreground-tertiary/60 mt-1">to edit its properties</p>
          </div>
        )}
      </div>
    </aside>
  );
}
