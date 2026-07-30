'use client';

import EditorHeader from './EditorHeader';
import LeftSidebar from './LeftSidebar';
import EditorCanvas from './EditorCanvas';
import RightPanel from './RightPanel';
import { Smartphone } from 'lucide-react';

/**
 * EditorShell — the main layout container for the Quote Visual Editor.
 *
 * Layout (desktop):
 * ┌──────────────────────────────────────────────────────┐
 * │  Header                                             │
 * ├──────────┬───────────────────────────┬───────────────┤
 * │  Left    │                           │  Right        │
 * │  Sidebar │      EditorCanvas         │  Panel        │
 * │  260px   │      (flex-1)             │  280px        │
 * │          │                           │               │
 * ├──────────┴───────────────────────────┴───────────────┤
 * │  (Zoom controls are inside EditorCanvas)             │
 * └──────────────────────────────────────────────────────┘
 *
 * Tablet: sidebars collapse on width < 1024px
 * Mobile: shows "Desktop only" message
 */
export default function EditorShell() {
  return (
    <>
      {/* Mobile blocker */}
      <div className="flex lg:hidden items-center justify-center min-h-screen bg-background p-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Smartphone size={24} className="text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Desktop Required
          </h2>
          <p className="text-sm text-foreground-tertiary leading-relaxed">
            The Quote Visual Editor requires a larger screen. Please open it on
            a desktop or tablet device.
          </p>
        </div>
      </div>

      {/* Desktop/tablet layout */}
      <div className="hidden lg:flex flex-col h-screen bg-background">
        <EditorHeader />
        <div className="flex flex-1 min-h-0">
          <LeftSidebar />
          <EditorCanvas />
          <RightPanel />
        </div>
      </div>
    </>
  );
}
