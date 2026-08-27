"use client";

import { Truck, CheckCircle2 } from "lucide-react";

/**
 * ShippingPanel — shipping policy.
 */
export default function ShippingPanel() {
  return (
    <div>
      <h3 className="text-lg font-bold tracking-tight text-[#2E2A24]">Shipping</h3>
      <div className="mt-4 space-y-3">
        <p className="flex items-start gap-2.5 text-[14px] leading-relaxed text-[#5C5346]">
          <Truck size={16} className="mt-0.5 shrink-0 text-[#A6782B]" />
          Orders ship within 1–2 business days. Free standard shipping on all orders.
        </p>
        <p className="flex items-start gap-2.5 text-[14px] leading-relaxed text-[#5C5346]">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#2E5B3A]" />
          Tracked delivery with updates from dispatch to your door.
        </p>
      </div>
    </div>
  );
}
