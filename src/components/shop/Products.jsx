"use client";

// import { useProducts } from "@/hooks/useProducts";
// import { useDebounce } from "@/hooks/useDebounce";
import { ProductImage } from "@/components/ui/ProductImage";
import Link from "next/link";
import { useState, useEffect, Fragment } from "react";
import Loader from "@/shared/Loader";
import { useCategories } from "@/hooks/dynamic-categories/useCategories";
import { useProducts } from "@/hooks/product-service/useProducts";
import { useDebounce } from "@/hooks/search-with-debounce/useDebounce";

// Stock Status Component
const StockStatus = ({ stock }) => {
    if (stock <= 0) {
        return (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                Out of Stock
            </div>
        );
    } else if (stock <= 2) {
        return (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                Only {stock} {stock === 1 ? 'keychain' : 'keychains'} left
            </div>
        );
    }
    return null;
};

export default function ShopGrid() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [sort, setSort] = useState("newest");
    const [view, setView] = useState("grid");

    // Debounce search to prevent API flooding
    const debouncedSearch = useDebounce(search, 400);

    const limit = 12;

    // Reset page when search or filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, category, sort]);

    // Get categories from backend
    const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
    const categories = categoriesData?.data || [];

    // Use React Query for products
    const { 
        data, 
        isLoading, 
        error, 
        isFetching,
        refetch,
        isRefetching,
    } = useProducts({
        page,
        limit,
        search: debouncedSearch,
        category,
        sort,
    });

    const products = data?.data || [];
    const meta = data?.meta || { total: 0, totalPage: 0 };

    // Loading state
    if (isLoading && products.length === 0) {
        return <Loader text="Qkey..." size={50} fullScreen />;
    }

    // Error state with refetch
    if (error) {
        return (
            <section className="bg-white text-black py-16 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="bg-red-50 rounded-lg p-8 max-w-md mx-auto">
                        <p className="text-red-600 mb-4">Failed to load products</p>
                        <button 
                            onClick={() => refetch()} 
                            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                            disabled={isRefetching}
                        >
                            {isRefetching ? 'Loading...' : 'Retry'}
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white text-black py-16 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <p className="text-gray-900 font-semibold text-lg md:text-xl">
                        Showing {products.length > 0 ? (page - 1) * limit + 1 : 0}–{Math.min((page - 1) * limit + limit, meta.total)} of {meta.total} results
                    </p>

                    {/* Search & Sort */}
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black flex-1 md:flex-none md:w-48 transition"
                            aria-label="Search products"
                        />
                        
                        {/* Dynamic Categories */}
                        <select
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                setPage(1);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black bg-white"
                            disabled={categoriesLoading}
                            aria-label="Filter by category"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id || cat._id} value={cat.id || cat._id}>
                                    {cat.name || cat.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={sort}
                            onChange={(e) => {
                                setSort(e.target.value);
                                setPage(1);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black bg-white"
                            aria-label="Sort products"
                        >
                            <option value="newest">Newest</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="popular">Most Popular</option>
                        </select>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setView("grid")}
                            className={`p-2 border rounded-md transition cursor-pointer ${
                                view === "grid"
                                    ? "bg-black text-white border-black"
                                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                            }`}
                            aria-label="Grid view"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75h6v6h-6v-6zM14.25 3.75h6v6h-6v-6zM3.75 14.25h6v6h-6v-6zM14.25 14.25h6v6h-6v-6z" />
                            </svg>
                        </button>

                        <button
                            onClick={() => setView("list")}
                            className={`p-2 border rounded-md transition cursor-pointer ${
                                view === "list"
                                    ? "bg-black text-white border-black"
                                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                            }`}
                            aria-label="List view"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h18M3 9h18M3 13.5h18M3 18h18" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Loading Indicator */}
                {isFetching && products.length > 0 && (
                    <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                        <span className="ml-2 text-gray-500">Updating...</span>
                    </div>
                )}

                {/* Products Grid/List */}
                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                            <p className="text-gray-500 mb-4">No products found matching your criteria.</p>
                            <button 
                                onClick={() => {
                                    setSearch("");
                                    setCategory("");
                                    setPage(1);
                                }}
                                className="text-black underline hover:text-gray-600 transition"
                            >
                                Clear filters
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {view === "grid" ? (
                            /* GRID VIEW */
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <div key={product._id} className="bg-gray-100 rounded-md overflow-hidden relative group hover:shadow-lg transition-shadow duration-300">
                                        <StockStatus stock={product.stock} />

                                        <Link href={`/shop/${product._id}`} className="block">
                                            <ProductImage
                                                src={product.image?.url}
                                                alt={product.name}
                                                width={400}
                                                height={400}
                                                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                                                fill={false}
                                            />
                                        </Link>

                                        <div className="p-4 text-left">
                                            <h3 className="font-semibold text-base mb-2 line-clamp-1">
                                                <Link href={`/shop/${product._id}`} className="hover:text-gray-600 transition">
                                                    {product.name}
                                                </Link>
                                            </h3>
                                            <p className="text-gray-500 text-sm line-clamp-2 mb-2">
                                                {product.description}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-gray-900 font-semibold">
                                                    ${Number(product.price).toFixed(2)}
                                                </p>
                                                {product.stock > 0 && (
                                                    <span className="text-xs text-gray-500">
                                                        {product.stock} in stock
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* LIST VIEW */
                            <div className="space-y-6">
                                {products.map((product) => (
                                    <div key={product._id} className="flex bg-gray-50 shadow-sm hover:shadow-md transition overflow-hidden relative rounded-md">
                                        <StockStatus stock={product.stock} />

                                        <Link href={`/shop/${product._id}`} className="flex-shrink-0">
                                            <ProductImage
                                                src={product.image?.url}
                                                alt={product.name}
                                                width={200}
                                                height={200}
                                                className="w-44 h-44 object-cover"
                                                fill={false}
                                            />
                                        </Link>

                                        <div className="p-5 flex flex-col justify-center text-left w-full">
                                            <h3 className="font-semibold text-lg mb-2">
                                                <Link href={`/shop/${product._id}`} className="hover:text-gray-600 transition">
                                                    {product.name}
                                                </Link>
                                            </h3>

                                            <p className="text-gray-500 text-sm mb-3 line-clamp-3">
                                                {product.description}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <p className="text-gray-900 font-semibold text-lg">
                                                    ${Number(product.price).toFixed(2)}
                                                </p>
                                                {product.stock > 0 && (
                                                    <span className="text-sm text-gray-500">
                                                        Stock: {product.stock}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Pagination */}
                {meta.totalPage > 1 && (
                    <Pagination
                        currentPage={page}
                        totalPages={meta.totalPage}
                        onPageChange={setPage}
                    />
                )}
            </div>
        </section>
    );
}

// Pagination Component
function Pagination({ currentPage, totalPages, onPageChange }) {
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex items-center justify-center gap-2 pt-10">
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`w-8 h-8 flex items-center justify-center rounded border transition-all ${
                    currentPage === 1
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100 active:scale-95'
                }`}
                aria-label="Previous page"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>

            {pageNumbers.map((page, index) => (
                <Fragment key={index}>
                    {page === '...' ? (
                        <span className="w-8 h-8 flex items-center justify-center text-gray-500">
                            ...
                        </span>
                    ) : (
                        <button
                            onClick={() => onPageChange(page)}
                            className={`w-8 h-8 flex items-center justify-center rounded border text-sm font-medium transition-all ${
                                currentPage === page
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 active:scale-95'
                            }`}
                            aria-label={`Page ${page}`}
                            aria-current={currentPage === page ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    )}
                </Fragment>
            ))}

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`w-8 h-8 flex items-center justify-center rounded border transition-all ${
                    currentPage === totalPages
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100 active:scale-95'
                }`}
                aria-label="Next page"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>
        </div>
    );
}