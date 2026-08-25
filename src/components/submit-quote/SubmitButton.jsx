'use client';

import { Send, Sparkles, Loader2 } from 'lucide-react';

/**
 * Premium submit button — large, elegant hover, loading state, disabled during submit.
 */
export default function SubmitButton({ submitting, disabled }) {
  const isDisabled = disabled || submitting;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className="group relative inline-flex w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-accent to-accent/85 px-6 sm:px-12 py-3.5 sm:py-4 text-sm sm:text-[15px] font-semibold text-accent-foreground shadow-[0_12px_32px_-8px_rgba(253,182,92,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-8px_rgba(253,182,92,0.65)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[0_12px_32px_-8px_rgba(253,182,92,0.5)] sm:w-auto"
    >
      {/* Sheen sweep on hover */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

      {submitting ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          Submitting your quote...
        </>
      ) : (
        <>
          <Sparkles size={17} className="transition-transform duration-300 group-hover:rotate-12" />
          Publish Quote
          <Send size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
}
