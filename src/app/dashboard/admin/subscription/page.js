"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { 
    Crown, Calendar, DollarSign, CreditCard, 
    AlertCircle, Loader2, XCircle, Search,
    Filter, ChevronLeft, ChevronRight, RefreshCw,
    Users, TrendingUp, Clock, CheckCircle, Ban,
    ChevronDown, Check
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { SubscriptionCustomSelect } from "@/components/admin/Subscriptions/SubscriptionCustomSelect";
import Loader from "@/shared/Loader";



export default function AdminSubscriptionsPage() {
    const { user } = useAuthStore();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSubscriptions, setTotalSubscriptions] = useState(0);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        trialing: 0,
        pastDue: 0,
        canceled: 0,
        unpaid: 0,
        incomplete: 0,
        totalRevenue: 0,
        monthlyRecurringRevenue: 0
    });

    const itemsPerPage = 10;

    // Status options for custom select
    const statusOptions = [
        { value: "all", label: "All", icon: null },
        { value: "active", label: "Active", icon: <CheckCircle size={12} className="text-green-600" /> },
        { value: "trialing", label: "Trialing", icon: <Clock size={12} className="text-blue-600" /> },
        { value: "past_due", label: "Past Due", icon: <AlertCircle size={12} className="text-yellow-600" /> },
        { value: "canceled", label: "Canceled", icon: <Ban size={12} className="text-red-600" /> },
        { value: "unpaid", label: "Unpaid", icon: <AlertCircle size={12} className="text-orange-600" /> },
        { value: "incomplete", label: "Incomplete", icon: <Clock size={12} className="text-gray-600" /> },
    ];

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("page", currentPage);
            params.append("limit", itemsPerPage);
            if (searchTerm) params.append("search", searchTerm);
            if (filterStatus !== "all") params.append("status", filterStatus);

            const response = await api.get(`/subscriptions/admin/subscriptions?${params.toString()}`);
            
            setSubscriptions(response.data?.data || []);
            setTotalPages(response.data?.meta?.totalPage || 1);
            setTotalSubscriptions(response.data?.meta?.total || 0);
        } catch (error) {
            console.error("Fetch subscriptions error:", error);
            toast.error(error.response?.data?.message || "Failed to fetch subscriptions");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get("/subscriptions/admin/subscriptions/stats");
            setStats(response.data?.data || stats);
        } catch (error) {
            console.error("Fetch stats error:", error);
        }
    };

    const handleSyncWithStripe = async () => {
        setLoading(true);
        try {
            const response = await api.post("/subscriptions/admin/subscriptions/sync");
            toast.success(response.data?.message || "Sync completed successfully");
            fetchSubscriptions();
            fetchStats();
        } catch (error) {
            console.error("Sync error:", error);
            toast.error(error.response?.data?.message || "Failed to sync with Stripe");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === "admin") {
            fetchSubscriptions();
            fetchStats();
        }
    }, [user, currentPage, filterStatus]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage === 1) fetchSubscriptions();
            else setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const getStatusBadge = (status) => {
        const styles = {
            active: "bg-gray-100 text-gray-700",
            trialing: "bg-gray-100 text-gray-700",
            past_due: "bg-gray-200 text-gray-800",
            canceled: "bg-gray-100 text-gray-500",
            unpaid: "bg-gray-200 text-gray-800",
            incomplete: "bg-gray-100 text-gray-500",
            checkout_pending: "bg-gray-100 text-gray-500",
        };
        return styles[status] || "bg-gray-100 text-gray-600";
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "active": return <CheckCircle size={12} className="inline mr-1" />;
            case "trialing": return <Clock size={12} className="inline mr-1" />;
            case "past_due": return <AlertCircle size={12} className="inline mr-1" />;
            case "canceled": return <Ban size={12} className="inline mr-1" />;
            default: return null;
        }
    };

    if (loading && subscriptions.length === 0) {
        return (
            <div className="flex-1 w-full p-8 flex items-center justify-center min-h-[400px]">
                <Loader size={40} />
            </div>
        );
    }

    return (
        <div className="flex-1 w-full p-4 lg:p-8 bg-white">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-black flex items-center gap-2">
                            <Crown size={24} className="text-black" />
                            Subscriptions Management
                        </h1>
                        <p className="text-gray-600">Manage and monitor all customer subscriptions</p>
                    </div>
                    <button
                        onClick={handleSyncWithStripe}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Sync with Stripe
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">Total</span>
                        <Users size={14} className="text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-black">{stats.total}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">Active</span>
                        <CheckCircle size={14} className="text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-black">{stats.active || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">Trialing</span>
                        <Clock size={14} className="text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-black">{stats.trialing || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">Past Due</span>
                        <AlertCircle size={14} className="text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-black">{stats.pastDue || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">Canceled</span>
                        <Ban size={14} className="text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-black">{stats.canceled || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">MRR</span>
                        <TrendingUp size={14} className="text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-black">${(stats.monthlyRecurringRevenue || 0).toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">Revenue</span>
                        <DollarSign size={14} className="text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-black">${(stats.totalRevenue || 0).toFixed(2)}</p>
                </div>
            </div>

            {/* Filters - with Custom Dropdown */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by tag code, user email, or subscription ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                    />
                </div>

                {/* Custom Status Filter Dropdown */}
                <SubscriptionCustomSelect
                    options={statusOptions}
                    value={filterStatus}
                    onChange={setFilterStatus}
                    placeholder="Filter by status"
                />
            </div>

            {/* Subscriptions Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left p-4 text-sm font-semibold text-gray-600">Tag Code</th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-600">User</th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-600">Period</th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-600">Amount</th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-600">Category</th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-600">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {subscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-gray-500">
                                        <Crown size={48} className="mx-auto mb-4 text-gray-300" />
                                        <p>No subscriptions found</p>
                                    </td>
                                </tr>
                            ) : (
                                subscriptions.map((sub) => (
                                    <tr key={sub._id} className="hover:bg-gray-50 transition">
                                        <td className="p-4">
                                            <span className="font-mono text-sm font-medium text-black">
                                                {sub.tag?.tagCode || "N/A"}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <p className="text-sm font-medium text-black">{sub.user?.name || "Guest"}</p>
                                                <p className="text-xs text-gray-500">{sub.user?.email}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getStatusBadge(sub.status)}`}>
                                                {getStatusIcon(sub.status)}
                                                <span className="capitalize">{sub.status}</span>
                                            </span>
                                            {sub.cancelAtPeriodEnd && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Cancels at period end
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="text-xs text-gray-600 space-y-1">
                                                <div>Start: {new Date(sub.currentPeriodStart).toLocaleDateString()}</div>
                                                <div>End: {new Date(sub.currentPeriodEnd).toLocaleDateString()}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 text-gray-700">
                                                <span className="font-medium flex items-center"><DollarSign size={14} />2.99</span>
                                                <span className="text-xs text-gray-500">/month</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs text-gray-600 capitalize">
                                                {sub.preferredCategory || "Not set"}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-xs text-gray-500">
                                                {new Date(sub.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="text-sm text-gray-500">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalSubscriptions)} of {totalSubscriptions} subscriptions
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-3 py-1 text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}