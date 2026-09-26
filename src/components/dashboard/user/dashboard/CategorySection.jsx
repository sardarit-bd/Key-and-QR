"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, ArrowRight, X, Search } from "lucide-react";
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
        className="h-12 w-12 object-contain transition-transform duration-200 group-hover:scale-110"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <IconComponent
      size={32}
      strokeWidth={2.2}
      className="h-12 w-12 transition-transform duration-200 group-hover:scale-110"
      style={{ color: categoryColor }}
    />
  );
}

export default function CategorySection({
  categories,
  onSelectCategory,
  disabled,
}) {
  const reduceMotion = useReducedMotion();
  const categoryList = Array.isArray(categories) ? categories : [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleClick = (category) => {
    if (disabled) return;
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
    handleCloseModal();
    handleClick(category);
  };

  // Keyboard accessibility: Escape to close modal
  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") handleCloseModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen]);

  // Lock body scroll while category modal is open
  useEffect(() => {
    if (!isModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isModalOpen]);

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
                  group relative flex flex-shrink-0 flex-col items-center justify-center gap-2
                  min-w-[96px] sm:min-w-[104px] md:min-w-[108px]
                  rounded-2xl border px-4 py-4 sm:py-5
                  transition-all duration-200
                  cursor-pointer
                  bg-white/75 dark:bg-neutral-900/70 backdrop-blur-md dark:backdrop-blur-xl
                  border border-white/80 dark:border-white/[0.08]
                  shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_4px_20px_-4px_rgba(0,0,0,0.05)]
                  dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_8px_30px_rgba(0,0,0,0.35)]
                  hover:bg-white/90 dark:hover:bg-neutral-800/80
                  hover:border-accent/40 dark:hover:border-white/20
                  hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_8px_28px_-6px_rgba(0,0,0,0.08)]
                  dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_12px_36px_rgba(0,0,0,0.4)]
                `}
                aria-label={`${category?.name || slug} category`}
              >
                {/* Primary Category Icon with dynamic color container */}
                <span
                  className="relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200"
                >
                  <CategoryCardIcon category={category} categoryColor={categoryColor} />
                </span>

                {/* Category Name */}
                <span className="text-[12px] sm:text-[13px] font-semibold text-center leading-tight whitespace-nowrap text-foreground-secondary group-hover:text-foreground transition-colors">
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5">
                    {filteredCategories.map((cat, idx) => {
                      const slug = cat?.slug || cat?.name || "";
                      const color = cat?.color || (slug === 'love' ? '#ef4444' : '#f59e0b');

                      return (
                        <button
                          key={cat?.id || cat?._id || slug || idx}
                          type="button"
                          onClick={() => handleModalSelect(cat)}
                          disabled={disabled}
                          className="group flex flex-col items-center justify-center gap-2 p-3.5 sm:p-4 rounded-2xl border border-border/70 bg-card/60 hover:bg-accent/5 hover:border-accent/40 dark:hover:border-accent/40 transition-all text-center cursor-pointer shadow-xs active:scale-97"
                        >
                          <span className="relative flex items-center justify-center w-11 h-11 rounded-xl transition-transform duration-200 group-hover:scale-105">
                            <CategoryCardIcon category={cat} categoryColor={color} />
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-accent transition-colors leading-tight">
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
    </section>
  );
}

