"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useProductStore } from "@/store/productStore";

export default function ShopGrid() {
    const products = useProductStore((state) => state.products);

    const [page, setPage] = useState(1);
    const perPage = 12;

    const totalPages = Math.ceil(products.length / perPage);
    const start = (page - 1) * perPage;
    const paginated = products.slice(start, start + perPage);

    return (
        <section className="bg-white text-black py-16 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-500 text-sm">
                        Showing {(start + 1)}–{start + paginated.length} of {products.length} results
                    </p>

                    <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 4.5h18m-18 6.75h18m-18 6.75h18"
                            />
                        </svg>
                    </button>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {paginated.map((product) => (
                        <div
                            key={product.id}
                            className="bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
                        >
                            <Link href={`/shop/${product.id}`}>
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    width={400}
                                    height={400}
                                    className="w-full h-56 object-cover"
                                />
                            </Link>

                            <div className="p-4 text-left">
                                <h3 className="font-semibold text-base">
                                    <Link href={`/shop/${product.id}`}>{product.name}</Link>
                                </h3>
                                <p className="text-gray-500 text-sm">{product.category}</p>
                                <p className="text-gray-900 font-semibold mt-1">
                                    ${product.price}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center mt-10 space-x-2">
                    <button
                        onClick={() => setPage(page > 1 ? page - 1 : totalPages)}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition"
                    >
                        &lt;
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`px-3 py-1 border rounded ${page === i + 1
                                    ? "bg-black text-white border-black"
                                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => setPage(page < totalPages ? page + 1 : 1)}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition"
                    >
                        &gt;
                    </button>
                </div>

            </div>
        </section>
    );
}
