"use client";

import api from "@/lib/api";
import Loader from "@/shared/Loader";
import { useAuthStore } from "@/store/authStore";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Clock,
    Flame,
    Heart,
    MessageSquare,
    QrCode,
    RefreshCw,
    Sparkles,
    Star,
    Tag,
    TrendingUp
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

// Category colors and icons
const CATEGORY_CONFIG = {
    faith: { label: "Faith", color: "bg-purple-100 text-purple-700", icon: Heart },
    love: { label: "Love", color: "bg-pink-100 text-pink-700", icon: Heart },
    hope: { label: "Hope", color: "bg-green-100 text-green-700", icon: Sparkles },
    success: { label: "Success", color: "bg-blue-100 text-blue-700", icon: Star },
    motivation: { label: "Motivation", color: "bg-orange-100 text-orange-700", icon: Flame },
    personal: { label: "Personal Message", color: "bg-indigo-100 text-indigo-700", icon: MessageSquare },
    other: { label: "Other", color: "bg-gray-100 text-gray-700", icon: MessageSquare },
};

const getCategoryBadge = (category) => {
    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
    const Icon = config.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${config.color}`}>
            <Icon size={10} />
            {config.label}
        </span>
    );
};

const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatRelativeTime = (date) => {
    if (!date) return "N/A";
    const now = new Date();
    const scanDate = new Date(date);
    const diffMs = now - scanDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(date);
};

export default function ScanHistoryPage() {
    const { user, isInitialized } = useAuthStore();
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedId, setExpandedId] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalScans, setTotalScans] = useState(0);
    const itemsPerPage = 10;

    // Stats
    const [stats, setStats] = useState({
        totalScans: 0,
        todayScans: 0,
        uniqueTags: 0,
        categoryDistribution: {},
    });

    const fetchScanHistory = async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();
            params.append("page", currentPage);
            params.append("limit", itemsPerPage);

            const response = await api.get(`/scan/history?${params.toString()}`);
            setScans(response.data?.data || []);
            setTotalPages(response.data?.meta?.totalPage || 1);
            setTotalScans(response.data?.meta?.total || 0);
        } catch (err) {
            console.error("Error fetching scan history:", err);
            if (err.response?.status === 401) {
                setError("Please login to view scan history");
            } else {
                setError(err.response?.data?.message || "Failed to load scan history");
                toast.error("Failed to load scan history");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchScanStats = async () => {
        try {
            const response = await api.get("/scan/stats");
            setStats(response.data?.data || stats);
        } catch (err) {
            console.error("Error fetching scan stats:", err);
        }
    };

    const handleRefresh = () => {
        setCurrentPage(1);
        fetchScanHistory();
        fetchScanStats();
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    useEffect(() => {
        fetchScanHistory();
    }, [currentPage]);

    useEffect(() => {
        if (!isInitialized) return;

        if (user) {
            fetchScanHistory();
            fetchScanStats();
        }
    }, [user, isInitialized]);

    if (loading && currentPage === 1 && scans.length === 0) {
       return <Loader text="QKey" size={50} fullScreen />;
    }

    if (error) {
        return (
            <div className="flex-1 w-full p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <QrCode size={32} className="text-red-500" />
                    </div>
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full p-4 lg:p-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                            <QrCode size={24} className="text-blue-500" />
                            QR Scan History
                        </h1>
                        <p className="text-gray-500 mt-1">
                            View all your QR code scan history and unlocked messages
                        </p>
                    </div>
                    {/* <button
                        onClick={handleRefresh}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button> */}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Total Scans</span>
                        <QrCode size={18} className="text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalScans}</div>
                    <p className="text-xs text-gray-400 mt-1">All time scans</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Today's Scans</span>
                        <Clock size={18} className="text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">{stats.todayScans}</div>
                    <p className="text-xs text-gray-400 mt-1">Scans today</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Unique Tags</span>
                        <Tag size={18} className="text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-purple-600">{stats.uniqueTags}</div>
                    <p className="text-xs text-gray-400 mt-1">Different tags scanned</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Messages Unlocked</span>
                        <MessageSquare size={18} className="text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-orange-600">{stats.totalScans}</div>
                    <p className="text-xs text-gray-400 mt-1">Inspiring messages</p>
                </div>
            </div>

            {/* Category Distribution */}
            {Object.keys(stats.categoryDistribution).length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <TrendingUp size={16} />
                        Category Distribution
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(stats.categoryDistribution).map(([category, count]) => (
                            <div key={category} className="flex items-center gap-2">
                                {getCategoryBadge(category)}
                                <span className="text-sm font-semibold text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Scan History Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {scans.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <QrCode size={40} className="text-gray-400" />
                        </div>
                        <p className="font-medium">No scan history found</p>
                        <p className="text-sm mt-1">Scan your first QR code to see history here</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">#</th>
                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Tag Code</th>
                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Message</th>
                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Category</th>
                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Scanned At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {scans.map((scan, index) => (
                                        <tr key={scan._id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 text-sm text-gray-500">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="p-4">
                                                <span className="font-mono text-sm font-medium text-gray-900">
                                                    {scan.tag?.tagCode || "Unknown"}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-gray-700 max-w-md italic line-clamp-2">
                                                    "{scan.quote?.text || (scan.category === "personal" ? "Personal Message" : "No quote")}"
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {getCategoryBadge(scan.category)}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-900">{formatRelativeTime(scan.createdAt)}</span>
                                                    <span className="text-xs text-gray-400">{formatDate(scan.createdAt)}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden divide-y divide-gray-100">
                            {scans.map((scan) => (
                                <div key={scan._id} className="p-4">
                                    <div
                                        className="flex items-start justify-between cursor-pointer"
                                        onClick={() => setExpandedId(expandedId === scan._id ? null : scan._id)}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-mono font-semibold text-gray-900 text-sm">
                                                    {scan.tag?.tagCode || "Unknown"}
                                                </span>
                                                {expandedId === scan._id ? (
                                                    <ChevronUp size={20} className="text-gray-400" />
                                                ) : (
                                                    <ChevronDown size={20} className="text-gray-400" />
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600 italic line-clamp-2">
                                                "{scan.quote?.text || (scan.category === "personal" ? "Personal Message" : "No quote")}"
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                {getCategoryBadge(scan.category)}
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {formatRelativeTime(scan.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {expandedId === scan._id && (
                                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Tag Code:</span>
                                                <span className="text-gray-900 font-mono">{scan.tag?.tagCode}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Category:</span>
                                                <span>{getCategoryBadge(scan.category)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Scanned:</span>
                                                <span className="text-gray-900">{formatDate(scan.createdAt)}</span>
                                            </div>
                                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-700 italic">
                                                    "{scan.quote?.text || (scan.category === "personal" ? "Personal Message" : "No quote")}"
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                                <div className="text-sm text-gray-500">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} -{" "}
                                    {Math.min(currentPage * itemsPerPage, totalScans)} of {totalScans} scans
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 rounded-lg text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        <ChevronLeft size={14} className="inline mr-1" />
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 rounded-lg text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        Next
                                        <ChevronRight size={14} className="inline ml-1" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}