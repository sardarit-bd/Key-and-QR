'use client';

import {
  Undo2, Redo2, Copy, Trash2, ArrowUp, ArrowDown, Layers,
  Type, Sparkles, Square, Image, Music, Eye, EyeOff, Lock, Unlock
} from 'lucide-react';
import useEditorStore from './editorStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { selectObjectById, updateObjectTransform } from './editorFabric';

const ACTIONS = [
  { key: 'undo', icon: Undo2, label: 'Undo' },
  { key: 'redo', icon: Redo2, label: 'Redo' },
  { key: 'duplicate', icon: Copy, label: 'Duplicate' },
  { key: 'delete', icon: Trash2, label: 'Delete' },
  { key: 'bringForward', icon: ArrowUp, label: 'Bring Forward' },
  { key: 'sendBackward', icon: ArrowDown, label: 'Send Backward' },
  { key: 'layers', icon: Layers, label: 'Layers' },
];

export default function Toolbar() {
  const selectedElementIds = useEditorStore((s) => s.selectedElementIds);
  const elements = useEditorStore((s) => s.elements);
  const historyIndex = useEditorStore((s) => s.historyIndex);
  const history = useEditorStore((s) => s.history);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const duplicateElements = useEditorStore((s) => s.duplicateElements);
  const removeElements = useEditorStore((s) => s.removeElements);
  const bringForward = useEditorStore((s) => s.bringForward);
  const sendBackward = useEditorStore((s) => s.sendBackward);
  const updateElement = useEditorStore((s) => s.updateElement);
  const setSelection = useEditorStore((s) => s.setSelection);
  const toggleSelection = useEditorStore((s) => s.toggleSelection);
  const setActiveSidebarTab = useEditorStore((s) => s.setActiveSidebarTab);
  const pushHistory = useEditorStore((s) => s.pushHistory);

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex + 1 < history.length;
  const hasSelection = selectedElementIds.length > 0;

  const handleAction = (key) => {
    switch (key) {
      case 'undo':
        undo();
        break;
      case 'redo':
        redo();
        break;
      case 'duplicate':
        if (hasSelection) duplicateElements(selectedElementIds);
        break;
      case 'delete':
        if (hasSelection) removeElements(selectedElementIds);
        break;
      case 'bringForward':
        if (hasSelection) bringForward(selectedElementIds);
        break;
      case 'sendBackward':
        if (hasSelection) sendBackward(selectedElementIds);
        break;
      case 'layers':
        setActiveSidebarTab('layers');
        break;
    }
  };

  const isDisabled = (key) => {
    if (key === 'undo') return !canUndo;
    if (key === 'redo') return !canRedo;
    if (key === 'layers') return elements.length === 0;
    if (key === 'duplicate' || key === 'delete' || key === 'bringForward' || key === 'sendBackward')
      return !hasSelection;
    return false;
  };

  const handleSelectLayer = (e, id) => {
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      toggleSelection(id);
    } else {
      setSelection([id]);
    }
  };

  const toggleLock = (el) => {
    const nextLocked = !el.locked;
    updateObjectTransform(el.id, {
      selectable: !nextLocked,
      evented: !nextLocked,
    });
    updateElement(el.id, { locked: nextLocked });
    pushHistory();
  };

  const toggleVisibility = (el) => {
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

  return (
    <div className="flex items-center justify-center py-3">
      <div className="flex items-center gap-1 bg-background rounded-xl shadow-sm border border-border px-2 py-1.5 animate-in fade-in zoom-in-95 duration-200">
        {ACTIONS.map((action) => {
          const disabled = isDisabled(action.key);
          const isLayers = action.key === 'layers';

          if (isLayers) {
            return (
              <Popover key={action.key}>
                <PopoverTrigger asChild>
                  <button
                    disabled={disabled}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title={action.label}
                  >
                    <action.icon size={15} />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="center" side="top" sideOffset={12} className="w-56 p-2">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[10px] font-semibold text-foreground-tertiary uppercase tracking-wider">
                      Canvas Layers ({elements.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveSidebarTab('layers')}
                      className="text-[10px] text-primary hover:underline font-medium cursor-pointer"
                    >
                      Open Sidebar →
                    </button>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {[...elements].reverse().map((el) => {
                      const LayerIcon =
                        el.type === 'text'
                          ? Type
                          : el.type === 'icon'
                            ? Sparkles
                            : el.type === 'shape'
                              ? Square
                              : el.type === 'image'
                                ? Image
                                : Music;

                      const isSelected = selectedElementIds.includes(el.id);
                      
                      const label =
                        el.type === 'text'
                          ? el.textData?.content?.substring(0, 15) || 'Text'
                          : el.type === 'icon'
                            ? el.iconData?.iconName || 'Icon'
                            : el.type === 'shape'
                              ? el.shapeData?.shapeType || 'Shape'
                              : el.type === 'image'
                                ? 'Image'
                                : el.audioData?.title || 'Audio';

                      return (
                        <div
                          key={el.id}
                          className={`flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors ${
                            isSelected
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'hover:bg-muted text-foreground-secondary'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(e) => handleSelectLayer(e, el.id)}
                            className="flex items-center gap-2 flex-1 text-left truncate cursor-pointer font-medium"
                          >
                            <LayerIcon size={12} className="shrink-0" />
                            <span className="truncate">{label}</span>
                          </button>
                          
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => toggleLock(el)}
                              className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-foreground-tertiary hover:text-foreground cursor-pointer"
                              title={el.locked ? 'Unlock Layer' : 'Lock Layer'}
                            >
                              {el.locked ? <Lock size={12} className="text-amber-500" /> : <Unlock size={12} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleVisibility(el)}
                              className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-foreground-tertiary hover:text-foreground cursor-pointer"
                              title={el.visible === false ? 'Show Layer' : 'Hide Layer'}
                            >
                              {el.visible === false ? <EyeOff size={12} className="text-red-500" /> : <Eye size={12} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeElements([el.id])}
                              className="p-1 hover:bg-red-500/10 rounded text-foreground-tertiary hover:text-red-500 cursor-pointer"
                              title="Delete Layer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            );
          }

          return (
            <button
              key={action.key}
              onClick={() => handleAction(action.key)}
              disabled={disabled}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title={action.label}
            >
              <action.icon size={15} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
