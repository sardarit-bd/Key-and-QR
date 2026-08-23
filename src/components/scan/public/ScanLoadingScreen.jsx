"use client";

import React from "react";
import { Sparkles, Loader2 } from "lucide-react";

export default function ScanLoadingScreen({ message = "Awakening your inspiration..." }) {
  return (
    <div className="fixed inset-0 h-[100dvh] w-full bg-black flex flex-col items-center justify-center text-center p-6 overflow-hidden select-none z-50">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-[320px]">
        {/* Animated Brand Aura & Spinner */}
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/30 bg-neutral-950/90 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
            <Sparkles size={22} className="text-amber-300 fill-amber-300/30 animate-pulse" />
          </div>
          <Loader2
            size={76}
            className="absolute inset-0 m-auto text-amber-400/40 animate-spin"
            strokeWidth={1.5}
          />
        </div>

        {/* Text */}
        <p className="text-[15px] sm:text-base font-light text-white tracking-wide">
          {message}
        </p>

        <span className="mt-2.5 text-[11px] font-medium tracking-widest text-[#f3d6a0]/60 uppercase">
          MyInspireTag
        </span>
      </div>
    </div>
  );
}
