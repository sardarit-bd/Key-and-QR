'use client';

import { useState, useEffect } from 'react';
import { Monitor, Smartphone, Eye, Quote, X, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useEditorStore from './editorStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function EditorHeader() {
  const router = useRouter();
  const activeDesignVersion = useEditorStore((s) => s.activeDesignVersion);
  const switchDesignVersion = useEditorStore((s) => s.switchDesignVersion);
  const isDirty = useEditorStore((s) => s.isDirty);
  const isSaving = useEditorStore((s) => s.isSaving);
  const setSaving = useEditorStore((s) => s.setSaving);
  const quoteId = useEditorStore((s) => s.quoteId);
  const quoteText = useEditorStore((s) => s.quoteText);
  const quoteAuthor = useEditorStore((s) => s.quoteAuthor);
  const quoteCategory = useEditorStore((s) => s.quoteCategory);
  const toEditorData = useEditorStore((s) => s.toEditorData);

  const [confirmExitOpen, setConfirmExitOpen] = useState(false);

  // Native beforeunload protection for accidental tab close / reload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleExitRequest = () => {
    if (isDirty) {
      setConfirmExitOpen(true);
    } else {
      router.push('/new-dashboard/admin/quotes');
    }
  };

  const handleConfirmExit = () => {
    setConfirmExitOpen(false);
    useEditorStore.setState({ isDirty: false });
    router.push('/new-dashboard/admin/quotes');
  };

  const handleSave = async (redirectAfter = true) => {
    if (!quoteCategory) {
      toast.error('Please select a category in Quote Details before saving.');
      return;
    }

    const editorData = toEditorData();
    const desktopElements = editorData?.desktop?.elements || [];
    const mobileElements = editorData?.mobile?.elements || [];
    const hasElements = desktopElements.length > 0 || mobileElements.length > 0;

    if (!hasElements) {
      toast.error('Add at least one element before saving.');
      return;
    }

    // Extract quote text from elements or store
    const textEl =
      desktopElements.find((el) => el.type === 'text') ||
      mobileElements.find((el) => el.type === 'text');

    const plainText = textEl?.textData?.content?.trim() || quoteText || 'Untitled Quote';
    const authorName = (quoteAuthor || '').trim();

    setSaving(true);
    try {
      if (quoteId) {
        await api.patch(`/quotes/${quoteId}`, {
          text: plainText,
          author: authorName,
          category: quoteCategory,
          editorData,
        });
        toast.success('Quote updated');
      } else {
        const response = await api.post('/quotes', {
          text: plainText,
          author: authorName,
          category: quoteCategory,
          editorData,
        });
        toast.success('Quote created');
        if (response.data?.data?._id) {
          useEditorStore.setState({ quoteId: response.data.data._id });
        }
      }
      useEditorStore.setState({ isDirty: false });
      if (redirectAfter) {
        router.push('/new-dashboard/admin/quotes');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save quote');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndExit = async () => {
    setConfirmExitOpen(false);
    await handleSave(true);
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
    <>
      <header className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-border bg-background shrink-0 z-10">
        {/* Left: Breadcrumbs & Exit */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={handleExitRequest}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground-secondary hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Return to Quotes"
          >
            <Quote size={14} className="text-primary" />
            <span className="hidden sm:inline">All Quotes</span>
          </button>
          <ChevronRight size={13} className="text-foreground-tertiary/40 shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
              {quoteId ? 'Edit Visual Quote' : 'New Visual Quote'}
            </span>
            {isDirty && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                Unsaved
              </span>
            )}
          </div>
        </div>

        {/* Center: Desktop / Mobile Switcher */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => switchDesignVersion('desktop')}
            className={`h-7 px-3 flex items-center gap-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeDesignVersion === 'desktop'
                ? 'bg-background shadow-xs text-foreground font-semibold'
                : 'text-foreground-tertiary hover:text-foreground'
            }`}
            title="Desktop Design (800 × 600)"
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
            title="Mobile Design (375 × 667)"
          >
            <Smartphone size={13} />
            <span>Mobile</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-normal cursor-pointer"
            onClick={handlePreview}
          >
            <Eye size={14} className="mr-1.5" />
            <span>Preview</span>
          </Button>

          <Button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            size="sm"
            className="h-8 text-xs font-medium cursor-pointer"
          >
            {isSaving ? 'Saving...' : quoteId ? 'Save Changes' : 'Save Quote'}
          </Button>

          <button
            type="button"
            onClick={handleExitRequest}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-muted transition-colors cursor-pointer ml-1"
            title="Close Editor"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* Styled Unsaved Changes Confirmation Modal */}
      <Dialog open={confirmExitOpen} onOpenChange={setConfirmExitOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Unsaved Changes</DialogTitle>
            <DialogDescription className="text-xs text-foreground-secondary pt-1">
              You have unsaved changes to this quote. Are you sure you want to leave without saving?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmExitOpen(false)}
              className="text-xs cursor-pointer"
            >
              Continue Editing
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmExit}
              className="text-xs cursor-pointer"
            >
              Leave Without Saving
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveAndExit}
              disabled={isSaving}
              className="text-xs cursor-pointer"
            >
              {isSaving ? 'Saving...' : 'Save & Exit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
