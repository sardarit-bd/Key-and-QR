"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Lock, ArrowRight, X, Crown } from "lucide-react";
import { useRouter } from "next/navigation";

function hexToRgba(hex, alpha = 0.1) {
  if (!hex || typeof hex !== 'string') return `rgba(239, 68, 68, ${alpha})`;
  let c = hex.replace('#', '').trim();
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  if (c.length !== 6) return hex;
  const num = parseInt(c, 16);
  if (Number.isNaN(num)) return hex;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function CategorySection({
  categories,
  onSelectCategory,
  disabled,
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [selectedLockedCategory, setSelectedLockedCategory] = useState(null);
  const categoryList = Array.isArray(categories) ? categories : [];

  const handleClick = (category) => {
    const isLocked = !!category?.isLocked || category?.isAvailableToday === false;
    if (isLocked) {
      setSelectedLockedCategory(category);
      return;
    }
    onSelectCategory(category);
  };

  const handleViewAll = () => {
    router.push("/new-dashboard/user/favorites");
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
            const categoryColor = category?.color || (slug === 'love' ? '#ef4444' : '#f59e0b');

            return (
              <motion.button
                key={category?.id || slug}
                onClick={() => handleClick(category)}
                disabled={disabled}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={
                  !reduceMotion
                    ? { y: -3, transition: { duration: 0.2 } }
                    : undefined
                }
                whileTap={!reduceMotion ? { scale: 0.97 } : undefined}
                className={`
                  group relative flex flex-shrink-0 flex-col items-center justify-center gap-2
                  min-w-[96px] sm:min-w-[104px] md:min-w-[108px]
                  rounded-2xl border px-4 py-4 sm:py-5
                  transition-all duration-200
                  cursor-pointer bg-card
                  ${
                    isLocked
                      ? "border-border/80 hover:border-accent/30 hover:bg-accent/[0.02] shadow-xs"
                      : "border-border shadow-sm hover:border-accent/35 hover:shadow-md hover:bg-accent/[0.03]"
                  }
                `}
                aria-label={
                  isLocked
                    ? `${category?.name || slug} category, Premium only`
                    : `${category?.name || slug} category`
                }
              >
                {/* Premium indicator on unlocked cards */}
                {isPremium && !isLocked && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-accent/40 bg-accent/10">
                    <Sparkles size={9} className="text-accent" />
                  </span>
                )}

                {/* Primary Category Icon with dynamic database color and subtle tint container */}
                <span
                  className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-200"
                  style={{
                    backgroundColor: hexToRgba(categoryColor, 0.1),
                    borderWidth: 1,
                    borderColor: hexToRgba(categoryColor, 0.22),
                  }}
                >
                  {/* Category icon ALWAYS rendered in its database color */}
                  <Icon
                    size={20}
                    strokeWidth={2.2}
                    className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] transition-transform duration-200 group-hover:scale-110"
                    style={{ color: categoryColor }}
                  />

                  {/* Secondary Small Lock Badge */}
                  {isLocked && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-card border border-border shadow-xs text-foreground-tertiary">
                      <Lock size={10} strokeWidth={2.2} />
                    </span>
                  )}
                </span>

                {/* Category Name */}
                <span className="text-[12px] sm:text-[13px] font-semibold text-center leading-tight whitespace-nowrap text-foreground-secondary group-hover:text-foreground transition-colors">
                  {category?.name || "Inspire"}
                </span>

                {/* Status label */}
                <span className="text-[10px] font-medium text-foreground-tertiary/75">
                  {isLocked ? (isPremium ? "Premium Only" : "Locked") : "Available"}
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

      {/* Premium Upgrade Modal for Locked Categories */}
      {selectedLockedCategory && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 border border-border">
            <button
              onClick={() => setSelectedLockedCategory(null)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10">
                <Crown size={18} className="text-accent" />
              </span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedLockedCategory?.name || "Category"} is available with Premium
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
              Upgrade to Premium for unlimited quote receives and instant access to all categories including {selectedLockedCategory?.name || "this category"}.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push('/new-dashboard/user/premium')}
                className="h-11 rounded-xl bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition cursor-pointer"
              >
                Upgrade Now
              </button>
              <button
                onClick={() => setSelectedLockedCategory(null)}
                className="h-11 rounded-xl border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
