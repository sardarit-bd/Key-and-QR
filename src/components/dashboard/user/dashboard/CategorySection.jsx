"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Lock, Check, LayoutGrid, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Card from "./Card";

/**
 * Explore Categories — client image:
 * icon + name + premium/locked/available state; disabled when backend
 * says unavailable. Clicking an available category triggers the receive
 * flow (loading → reveal) handled by the parent DashboardHome.
 *
 * Layout: two-column premium hero — left introduces the feature, right
 * presents the category buttons (vertically centered). The moon
 * illustration is a purely decorative background element on the far
 * right, softly masked so it never distracts from the content.
 */
export default function CategorySection({
  categories,
  onSelectCategory,
  disabled,
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const categoryList = Array.isArray(categories) ? categories : [];

  const handleClick = (category) => {
    if (category?.isLocked || category?.isAvailableToday === false) return;
    onSelectCategory(category);
  };

  const handleViewAll = () => {
    router.push("/new-dashboard/user/my-quotes");
  };

  return (
    <Card className="relative overflow-hidden rounded-[22px] sm:rounded-[26px] px-5 sm:px-7 md:px-8 py-6 sm:py-7">
      {/* ===== Ambient luxury background ===== */}
      <div className="pointer-events-none absolute inset-0">
        {/* Base luxury layered gradient */}

        {/* Subtle golden ambient glow — left */}
        <div className="absolute -left-28 -top-20 h-80 w-80 rounded-full bg-accent/[0.07] blur-3xl" />

        {/* Soft purple glow — right */}
        <div className="absolute -right-28 -bottom-24 h-80 w-80 rounded-full bg-primary/[0.08] blur-3xl" />

        {/* Faint radial lighting around the moon — right side */}
        <div className="absolute -right-10 -bottom-10 h-96 w-96 rounded-full bg-[#C6922D]/[0.06] blur-[100px]" />

        {/* ===== Moon illustration — decorative only, far right ===== */}
        <div className="absolute bottom-0 right-0 flex items-end justify-end">
          <Image
            src="/images/dashboard/moon.png"
            alt=""
            aria-hidden="true"
            width={360}
            height={360}
            priority={false}
            className="pointer-events-none select-none opacity-[0.80] [mask-image:radial-gradient(ellipse_80%_80%_at_75%_75%,black_55%,transparent_95%)] [-webkit-mask-image:radial-gradient(ellipse_80%_80%_at_75%_75%,black_55%,transparent_95%)]"
          />
        </div>
      </div>
      {/* ===== Tiny floating particles ===== */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <span className="absolute left-[42%] top-[18%] h-1 w-1 rounded-full bg-accent/40 blur-[1px]" />
        <span className="absolute left-[48%] bottom-[24%] h-[3px] w-[3px] rounded-full bg-primary/30 blur-[1px]" />
        <span className="absolute right-[34%] top-[30%] h-[2px] w-[2px] rounded-full bg-accent/25" />
        <span className="absolute right-[30%] bottom-[18%] h-1 w-1 rounded-full bg-white/20 blur-[1px]" />
      </div>

      {/* ===== Content: two-column hero ===== */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-6">
        {/* LEFT COLUMN — heading + description */}
        <div className="w-full lg:w-[30%] lg:shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles
              size={16}
              fill="currentColor"
              className="text-accent w-4 h-4"
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
              Explore
            </span>
          </div>
          <h2 className="mt-1.5 text-[22px] sm:text-[24px] md:text-[28px] leading-tight tracking-tight text-foreground">
            Ready for more inspiration?
          </h2>
          <p className="mt-1.5 text-[13px] sm:text-[14px] leading-6 text-foreground-secondary">
            Choose a category and get a new quote.
          </p>

          {/* Small premium decorative accent — soft gold divider line */}
          <div className="mt-4 flex items-center gap-2">
            <span className="h-px w-8 bg-gradient-to-r from-accent/50 to-transparent" />
            <span className="h-1 w-1 rounded-full bg-accent/40" />
          </div>
        </div>

        {/* RIGHT COLUMN — category actions — fills remaining space, aligned right */}
        <div className="w-full lg:flex-1 lg:w-auto">
          <div className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-1 px-1 lg:flex-nowrap lg:overflow-visible lg:justify-start">
            {categoryList.length > 0 ? (
              categoryList.map((category, index) => {
                const slug = category?.slug || category?.name || "";
                const Icon = category?.iconComponent || Sparkles;
                const isLocked =
                  !!category?.isLocked || category?.isAvailableToday === false;
                const isPremium = !!category?.isPremium;

                return (
                  <motion.button
                    key={category?.id || slug}
                    onClick={() => handleClick(category)}
                    disabled={isLocked || disabled}
                    initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={!isLocked && !reduceMotion ? { y: -4, scale: 1.03 } : undefined}
                    whileTap={!isLocked && !reduceMotion ? { scale: 0.97 } : undefined}
                    className={`
                      group relative flex min-h-[104px] min-w-[104px] shrink-0 flex-col items-center justify-center gap-1.5
                      rounded-[18px] border px-3 py-4
                      transition-colors duration-300
                      ${
                        isLocked
                          ? "border-white/6 bg-background-secondary/40 backdrop-blur-sm cursor-not-allowed"
                          : "border-white/8 bg-gradient-to-b from-background-secondary/80 to-background-secondary/30 cursor-pointer hover:border-primary/30 hover:shadow-[0_16px_32px_-12px_rgb(0_0_0/0.5)]"
                      }
                    `}
                  >
                    {/* Premium marker */}
                    {isPremium && (
                      <motion.span
                        initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 16 }}
                        className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-accent/40 bg-gradient-to-tr from-accent/30 to-accent/10 shadow-[0_0_14px_rgba(253,182,92,0.3)]"
                      >
                        <Sparkles size={11} className="text-accent" />
                      </motion.span>
                    )}

                    {/* Icon */}
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 ${
                        isLocked
                          ? "bg-background-tertiary/40"
                          : "bg-background-tertiary/60 group-hover:bg-accent/10 group-hover:shadow-[0_0_18px_-4px_rgba(253,182,92,0.35)]"
                      }`}
                    >
                      {isLocked ? (
                        <Lock size={18} className="text-muted-foreground" />
                      ) : (
                        <motion.span
                          whileHover={reduceMotion ? undefined : { rotate: -6, scale: 1.12 }}
                          transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          className="flex items-center justify-center"
                        >
                          <Icon
                            size={22}
                            strokeWidth={2}
                            className={`w-[20px] h-[20px] ${category?.colorClass || "text-accent"} transition-colors duration-300`}
                          />
                        </motion.span>
                      )}
                    </span>

                    <span className="text-[12px] sm:text-[13px] font-semibold text-foreground">
                      {category?.name || "Inspire"}
                    </span>

                    {isLocked ? (
                      <span className="text-[10px] font-medium text-foreground-tertiary">
                        {isPremium ? "Premium" : "Unavailable"}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-foreground-tertiary">
                        <Check
                          size={10}
                          className="text-accent"
                          strokeWidth={2.5}
                        />
                        Available
                      </span>
                    )}
                  </motion.button>
                );
              })
            ) : (
              <p className="py-8 text-[13px] text-foreground-secondary">
                No categories available right now.
              </p>
            )}

            {/* View All — premium secondary action, last action item */}
            <motion.button
              onClick={handleViewAll}
              initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: categoryList.length * 0.05, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduceMotion ? undefined : { y: -4, scale: 1.03 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              className="group relative flex min-h-[104px] min-w-[104px] shrink-0 flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed border-white/10 px-4 cursor-pointer transition-colors duration-300 hover:border-accent/30 hover:bg-accent/[0.04]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background-tertiary/50 text-foreground-secondary transition-all duration-300 group-hover:text-accent group-hover:bg-accent/10">
                <LayoutGrid size={20} className="w-5 h-5" />
              </span>
              <span className="flex items-center gap-1 text-[12px] font-semibold text-foreground-secondary group-hover:text-foreground">
                View All
                <ArrowRight
                  size={12}
                  className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </span>
              <span className="text-[10px] text-foreground-tertiary">
                Categories
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </Card>
  );
}
