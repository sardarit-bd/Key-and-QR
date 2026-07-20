'use client';

import { BookOpen, Sparkles } from 'lucide-react';

/**
 * My Quotes Header
 */
export default function MyQuoteHeader() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-violet-400" />
          My Quotes
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Your personal inspiration library
        </p>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full">
        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
        <span className="text-xs text-violet-300 font-medium">Saved Collection</span>
      </div>
    </div>
  );
}