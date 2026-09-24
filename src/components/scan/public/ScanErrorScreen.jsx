"use client";

import { useState } from "react";
import { AlertTriangle, WifiOff, RefreshCw } from "lucide-react";

export default function ScanErrorScreen({ message, onRetry, isOffline = false }) {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (retrying) return;
    setRetrying(true);
    try {
      if (onRetry) await onRetry();
    } finally {
      setTimeout(() => setRetrying(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 h-[100dvh] w-full bg-black flex items-center justify-center p-4 overflow-hidden select-none z-50">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full blur-3xl ${
            isOffline ? "bg-amber-500/15" : "bg-red-500/10"
          }`}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-white/20 bg-neutral-950/75 backdrop-blur-2xl saturate-150 p-6 sm:p-8 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_16px_48px_rgba(0,0,0,0.8)] text-white">
        <div
          className={`w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto mb-5 shadow-inner ${
            isOffline
              ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
              : "bg-red-500/15 border-red-500/30 text-red-400"
          }`}
        >
          {isOffline ? <WifiOff size={28} /> : <AlertTriangle size={28} />}
        </div>

        <h1 className="text-xl sm:text-2xl font-serif font-normal text-white mb-2 tracking-tight">
          {isOffline ? "No Internet Connection" : "Something Went Wrong"}
        </h1>

        <p className="text-white/70 mb-6 text-xs sm:text-sm font-light leading-relaxed">
          {isOffline
            ? "Please check your mobile data or Wi-Fi to unlock your inspiration."
            : message || "We couldn't load this QR code right now. Please try again."}
        </p>

        <button
          type="button"
          disabled={retrying}
          onClick={handleRetry}
          className="inline-flex w-full items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 text-black text-xs font-bold shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-80"
        >
          {retrying ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>Checking Connection...</span>
            </>
          ) : (
            <span>Tap to Retry</span>
          )}
        </button>

        <p className="mt-4 text-[10px] text-[#e6b76f]/50 tracking-widest uppercase font-light">
          myinspiretag.com
        </p>
      </div>
    </div>
  );
}