"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { useProducts } from "@/hooks/product-service/useProducts";
import { useProductStore } from "@/store/productStore";

export default function RelatedProducts({ currentProductId }) {
    const { products: storeProducts } = useProductStore();
    const { data } = useProducts({ limit: 8 });
    const [visibleCount, setVisibleCount] = useState(4);

    const relatedProducts = useMemo(() => {
        const productList = data?.data?.products || data?.data || storeProducts || [];
        return productList
            .filter((p) => p && p._id !== currentProductId)
            .slice(0, 8);
    }, [data, storeProducts, currentProductId]);

    const handleShowMore = () => {
        setVisibleCount((prev) => prev + 4);
    };

    if (relatedProducts.length === 0) {
        return null;
    }

    return (
        <section className="mt-8 sm:mt-12 py-4 sm:py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A99B7F]">
                            Keep exploring
                        </span>
                        <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[#2E2A24]">
                            You may also like
                        </h2>
                    </div>
                    <Link
                        href="/shop"
                        className="group inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-sm font-semibold text-[#A6782B] transition-all duration-200 hover:gap-2.5"
                    >
                        View all
                        <ArrowRight size={15} />
                    </Link>
                </div>

                {/* Product grid — EXACT same card as the Shop page */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                    {relatedProducts.slice(0, visibleCount).map((product, index) => (
                        <ProductCard key={product._id} product={product} index={index} />
                    ))}
                </div>

                {/* Show More button */}
                {visibleCount < relatedProducts.length && (
                    <div className="flex justify-center mt-10">
                        <button
                            onClick={handleShowMore}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#E5DCC8] bg-white px-6 py-2.5 text-sm font-medium text-[#5C5346] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C6922D]/50 hover:text-[#A6782B] active:scale-95"
                        >
                            Show More
                            <ChevronRight size={15} />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
