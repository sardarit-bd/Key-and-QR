'use client';

import EditorShell from '@/components/dashboard/admin/editor/EditorShell';
import { useEffect } from 'react';
import { ensureEditorFontsLoaded } from '@/components/dashboard/admin/editor/editorFonts';

export default function CreateVisualQuotePage() {
  useEffect(() => {
    ensureEditorFontsLoaded();
  }, []);

  return <EditorShell />;
}
