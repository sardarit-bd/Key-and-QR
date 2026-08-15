'use client';

import React from 'react';
import {
  Layers,
  Type,
  Feather,
  Sparkles,
  Square,
  Image as ImageIcon,
  Music,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  CheckSquare,
} from 'lucide-react';
import useEditorStore from './editorStore';
import { updateObjectTransform } from './editorFabric';

function getLayerLabel(el, index, allElements) {
  if (el.type === 'text') {
    const content = el.textData?.content?.trim();
    if (content) {
      return content.length > 20 ? `${content.slice(0, 18)}…` : content;
    }
    const textIndex =
      allElements
        .filter((e) => e.type === 'text')
        .findIndex((e) => e.id === el.id) + 1;
    return textIndex > 1 ? `Text ${textIndex}` : 'Text';
  }

  if (el.type === 'image') {
    const imgIndex = allElements.filter((e) => e.type === 'image').findIndex((e) => e.id === el.id) + 1;
    return imgIndex > 1 ? `Image ${imgIndex}` : 'Image';
  }

  if (el.type === 'icon') {
    const iconName = el.iconData?.iconName;
    if (iconName) {
      const formatted = iconName.charAt(0).toUpperCase() + iconName.slice(1);
      return `${formatted} Icon`;
    }
    return 'Icon';
  }

  if (el.type === 'shape') {
    const shapeType = el.shapeData?.shapeType || 'Shape';
    const formatted = shapeType.charAt(0).toUpperCase() + shapeType.slice(1);
    return `${formatted} Shape`;
  }

  if (el.type === 'audio') {
    return el.audioData?.title || 'Audio Track';
  }

  return 'Layer';
}

function getLayerIcon(el) {
  if (el.type === 'text') {
    return Type;
  }
  switch (el.type) {
    case 'image':
      return ImageIcon;
    case 'icon':
      return Sparkles;
    case 'shape':
      return Square;
    case 'audio':
      return Music;
    default:
      return Layers;
  }
}

