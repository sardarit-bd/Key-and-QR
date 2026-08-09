'use client';

import { SlidersHorizontal } from 'lucide-react';
import TextProperties from './TextProperties';

export default function PropertiesPanel({ selectedEl }) {
  return (
    <aside className="w-[280px] shrink-0 border-l border-border bg-background flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-foreground-tertiary" />
          <span className="text-[11px] font-semibold text-foreground-secondary uppercase tracking-wider">
            {selectedEl?.type === 'text' ? 'Text Properties' : 'Properties'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {selectedEl?.type === 'text' ? (
          <TextProperties selectedEl={selectedEl} />
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
