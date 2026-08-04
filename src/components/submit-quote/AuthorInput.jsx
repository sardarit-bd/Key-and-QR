'use client';

import { User } from 'lucide-react';

/**
 * Author input — optional attribution, premium styling.
 */
export default function AuthorInput({ author, onChange }) {
  return (
    <div className="relative">
      <div className="group relative overflow-hidden rounded-[18px] border border-white/6 bg-card shadow-[0_10px_28px_-12px_rgb(0_0_0/0.4)] transition-all duration-300 focus-within:border-accent/40 focus-within:shadow-[0_0_0_1px_rgba(253,182,92,0.25),0_16px_40px_-14px_rgb(0_0_0/0.5)] light:border-[#E8DFCE]/80 light:bg-[#FBF7EF]/55 light:focus-within:border-[#DCB878]/90">
        <div className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative z-10 flex items-center gap-3 px-4">
          <User size={16} className="shrink-0 text-foreground-tertiary" />
          <input
            type="text"
            value={author}
            onChange={(e) => onChange(e.target.value)}
            maxLength={100}
            placeholder="The person who inspired these words... (optional)"
            aria-label="Quote author"
            className="h-12 w-full border-0 bg-transparent text-sm text-foreground placeholder:text-foreground-tertiary/70 focus:outline-none focus:ring-0"
          />
        </div>
      </div>
    </div>
  );
}
