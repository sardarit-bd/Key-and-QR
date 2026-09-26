"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, ArrowRight, X, Search, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { resolveCategory } from "@/components/dashboard/admin/categories/categoryIconRegistry";
import { getCategoryIcon } from "@/components/public/quote/category";

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

/**
 * Category Card Icon Component
 * Securely renders custom category SVG/image assets with automatic fallback to Lucide icons.
 */
function CategoryCardIcon({ category, categoryColor }) {
  const [imageError, setImageError] = useState(false);
  const slug = category?.slug || category?.name?.toLowerCase() || '';
  const iconUrl = category?.iconUrl;

  // Resolve the canonical icon from the registry (respects icon name, slug aliases, and global fallback)
  const resolved = resolveCategory(category);
  const IconComponent = resolved?.Icon || getCategoryIcon(category?.icon || slug) || Sparkles;

  if (iconUrl && !imageError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={iconUrl}
        alt={category?.name || 'Category icon'}
        className="w-12 h-12 sm:w-14 sm:h-14 object-contain transition-transform duration-200 group-hover:scale-105"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <IconComponent
      size={36}
      strokeWidth={2}
      className="w-12 h-12 sm:w-14 sm:h-14 transition-transform duration-200 group-hover:scale-105"
      style={{ color: categoryColor }}
    />
  );
}

export function isCategorySubscriberExclusive(category) {
  if (!category) return false;
  return Boolean(
    category.isSubscriberOnly ||
    category.isPremium ||
    category.isExclusive ||
    category.tier === "premium"
  );
}

