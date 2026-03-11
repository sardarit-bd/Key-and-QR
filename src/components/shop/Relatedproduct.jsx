"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useProductStore } from "@/store/productStore";

export default function RelatedProducts({ currentProductId }) {
    const { products } = useProductStore();
    const [visibleCount, setVisibleCount] = useState(4);
    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        // Get 6 random products excluding current product
        const otherProducts = products
            .filter(p => p._id !== currentProductId)
            .sort(() => 0.5 - Math.random())
            .slice(0, 6)
            .map(p => ({
                id: p._id,
                title: p.name,
                desc: p.description?.substring(0, 50) + "...",
                price: p.price,
                oldPrice: Math.round(p.price * 1.4), // Example old price
                img: p.image?.url || "/placeholder.png"
            }));

        setRelatedProducts(otherProducts);
    }, [products, currentProductId]);

    const handleShowMore = () => {
        setVisibleCount((prev) => prev + 4);
    };

    const handleImageError = (e) => {
        e.target.src = "/placeholder.png";
        e.target.onerror = null;
    };

    if (relatedProducts.length === 0) {
        return null;
    }

    return (
        <section className="py-10 mt-16">
            <h2 className="text-center text-3xl font-semibold mb-8">
                Related Products
            </h2>

            {/* Product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
                {relatedProducts.slice(0, visibleCount).map((item) => (
                    <div key={item.id} className="bg-gray-100 rounded-md overflow-hidden">
                        {/* Image */}
                        <div className="relative w-full h-[220px]">
                            <Link href={`/shop/${item.id}`}>
                                <Image
                                    src={item.img}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    onError={handleImageError}
                                    unoptimized={true}
                                />
                            </Link>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <h3 className="font-medium text-gray-900">
                                <Link href={`/shop/${item.id}`}>{item.title}</Link>
                            </h3>
                            <p className="text-gray-500 text-sm">{item.desc}</p>

                            <div className="mt-3 flex items-center gap-3">
                                <span className="text-black font-semibold">
                                    ${item.price}
                                </span>
                                <span className="line-through text-gray-400">${item.oldPrice}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Show More button */}
            {visibleCount < relatedProducts.length && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={handleShowMore}
                        className="px-6 py-2 border rounded-md hover:bg-gray-100 transition"
                    >
                        Show More
                    </button>
                </div>
            )}
        </section>
    );
}