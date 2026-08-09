"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

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
    <section className="w-full">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h2 className="text-[18px] sm:text-[19px] md:text-[20px] font-semibold tracking-tight text-foreground">
          Explore Categories
        </h2>
        <button
          onClick={handleViewAll}
          className="group inline-flex cursor-pointer items-center gap-1.5 text-[13px] sm:text-[14px] font-medium text-foreground-tertiary hover:text-accent transition-colors duration-200"
        >
          View All
          <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto hide-scrollbar pb-1 py-3">
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
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={
                  !isLocked && !reduceMotion
                    ? { y: -3, transition: { duration: 0.2 } }
                    : undefined
                }
                whileTap={
                  !isLocked && !reduceMotion ? { scale: 0.97 } : undefined
                }
                className={`
                  group relative flex flex-shrink-0 flex-col items-center justify-center gap-2
                  min-w-[96px] sm:min-w-[104px] md:min-w-[108px]
                  rounded-2xl border px-4 py-4 sm:py-5
                  transition-all duration-200
                  cursor-pointer
                  ${
                    isLocked
                      ? "border-border/40 bg-background-secondary/30 cursor-not-allowed opacity-50"
                      : "border-border bg-card shadow-sm hover:border-accent/25 hover:shadow-md hover:bg-accent/[0.02]"
                  }
                `}
                aria-label={
                  isLocked
                    ? `${category?.name || slug} (locked)`
                    : category?.name || slug
                }
              >
                {/* Premium indicator */}
                {isPremium && !isLocked && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-accent/40 bg-accent/10">
                    <Sparkles size={9} className="text-accent" />
                  </span>
                )}

                {/* Icon */}
                <span
                  className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-colors duration-200 ${
                    isLocked
                      ? "bg-background-tertiary/30"
                      : `bg-background-secondary group-hover:bg-accent/10`
                  }`}
                >
                  {isLocked ? (
                    <Lock
                      size={18}
                      className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-muted-foreground"
                    />
                  ) : (
                    <Icon
                      size={20}
                      strokeWidth={2}
                      className={`w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] ${category?.colorClass || "text-accent"}`}
                    />
                  )}
                </span>

                {/* Name */}
                <span
                  className={`text-[12px] sm:text-[13px] font-semibold text-center leading-tight whitespace-nowrap ${
                    isLocked
                      ? "text-foreground-tertiary"
                      : "text-foreground-secondary group-hover:text-foreground"
                  }`}
                >
                  {category?.name || "Inspire"}
                </span>

                {/* Status label */}
                <span className="text-[10px] font-medium text-foreground-tertiary/60">
                  {isLocked ? (isPremium ? "Premium" : "Locked") : "Available"}
                </span>
              </motion.button>
            );
          })
        ) : (
          <p className="py-8 text-[13px] text-foreground-tertiary">
            No categories available right now.
          </p>
        )}
      </div>
    </section>
  );
}
