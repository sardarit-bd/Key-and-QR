'use client';

import { User } from 'lucide-react';

/**
 * Author input — optional attribution, premium styling.
 */
export default function AuthorInput({ author, onChange }) {
  return (
    <div className="relative">
      <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm px-4 py-3 transition-all duration-200 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500/60 dark:focus-within:border-amber-500/50">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <User size={16} className="shrink-0 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            value={author}
            onChange={(e) => onChange(e.target.value)}
            maxLength={100}
            placeholder="Author or source... (optional)"
            aria-label="Quote author"
            className="w-full border-0 bg-transparent p-0 text-[13px] sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-0"
          />
        </div>
      </div>
    </div>
  );
}
