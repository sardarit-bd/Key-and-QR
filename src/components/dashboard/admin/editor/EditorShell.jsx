'use client';

import { useEffect } from 'react';
import EditorHeader from './EditorHeader';
import ElementsPanel from './ElementsPanel';
import EditorCanvas from './EditorCanvas';
import PropertiesPanel from './PropertiesPanel';
import Toolbar from './Toolbar';
import useEditorStore from './editorStore';

export default function EditorShell() {
  const selectedElementIds = useEditorStore((s) => s.selectedElementIds);
  const elements = useEditorStore((s) => s.elements);
  const selectedEl = selectedElementIds.length === 1
    ? elements.find((el) => el.id === selectedElementIds[0])
    : null;



  return (
    <div className="flex flex-col h-screen bg-background">
      <EditorHeader />

      <div className="flex flex-1 min-h-0">
        {/* Left zone: elements card + empty space */}
        <div className="w-[200px] shrink-0 flex flex-col">
          <ElementsPanel />
          <div className="flex-1" />
        </div>

        {/* Center: workspace + canvas + toolbar */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden py-4">
          <div className="flex-1 flex items-center justify-center overflow-auto px-4">
            <EditorCanvas />
          </div>
          <Toolbar />
        </div>

        {/* Right: properties */}
        <PropertiesPanel selectedEl={selectedEl} />
      </div>
    </div>
  );
}
