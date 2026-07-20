'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * My Quote Error State
 * Displayed when data fetch fails
 */
export default function MyQuoteErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-white">
        Oops! Something went wrong
      </h3>
      
      <p className="mt-2 text-sm text-gray-400 max-w-sm">
        {error || 'Failed to load your quotes. Please try again.'}
      </p>

      <Button
        onClick={onRetry}
        className="mt-6 bg-white/10 text-white hover:bg-white/20 border border-white/20"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </div>
  );
}