"use client";

import { RotateCcw, ShieldCheck } from "lucide-react";

/**
 * ReturnsPanel — return policy.
 */
export default function ReturnsPanel() {
  return (
    <div>
      <h3 className="text-lg font-bold tracking-tight text-[#2E2A24]">Returns</h3>
      <div className="mt-4 space-y-3">
        <p className="flex items-start gap-2.5 text-[14px] leading-relaxed text-[#5C5346]">
          <RotateCcw size={16} className="mt-0.5 shrink-0 text-[#A6782B]" />
          Not quite right? Return within 30 days for a full refund — no questions asked.
        </p>
        <p className="flex items-start gap-2.5 text-[14px] leading-relaxed text-[#5C5346]">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#2E5B3A]" />
          Products must be unused and in original packaging.
        </p>
      </div>
    </div>
  );
}
