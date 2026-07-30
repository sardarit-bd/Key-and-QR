'use client';

import { ArrowLeft, Undo2, Redo2, Eye, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useEditorStore from './editorStore';

const UNDO_LABEL = 'Undo';
const REDO_LABEL = 'Redo';
const PREVIEW_LABEL = 'Preview';
const PUBLISH_LABEL = 'Publish';

export default function EditorHeader() {
  const router = useRouter();
  const quoteText = useEditorStore((s) => s.quoteText);
  const isDirty = useEditorStore((s) => s.isDirty);
  const isSaving = useEditorStore((s) => s.isSaving);
  const canUndo = useEditorStore((s) => s.canUndo());
  const canRedo = useEditorStore((s) => s.canRedo());
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  const title = quoteText
    ? quoteText.length > 40
      ? quoteText.slice(0, 40) + '…'
      : quoteText
    : 'Untitled Quote';

  const handleBack = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Leave without saving?'
      );
      if (!confirmed) return;
    }
    router.push('/new-dashboard/admin/quotes');
  };

  const handlePreview = () => {
    // Will be implemented in Phase 12
  };

  const handlePublish = () => {
    // Will be implemented in Phase 10
  };

  return (
    <header className="flex items-center justify-between h-12 px-3 border-b border-border bg-background shrink-0">
      {/* Left: Back + Title */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={handleBack}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-foreground-secondary hover:text-foreground transition-colors cursor-pointer shrink-0"
          title="Back to quotes"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="text-sm font-medium text-foreground truncate max-w-[200px] sm:max-w-[300px]">
          {title}
        </span>
        {isDirty && (
          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
            Unsaved
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-foreground-secondary hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title={UNDO_LABEL}
        >
          <Undo2 size={15} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-foreground-secondary hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title={REDO_LABEL}
        >
          <Redo2 size={15} />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <button
          onClick={handlePreview}
          className="h-7 px-2.5 flex items-center gap-1.5 rounded-md border border-border bg-background hover:bg-muted text-foreground-secondary hover:text-foreground transition-colors text-xs cursor-pointer"
          title={PREVIEW_LABEL}
        >
          <Eye size={13} />
          <span className="hidden sm:inline">{PREVIEW_LABEL}</span>
        </button>
        <button
          onClick={handlePublish}
          disabled={isSaving}
          className="h-7 px-3 flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium cursor-pointer"
          title={PUBLISH_LABEL}
        >
          <Send size={13} />
          <span className="hidden sm:inline">
            {isSaving ? 'Saving…' : PUBLISH_LABEL}
          </span>
        </button>
      </div>
    </header>
  );
}
