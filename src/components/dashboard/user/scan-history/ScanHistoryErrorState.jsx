'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Scan History Error State
 * Premium error state with soft glow.
 */
export default function ScanHistoryErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-red-500/15 blur-2xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-red-400/25 bg-red-500/10">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
      </div>

      <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
        Oops! Something went wrong
      </h3>

      <p className="mt-2 max-w-sm text-sm text-foreground-tertiary">
        {error || 'Failed to load scan history. Please try again.'}
      </p>

      <Button
        onClick={onRetry}
        className="mt-6 h-10 cursor-pointer rounded-xl border border-white/6 bg-muted px-5 text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-muted hover:shadow-md light:border-[#E8DFCE]/80"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}
