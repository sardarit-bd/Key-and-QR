"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Search, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

export default function ViewAllQuotes({ onClose }) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/quotes?limit=500");
      const quoteData = response.data?.data?.data || response.data?.data || [];
      setQuotes(Array.isArray(quoteData) ? quoteData : []);
      setCurrentPage(1); // Reset to first page when new data loads
    } catch (error) {
      console.error("Error fetching quotes:", error);
      toast.error("Failed to load quotes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await api.delete(`/quotes/${id}`);
      toast.success("Quote deleted successfully");
      setDeleteConfirm(null);
      fetchQuotes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete quote");
    } finally {
      setDeleting(false);
    }
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "faith", label: "Faith" },
    { value: "love", label: "Love" },
    { value: "hope", label: "Hope" },
    { value: "success", label: "Success" },
    { value: "motivation", label: "Motivation" },
  ];

  // Filter quotes based on search and category
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = search === "" || 
      quote.text?.toLowerCase().includes(search.toLowerCase()) ||
      quote.author?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = category === "all" || quote.category === category;
    
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalItems = filteredQuotes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQuotes = filteredQuotes.slice(startIndex, endIndex);

  // Handle page change
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category]);

  return (
    <div className="flex-1 w-full min-h-screen ">
      <div className=" p-4 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">All Quotes</h1>
            <p className="text-sm text-gray-500 mt-1">
              Total {totalItems} quote{totalItems !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Filters */}
        {/* <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by quote text or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div> */}

        {/* Quotes Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : currentQuotes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No quotes found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentQuotes.map((quote) => (
                <div
                  key={quote._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition bg-white"
                >
                  {/* Quote Image */}
                  {quote.image?.url && (
                    <div className="mb-3 rounded-lg overflow-hidden h-32 relative">
                      <img
                        src={quote.image.url}
                        alt="Quote"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Quote Text */}
                  <p className="text-gray-900 text-sm mb-2 line-clamp-3">
                    "{quote.text}"
                  </p>
                  
                  {/* Author & Category */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {quote.author && quote.author !== "InspireTag" && (
                      <span className="text-xs text-gray-500">— {quote.author}</span>
                    )}
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                      {quote.category}
                    </span>
                    {!quote.allowReuse && (
                      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                        One-time use
                      </span>
                    )}
                    {!quote.isActive && (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  
                  {/* Description */}
                  {quote.description && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                      {quote.description}
                    </p>
                  )}
                  
                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => setDeleteConfirm(quote)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                      title="Delete quote"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 bg-opacity-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Quote</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{deleteConfirm.text.substring(0, 100)}..."?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 cursor-pointer"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}