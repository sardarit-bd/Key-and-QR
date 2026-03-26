"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import {
    Quote,
    Plus,
    RefreshCw,
    XCircle,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    Power,
    PowerOff,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

// Category options
const CATEGORIES = [
    { value: "faith", label: "Faith", color: "bg-purple-100 text-purple-700" },
    { value: "love", label: "Love", color: "bg-pink-100 text-pink-700" },
    { value: "hope", label: "Hope", color: "bg-green-100 text-green-700" },
    { value: "success", label: "Success", color: "bg-blue-100 text-blue-700" },
    { value: "motivation", label: "Motivation", color: "bg-orange-100 text-orange-700" },
];

// Components
const CreateQuoteModal = ({ isOpen, onClose, onSuccess }) => {
    const [text, setText] = useState("");
    const [category, setCategory] = useState("motivation");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!text.trim()) {
            setError("Quote text is required");
            return;
        }
        if (text.length < 3) {
            setError("Quote must be at least 3 characters");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await api.post("/quotes", { text: text.trim(), category });
            toast.success("Quote created successfully");
            onSuccess();
            onClose();
            setText("");
            setCategory("motivation");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create quote");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-xl">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Create New Quote</h3>
                    <p className="text-sm text-gray-500 mt-1">Add a new inspirational quote</p>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quote Text *
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Enter your quote here..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !text.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Quote"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditQuoteModal = ({ isOpen, onClose, quote, onSuccess }) => {
    const [text, setText] = useState("");
    const [category, setCategory] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (quote) {
            setText(quote.text);
            setCategory(quote.category);
            setIsActive(quote.isActive);
        }
    }, [quote]);

    const handleSubmit = async () => {
        if (!text.trim()) {
            setError("Quote text is required");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await api.patch(`/quotes/${quote._id}`, { text: text.trim(), category, isActive });
            toast.success("Quote updated successfully");
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update quote");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !quote) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-xl">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Quote</h3>
                    <p className="text-sm text-gray-500 mt-1">Update your quote</p>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quote Text *
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="isActive" className="text-sm text-gray-700">
                            Active (visible for scans)
                        </label>
                    </div>
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !text.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const DeleteConfirmModal = ({ isOpen, onClose, quote, onConfirm }) => {
    if (!isOpen || !quote) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Delete Quote</h3>
                </div>
                <div className="p-6">
                    <p className="text-gray-600">
                        Are you sure you want to delete this quote?
                    </p>
                    <p className="text-sm text-gray-500 mt-2 font-mono">
                        "{quote.text?.substring(0, 100)}..."
                    </p>
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(quote._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Page
export default function QuotesManagementPage() {
    const { accessToken } = useAuthStore();
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState(null);

    // Filters and Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalQuotes, setTotalQuotes] = useState(0);
    const itemsPerPage = 10;

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        byCategory: {}
    });

    const fetchQuotes = async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();
            params.append("page", currentPage);
            params.append("limit", itemsPerPage);
            if (searchTerm) params.append("search", searchTerm);
            if (selectedCategory !== "all") params.append("category", selectedCategory);

            const response = await api.get(`/quotes?${params.toString()}`);
            setQuotes(response.data?.data || []);
            setTotalPages(response.data?.meta?.totalPage || 1);
            setTotalQuotes(response.data?.meta?.total || 0);
        } catch (err) {
            console.error("Error fetching quotes:", err);
            setError(err.response?.data?.message || "Failed to load quotes");
            toast.error("Failed to load quotes");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get("/quotes?limit=1000");
            const allQuotes = response.data?.data || [];
            const activeCount = allQuotes.filter(q => q.isActive).length;
            const inactiveCount = allQuotes.filter(q => !q.isActive).length;

            const byCategory = {};
            CATEGORIES.forEach(cat => {
                byCategory[cat.value] = allQuotes.filter(q => q.category === cat.value).length;
            });

            setStats({
                total: allQuotes.length,
                active: activeCount,
                inactive: inactiveCount,
                byCategory
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const handleToggleActive = async (id) => {
        try {
            const response = await api.patch(`/quotes/${id}/toggle`);
            toast.success(`Quote ${response.data.data.isActive ? "activated" : "deactivated"}`);
            fetchQuotes();
            fetchStats();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to toggle quote status");
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/quotes/${id}`);
            toast.success("Quote deleted successfully");
            setShowDeleteModal(false);
            setSelectedQuote(null);
            fetchQuotes();
            fetchStats();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete quote");
        }
    };

    const handleRefresh = () => {
        setSearchTerm("");
        setSelectedCategory("all");
        setCurrentPage(1);
        fetchQuotes();
        fetchStats();
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage === 1) {
                fetchQuotes();
            } else {
                setCurrentPage(1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
        fetchQuotes();
    }, [selectedCategory]);

    useEffect(() => {
        fetchQuotes();
    }, [currentPage]);

    useEffect(() => {
        if (accessToken) {
            fetchQuotes();
            fetchStats();
        }
    }, [accessToken]);

    const getCategoryBadge = (category) => {
        const cat = CATEGORIES.find(c => c.value === category);
        return cat ? (
            <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${cat.color}`}>
                {cat.label}
            </span>
        ) : category;
    };

    if (loading && currentPage === 1 && quotes.length === 0) {
        return (
            <div className="flex-1 w-full p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <RefreshCw size={40} className="animate-spin text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Loading quotes...</p>
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
                            <Quote size={24} />
                            Quotes Management
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Manage inspirational quotes for user scans
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                    >
                        <Plus size={18} />
                        Add New Quote
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Total Quotes</span>
                        <Quote size={18} className="text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Active</span>
                        <Eye size={18} className="text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Inactive</span>
                        <PowerOff size={18} className="text-red-500" />
                    </div>
                    <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Categories</span>
                        <Filter size={18} className="text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{CATEGORIES.length}</div>
                </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Distribution by Category</h3>
                <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map((cat) => (
                        <div key={cat.value} className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${cat.color}`}>
                                {cat.label}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                                {stats.byCategory[cat.value] || 0}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search quotes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSelectedCategory("all")}
                            className={`px-4 py-2 rounded-lg text-sm transition ${selectedCategory === "all"
                                    ? "bg-gray-900 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            All
                        </button>
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={`px-4 py-2 rounded-lg text-sm transition ${selectedCategory === cat.value
                                        ? cat.color.replace("text-", "bg-").replace("100", "500") + " text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        title="Refresh"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-600">
                    {error}
                </div>
            )}

            {/* Quotes Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {quotes.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Quote size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>No quotes found</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                        >
                            Create your first quote
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Quote</th>
                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Category</th>
                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Created</th>
                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {quotes.map((quote) => (
                                        <tr key={quote._id} className="hover:bg-gray-50 transition">
                                            <td className="p-4">
                                                <div className="text-sm text-gray-900 max-w-md">
                                                    "{quote.text}"
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {getCategoryBadge(quote.category)}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${quote.isActive
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                    }`}>
                                                    {quote.isActive ? <Power size={10} /> : <PowerOff size={10} />}
                                                    {quote.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">
                                                {new Date(quote.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleToggleActive(quote._id)}
                                                        className="p-1.5 hover:bg-gray-100 rounded-lg transition group"
                                                        title={quote.isActive ? "Deactivate" : "Activate"}
                                                    >
                                                        {quote.isActive ? (
                                                            <PowerOff size={16} className="text-gray-500 group-hover:text-red-600" />
                                                        ) : (
                                                            <Power size={16} className="text-gray-500 group-hover:text-green-600" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedQuote(quote);
                                                            setShowEditModal(true);
                                                        }}
                                                        className="p-1.5 hover:bg-gray-100 rounded-lg transition group"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} className="text-gray-500 group-hover:text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedQuote(quote);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="p-1.5 hover:bg-gray-100 rounded-lg transition group"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} className="text-gray-500 group-hover:text-red-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="lg:hidden divide-y divide-gray-100">
                            {quotes.map((quote) => (
                                <div key={quote._id} className="p-4">
                                    <div className="text-sm text-gray-900 italic">
                                        "{quote.text}"
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-2">
                                            {getCategoryBadge(quote.category)}
                                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${quote.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}>
                                                {quote.isActive ? <Power size={10} /> : <PowerOff size={10} />}
                                                {quote.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleActive(quote._id)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                                            >
                                                {quote.isActive ? (
                                                    <PowerOff size={16} className="text-red-500" />
                                                ) : (
                                                    <Power size={16} className="text-green-500" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedQuote(quote);
                                                    setShowEditModal(true);
                                                }}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                                            >
                                                <Edit size={16} className="text-blue-600" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedQuote(quote);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                                            >
                                                <Trash2 size={16} className="text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2">
                                        {new Date(quote.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                                <div className="text-sm text-gray-500">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalQuotes)} of {totalQuotes} quotes
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

            {/* Modals */}
            <CreateQuoteModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    fetchQuotes();
                    fetchStats();
                }}
            />

            <EditQuoteModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedQuote(null);
                }}
                quote={selectedQuote}
                onSuccess={() => {
                    fetchQuotes();
                    fetchStats();
                }}
            />

            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedQuote(null);
                }}
                quote={selectedQuote}
                onConfirm={handleDelete}
            />
        </div>
    );
}