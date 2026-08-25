"use client";

import { useMemo, useState, useCallback, useEffect, Fragment } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronRight,
  PackageSearch,
  ArrowRight,
  X,
  SlidersHorizontal,
  Sparkles,
  Check,
  RotateCcw,
} from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";
import ProductCard from "@/components/shop/ProductCard";
import ShopBreadcrumb from "@/components/shop/ShopBreadcrumb";
import ShopSkeleton from "@/components/skeletons/ShopSkeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { useCategories } from "@/hooks/dynamic-categories/useCategories";
import { useProducts } from "@/hooks/product-service/useProducts";
import { useDebounce } from "@/hooks/search-with-debounce/useDebounce";

/* ============================================================
   Premium Shop — MyInspireTag
   Layout: breadcrumb → [sticky sidebar | promo banner → toolbar
           → product grid → pagination]

   Facets are REAL product data (category API, stock, price).
   Search is server-side (name/category/brand, debounced).
   ============================================================ */

const PRICE_BUCKETS = [
  { id: "all", label: "All Prices", min: 0, max: Infinity },
  { id: "under-25", label: "Under $25", min: 0, max: 25 },
  { id: "25-50", label: "$25–$50", min: 25, max: 50 },
  { id: "50-100", label: "$50–$100", min: 50, max: 100 },
  { id: "over-100", label: "Over $100", min: 100, max: Infinity },
];

const AVAILABILITY_OPTIONS = [
  { id: "in-stock", label: "In Stock", test: (s) => s > 2 },
  { id: "low-stock", label: "Low Stock", test: (s) => s > 0 && s <= 2 },
  { id: "out-of-stock", label: "Out of Stock", test: (s) => s <= 0 },
];

