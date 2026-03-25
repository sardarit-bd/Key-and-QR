// app/dashboard/admin/tags/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import {
    Tag,
    Plus,
    RefreshCw,
    AlertCircle,
    Check,
    Shield
} from "lucide-react";
import QRCodeModal from "@/components/admin/tags/QRCodeModal";
import CreateTagModal from "@/components/admin/tags/CreateTagModal";
import TagsTable from "@/components/admin/tags/TagsTable";
import TagFilters from "@/components/admin/tags/TagFilters";
import StatsCards from "@/components/admin/tags/StatsCards";


export default function AdminTagsPage() {
    const router = useRouter();
    const { user, accessToken } = useAuthStore();
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedTag, setSelectedTag] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    // Check admin access
    useEffect(() => {
        if (!accessToken) {
            router.push("/login");
            return;
        }
        if (user?.role !== "admin") {
            router.push("/");
            return;
        }
    }, [accessToken, user, router]);

    // Fetch tags
    const fetchTags = async () => {
        try {
            setLoading(true);
            const response = await api.get("/tags");
            setTags(response.data.data || []);
            setError("");
        } catch (error) {
            console.error("Error fetching tags:", error);
            setError(error.response?.data?.message || "Failed to load tags");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    // Filter tags
    const filteredTags = tags.filter((tag) => {
        const matchesSearch = tag.tagCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all"
            ? true
            : filterStatus === "active"
                ? tag.isActivated
                : filterStatus === "pending"
                    ? !tag.isActivated && tag.isActive
                    : filterStatus === "disabled"
                        ? !tag.isActive
                        : true;
        return matchesSearch && matchesFilter;
    });

    // Stats
    const stats = {
        total: tags.length,
        activated: tags.filter(t => t.isActivated).length,
        pending: tags.filter(t => !t.isActivated && t.isActive).length,
        disabled: tags.filter(t => !t.isActive).length,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading tags...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="w-full">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <Tag className="w-8 h-8" />
                                Admin Tags
                            </h1>
                            <p className="text-gray-600 mt-1">Manage all NFC/QR tags</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition cursor-pointer"
                        >
                            <Plus size={18} />
                            Create Tag
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <StatsCards stats={stats} />

                {/* Filters */}
                <TagFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    onRefresh={fetchTags}
                />

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-600">
                        {error}
                    </div>
                )}

                {/* Tags Table */}
                <TagsTable
                    tags={filteredTags}
                    onShowQR={(tag) => {
                        setSelectedTag(tag);
                        setShowQRModal(true);
                    }}
                />

                {/* Create Tag Modal */}
                <CreateTagModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={fetchTags}
                />

                {/* QR Code Modal */}
                <QRCodeModal
                    isOpen={showQRModal}
                    onClose={() => setShowQRModal(false)}
                    tag={selectedTag}
                />
            </div>
        </div>
    );
}