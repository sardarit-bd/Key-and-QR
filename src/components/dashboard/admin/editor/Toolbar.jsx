'use client';

import { Undo2, Redo2, Copy, Trash2, ArrowUp, ArrowDown, Layers } from 'lucide-react';
import useEditorStore from './editorStore';

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
  const duplicateElement = useEditorStore((s) => s.duplicateElement);
  const removeElement = useEditorStore((s) => s.removeElement);
  const reorderElement = useEditorStore((s) => s.reorderElement);

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex + 1 < history.length;
  const hasSelection = selectedElementIds.length > 0;
  const selectedId = selectedElementIds.length === 1 ? selectedElementIds[0] : null;
  const selectedIndex = selectedId ? elements.findIndex((el) => el.id === selectedId) : -1;

  const handleAction = (key) => {
    switch (key) {
      case 'undo': undo(); break;
      case 'redo': redo(); break;
      case 'duplicate': selectedId && duplicateElement(selectedId); break;
      case 'delete': selectedId && removeElement(selectedId); break;
      case 'bringForward':
        if (selectedIndex >= 0 && selectedIndex < elements.length - 1) reorderElement(selectedIndex, selectedIndex + 1);
        break;
      case 'sendBackward':
        if (selectedIndex > 0) reorderElement(selectedIndex, selectedIndex - 1);
        break;
    }
  };

  const isDisabled = (key) => {
    if (key === 'undo') return !canUndo;
    if (key === 'redo') return !canRedo;
    if (key === 'duplicate' || key === 'delete' || key === 'bringForward' || key === 'sendBackward') return !hasSelection;
    return false;
  };

  return (
    <div className="flex items-center justify-center py-3">
      <div className="flex items-center gap-1 bg-background rounded-xl shadow-sm border border-border px-2 py-1.5">
        {ACTIONS.map((action) => {
          const disabled = isDisabled(action.key);
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
