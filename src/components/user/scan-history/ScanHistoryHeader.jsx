'use client';

import { Scan, Sparkles } from 'lucide-react';

/**
 * Scan History Header
 */
export default function ScanHistoryHeader() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
          <Scan className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" />
          Scan History
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Every quote you've discovered through scanning
        </p>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-xs text-emerald-300 font-medium">Scan Journey</span>
      </div>
    </div>
  );
}