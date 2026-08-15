'use client';

import { ArrowLeft, Monitor, Smartphone, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useEditorStore from './editorStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

export default function EditorHeader() {
  const router = useRouter();
  const previewMode = useEditorStore((s) => s.previewMode);
  const setPreviewMode = useEditorStore((s) => s.setPreviewMode);
  const isDirty = useEditorStore((s) => s.isDirty);
  const isSaving = useEditorStore((s) => s.isSaving);
  const setSaving = useEditorStore((s) => s.setSaving);
  const quoteId = useEditorStore((s) => s.quoteId);
  const quoteText = useEditorStore((s) => s.quoteText);
  const toEditorData = useEditorStore((s) => s.toEditorData);

  const handleBack = () => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Leave without saving?');
      if (!confirmed) return;
    }
    router.push('/new-dashboard/admin/quotes');
  };

  const handleSave = async () => {
    const editorData = toEditorData();
    if (!editorData?.elements?.length) {
      toast.error('Add at least one element before saving.');
      return;
    }

    // Find the first text element content to use as the main quote text
    const textEl = editorData.elements.find((el) => el.type === 'text');
    const plainText = textEl?.textData?.content || quoteText || 'Untitled Quote';

    setSaving(true);
    try {
      if (quoteId) {
        await api.patch(`/quotes/${quoteId}`, {
          text: plainText,
          editorData,
        });
        toast.success('Quote updated');
      } else {
        await api.post('/quotes', {
          text: plainText,
          category: 'love',
          editorData,
        });
        toast.success('Quote created');
      }
      router.push('/new-dashboard/admin/quotes');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    const data = toEditorData();
    const json = JSON.stringify(data);
    const url = `/admin/quotes/preview?data=${encodeURIComponent(json)}`;
    window.open(url, '_blank');
  };

  return (
    <header className="flex items-center justify-between h-14 px-5 border-b border-border bg-background shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-foreground-secondary hover:text-foreground transition-colors cursor-pointer"
          title="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-sm font-medium text-foreground">Edit Quote</span>
      </div>

      <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
        <button
          onClick={() => setPreviewMode('desktop')}
          className={`w-8 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
            previewMode === 'desktop'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-foreground-tertiary hover:text-foreground-secondary'
          }`}
          title="Desktop view"
        >
          <Monitor size={15} />
        </button>
        <button
          onClick={() => setPreviewMode('mobile')}
          className={`w-8 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
            previewMode === 'mobile'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-foreground-tertiary hover:text-foreground-secondary'
          }`}
          title="Mobile view"
        >
          <Smartphone size={15} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 text-xs font-normal cursor-pointer" onClick={handlePreview}>
          <Eye size={14} className="mr-1.5" />
          Preview
        </Button>
        <Button onClick={handleSave} disabled={isSaving} size="sm" className="h-8 text-xs font-medium cursor-pointer">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </header>
  );
}
