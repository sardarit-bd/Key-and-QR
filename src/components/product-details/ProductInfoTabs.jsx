"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Info, Box, Truck, RotateCcw, Sparkles } from "lucide-react";
import OverviewPanel from "./OverviewPanel";
import SpecificationPanel from "./SpecificationPanel";
import ShippingPanel from "./ShippingPanel";
import ReturnsPanel from "./ReturnsPanel";
import HowItWorksPanel from "./HowItWorksPanel";

const TABS = [
  { id: "overview", label: "Overview", icon: Info },
  { id: "specifications", label: "Specifications", icon: Box },
  { id: "how-it-works", label: "How It Works", icon: Sparkles },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "returns", label: "Returns", icon: RotateCcw },
];

/**
 * ProductInfoTabs — full-width left navigation + large right content panel.
 */
export default function ProductInfoTabs({ product }) {
  const [active, setActive] = useState("overview");
  const reduceMotion = useReducedMotion();

  const renderPanel = () => {
    switch (active) {
      case "overview":
        return <OverviewPanel product={product} />;
      case "specifications":
        return <SpecificationPanel product={product} />;
      case "shipping":
        return <ShippingPanel />;
      case "returns":
        return <ReturnsPanel />;
      case "how-it-works":
        return <HowItWorksPanel />;
      default:
        return <OverviewPanel product={product} />;
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-12">
      <div className="rounded-2xl border border-[#EDE4D0] bg-white overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
          {/* Left navigation */}
          <nav
            aria-label="Product information"
            className="flex md:flex-col border-b border-[#EDE4D0] md:border-b-0 md:border-r bg-[#FDFBF6] overflow-x-auto md:overflow-visible hide-scrollbar"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = active === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActive(tab.id)}
                  aria-pressed={isActive}
                  className={`relative flex shrink-0 cursor-pointer items-center gap-2.5 px-5 py-4 text-left text-[13px] font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6922D]/40 ${
                    isActive
                      ? "text-[#A6782B] bg-white"
                      : "text-[#8A7A5C] hover:text-[#2E2A24] hover:bg-white/60"
                  }`}
                >
                  <Icon size={15} className="shrink-0" />
                  {tab.label}
                  {isActive && (
                    <motion.span
                      layoutId="info-tab-active"
                      className="absolute inset-y-0 right-0 hidden md:block w-0.5 bg-[#C6922D]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right content area */}
          <div className="p-6 sm:p-8 lg:p-10 min-h-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-3xl"
              >
                {renderPanel()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
