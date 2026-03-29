"use client";

import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
    ChevronLeft,
    ChevronRight,
    Heart,
    Package,
    Quote,
    RefreshCw,
    ShoppingBag,
    Trash2,
    XCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function DashboardFavorites() {
    const router = useRouter();
    const { user, accessToken } = useAuthStore();

    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removingId, setRemovingId] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalFavorites, setTotalFavorites] = useState(0);
    const itemsPerPage = 8;

    // Fetch favorites from backend
    const fetchFavorites = async () => {
        try {
            setLoading(true);
            setError("");

            if (!accessToken) {
                setError("Please login to view favorites");
                toast.error("Please login to view favorites");
                return;
            }

            const params = new URLSearchParams();
            params.append("page", currentPage);
            params.append("limit", itemsPerPage);

            const response = await api.get(`/favorites?${params.toString()}`);

            setFavorites(response.data?.data || []);
            setTotalPages(response.data?.meta?.totalPage || 1);
            setTotalFavorites(response.data?.meta?.total || 0);
        } catch (err) {
            console.error("Error fetching favorites:", err);

            if (err.response?.status === 401) {
                setError("Session expired. Please login again.");
                toast.error("Please login to view favorites");
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            } else {
                setError(err.response?.data?.message || "Failed to load favorites");
                toast.error("Failed to load favorites");
            }
        } finally {
            setLoading(false);
        }
    };

    // Remove from favorites
    const handleRemoveFromFavorites = async (favoriteId, productName) => {
        setRemovingId(favoriteId);
        try {
            await api.delete(`/favorites/${favoriteId}`);
            toast.success(`Removed "${productName}" from favorites`);
            fetchFavorites(); // Refresh list
        } catch (err) {
            console.error("Error removing favorite:", err);
            toast.error(err.response?.data?.message || "Failed to remove from favorites");
        } finally {
            setRemovingId(null);
        }
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Initial fetch
    useEffect(() => {
        if (accessToken) {
            fetchFavorites();
        } else {
            setLoading(false);
        }
    }, [accessToken, currentPage]);

    // Empty state with login prompt
    if (!accessToken) {
        return (
            <div className="flex-1 w-full p-4 lg:p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <Heart size={48} className="text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Login to View Favorites</h2>
                    <p className="text-gray-500 mb-6">Sign in to see your favorite products and quotes</p>
                    <button
                        onClick={() => router.push("/login")}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition cursor-pointer"
                    >
                        Login / Sign Up
                    </button>
                </div>
            </div>
        );
    }

    if (loading && currentPage === 1 && favorites.length === 0) {
        return (
            <div className="flex-1 w-full p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <RefreshCw size={40} className="animate-spin text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Loading favorites...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 w-full p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <XCircle size={40} className="text-red-400 mx-auto mb-4" />
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={fetchFavorites}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (favorites.length === 0) {
        return (
            <div className="flex-1 w-full p-4 lg:p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <Heart size={48} className="text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No Favorites Yet</h2>
                    <p className="text-gray-500 mb-6">Start adding products and quotes to your favorites</p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                    >
                        <ShoppingBag size={18} />
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full p-4 lg:p-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                            <Heart size={24} className="text-red-500" />
                            My Favorites
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {totalFavorites} {totalFavorites === 1 ? "item" : "items"} saved
                        </p>
                    </div>
                    {/* <button
                        onClick={fetchFavorites}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button> */}
                </div>
            </div>

            {/* Favorites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {favorites.map((fav) => {
                    const product = fav.product;
                    const quote = fav.quote;
                    const isRemoving = removingId === fav._id;

                    return (
                        <div
                            key={fav._id}
                            className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all relative"
                        >
                            <button
                                onClick={() => handleRemoveFromFavorites(fav._id, product?.name || "Quote")}
                                disabled={isRemoving}
                                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-red-50 transition cursor-pointer disabled:opacity-50 z-10"
                            >
                                {isRemoving ? (
                                    <RefreshCw size={16} className="animate-spin" />
                                ) : (
                                    <Trash2 size={16} className="text-gray-600 hover:text-red-500" />
                                )}
                            </button>

                            {/* IF PRODUCT */}
                            {product ? (
                                <>
                                    <Link href={`/shop/${product._id}`} className="block relative aspect-square bg-gray-100">
                                        {product?.image?.url ? (
                                            <img
                                                src={product.image.url}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package size={40} className="text-gray-300" />
                                            </div>
                                        )}
                                    </Link>

                                    <div className="p-4">
                                        <h3 className="font-semibold">{product.name}</h3>
                                        <p className="text-sm text-gray-500">{product.description}</p>
                                        <p className="font-bold mt-2">${product.price}</p>
                                    </div>
                                </>
                            ) : quote ? (
                                // IF QUOTE
                                <div className="p-6 text-center">
                                    <Quote size={30} className="text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-800 italic">"{quote.text}"</p>
                                    <p className="text-xs text-gray-500 mt-2">— {quote.author}</p>
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalFavorites)} of {totalFavorites} favorites
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                            <ChevronLeft size={16} className="inline mr-1" />
                            Previous
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                            Next
                            <ChevronRight size={16} className="inline ml-1" />
                        </button>
                    </div>
                </div>
            )}

            {/* Empty State in Pagination */}
            {favorites.length === 0 && !loading && (
                <div className="text-center py-12">
                    <Heart size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No favorites found</p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                    >
                        <ShoppingBag size={18} />
                        Browse Products
                    </Link>
                </div>
            )}
        </div>
    );
}