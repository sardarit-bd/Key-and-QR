"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Truck, RotateCcw, ShieldCheck, BadgeCheck } from "lucide-react";

const HIGHLIGHTS = [
  { icon: Truck, title: "Free Shipping", desc: "On all orders" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
  { icon: ShieldCheck, title: "Secure Checkout", desc: "100% safe & secure" },
  { icon: BadgeCheck, title: "Premium Quality", desc: "Crafted to last" },
];

/**
 * FeatureHighlights — full-width single-row trust badges.
 */
export default function FeatureHighlights() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {HIGHLIGHTS.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduceMotion ? undefined : { y: -3 }}
              className="group flex items-center gap-3.5 rounded-2xl border border-[#EDE4D0] bg-white p-4 shadow-[0_2px_12px_-4px_rgb(60_45_15/0.06)] transition-[border-color,box-shadow] duration-300 hover:border-[#C6922D]/30 hover:shadow-[0_16px_32px_-16px_rgb(60_45_15/0.25)]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5EDDC] text-[#A6782B] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]">
                <Icon size={19} />
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-[#2E2A24]">{item.title}</p>
                <p className="text-[12px] leading-snug text-[#A99B7F]">{item.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
