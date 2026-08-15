'use client';

import { ArrowLeft, Monitor, Smartphone, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useEditorStore from './editorStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

export default function EditorHeader() {
  const router = useRouter();
  const activeDesignVersion = useEditorStore((s) => s.activeDesignVersion);
  const switchDesignVersion = useEditorStore((s) => s.switchDesignVersion);
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
    const hasElements =
      editorData?.desktop?.elements?.length > 0 ||
      editorData?.mobile?.elements?.length > 0 ||
      editorData?.elements?.length > 0;

    if (!hasElements) {
      toast.error('Add at least one element before saving.');
      return;
    }

    // Find first text element content to use as the main quote title/text
    const textEl =
      editorData?.desktop?.elements?.find((el) => el.type === 'text') ||
      editorData?.mobile?.elements?.find((el) => el.type === 'text') ||
      editorData?.elements?.find((el) => el.type === 'text');

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
    const previewKey = quoteId ? `quote_preview_${quoteId}` : `quote_preview_temp_${Date.now()}`;
    const previewParam = quoteId ? `id=${quoteId}` : `previewKey=${encodeURIComponent(previewKey)}`;

    try {
      sessionStorage.setItem(previewKey, JSON.stringify(data));
    } catch (err) {
      console.warn('SessionStorage quota exceeded, continuing with URL identifier:', err);
    }

    const url = `/admin/quotes/preview?${previewParam}&mode=${activeDesignVersion}`;
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

      {/* Desktop / Mobile Switcher */}
      <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border">
        <button
          type="button"
          onClick={() => switchDesignVersion('desktop')}
          className={`h-7 px-3 flex items-center gap-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeDesignVersion === 'desktop'
              ? 'bg-background shadow-xs text-foreground font-semibold'
              : 'text-foreground-tertiary hover:text-foreground'
          }`}
          title="Switch to Desktop Design"
        >
          <Monitor size={13} />
          <span>Desktop</span>
        </button>
        <button
          type="button"
          onClick={() => switchDesignVersion('mobile')}
          className={`h-7 px-3 flex items-center gap-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeDesignVersion === 'mobile'
              ? 'bg-background shadow-xs text-foreground font-semibold'
              : 'text-foreground-tertiary hover:text-foreground'
          }`}
          title="Switch to Mobile Design"
        >
          <Smartphone size={13} />
          <span>Mobile</span>
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
