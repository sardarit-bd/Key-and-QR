"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { Tag, Plus, Mail } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import QRCodeModal from "@/components/admin/tags/QRCodeModal";
import CreateTagModal from "@/components/admin/tags/CreateTagModal";
import TagsTable from "@/components/admin/tags/TagsTable";
import TagFilters from "@/components/admin/tags/TagFilters";
import StatsCards from "@/components/admin/tags/StatsCards";
import Loader from "@/shared/Loader";
import useAuthInit from "@/hooks/useAuthInit";

export default function AdminTagsPage() {
    useAuthInit();
    const router = useRouter();
    const { user, isInitialized, isAuthenticated, isAdmin } = useAuthStore();
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedTag, setSelectedTag] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTags, setTotalTags] = useState(0);
    const [stats, setStats] = useState({
        total: 0,
        activated: 0,
        pending: 0,
        disabled: 0,
    });
    
    const itemsPerPage = 10;

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

            if (searchTerm) {
                params.append("search", searchTerm);
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
        }
    }, [currentPage, searchTerm, filterStatus, user]);

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

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(1);
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

    if (loading && currentPage === 1 && tags.length === 0) {
        return <Loader text="QKey..." size={50} fullScreen />;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="w-full">
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
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
                            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition cursor-pointer"
                        >
                            <Plus size={18} />
                            Create New Tag
                        </button>
                    </div>
                </div>

                <StatsCards stats={stats} tags={[]} providerInfo={providerInfo} />

                <TagFilters
                    searchTerm={searchTerm}
                    setSearchTerm={handleSearch}
                    filterStatus={filterStatus}
                    setFilterStatus={handleFilterChange}
                    onRefresh={handleRefresh}
                />

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