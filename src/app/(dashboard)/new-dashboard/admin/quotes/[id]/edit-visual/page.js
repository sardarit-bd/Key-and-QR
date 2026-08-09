'use client';

import EditorShell from '@/components/dashboard/admin/editor/EditorShell';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useEditorStore from '@/components/dashboard/admin/editor/editorStore';
import api from '@/lib/api';
import { ensureEditorFontsLoaded } from '@/components/dashboard/admin/editor/editorFonts';

export default function EditVisualQuotePage() {
  const params = useParams();
  const router = useRouter();
  const loadQuote = useEditorStore((s) => s.loadQuote);
  const setLoading = useEditorStore((s) => s.setLoading);
  const setQuoteId = useEditorStore((s) => s.setQuoteId);

  useEffect(() => {
    ensureEditorFontsLoaded();
  }, []);

  useEffect(() => {
    const quoteId = params?.id;
    if (!quoteId) {
      router.push('/new-dashboard/admin/quotes');
      return;
    }

    setLoading(true);
    setQuoteId(quoteId);

    api
      .get(`/quotes/${quoteId}`)
      .then((res) => {
        const quote = res.data?.data;
        if (!quote) {
          router.push('/new-dashboard/admin/quotes');
          return;
        }

        if (quote.editorData) {
          loadQuote(quote.editorData);
        } else {
          const elements = [];
          if (quote.text) {
            elements.push({
              id: `el_legacy_text`,
              type: 'text',
              x: 40, y: 200, width: 720, height: 160,
              rotation: 0, scaleX: 1, scaleY: 1,
              opacity: 1, visible: true, locked: false, zIndex: 1,
              textData: {
                content: quote.text,
                fontFamily: 'Playfair Display', fontSize: 48,
                fontWeight: '700', fontStyle: 'normal',
                lineHeight: 1.3, letterSpacing: 0,
                textAlign: 'center', color: '#1a1a1a', wrap: true,
              },
            });
          }
          if (quote.author) {
            elements.push({
              id: `el_legacy_author`,
              type: 'text',
              x: 40, y: 380, width: 720, height: 40,
              rotation: 0, scaleX: 1, scaleY: 1,
              opacity: 0.7, visible: true, locked: false, zIndex: 1,
              textData: {
                content: `\u2014 ${quote.author}`,
                fontFamily: 'Inter', fontSize: 20,
                fontWeight: '300', fontStyle: 'italic',
                lineHeight: 1, letterSpacing: 2,
                textAlign: 'right', color: '#666666', wrap: false,
              },
            });
          }

          const editorData = {
            version: '1.0',
            canvas: { width: 800, height: 600 },
            elements,
            background: quote.image?.url
              ? { type: 'image', source: { url: quote.image.url } }
              : null,
          };
          loadQuote(editorData);
        }
      })
      .catch(() => {
        router.push('/new-dashboard/admin/quotes');
      });
  }, [params?.id, loadQuote, setLoading, setQuoteId, router]);

  return <EditorShell />;
}
