"use client";

import React from "react";
import { Sparkles, Loader2 } from "lucide-react";

const Loader = ({ text = "Awakening your inspiration...", fullScreen = true }) => {
  return (
    <div
      className={`w-full flex flex-col items-center justify-center text-center p-6 select-none bg-black ${
        fullScreen ? "fixed inset-0 h-[100dvh] z-50 overflow-hidden" : "h-full min-h-[220px]"
      }`}
    >
      {/* Ambient glow */}
      {fullScreen && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center max-w-[320px]">
        {/* Animated Brand Aura & Spinner */}
        <div className="relative mb-5 flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-amber-400/30 bg-neutral-950/90 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
            <Sparkles size={20} className="text-amber-300 fill-amber-300/30 animate-pulse" />
          </div>
          <Loader2
            size={64}
            className="absolute inset-0 m-auto text-amber-400/40 animate-spin"
            strokeWidth={1.5}
          />
        </div>

        {/* Text */}
        <p className="text-sm sm:text-base font-light text-white tracking-wide">
          {text}
        </p>

        <span className="mt-2 text-[10.5px] font-medium tracking-widest text-[#f3d6a0]/60 uppercase">
          MyInspireTag
        </span>
      </div>
    </div>
  );
};

export default Loader;