'use client';

import { useEffect } from 'react';
import EditorShell from '@/components/dashboard/admin/editor/EditorShell';
import useEditorStore from '@/components/dashboard/admin/editor/editorStore';
import { ensureEditorFontsLoaded } from '@/components/dashboard/admin/editor/editorFonts';

export default function CreateVisualQuotePage() {
  useEffect(() => {
    ensureEditorFontsLoaded();
    useEditorStore.getState().initializeNewQuote();
  }, []);

  return <EditorShell />;
}
