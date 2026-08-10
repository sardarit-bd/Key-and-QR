'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * Legacy QR Page — redirects to the canonical daily-unlock flow.
 * Route: /tag/[tagCode] → /t/[tagCode]
 *
 * The old useQRResolution hook called resolveTag/resolveQuoteId which
 * could return a different quote _id than what was displayed (P0.8).
 * Redirect to the canonical page that uses GET /scan/public/:tagCode.
 */
export default function QRPage() {
  const params = useParams();
  const router = useRouter();
  const tagCode = params?.tagCode;

  useEffect(() => {
    if (tagCode) {
      router.replace(`/t/${tagCode}`);
    }
  }, [tagCode, router]);

  return null;
}
