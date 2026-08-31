'use client';

import { useRef, useEffect } from 'react';
import { Quote as QuoteIcon } from 'lucide-react';

const MAX_LENGTH = 500;

/**
 * Quote Writer — premium textarea with auto-resize, focus glow,
 * and a character progress bar.
 */
export default function QuoteWriter({ text, onChange }) {
  const textareaRef = useRef(null);

  // Auto-resize the textarea to fit content.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
  }, [text]);

  const percent = Math.min((text.length / MAX_LENGTH) * 100, 100);
  const remaining = MAX_LENGTH - text.length;
  const isNearLimit = remaining <= 50;

  return (
    <div className="relative">
      <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm p-4 md:p-5 transition-all duration-200 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500/60 dark:focus-within:border-amber-500/50">
        {/* Label Header */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <QuoteIcon size={13} fill="currentColor" stroke="none" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-400">
              Your Quote
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 tabular-nums">
            {remaining} remaining
          </span>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          maxLength={MAX_LENGTH}
          rows={4}
          placeholder="Write something that could change someone's day..."
          aria-label="Quote text"
          className="block w-full resize-none border-0 bg-transparent p-0 text-[15px] leading-[1.6] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-0 sm:text-[16px] sm:leading-[1.7]"
        />

        {/* Character progress bar */}
        <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/60">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isNearLimit
                  ? 'bg-gradient-to-r from-amber-400 to-red-400'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
              {percent.toFixed(0)}% of {MAX_LENGTH}
            </span>
            {isNearLimit && (
              <span className="text-[10px] font-medium text-amber-500 dark:text-amber-400">
                Approaching the limit
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
