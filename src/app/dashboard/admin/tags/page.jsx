"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { Tag, Plus, Mail, Search, X } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import QRCodeModal from "@/components/admin/tags/QRCodeModal";
import CreateTagModal from "@/components/admin/tags/CreateTagModal";
import TagsTable from "@/components/admin/tags/TagsTable";
import Loader from "@/shared/Loader";
import useAuthInit from "@/hooks/useAuthInit";

export default function AdminTagsPage() {
    useAuthInit();
    const router = useRouter();
    const { user, isInitialized } = useAuthStore();
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedTag, setSelectedTag] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeSearchTerm, setActiveSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTags, setTotalTags] = useState(0);
    const [isSearching, setIsSearching] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        activated: 0,
        pending: 0,
        disabled: 0,
    });
    
    const itemsPerPage = 10;
    const searchInputRef = useRef(null);

    const getProviderInfo = () => {
        if (user?.provider === "google") {
            return { icon: <FaGoogle size={14} className="text-blue-500" />, text: "Google" };
        }
        return { icon: <Mail size={14} className="text-gray-500" />, text: "Email" };
    };

    const providerInfo = getProviderInfo();

    useEffect(() => {
        if (!isInitialized) return;

        if (!user) {
            router.push("/login");
            return;
        }

        if (user.role !== "admin") {
            router.push("/");
            return;
        }
    }, [user, isInitialized, router]);

    const fetchTags = useCallback(async () => {
        if (!user || user.role !== "admin") return;
        
        try {
            setLoading(true);
            setError("");
            
            const params = new URLSearchParams();
            params.append("page", currentPage);
            params.append("limit", itemsPerPage);

            if (activeSearchTerm) {
                params.append("search", activeSearchTerm);
            }

            if (filterStatus === "active") {
                params.append("isActivated", "true");
            } else if (filterStatus === "pending") {
                params.append("isActivated", "false");
                params.append("isActive", "true");
            } else if (filterStatus === "disabled") {
                params.append("isActive", "false");
            }

            const response = await api.get(`/tags?${params.toString()}`);
            
            const responseData = response.data?.data?.data || response.data?.data || [];
            const responseMeta = response.data?.data?.meta || response.data?.meta || {};
            
            setTags(responseData);
            setTotalPages(responseMeta.totalPage || 1);
            setTotalTags(responseMeta.total || 0);
        } catch (error) {
            console.error("Error fetching tags:", error);
            
            if (error.response?.status === 401) {
                setError("Session expired. Please login again.");
            } else {
                setError(error.response?.data?.message || "Failed to load tags");
            }
        } finally {
            setLoading(false);
            setIsSearching(false);
        }
    }, [currentPage, activeSearchTerm, filterStatus, user]);

    const loadStats = useCallback(async () => {
        if (!user || user.role !== "admin") return;
        
        try {
            const response = await api.get("/tags?limit=1000");
            const allTags = response.data?.data?.data || response.data?.data || [];
            
            setStats({
                total: allTags.length,
                activated: allTags.filter(t => t.isActivated).length,
                pending: allTags.filter(t => !t.isActivated && t.isActive).length,
                disabled: allTags.filter(t => !t.isActive).length,
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    }, [user]);

    useEffect(() => {
        if (user && user.role === "admin") {
            fetchTags();
        }
    }, [fetchTags, user]);

    useEffect(() => {
        if (user && user.role === "admin") {
            loadStats();
        }
    }, [loadStats, user]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleRefresh = () => {
        fetchTags();
        loadStats();
    };

    // FIXED: Empty search handler
    const performSearch = () => {
        // If search term is empty or only spaces, do nothing
        if (!searchTerm || searchTerm.trim() === "") {
            // Optional: Show a toast or notification
            // toast.error("Please enter a tag code to search");
            return;
        }
        
        // Only search if there's actual text
        setIsSearching(true);
        setActiveSearchTerm(searchTerm);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            performSearch();
        }
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setActiveSearchTerm("");
        setCurrentPage(1);
        searchInputRef.current?.focus();
    };

    const handleFilterChange = (status) => {
        setFilterStatus(status);
        setCurrentPage(1);
    };

    if (!isInitialized) {
        return <Loader text="QKey..." size={50} fullScreen />;
    }

    if (user && user.role !== "admin") {
        return null;
    }

    if (loading && currentPage === 1 && tags.length === 0 && !activeSearchTerm) {
        return <Loader text="QKey..." size={50} fullScreen />;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="w-full max-w-full overflow-x-hidden">
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                                    <Tag className="w-8 h-8" />
                                    Admin Tags
                                </h1>
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                                    {providerInfo.icon}
                                    <span className="text-gray-600">{providerInfo.text} Admin</span>
                                </div>
                            </div>
                            <p className="text-gray-600 mt-1">
                                Manage all NFC/QR tags for physical keychains
                                {totalTags > 0 && <span className="ml-2 text-sm">({totalTags} total tags)</span>}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition cursor-pointer whitespace-nowrap"
                        >
                            <Plus size={18} />
                            Create New Tag
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-gray-500">Total Tags</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-gray-500">Activated</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.activated}</p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-gray-500">Pending</p>
                        <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-gray-500">Disabled</p>
                        <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.disabled}</p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 col-span-2 sm:col-span-1">
                        <p className="text-xs sm:text-sm text-gray-500">Subscriber Tags</p>
                        <p className="text-xl sm:text-2xl font-bold text-purple-600">$0</p>
                    </div>
                </div>

                {/* Search Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search by tag code..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onKeyPress={handleKeyPress}
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                            {searchTerm && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition"
                                >
                                    <X size={16} className="text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>
                        
                        <button
                            onClick={performSearch}
                            disabled={isSearching || !searchTerm || searchTerm.trim() === ""}
                            className={`px-6 py-2 rounded-lg transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                                !searchTerm || searchTerm.trim() === ""
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-gray-900 text-white hover:bg-gray-800"
                            }`}
                        >
                            {isSearching ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Searching...</span>
                                </>
                            ) : (
                                <>
                                    <Search size={18} />
                                    <span>Search</span>
                                </>
                            )}
                        </button>

                        <div className="flex gap-2 flex-wrap">
                            {[
                                { label: "All", value: "all", color: "bg-black" },
                                { label: "Activated", value: "active", color: "bg-green-600" },
                                { label: "Pending", value: "pending", color: "bg-yellow-600" },
                                { label: "Disabled", value: "disabled", color: "bg-red-600" }
                            ].map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() => handleFilterChange(filter.value)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                                        filterStatus === filter.value
                                            ? `${filter.color} text-white`
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {activeSearchTerm && (
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                            <div className="inline-flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm">
                                <Search size={14} />
                                <span>Showing results for: <strong>"{activeSearchTerm}"</strong></span>
                                <button
                                    onClick={handleClearSearch}
                                    className="ml-1 p-0.5 hover:bg-blue-100 rounded-full transition"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                            {totalTags > 0 && (
                                <span className="text-sm text-gray-500">
                                    Found {totalTags} result{totalTags !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-600">
                        {error}
                        <button 
                            onClick={handleRefresh}
                            className="ml-4 text-sm underline hover:no-underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {loading && tags.length > 0 && (
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-lg">
                            <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm text-gray-600">Updating tags...</span>
                            </div>
                        </div>
                    </div>
                )}

                <TagsTable
                    tags={tags}
                    onShowQR={(tag) => {
                        setSelectedTag(tag);
                        setShowQRModal(true);
                    }}
                    onRefresh={handleRefresh}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />

                <CreateTagModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        handleRefresh();
                        setCurrentPage(1);
                    }}
                />

                <QRCodeModal
                    isOpen={showQRModal}
                    onClose={() => setShowQRModal(false)}
                    tag={selectedTag}
                />
            </div>
        </div>
    );
}