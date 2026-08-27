"use client";

import { QrCode, Sparkles } from "lucide-react";
import Link from "next/link";

export default function InvalidQrScreen({ tagCode }) {
  return (
    <div className="fixed inset-0 h-[100dvh] w-full bg-black flex items-center justify-center p-4 overflow-hidden select-none z-50">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-white/20 bg-neutral-950/60 backdrop-blur-2xl saturate-150 p-6 sm:p-8 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_16px_48px_rgba(0,0,0,0.8)] text-white">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5 text-amber-300 shadow-inner">
          <QrCode size={28} />
        </div>

        <h1 className="text-xl sm:text-2xl font-serif font-normal text-white mb-2 tracking-tight">
          QR Code Not Found
        </h1>

        <p className="text-white/70 mb-5 text-xs sm:text-sm font-light leading-relaxed">
          We couldn&apos;t find a valid InspireTag for this QR code. It may have been mistyped or does not exist.
        </p>

        {tagCode && (
          <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 mb-5 text-left">
            <p className="text-[11px] text-white/50 font-medium mb-1">
              Scanned code:
            </p>
            <p className="text-xs font-mono text-amber-200/90 break-all">
              {tagCode}
            </p>
          </div>
        )}

        <Link
          href="/"
          className="inline-flex w-full items-center justify-center h-11 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 text-black text-xs font-bold shadow-lg transition-all active:scale-[0.98] cursor-pointer"
        >
          Go to Homepage
        </Link>

        <p className="mt-4 text-[10px] text-[#e6b76f]/50 tracking-widest uppercase font-light">
          myinspiretag.com
        </p>
      </div>
    </div>
  );
}
