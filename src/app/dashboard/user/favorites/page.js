"use client";

import api from "@/lib/api";
import Loader from "@/shared/Loader";
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
import { toast, Toaster } from "react-hot-toast";

export default function DashboardFavorites() {
    const router = useRouter();
    const { user, isInitialized } = useAuthStore();

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

            if (!user) {
                setError("Please login to view favorites");
                toast.error("Please login to view favorites");
                return;
            }

            const params = new URLSearchParams();
            params.append("page", currentPage);
            params.append("limit", itemsPerPage);

            const response = await api.get(`/favorites?${params.toString()}`);

            // Handle different response structures
            const favoritesData = response.data?.data || response.data || [];
            const meta = response.data?.meta || {};

            setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
            setTotalPages(meta.totalPage || meta.totalPages || 1);
            setTotalFavorites(meta.total || favoritesData.length || 0);
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
                toast.error(err.response?.data?.message || "Failed to load favorites");
            }
        } finally {
            setLoading(false);
        }
    };

    // Remove from favorites
    const handleRemoveFromFavorites = async (favoriteId, itemName) => {
        setRemovingId(favoriteId);
        try {
            await api.delete(`/favorites/${favoriteId}`);
            toast.success(`Removed "${itemName}" from favorites`);

            // Update local state instead of refetching for better performance
            setFavorites(prev => prev.filter(fav => fav._id !== favoriteId));
            setTotalFavorites(prev => prev - 1);

            // If current page becomes empty and not first page, go to previous page
            if (favorites.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            } else {
                fetchFavorites(); // Refresh to get updated pagination
            }
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

    // Initial fetch - UPDATED to check user instead of accessToken
    useEffect(() => {
        if (!isInitialized) return;

        if (user) {
            fetchFavorites();
        } else {
            setLoading(false);
        }
    }, [user, currentPage, isInitialized]);

    // Empty state with login prompt - UPDATED to check user
    if (!user) {
        return (
            <div className="flex-1 w-full p-4 lg:p-3 flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md transition-all duration-300">
                    <Heart size={48} className="text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Login to View Favorites</h2>
                    <p className="text-gray-500 mb-6">Sign in to see your favorite products and quotes</p>
                    <button
                        onClick={() => router.push("/login")}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                        Login / Sign Up
                    </button>
                </div>
            </div>
        );
    }

    if (loading && currentPage === 1 && favorites.length === 0) {
        return <Loader text="Qkey..." size={50} fullScreen />;
    }

    if (error) {
        return (
            <div className="flex-1 w-full p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <XCircle size={40} className="text-red-400 mx-auto mb-4" />
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={fetchFavorites}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (favorites.length === 0 && !loading) {
        return (
            <div className="flex-1 w-full p-4 lg:p-3 flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md transition-all duration-300">
                    <Heart size={48} className="text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No Favorites Yet</h2>
                    <p className="text-gray-500 mb-6">Start adding products and quotes to your favorites</p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <ShoppingBag size={18} />
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full p-4 lg:p-3">
            <Toaster position="top-right" />
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
                </div>
            </div>

            {/* Favorites Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {favorites.map((fav) => {
                    const product = fav.product;
                    const quote = fav.quote;
                    const isRemoving = removingId === fav._id;
                    const itemName = product?.name || quote?.text?.substring(0, 30) || "Item";

                    return (
                        <div
                            key={fav._id}
                            className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative"
                        >
                            {/* Delete Button - Always visible on mobile, visible on hover on desktop */}
                            <button
                                onClick={() => handleRemoveFromFavorites(fav._id, itemName)}
                                disabled={isRemoving}
                                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-all duration-200 cursor-pointer disabled:opacity-50 z-10 
                                lg:opacity-0 lg:group-hover:opacity-100 
                                opacity-100"
                            >
                                {isRemoving ? (
                                    <RefreshCw size={16} className="animate-spin" />
                                ) : (
                                    <Trash2 size={16} className="text-gray-600 hover:text-red-500 transition-colors" />
                                )}
                            </button>

                            {/* IF PRODUCT */}
                            {product ? (
                                <>
                                    <Link href={`/shop/${product._id}`} className="block relative aspect-square bg-gray-100 overflow-hidden">
                                        {product?.image?.url ? (
                                            <img
                                                src={product.image.url}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package size={40} className="text-gray-300" />
                                            </div>
                                        )}
                                    </Link>

                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>
                                        <p className="font-bold text-gray-900 mt-2">${product.price?.toFixed(2) || "0.00"}</p>

                                        <Link
                                            href={`/shop/${product._id}`}
                                            className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            View Details
                                            <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                </>
                            ) : quote ? (
                                <div className="block p-6 text-center hover:bg-gray-50 transition-colors">
                                    <Quote size={30} className="text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-800 italic line-clamp-3">"{quote.text}"</p>
                                    <p className="text-xs text-gray-500 mt-2">— {quote.author || "InspireTag"}</p>
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && favorites.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500 order-2 sm:order-1">
                        Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalFavorites)} of {totalFavorites} favorites
                    </div>
                    <div className="flex gap-2 order-1 sm:order-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        >
                            <ChevronLeft size={16} className="inline mr-1" />
                            Previous
                        </button>
                        <span className="px-4 py-2 text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        >
                            Next
                            <ChevronRight size={16} className="inline ml-1" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}