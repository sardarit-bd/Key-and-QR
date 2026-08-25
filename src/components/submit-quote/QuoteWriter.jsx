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
      {/* Glow behind on focus */}
      <div className="pointer-events-none absolute -inset-2 rounded-[24px] bg-accent/[0.06] opacity-0 blur-2xl transition-opacity duration-500 has-focus:opacity-100" />

      <div className="group relative overflow-hidden rounded-[22px] border border-white/6 bg-card shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)] transition-all duration-300 focus-within:border-accent/40 focus-within:shadow-[0_0_0_1px_rgba(253,182,92,0.25),0_20px_50px_-16px_rgba(0,0,0,0.5)] light:border-[#E8DFCE]/80 light:bg-[#FBF7EF]/55 light:focus-within:border-[#DCB878]/90 light:focus-within:shadow-[0_0_0_1px_rgba(220,184,120,0.35),0_24px_60px_-18px_rgba(120,85,30,0.28)]">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        {/* Hairline top highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent light:via-[#E8DFCE]/70" />

        {/* Label */}
        <div className="relative z-10 flex items-center justify-between px-4 sm:px-5 pt-3.5 sm:pt-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-accent/25 bg-accent/10 shadow-[0_0_16px_rgba(253,182,92,0.12)]">
              <QuoteIcon size={13} className="text-accent" fill="currentColor" stroke="none" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
              Your Quote
            </span>
          </div>
          <span className="text-[11px] text-foreground-tertiary tabular-nums">
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
          className="relative z-10 block w-full resize-none border-0 bg-transparent px-4 sm:px-5 py-3 sm:py-4 text-[15px] leading-[1.6] text-foreground placeholder:text-foreground-tertiary/70 focus:outline-none focus:ring-0 sm:text-[17px] sm:leading-[1.7]"
        />

        {/* Character progress bar */}
        <div className="relative z-10 px-4 sm:px-5 pb-3.5 sm:pb-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-background-tertiary/60 light:bg-[#E8DFCE]/60">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isNearLimit
                  ? 'bg-gradient-to-r from-amber-400 to-red-400'
                  : 'bg-gradient-to-r from-accent to-accent/70'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[10px] text-foreground-tertiary">
              {percent.toFixed(0)}% of {MAX_LENGTH}
            </span>
            {isNearLimit && (
              <span className="text-[10px] font-medium text-amber-400">
                Approaching the limit
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
