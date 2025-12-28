
'use client'


import { useProductStore } from "@/store/productStore";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";


const DashboardFavorites = () => {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState(null);


    const products = useProductStore((state) => state.products);

    const [page, setPage] = useState(1);
    const [view, setView] = useState("grid");

    const perPage = 12;
    const totalPages = Math.ceil(products.length / perPage);
    const start = (page - 1) * perPage;
    const paginated = products.slice(start, start + perPage);


    return (
        <div className="flex-1 w-full p-4">


            {/* Recent Orders */}
            <div className="bg-white rounded-lg border border-gray-200 mb-4 lg:mb-6">
                <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">Favorites</h2>
                </div>



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



            </div>


        </div>
    )
}

export default DashboardFavorites;