import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { CheckCircle, ChevronDown, ChevronUp, Clock, Eye, MessageSquare, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function UserQuotesList() {
    const { user } = useAuthStore();
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedQuote, setExpandedQuote] = useState(null);
    const [showAllQuotes, setShowAllQuotes] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalQuotes, setTotalQuotes] = useState(0);
    const [isLoadingPage, setIsLoadingPage] = useState(false);
    const QUOTES_PER_PAGE = 5;

    const fetchUserQuotes = async (pageNum = 1, replace = true) => {
        try {
            if (replace) {
                setLoading(true);
            } else {
                setIsLoadingPage(true);
            }
            
            const response = await api.get(`/pending-quotes/my-quotes?page=${pageNum}&limit=${QUOTES_PER_PAGE}`);
            const newQuotes = response.data.data || [];
            const total = response.data.meta?.total || 0;
            
            if (replace) {
                setQuotes(newQuotes);
            } else {
                setQuotes(newQuotes);
            }
            
            setTotalQuotes(total);
            setCurrentPage(pageNum);
        } catch (error) {
            console.error("Error fetching quotes:", error);
            toast.error("Failed to load your quotes");
        } finally {
            setLoading(false);
            setIsLoadingPage(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUserQuotes(1, true);
        }
    }, [user]);

    const goToPage = (pageNum) => {
        if (pageNum !== currentPage && pageNum >= 1 && pageNum <= totalPages) {
            fetchUserQuotes(pageNum, true);
            // Scroll to top of quotes section
            document.getElementById('quotes-section')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const toggleShowAll = () => {
        if (!showAllQuotes) {
            // Reset to first page when expanding
            setCurrentPage(1);
            fetchUserQuotes(1, true);
        }
        setShowAllQuotes(!showAllQuotes);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "approved":
                return {
                    icon: <CheckCircle size={14} />,
                    text: "Approved",
                    color: "bg-green-100 text-green-700 border-green-200"
                };
            case "rejected":
                return {
                    icon: <XCircle size={14} />,
                    text: "Rejected",
                    color: "bg-red-100 text-red-700 border-red-200"
                };
            default:
                return {
                    icon: <Clock size={14} />,
                    text: "Pending",
                    color: "bg-yellow-100 text-yellow-700 border-yellow-200"
                };
        }
    };

    // Calculate total pages
    const totalPages = Math.ceil(totalQuotes / QUOTES_PER_PAGE);

    if (loading && quotes.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-gray-500">Loading your quotes...</p>
            </div>
        );
    }

    if (quotes.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl cursor-pointer">
                <MessageSquare size={48} className="mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No quotes yet</h3>
                <p className="text-gray-500">You haven't submitted any quotes yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4" id="quotes-section">
            <button
                onClick={toggleShowAll}
                className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
                <h2 className="text-xl font-semibold text-gray-900">
                    My Submitted Quotes ({totalQuotes})
                </h2>
                <div className="flex items-center gap-2 text-gray-500 group-hover:text-gray-700">
                    <span className="text-sm">
                        {showAllQuotes ? "Show Less" : "Show All"}
                    </span>
                    {showAllQuotes ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </button>
            
            {showAllQuotes && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    {/* Loading indicator for page change */}
                    {isLoadingPage && (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            <p className="mt-2 text-gray-500">Loading page {currentPage}...</p>
                        </div>
                    )}
                    
                    {/* Quotes List */}
                    {!isLoadingPage && quotes.map((quote) => {
                        const statusBadge = getStatusBadge(quote.status);
                        return (
                            <div
                                key={quote._id}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <p className="text-gray-800 leading-relaxed">{quote.text}</p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                                                {statusBadge.icon}
                                                {statusBadge.text}
                                            </span>
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                {quote.category}
                                            </span>
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                                {new Date(quote.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* View Admin Note Button */}
                                    {quote.adminNote && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedQuote(expandedQuote === quote._id ? null : quote._id);
                                            }}
                                            className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                            title="View admin note"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    )}
                                </div>
                                
                                {/* Admin Note Section */}
                                {expandedQuote === quote._id && quote.adminNote && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
                                        <p className="text-xs font-semibold text-gray-600 mb-1">Admin Note:</p>
                                        <p className="text-sm text-gray-700">{quote.adminNote}</p>
                                        {quote.approvedAt && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                Approved on: {new Date(quote.approvedAt).toLocaleDateString()} at {new Date(quote.approvedAt).toLocaleTimeString()}
                                            </p>
                                        )}
                                        {quote.rejectedAt && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                Rejected on: {new Date(quote.rejectedAt).toLocaleDateString()} at {new Date(quote.rejectedAt).toLocaleTimeString()}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                    {/* Pagination Controls - Only show if more than 1 page */}
                    {totalPages > 1 && !isLoadingPage && (
                        <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md hover:bg-gray-50 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            
                            <div className="flex items-center gap-1">
                                {/* First page */}
                                {currentPage > 2 && (
                                    <>
                                        <button
                                            onClick={() => goToPage(1)}
                                            className="min-w-[32px] h-8 px-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-all duration-200 cursor-pointer"
                                        >
                                            1
                                        </button>
                                        {currentPage > 3 && <span className="text-gray-400">...</span>}
                                    </>
                                )}
                                
                                {/* Previous page */}
                                {currentPage > 1 && (
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        className="min-w-[32px] h-8 px-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-all duration-200 cursor-pointer"
                                    >
                                        {currentPage - 1}
                                    </button>
                                )}
                                
                                {/* Current page */}
                                <button
                                    className="min-w-[32px] h-8 px-2 text-sm bg-gray-900 text-white rounded-md cursor-default"
                                >
                                    {currentPage}
                                </button>
                                
                                {/* Next page */}
                                {currentPage < totalPages && (
                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        className="min-w-[32px] h-8 px-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-all duration-200 cursor-pointer"
                                    >
                                        {currentPage + 1}
                                    </button>
                                )}
                                
                                {/* Last page */}
                                {currentPage < totalPages - 1 && (
                                    <>
                                        {currentPage < totalPages - 2 && <span className="text-gray-400">...</span>}
                                        <button
                                            onClick={() => goToPage(totalPages)}
                                            className="min-w-[32px] h-8 px-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-all duration-200 cursor-pointer"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}
                            </div>
                            
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md hover:bg-gray-50 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                    
                    {/* Showing info */}
                    {totalQuotes > 0 && !isLoadingPage && (
                        <p className="text-center text-xs text-gray-500 mt-2">
                            Showing {((currentPage - 1) * QUOTES_PER_PAGE) + 1} - {Math.min(currentPage * QUOTES_PER_PAGE, totalQuotes)} of {totalQuotes} quotes
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}