export default function CategorySection({
  categories,
  onSelectCategory,
  disabled,
  isSubscriber = false,
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const categoryList = Array.isArray(categories) ? categories : [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [upgradeCategory, setUpgradeCategory] = useState(null);

  const handleClick = (category) => {
    if (disabled) return;

    const isExclusive = isCategorySubscriberExclusive(category);
    if (isExclusive && !isSubscriber) {
      setUpgradeCategory(category);
      return;
    }

    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

  const handleViewAll = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSearchQuery("");
  };

  const handleModalSelect = (category) => {
    const isExclusive = isCategorySubscriberExclusive(category);
    if (isExclusive && !isSubscriber) {
      setIsModalOpen(false);
      setUpgradeCategory(category);
      return;
    }
    handleCloseModal();
    handleClick(category);
  };

  // Keyboard accessibility: Escape to close modal
  useEffect(() => {
    if (!isModalOpen && !upgradeCategory) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        handleCloseModal();
        setUpgradeCategory(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen, upgradeCategory]);

  // Lock body scroll while category modal or upgrade modal is open
  useEffect(() => {
    if (!isModalOpen && !upgradeCategory) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isModalOpen, upgradeCategory]);

  // Filtered categories for in-dashboard modal
  const filteredCategories = searchQuery.trim()
    ? categoryList.filter((c) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          (c.name || "").toLowerCase().includes(q) ||
          (c.slug || "").toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q)
        );
      })
    : categoryList;

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

      {/* Horizontal Carousel */}
      <div className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto hide-scrollbar rounded-2xl border border-gray-200/70 bg-gray-50/70 px-4 py-4 shadow-sm backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.025] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        {categoryList.length > 0 ? (
          categoryList.map((category, index) => {
            const slug = category?.slug || category?.name || "";
            const categoryColor = category?.color || (slug === 'love' ? '#ef4444' : '#f59e0b');
            const isExclusive = isCategorySubscriberExclusive(category);

            return (
              <motion.button
                key={category?.id || category?._id || slug || index}
                type="button"
                onClick={(e) => { e.preventDefault(); handleClick(category); }}
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
                  group relative flex flex-shrink-0 flex-col items-center justify-between
                  min-w-[120px] sm:min-w-[136px]
                  h-[160px] sm:h-[180px]
                  p-3 rounded-2xl
                  transition-all duration-200
                  cursor-pointer
                  bg-white/80 dark:bg-neutral-900/80
                  border border-gray-200/80 dark:border-white/5
                  shadow-sm dark:shadow-md
                  hover:bg-white/95 dark:hover:bg-neutral-800/90
                  hover:border-accent/40 dark:hover:border-white/20
                  hover:shadow-md dark:hover:shadow-xl
                `}
                aria-label={`${category?.name || slug} category`}
              >
                {/* Top Slot: Distinct Floating Pill Badge (Exact Reference Recreation) */}
                <div className="w-full flex items-center justify-center shrink-0">
                  {isExclusive ? (
                    <span className="mt-1 px-3 py-1 rounded-full flex items-center justify-center gap-1.5 shadow-sm bg-[#FDE8C7] text-[#9A6218] border border-[#F3CD87] dark:bg-[#2D2312] dark:text-[#F3CD87] dark:border-[#F3CD87]/40 dark:shadow-[0_2px_10px_rgba(243,205,135,0.15)] transition-all">
                      <Sparkles className="w-3 h-3 text-[#9A6218] dark:text-[#F3CD87] shrink-0" />
                      <span className="text-[11px] font-semibold tracking-tight whitespace-nowrap">MyInspireTag+</span>
                    </span>
                  ) : (
                    <div className="h-6 w-full" aria-hidden="true" />
                  )}
                </div>

                {/* Primary Category Icon with ample central space */}
                <span className="my-auto flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 transition-all duration-200">
                  <CategoryCardIcon category={category} categoryColor={categoryColor} />
                </span>

                {/* Category Name */}
                <span className="text-sm font-semibold text-center leading-tight whitespace-nowrap text-neutral-800 dark:text-neutral-200 group-hover:text-foreground transition-colors mt-auto">
                  {category?.name || "Inspire"}
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

      {/* In-Dashboard Category Selector Dialog (Preserves Single-Reveal Daily Quota Flow) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="relative w-full max-w-xl max-h-[85dvh] flex flex-col rounded-3xl overflow-hidden bg-white/95 dark:bg-neutral-900/95 border border-black/10 dark:border-white/10 shadow-2xl"
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-5 sm:px-6 pt-5 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground">
                      Explore Categories
                    </h3>
                    <p className="text-xs text-foreground-tertiary mt-0.5">
                      Select a category to receive today&apos;s revelation
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  aria-label="Close dialog"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-background/80 text-foreground-secondary hover:text-foreground hover:bg-muted transition-colors active:scale-95"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search filter for rapid category selection */}
              {categoryList.length > 6 && (
                <div className="px-5 sm:px-6 pt-3 shrink-0">
                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-tertiary"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search categories..."
                      className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background/60 text-xs sm:text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Modal Category Grid */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6">
                {filteredCategories.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5 pt-2.5">
                    {filteredCategories.map((cat, idx) => {
                      const slug = cat?.slug || cat?.name || "";
                      const color = cat?.color || (slug === 'love' ? '#ef4444' : '#f59e0b');
                      const isExclusive = isCategorySubscriberExclusive(cat);

                      return (
                        <button
                          key={cat?.id || cat?._id || slug || idx}
                          type="button"
                          onClick={() => handleModalSelect(cat)}
                          disabled={disabled}
                          className="group relative flex flex-col items-center justify-between min-h-[150px] sm:min-h-[170px] p-3 rounded-2xl border border-gray-200/80 dark:border-white/5 bg-white/80 dark:bg-neutral-900/80 hover:bg-white/95 dark:hover:bg-neutral-800/90 hover:border-accent/40 dark:hover:border-accent/40 transition-all text-center cursor-pointer shadow-xs active:scale-97"
                        >
                          {/* Top Slot: Distinct Floating Pill Badge */}
                          <div className="w-full flex items-center justify-center shrink-0">
                            {isExclusive ? (
                              <span className="mt-1 px-3 py-1 rounded-full flex items-center justify-center gap-1.5 shadow-sm bg-[#FDE8C7] text-[#9A6218] border border-[#F3CD87] dark:bg-[#2D2312] dark:text-[#F3CD87] dark:border-[#F3CD87]/40 dark:shadow-[0_2px_10px_rgba(243,205,135,0.15)] transition-all">
                                <Sparkles className="w-3 h-3 text-[#9A6218] dark:text-[#F3CD87] shrink-0" />
                                <span className="text-[11px] font-semibold tracking-tight whitespace-nowrap">MyInspireTag+</span>
                              </span>
                            ) : (
                              <div className="h-6 w-full" aria-hidden="true" />
                            )}
                          </div>

                          <span className="my-auto flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 transition-transform duration-200 group-hover:scale-105">
                            <CategoryCardIcon category={cat} categoryColor={color} />
                          </span>
                          <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-accent transition-colors leading-tight mt-auto">
                            {cat?.name || "Inspire"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs sm:text-sm text-foreground-tertiary">
                    No categories found matching &ldquo;{searchQuery}&rdquo;.
                  </div>
                )}
              </div>

              {/* Modal Footer Notice */}
              <div className="px-5 py-3 bg-muted/40 border-t border-border/50 text-center shrink-0">
                <p className="text-[11px] text-foreground-tertiary">
                  Selecting a category reveals today&apos;s inspiration and respects your daily reveal credit.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subscriber Exclusive Upgrade Prompt Dialog */}
      <AnimatePresence>
        {upgradeCategory && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setUpgradeCategory(null)}
          >
            <motion.div
              className="relative w-full max-w-md rounded-3xl overflow-hidden bg-white dark:bg-neutral-900 border border-amber-500/30 shadow-2xl p-6 sm:p-7 text-center space-y-4"
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Crown Icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-400/20 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-500 shadow-sm">
                <Crown size={28} />
              </div>

              {/* Title & Badge */}
              <div className="space-y-1.5">
                <span className="inline-block px-3 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-400/30">
                  Subscriber Exclusive
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  Unlock {upgradeCategory?.name || "This Category"}
                </h3>
                <p className="text-xs sm:text-sm text-foreground-secondary max-w-sm mx-auto leading-relaxed">
                  <strong className="text-foreground">{upgradeCategory?.name}</strong> is reserved exclusively for <span className="text-amber-500 font-semibold">MyInspireTag+</span> members. Upgrade now to enjoy unlimited inspiration across all categories.
                </p>
              </div>

              {/* Perks Highlights */}
              <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/15 text-left text-xs text-foreground-secondary space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-500 shrink-0" />
                  <span>Unlimited daily quote reveals — no daily limits</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-500 shrink-0" />
                  <span>Access to all exclusive category collections</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-500 shrink-0" />
                  <span>Audio messages & visual canvas quotes</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setUpgradeCategory(null);
                    router.push("/dashboard/user/premium");
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs sm:text-sm py-3 px-6 shadow-md transition-all active:scale-97 cursor-pointer"
                >
                  <Crown size={16} />
                  <span>Upgrade to MyInspireTag+ ($4.99/mo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUpgradeCategory(null)}
                  className="w-full text-xs font-medium text-foreground-tertiary hover:text-foreground py-2 transition-colors cursor-pointer"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

