"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useProductStore } from "@/store/productStore";

export default function ShopGrid() {
    const products = useProductStore((state) => state.products);

    const [page, setPage] = useState(1);
    const [view, setView] = useState("grid");

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

                    {/* List/Grid Toggle Buttons */}
                    <div className="flex items-center gap-2">
                        {/* GRID VIEW BUTTON */}
                        <button
                            onClick={() => setView("grid")}
                            className={`p-2 border rounded-md transition ${view === "grid"
                                ? "bg-black text-white border-black"
                                : "border-gray-300 text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {/* Grid Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                                className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M3.75 3.75h6v6h-6v-6zM14.25 3.75h6v6h-6v-6zM3.75 14.25h6v6h-6v-6zM14.25 14.25h6v6h-6v-6z" />
                            </svg>
                        </button>

                        {/* LIST VIEW BUTTON */}
                        <button
                            onClick={() => setView("list")}
                            className={`p-2 border rounded-md transition ${view === "list"
                                ? "bg-black text-white border-black"
                                : "border-gray-300 text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {/* List Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                                className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M3 4.5h18M3 9h18M3 13.5h18M3 18h18" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* PRODUCT GRID / LIST */}
                {view === "grid" ? (
                    /* GRID VIEW */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {paginated.map((product) => (
                            <div
                                key={product.id}
                                className="bg-gray-50 overflow-hidden shadow-sm hover:shadow-md transition"
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
                                    <h3 className="font-semibold text-base mb-2">
                                        <Link href={`/shop/${product.id}`}>{product.name}</Link>
                                    </h3>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-2">
                                        {product.description}
                                    </p>
                                    <p className="text-gray-900 font-semibold mt-1 mb-2">
                                        ${product.price}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* LIST VIEW */
                    <div className="space-y-6">
                        {paginated.map((product) => (
                            <div
                                key={product.id}
                                className="flex bg-gray-50 shadow-sm hover:shadow-md transition overflow-hidden"
                            >
                                <Link href={`/shop/${product.id}`}>
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        width={200}
                                        height={200}
                                        className="w-44 h-44 object-cover"
                                    />
                                </Link>

                                <div className="p-5 flex flex-col justify-center text-left w-full">
                                    <h3 className="font-semibold text-lg mb-2">
                                        <Link href={`/shop/${product.id}`}>{product.name}</Link>
                                    </h3>

                                    <p className="text-gray-500 text-sm mb-3 line-clamp-3">
                                        {product.description}
                                    </p>

                                    <p className="text-gray-900 font-semibold text-lg">
                                        ${product.price}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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
