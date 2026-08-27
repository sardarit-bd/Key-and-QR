'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EditorShell from '@/components/dashboard/admin/editor/EditorShell';
import useEditorStore from '@/components/dashboard/admin/editor/editorStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ensureEditorFontsLoaded } from '@/components/dashboard/admin/editor/editorFonts';

export default function EditVisualQuotePage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    ensureEditorFontsLoaded();
  }, []);

  useEffect(() => {
    const quoteId = params?.id;
    if (!quoteId) {
      router.push('/dashboard/admin/quotes');
      return;
    }

    useEditorStore.getState().setLoading(true);

    api
      .get(`/quotes/${quoteId}`)
      .then((res) => {
        const quote = res.data?.data;
        if (!quote) {
          toast.error('Quote not found');
          router.push('/dashboard/admin/quotes');
          return;
        }

        useEditorStore.getState().initializeExistingQuote(quote);
      })
      .catch((err) => {
        console.error('Failed to load quote:', err);
        toast.error('Failed to load quote data');
        router.push('/dashboard/admin/quotes');
      });
  }, [params?.id, router]);

  return <EditorShell />;
}
