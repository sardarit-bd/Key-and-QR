"use client";

import ApproveModal from "@/components/admin/pending-quotes/ApproveModal";
import DeleteModal from "@/components/admin/pending-quotes/DeleteModal";
import RejectModal from "@/components/admin/pending-quotes/RejectModal";
import QuoteDetailsModal from "@/components/admin/pending-quotes/QuoteDetailsModal";
import api from "@/lib/api";
import Loader from "@/shared/Loader";
import { useAuthStore } from "@/store/authStore";
import {
    CheckCircle,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronUp,
    Clock,
    Eye,
    MessageSquare,
    RefreshCw,
    Search,
    Trash2,
    User,
    XCircle
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";

const CATEGORY_COLORS = {
    faith: "bg-purple-100 text-purple-700",
    love: "bg-pink-100 text-pink-700",
    hope: "bg-green-100 text-green-700",
    success: "bg-blue-100 text-blue-700",
    motivation: "bg-orange-100 text-orange-700",
    other: "bg-gray-100 text-gray-700",
};

const CATEGORY_LABELS = {
    faith: "Faith",
    love: "Love",
    hope: "Hope",
    success: "Success",
    motivation: "Motivation",
    other: "Other",
};

// Custom Select Component for items per page
const ItemsPerPageSelect = ({ value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative z-30" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between gap-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white min-w-[70px] cursor-pointer hover:border-gray-400 transition-colors"
            >
                <span>{selectedOption?.label || value}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 min-w-[70px] bg-white border border-gray-200 rounded-md shadow-xl z-[9999] overflow-hidden">
                    <div className="max-h-20 overflow-y-auto custom-scroll">
                        {options.map((option, index) => (
                            <div key={option.value}>
                                <button
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors cursor-pointer ${value === option.value
                                        ? 'bg-gray-100 text-gray-900 font-medium'
                                        : 'text-gray-600'
                                        }`}
                                >
                                    {option.label}
                                </button>
                                {index < options.length - 1 && (
                                    <div className="border-t border-gray-100 mx-2" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <style jsx global>{`
                .custom-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scroll::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .custom-scroll::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scroll::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default function PendingQuotesPage() {
    const { user, isInitialized } = useAuthStore();
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalQuotes, setTotalQuotes] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Modal states
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [expandedId, setExpandedId] = useState(null);

    const fetchPendingQuotes = async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();
            params.append("page", currentPage);
            params.append("limit", itemsPerPage);
            if (searchTerm) params.append("search", searchTerm);

            const response = await api.get(`/pending-quotes?${params.toString()}`);
            setQuotes(response.data?.data || []);
            setTotalPages(response.data?.meta?.totalPage || 1);
            setTotalQuotes(response.data?.meta?.total || 0);
        } catch (err) {
            console.error("Error fetching pending quotes:", err);
            setError(err.response?.data?.message || "Failed to load pending quotes");
            toast.error("Failed to load pending quotes");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, adminNote) => {
        try {
            await api.patch(`/pending-quotes/${id}/approve`, { adminNote });
            toast.success("Quote approved and added to main quotes");
            fetchPendingQuotes();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to approve quote");
            throw err;
        }
    };

    const handleReject = async (id, adminNote) => {
        try {
            await api.patch(`/pending-quotes/${id}/reject`, { adminNote });
            toast.success("Quote rejected");
            fetchPendingQuotes();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reject quote");
            throw err;
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/pending-quotes/${id}`);
            toast.success("Pending quote deleted");
            fetchPendingQuotes();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete quote");
        }
    };

    const handleRefresh = () => {
        setSearchTerm("");
        setCurrentPage(1);
        fetchPendingQuotes();
    };

    // Pagination handlers
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToFirstPage = () => {
        setCurrentPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToLastPage = () => {
        setCurrentPage(totalPages);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleItemsPerPageChange = (newLimit) => {
        setItemsPerPage(newLimit);
        setCurrentPage(1);
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    // Debounced search
    useEffect(() => {
        if (!isInitialized) return;
        if (!user || user.role !== "admin") return;

        const timer = setTimeout(() => {
            if (currentPage === 1) {
                fetchPendingQuotes();
            } else {
                setCurrentPage(1);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, isInitialized, user]);

    useEffect(() => {
        if (!isInitialized) return;
        if (!user || user.role !== "admin") return;

        fetchPendingQuotes();
    }, [currentPage, itemsPerPage, isInitialized, user]);

    useEffect(() => {
        if (!isInitialized) return;

        if (user?.role === "admin") {
            fetchPendingQuotes();
        }
    }, [user, isInitialized]);

    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading && currentPage === 1 && quotes.length === 0) {
        return <Loader text="QKey..." size={50} fullScreen />;
    }

    return (
        <div className="flex-1 w-full p-4 lg:p-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                            <Clock size={24} />
                            Pending Quotes
                        </h1>
                        <p className="text-gray-500 mt-1">
                            User submitted quotes waiting for approval
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Total Pending</span>
                        <Clock size={18} className="text-yellow-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{totalQuotes}</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Unique Users</span>
                        <User size={18} className="text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {new Set(quotes.map(q => q.user?._id)).size}
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Total Submissions</span>
                        <MessageSquare size={18} className="text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{totalQuotes}</div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search quotes by text or user name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-600">
                    {error}
                    <button
                        onClick={fetchPendingQuotes}
                        className="ml-4 text-sm underline hover:no-underline"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Quotes Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-visible shadow-sm">
                {quotes.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <CheckCircle size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>No pending quotes found</p>
                        <p className="text-sm mt-1">All quotes have been reviewed</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">#</th>
                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">User</th>
                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Quote</th>
                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Category</th>
                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Submitted</th>
                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {quotes.map((quote, index) => (
                                        <tr key={quote._id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 text-sm text-gray-500">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{quote.user?.name || "Unknown"}</p>
                                                    <p className="text-xs text-gray-500">{quote.user?.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-gray-700 max-w-md italic line-clamp-2">
                                                    "{quote.text}"
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${CATEGORY_COLORS[quote.category] || "bg-gray-100 text-gray-700"}`}>
                                                    {CATEGORY_LABELS[quote.category] || quote.category}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">
                                                {formatDate(quote.createdAt)}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedQuote(quote);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        className="p-1.5 hover:bg-gray-100 rounded-lg transition group cursor-pointer"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} className="text-gray-500 group-hover:text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedQuote(quote);
                                                            setShowApproveModal(true);
                                                        }}
                                                        className="p-1.5 hover:bg-green-50 rounded-lg transition group cursor-pointer"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={18} className="text-gray-500 group-hover:text-green-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedQuote(quote);
                                                            setShowRejectModal(true);
                                                        }}
                                                        className="p-1.5 hover:bg-red-50 rounded-lg transition group cursor-pointer"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={18} className="text-gray-500 group-hover:text-red-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedQuote(quote);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="p-1.5 hover:bg-red-50 rounded-lg transition group cursor-pointer"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} className="text-gray-500 group-hover:text-red-600" />
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
                                    <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => setExpandedId(expandedId === quote._id ? null : quote._id)}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-gray-900">{quote.user?.name || "Unknown"}</span>
                                                {expandedId === quote._id ? (
                                                    <ChevronUp size={20} className="text-gray-400" />
                                                ) : (
                                                    <ChevronDown size={20} className="text-gray-400" />
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600 italic line-clamp-2">
                                                "{quote.text}"
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${CATEGORY_COLORS[quote.category] || "bg-gray-100 text-gray-700"}`}>
                                                    {CATEGORY_LABELS[quote.category] || quote.category}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {formatDate(quote.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {expandedId === quote._id && (
                                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                                            <div className="text-sm">
                                                <span className="text-gray-500">User Email:</span>
                                                <span className="text-gray-900 ml-2 break-all">{quote.user?.email || "N/A"}</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 pt-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedQuote(quote);
                                                        setShowDetailsModal(true);
                                                    }}
                                                    className="flex-1 py-2 text-center text-sm text-blue-600 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                                                >
                                                    <Eye size={14} className="inline mr-1" />
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedQuote(quote);
                                                        setShowApproveModal(true);
                                                    }}
                                                    className="flex-1 py-2 text-center text-sm text-green-600 font-medium border border-green-200 rounded-lg hover:bg-green-50 transition cursor-pointer"
                                                >
                                                    <CheckCircle size={14} className="inline mr-1" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedQuote(quote);
                                                        setShowRejectModal(true);
                                                    }}
                                                    className="flex-1 py-2 text-center text-sm text-red-600 font-medium border border-red-200 rounded-lg hover:bg-red-50 transition cursor-pointer"
                                                >
                                                    <XCircle size={14} className="inline mr-1" />
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedQuote(quote);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Enhanced Pagination Section */}
                        <div className="relative z-20 overflow-visible flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50">
                            {/* Items per page selector */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Show:</span>
                                <ItemsPerPageSelect
                                    value={itemsPerPage}
                                    onChange={handleItemsPerPageChange}
                                    options={[
                                        { value: 5, label: "5" },
                                        { value: 10, label: "10" },
                                        { value: 20, label: "20" },
                                        { value: 50, label: "50" },
                                    ]}
                                />
                                <span className="text-sm text-gray-600">per page</span>
                            </div>

                            {/* Pagination buttons */}
                            {totalPages > 1 && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={goToFirstPage}
                                        disabled={currentPage === 1}
                                        className={`p-2 rounded-md transition-all duration-200 ${currentPage === 1
                                            ? "text-gray-300 cursor-not-allowed"
                                            : "text-gray-600 hover:bg-gray-100 cursor-pointer"
                                            }`}
                                        aria-label="First page"
                                    >
                                        <ChevronsLeft className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={goToPreviousPage}
                                        disabled={currentPage === 1}
                                        className={`p-2 rounded-md transition-all duration-200 ${currentPage === 1
                                            ? "text-gray-300 cursor-not-allowed"
                                            : "text-gray-600 hover:bg-gray-100 cursor-pointer"
                                            }`}
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>

                                    {getPageNumbers().map((page, index) => (
                                        page === '...' ? (
                                            <span key={`dots-${index}`} className="px-3 py-1 text-gray-400">
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={page}
                                                onClick={() => goToPage(page)}
                                                className={`min-w-[36px] h-9 px-3 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${currentPage === page
                                                    ? "bg-gray-900 text-white"
                                                    : "text-gray-600 hover:bg-gray-100"
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    ))}

                                    <button
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages}
                                        className={`p-2 rounded-md transition-all duration-200 ${currentPage === totalPages
                                            ? "text-gray-300 cursor-not-allowed"
                                            : "text-gray-600 hover:bg-gray-100 cursor-pointer"
                                            }`}
                                        aria-label="Next page"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={goToLastPage}
                                        disabled={currentPage === totalPages}
                                        className={`p-2 rounded-md transition-all duration-200 ${currentPage === totalPages
                                            ? "text-gray-300 cursor-not-allowed"
                                            : "text-gray-600 hover:bg-gray-100 cursor-pointer"
                                            }`}
                                        aria-label="Last page"
                                    >
                                        <ChevronsRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Info text */}
                            <div className="text-sm text-gray-500">
                                Showing {quotes.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                                {Math.min(currentPage * itemsPerPage, totalQuotes)} of {totalQuotes} pending quotes
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            <ApproveModal
                isOpen={showApproveModal}
                onClose={() => {
                    setShowApproveModal(false);
                    setSelectedQuote(null);
                }}
                quote={selectedQuote}
                onConfirm={handleApprove}
            />

            <RejectModal
                isOpen={showRejectModal}
                onClose={() => {
                    setShowRejectModal(false);
                    setSelectedQuote(null);
                }}
                quote={selectedQuote}
                onConfirm={handleReject}
            />

            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedQuote(null);
                }}
                quote={selectedQuote}
                onConfirm={handleDelete}
            />

            <QuoteDetailsModal
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedQuote(null);
                }}
                quote={selectedQuote}
            />
        </div>
    );
}