export default function LayersPanel() {
  const elements = useEditorStore((s) => s.elements);
  const selectedElementIds = useEditorStore((s) => s.selectedElementIds);
  const setSelection = useEditorStore((s) => s.setSelection);
  const toggleSelection = useEditorStore((s) => s.toggleSelection);
  const selectAll = useEditorStore((s) => s.selectAll);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const removeElements = useEditorStore((s) => s.removeElements);
  const duplicateElements = useEditorStore((s) => s.duplicateElements);
  const bringForward = useEditorStore((s) => s.bringForward);
  const sendBackward = useEditorStore((s) => s.sendBackward);
  const bringToFront = useEditorStore((s) => s.bringToFront);
  const sendToBack = useEditorStore((s) => s.sendToBack);
  const updateElement = useEditorStore((s) => s.updateElement);
  const pushHistory = useEditorStore((s) => s.pushHistory);

  const hasSelection = selectedElementIds.length > 0;
  const isAllSelected = elements.length > 0 && selectedElementIds.length === elements.length;

  // Stacking order: topmost visual element at top of list
  const reversedElements = [...elements].reverse();

  const handleLayerClick = (e, id) => {
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      toggleSelection(id);
    } else {
      setSelection([id]);
    }
  };

  const toggleLock = (e, el) => {
    e.stopPropagation();
    const nextLocked = !el.locked;
    updateObjectTransform(el.id, {
      selectable: !nextLocked,
      evented: !nextLocked,
    });
    updateElement(el.id, { locked: nextLocked });
    pushHistory();
  };

  const toggleVisibility = (e, el) => {
    e.stopPropagation();
    const nextVisible = el.visible === false;
    updateObjectTransform(el.id, {
      visible: nextVisible,
    });
    updateElement(el.id, { visible: nextVisible });
    if (!nextVisible && selectedElementIds.includes(el.id)) {
      toggleSelection(el.id);
    }
    pushHistory();
  };

  const handleDeleteLayer = (e, id) => {
    e.stopPropagation();
    removeElements([id]);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Header & Actions */}
      <div className="px-4 py-3 border-b border-border bg-background flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
              Canvas Layers
            </span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-muted text-foreground-secondary font-mono">
              {elements.length}
            </span>
          </div>

          {elements.length > 0 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={isAllSelected ? clearSelection : selectAll}
                className="text-[10px] text-foreground-tertiary hover:text-foreground font-medium px-1.5 py-1 rounded hover:bg-muted transition-colors cursor-pointer"
                title={isAllSelected ? 'Deselect All' : 'Select All'}
              >
                {isAllSelected ? 'Deselect' : 'Select All'}
              </button>
            </div>
          )}
        </div>

        {/* Batch Actions Bar */}
        {elements.length > 0 && (
          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => bringToFront(selectedElementIds)}
                disabled={!hasSelection}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Bring To Front"
              >
                <ChevronsUp size={13} />
              </button>
              <button
                type="button"
                onClick={() => bringForward(selectedElementIds)}
                disabled={!hasSelection}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Bring Forward"
              >
                <ArrowUp size={13} />
              </button>
              <button
                type="button"
                onClick={() => sendBackward(selectedElementIds)}
                disabled={!hasSelection}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Send Backward"
              >
                <ArrowDown size={13} />
              </button>
              <button
                type="button"
                onClick={() => sendToBack(selectedElementIds)}
                disabled={!hasSelection}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Send To Back"
              >
                <ChevronsDown size={13} />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => duplicateElements(selectedElementIds)}
                disabled={!hasSelection}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Duplicate Selected"
              >
                <Copy size={13} />
              </button>
              <button
                type="button"
                onClick={() => removeElements(selectedElementIds)}
                disabled={!hasSelection}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-foreground-tertiary hover:text-red-500 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Delete Selected"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Layer Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {elements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground-tertiary mb-3">
              <Layers size={18} />
            </div>
            <p className="text-xs font-semibold text-foreground">No Layers Yet</p>
            <p className="text-[11px] text-foreground-tertiary mt-1">
              Add text, shapes, icons, images, or audio from the left panel to begin.
            </p>
          </div>
        ) : (
          reversedElements.map((el, idx) => {
            const isSelected = selectedElementIds.includes(el.id);
            const isHidden = el.visible === false;
            const isLocked = !!el.locked;
            const LayerIcon = getLayerIcon(el);
            const label = getLayerLabel(el, idx, elements);

            return (
              <div
                key={el.id}
                onClick={(e) => handleLayerClick(e, el.id)}
                className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer border select-none ${
                  isSelected
                    ? 'bg-primary/10 border-primary/40 text-primary font-semibold shadow-xs'
                    : 'bg-background hover:bg-muted/80 border-border/70 text-foreground-secondary'
                } ${isHidden ? 'opacity-50' : 'opacity-100'}`}
              >
                {/* Layer Icon & Title */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-foreground-tertiary group-hover:text-foreground'
                    }`}
                  >
                    <LayerIcon size={12} />
                  </div>
                  <span className="truncate text-xs">{label}</span>
                </div>

                {/* Layer Controls (Lock, Visibility, Delete) */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => toggleLock(e, el)}
                    className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                      isLocked
                        ? 'text-amber-500 hover:bg-amber-500/10'
                        : 'text-foreground-tertiary hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100'
                    }`}
                    title={isLocked ? 'Unlock Layer' : 'Lock Layer'}
                  >
                    {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => toggleVisibility(e, el)}
                    className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                      isHidden
                        ? 'text-red-500 hover:bg-red-500/10'
                        : 'text-foreground-tertiary hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100'
                    }`}
                    title={isHidden ? 'Show Layer' : 'Hide Layer'}
                  >
                    {isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteLayer(e, el.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-md text-foreground-tertiary hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-colors cursor-pointer"
                    title="Delete Layer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Multi-Selection Footer Hint */}
      {selectedElementIds.length > 1 && (
        <div className="p-3 border-t border-border bg-muted/40 text-[11px] text-foreground-secondary flex items-center justify-between">
          <span className="font-medium">
            {selectedElementIds.length} layers selected
          </span>
          <button
            type="button"
            onClick={clearSelection}
            className="text-[10px] text-primary hover:underline cursor-pointer font-medium"
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
}
