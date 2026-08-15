'use client';

import { SlidersHorizontal, Layers, Copy, Trash2, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import useEditorStore from './editorStore';
import TextProperties from './TextProperties';
import IconProperties from './IconProperties';
import ShapeProperties from './ShapeProperties';
import ImageProperties from './ImageProperties';
import AudioProperties from './AudioProperties';
import CommonProperties from './CommonProperties';
import LayersPanel from './LayersPanel';
import { updateObjectTransform } from './editorFabric';

export default function PropertiesPanel({ selectedEl }) {
  const selectedElementIds = useEditorStore((s) => s.selectedElementIds);
  const elements = useEditorStore((s) => s.elements);
  const activeSidebarTab = useEditorStore((s) => s.activeSidebarTab);
  const setActiveSidebarTab = useEditorStore((s) => s.setActiveSidebarTab);
  const duplicateElements = useEditorStore((s) => s.duplicateElements);
  const removeElements = useEditorStore((s) => s.removeElements);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const updateElement = useEditorStore((s) => s.updateElement);
  const pushHistory = useEditorStore((s) => s.pushHistory);

  const isMultiSelection = selectedElementIds.length > 1;
  const activeEl =
    selectedEl ||
    (selectedElementIds.length === 1
      ? elements.find((el) => el.id === selectedElementIds[0])
      : null);

  const handleBulkLock = (locked) => {
    selectedElementIds.forEach((id) => {
      updateObjectTransform(id, { selectable: !locked, evented: !locked });
      updateElement(id, { locked });
    });
    pushHistory();
  };

  const handleBulkVisibility = (visible) => {
    selectedElementIds.forEach((id) => {
      updateObjectTransform(id, { visible });
      updateElement(id, { visible });
    });
    if (!visible) clearSelection();
    pushHistory();
  };

  return (
    <aside className="w-[290px] shrink-0 border-l border-border bg-background flex flex-col overflow-hidden">
      {/* Tab Switcher Header */}
      <div className="flex items-center border-b border-border bg-muted/20">
        <button
          type="button"
          onClick={() => setActiveSidebarTab('properties')}
          className={`flex-1 py-3 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
            activeSidebarTab === 'properties'
              ? 'border-primary text-primary bg-background'
              : 'border-transparent text-foreground-tertiary hover:text-foreground'
          }`}
        >
          <SlidersHorizontal size={13} />
          <span>Properties</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSidebarTab('layers')}
          className={`flex-1 py-3 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
            activeSidebarTab === 'layers'
              ? 'border-primary text-primary bg-background'
              : 'border-transparent text-foreground-tertiary hover:text-foreground'
          }`}
        >
          <Layers size={13} />
          <span>Layers</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted text-foreground-secondary font-mono">
            {elements.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeSidebarTab === 'layers' ? (
          <LayersPanel />
        ) : (
          <div className="p-5">
            {isMultiSelection ? (
              /* Multi-selection summary panel */
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                      Multiple Selection
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary font-mono">
                      {selectedElementIds.length} items
                    </span>
                  </div>
                  <p className="text-[11px] text-foreground-tertiary">
                    Move, duplicate, or delete selected elements together.
                  </p>
                </div>

                {/* Bulk Actions */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-medium text-foreground-tertiary uppercase tracking-widest">
                    Bulk Actions
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => duplicateElements(selectedElementIds)}
                      className="h-9 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-medium text-foreground cursor-pointer transition-colors"
                    >
                      <Copy size={13} />
                      <span>Duplicate</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeElements(selectedElementIds)}
                      className="h-9 flex items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-xs font-medium text-red-600 dark:text-red-400 cursor-pointer transition-colors"
                    >
                      <Trash2 size={13} />
                      <span>Delete All</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleBulkLock(true)}
                      className="h-8 flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background hover:bg-muted text-[11px] font-medium text-foreground-secondary cursor-pointer transition-colors"
                    >
                      <Lock size={12} />
                      <span>Lock All</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBulkLock(false)}
                      className="h-8 flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background hover:bg-muted text-[11px] font-medium text-foreground-secondary cursor-pointer transition-colors"
                    >
                      <Unlock size={12} />
                      <span>Unlock All</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setActiveSidebarTab('layers')}
                    className="w-full py-2 px-3 rounded-xl bg-muted/60 hover:bg-muted text-xs font-medium text-primary flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Layers size={13} />
                    <span>Manage in Layers Panel →</span>
                  </button>
                </div>
              </div>
            ) : activeEl ? (
              /* Single element properties */
              <div className="space-y-6">
                <div>
                  {activeEl.type === 'text' && <TextProperties selectedEl={activeEl} />}
                  {activeEl.type === 'icon' && <IconProperties selectedEl={activeEl} />}
                  {activeEl.type === 'shape' && <ShapeProperties selectedEl={activeEl} />}
                  {activeEl.type === 'image' && <ImageProperties selectedEl={activeEl} />}
                  {activeEl.type === 'audio' && <AudioProperties selectedEl={activeEl} />}
                </div>

                <div className="h-px bg-border/60 my-6" />

                <CommonProperties selectedEl={activeEl} />
              </div>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <SlidersHorizontal size={22} className="text-foreground-tertiary/30 mb-3" />
                <p className="text-sm font-medium text-foreground-secondary">Select an Element</p>
                <p className="text-xs text-foreground-tertiary mt-1">
                  Click an element on canvas or select from Layers to edit properties.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveSidebarTab('layers')}
                  className="mt-4 text-xs text-primary hover:underline font-medium cursor-pointer"
                >
                  View Canvas Layers ({elements.length})
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