/* ---------- Promotional Banner (dynamic image campaign from GET /hero/shop-hero) ---------- */
function PromoBanner() {
  const reduceMotion = useReducedMotion();
  const [shopHero, setShopHero] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get("/hero/shop-hero");
        if (!cancelled) setShopHero(res.data?.data || null);
      } catch {
        // Fallback to /hero if /hero/shop-hero is not reachable
        try {
          const fallbackRes = await api.get("/hero");
          if (!cancelled) setShopHero(fallbackRes.data?.data || null);
        } catch {
          if (!cancelled) setShopHero(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Skeleton while the banner loads
  if (loading) {
    return (
      <div className="relative mb-6 h-44 sm:h-52 animate-pulse overflow-hidden rounded-2xl bg-[#F0E9DA]" />
    );
  }

  // Image-only campaign banner. If the backend provides no image, render a
  // clean branded placeholder surface (no text, no CTA).
  const imageUrl = shopHero?.imageUrl || shopHero?.shopHero?.imageUrl || null;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative mb-6 h-52 overflow-hidden rounded-2xl sm:h-60"
    >
      {imageUrl ? (
        <>
          {/* Campaign image — fully covers, luxury brand feel */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
          {/* Subtle premium overlay for image readability only */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1F1C18]/25 via-transparent to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C6922D]/30 to-transparent" />
        </>
      ) : (
        /* No-image fallback: subtle warm branded surface */
        <div className="h-full w-full bg-[radial-gradient(ellipse_70%_60%_at_70%_30%,rgba(198,146,45,0.25),transparent_65%)] bg-[#2E2A24]" />
      )}
    </motion.div>
  );
}

/* ---------- Faceted Sidebar Section (accordion) ---------- */
function SidebarSection({ title, icon: Icon, open, onToggle, children, count }) {
  return (
    <div className="border-b border-[#E8DFCE]/60 pb-5 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between rounded-md py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6922D]/40"
      >
        <span className="flex items-center gap-2 text-[13px] font-semibold tracking-wide text-[#2E2A24]">
          {Icon && <Icon size={15} className="text-[#C6922D]" />}
          {title}
          {count > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C6922D]/15 px-1.5 text-[11px] font-bold text-[#A6782B]">
              {count}
            </span>
          )}
        </span>
        <ChevronDown
          size={15}
          className={`text-[#8A7A5C] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckItem({ label, checked, count, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className="group flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition-colors duration-200 hover:bg-[#F5EDDC]/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6922D]/40"
    >
      <span className="flex items-center gap-2.5">
        <span
          className={`flex h-[18px] w-[18px] items-center justify-center rounded-md border transition-all duration-200 ${checked
            ? "border-[#C6922D] bg-[#C6922D] text-white"
            : "border-[#D8CCB2] bg-white group-hover:border-[#C6922D]/50"
            }`}
        >
          {checked && <Check size={12} strokeWidth={3} />}
        </span>
        <span className={`text-[13px] ${checked ? "font-medium text-[#2E2A24]" : "text-[#5C5346]"}`}>
          {label}
        </span>
      </span>
      {typeof count === "number" && (
        <span className="text-[11px] tabular-nums text-[#A99B7F]">{count}</span>
      )}
    </button>
  );
}

/* ---------- Main Shop Grid ---------- */
export default function ShopGrid() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState("grid");
  const [priceBucket, setPriceBucket] = useState("all");
  const [availability, setAvailability] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Accordion state
  const [openSections, setOpenSections] = useState({ category: true, availability: true, price: true });
  const reduceMotion = useReducedMotion();

  const debouncedSearch = useDebounce(search, 400);
  const limit = 12;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, sort, priceBucket, availability]);

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const categories = categoriesData?.data || [];

  const {
    data,
    isLoading,
    error,
    isFetching,
    refetch,
    isRefetching,
  } = useProducts({ page, limit, search: debouncedSearch, category, sort });

  const serverProducts = data?.data || [];
  const meta = data?.meta || { total: 0, totalPage: 0 };

  // ---- Client-side faceted filtering over the fetched page ----
  const availabilityCounts = useMemo(() => {
    return AVAILABILITY_OPTIONS.reduce((acc, opt) => {
      acc[opt.id] = serverProducts.filter((p) => opt.test(p.stock ?? 0)).length;
      return acc;
    }, {});
  }, [serverProducts]);

  const filteredProducts = useMemo(() => {
    let list = serverProducts;
    if (priceBucket !== "all") {
      const bucket = PRICE_BUCKETS.find((b) => b.id === priceBucket);
      if (bucket) list = list.filter((p) => p.price >= bucket.min && p.price < bucket.max);
    }
    if (availability.length > 0) {
      list = list.filter((p) =>
        availability.some((id) => {
          const opt = AVAILABILITY_OPTIONS.find((o) => o.id === id);
          return opt ? opt.test(p.stock ?? 0) : false;
        })
      );
    }
    return list;
  }, [serverProducts, priceBucket, availability]);

  const activeFilterCount =
    (category ? 1 : 0) + (priceBucket !== "all" ? 1 : 0) + availability.length;

  const handleResetFilters = useCallback(() => {
    setCategory("");
    setPriceBucket("all");
    setAvailability([]);
    setSearch("");
    setSort("newest");
    setPage(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearch("");
    setPage(1);
  }, []);

  const toggleAvailability = useCallback((id) => {
    setAvailability((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const toggleSection = useCallback((key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Loading state — premium skeleton, no layout shift
  if (isLoading && serverProducts.length === 0) {
    return <ShopSkeleton />;
  }

  if (error) {
    return (
      <section className="bg-white text-black py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-red-50 rounded-lg p-8 max-w-md mx-auto">
            <p className="text-red-600 mb-4">Failed to load products</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 cursor-pointer"
              disabled={isRefetching}
            >
              {isRefetching ? "Loading..." : "Retry"}
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Sidebar content (shared desktop/mobile)
  const sidebar = (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-[#2E2A24]">
          <SlidersHorizontal size={14} className="text-[#C6922D]" />
          Filters
        </span>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-[#A6782B] transition-colors hover:text-[#2E2A24]"
          >
            <RotateCcw size={11} /> Reset ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Category */}
      <SidebarSection
        title="Category"
        open={openSections.category}
        onToggle={() => toggleSection("category")}
        count={category ? 1 : 0}
      >
        <CheckItem label="All Categories" checked={!category} count={serverProducts.length} onToggle={() => setCategory("")} />
        {categories.map((cat) => {
          const value = cat.id || cat._id;
          return (
            <CheckItem
              key={value}
              label={cat.name || cat.label}
              checked={category === value}
              onToggle={() => setCategory(category === value ? "" : value)}
            />
          );
        })}
      </SidebarSection>

      {/* Availability */}
      <SidebarSection
        title="Availability"
        open={openSections.availability}
        onToggle={() => toggleSection("availability")}
        count={availability.length}
      >
        {AVAILABILITY_OPTIONS.map((opt) => (
          <CheckItem
            key={opt.id}
            label={opt.label}
            checked={availability.includes(opt.id)}
            count={availabilityCounts[opt.id] || 0}
            onToggle={() => toggleAvailability(opt.id)}
          />
        ))}
      </SidebarSection>

      {/* Price Range */}
      <SidebarSection
        title="Price Range"
        open={openSections.price}
        onToggle={() => toggleSection("price")}
        count={priceBucket !== "all" ? 1 : 0}
      >
        {PRICE_BUCKETS.map((bucket) => (
          <CheckItem
            key={bucket.id}
            label={bucket.label}
            checked={priceBucket === bucket.id}
            onToggle={() => setPriceBucket(bucket.id)}
          />
        ))}
      </SidebarSection>
    </div>
  );

  return (
    <section className="bg-[#FDFBF6] text-[#2E2A24] pb-16 sm:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Breadcrumb */}
        <ShopBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 lg:gap-10">
          {/* LEFT: Sticky Sidebar (desktop) */}
          <aside className="hidden lg:block" aria-label="Product filters">
            <div className="sticky top-6 rounded-2xl border border-[#EDE4D0]/80 bg-white/80 p-5 shadow-[0_2px_16px_-6px_rgb(60_45_15/0.08)] backdrop-blur-sm">
              {sidebar}
            </div>
          </aside>

          {/* RIGHT: Content */}
          <div id="shop-grid" className="scroll-mt-6">
            {/* Promotional banner (dynamic image from backend) */}
            <PromoBanner />

            {/* Mobile filter bar */}
            <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
              <p className="text-sm font-medium text-[#8A7A5C]">
                <span className="font-bold text-[#2E2A24]">{filteredProducts.length}</span> products
              </p>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#EDE4D0] bg-white px-4 py-2.5 text-sm font-semibold text-[#2E2A24] transition-all duration-200 active:scale-95"
                aria-label="Open filters"
              >
                <SlidersHorizontal size={15} className="text-[#C6922D]" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C6922D] text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* ===== Top Toolbar ===== */}
            <div className="mb-6 flex flex-col gap-4 border-b border-[#EDE4D0]/70 pb-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm font-medium text-[#8A7A5C]">
                  Showing{" "}
                  <span className="font-bold text-[#2E2A24]">
                    {filteredProducts.length > 0 ? (page - 1) * limit + 1 : 0}–
                    {Math.min((page - 1) * limit + limit, meta.total)}
                  </span>{" "}
                  of <span className="font-bold text-[#2E2A24]">{meta.total}</span> products
                </p>

                <div className="flex items-center gap-3">
                  {/* Active filter count + reset */}
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#EDE4D0] bg-white px-3 py-1.5 text-[12px] font-medium text-[#8A7A5C] transition-all duration-200 hover:border-[#C6922D]/40 hover:text-[#A6782B]"
                    >
                      <RotateCcw size={12} />
                      Reset ({activeFilterCount})
                    </button>
                  )}

                  {/* View toggle */}
                  <div className="flex items-center gap-1 rounded-xl border border-[#EDE4D0] bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setView("grid")}
                      aria-label="Grid view"
                      aria-pressed={view === "grid"}
                      className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-all duration-200 ${view === "grid" ? "bg-[#2E2A24] text-white shadow-sm" : "text-[#A99B7F] hover:bg-[#F5EDDC]"
                        }`}
                    >
                      <LayoutGrid size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setView("list")}
                      aria-label="List view"
                      aria-pressed={view === "list"}
                      className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-all duration-200 ${view === "list" ? "bg-[#2E2A24] text-white shadow-sm" : "text-[#A99B7F] hover:bg-[#F5EDDC]"
                        }`}
                    >
                      <List size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Search + selects */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                {/* Premium search — icon, clear button, loading state */}
                <div className="relative flex-1 md:max-w-xs">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A99B7F]" />
                  <input
                    type="text"
                    placeholder="Search keychains, cards, tags..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#E5DCC8] bg-white pl-10 pr-10 text-sm text-[#2E2A24] placeholder:text-[#A99B7F] transition-all duration-300 focus:border-[#C6922D]/60 focus:outline-none focus:ring-2 focus:ring-[#C6922D]/15"
                    aria-label="Search products"
                  />
                  {/* Loading indicator while fetching */}
                  {isFetching && search && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C6922D] opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C6922D]" />
                    </span>
                  )}
                  {/* Clear (X) button */}
                  {search && !isFetching && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-[#A99B7F] transition-all duration-200 hover:bg-[#F5EDDC] hover:text-[#2E2A24]"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Category — shadcn Select */}
                <div className="flex-1 md:max-w-[180px]">
                  <Select
                    value={category || "all"}
                    onValueChange={(val) => { setCategory(val === "all" ? "" : val); setPage(1); }}
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger className="h-10 w-full bg-white text-[#2E2A24] [&>span]:text-[#2E2A24]" aria-label="Filter by category">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id || cat._id} value={cat.id || cat._id}>
                          {cat.name || cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort — shadcn Select */}
                <div className="flex-1 md:max-w-[180px]">
                  <Select value={sort} onValueChange={(val) => { setSort(val); setPage(1); }}>
                    <SelectTrigger className="h-10 w-full bg-white text-[#2E2A24] [&>span]:text-[#2E2A24]" aria-label="Sort products">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Loading indicator */}
            <AnimatePresence>
              {isFetching && filteredProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 flex items-center gap-2 rounded-xl bg-[#F5EDDC]/60 px-4 py-2.5 text-[13px] text-[#8A7A5C]"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C6922D] opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C6922D]" />
                  </span>
                  Updating results...
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state */}
            {filteredProducts.length === 0 ? (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F5EDDC]">
                  <PackageSearch className="h-9 w-9 text-[#C6922D]" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-[#2E2A24]">No products found</h3>
                <p className="mt-1.5 max-w-sm text-sm text-[#8A7A5C]">
                  We couldn't find anything matching your criteria. Try adjusting your filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#2E2A24] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1F1C18] active:scale-95"
                >
                  <RotateCcw size={14} /> Reset Filters
                </button>
              </motion.div>
            ) : view === "grid" ? (
              /* GRID */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product._id} product={product} index={index} />
                ))}
              </div>
            ) : (
              /* LIST */
              <div className="space-y-4">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    className="group flex overflow-hidden rounded-2xl border border-[#EDE4D0]/80 bg-white shadow-[0_2px_12px_-4px_rgb(60_45_15/0.06)] transition-all duration-300 hover:border-[#C6922D]/30 hover:shadow-[0_20px_40px_-20px_rgb(60_45_15/0.2)]"
                  >
                    <Link href={`/shop/${product._id}`} className="shrink-0 cursor-pointer">
                      <ProductImage
                        src={product.image?.url}
                        alt={product.name}
                        width={200}
                        height={200}
                        fill={false}
                        className="h-full w-36 sm:w-44 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col justify-center p-5 sm:p-6">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A6782B]">
                        {product.category}
                      </span>
                      <h3 className="mt-1 text-lg font-bold text-[#2E2A24]">
                        <Link href={`/shop/${product._id}`} className="transition-colors hover:text-[#A6782B]">
                          {product.name}
                        </Link>
                      </h3>
                      <p className="mt-1.5 text-sm text-[#8A7A5C] line-clamp-2">{product.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xl font-bold text-[#2E2A24]">${Number(product.price).toFixed(2)}</p>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${(product.stock ?? 0) <= 0 ? "bg-[#FCE8E8] text-[#8A2E2E]" : (product.stock ?? 0) <= 2 ? "bg-[#FCE8CB] text-[#7A4A10]" : "bg-[#E4F2E8] text-[#2E5B3A]"
                          }`}>
                          {(product.stock ?? 0) <= 0 ? "Out of Stock" : (product.stock ?? 0) <= 2 ? `Only ${product.stock} left` : `${product.stock} in stock`}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta.totalPage > 1 && (
              <Pagination currentPage={page} totalPages={meta.totalPage} onPageChange={setPage} />
            )}
          </div>
        </div>
      </div>

      {/* ===== Mobile Filters Drawer ===== */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-[#2E2A24]/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm overflow-y-auto bg-[#FDFBF6] p-5 shadow-2xl lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Product filters"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[15px] font-bold text-[#2E2A24]">Filters</span>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filters"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#EDE4D0] bg-white text-[#5C5346] transition-all duration-200 hover:rotate-90 hover:text-[#2E2A24]"
                >
                  <X size={16} />
                </button>
              </div>
              {sidebar}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="mt-6 w-full cursor-pointer rounded-xl bg-[#2E2A24] py-3 text-sm font-semibold text-white transition-all duration-300 active:scale-[0.98]"
              >
                View Results
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ---------- Pagination ---------- */
function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) pages.push(1, 2, 3, 4, "...", totalPages);
      else if (currentPage >= totalPages - 2) pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      else pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 pt-12">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition-all ${currentPage === 1 ? "border-[#EDE4D0] text-[#C4B99F] cursor-not-allowed" : "border-[#E5DCC8] text-[#5C5346] hover:bg-[#F5EDDC] active:scale-95"
          }`}
        aria-label="Previous page"
      >
        <ChevronRight size={15} className="rotate-180" />
      </button>

      {pageNumbers.map((page, index) => (
        <Fragment key={index}>
          {page === "..." ? (
            <span className="flex h-9 w-9 items-center justify-center text-[#A99B7F]">...</span>
          ) : (
            <button
              onClick={() => onPageChange(page)}
              className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border text-sm font-medium transition-all ${currentPage === page
                ? "border-[#2E2A24] bg-[#2E2A24] text-white shadow-sm"
                : "border-[#E5DCC8] text-[#5C5346] hover:bg-[#F5EDDC] active:scale-95"
                }`}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          )}
        </Fragment>
      ))}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition-all ${currentPage === totalPages ? "border-[#EDE4D0] text-[#C4B99F] cursor-not-allowed" : "border-[#E5DCC8] text-[#5C5346] hover:bg-[#F5EDDC] active:scale-95"
          }`}
        aria-label="Next page"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
