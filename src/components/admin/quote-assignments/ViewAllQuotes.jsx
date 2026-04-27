"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import DeleteConfirmModal from "./DeleteConfirmModal";
import MobilePreview from "./ViewAllQuotes/MobilePreview";
import QuoteEditModal from "./ViewAllQuotes/QuoteEditModal";
import QuoteCard from "./ViewAllQuotes/QuoteCard";

export default function ViewAllQuotes({ onClose }) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [editingQuote, setEditingQuote] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showMobilePreview, setShowMobilePreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/quotes?limit=500");
      const quoteData = response.data?.data?.data || response.data?.data || [];
      setQuotes(Array.isArray(quoteData) ? quoteData : []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      toast.error("Failed to load quotes");
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateQuote = async () => {
    await fetchQuotes();
    setEditingQuote(null);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/quotes/${id}`);
      toast.success("Quote deleted successfully");
      await fetchQuotes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete quote");
    }
    setDeleteConfirm(null);
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "faith", label: "Faith" },
    { value: "love", label: "Love" },
    { value: "hope", label: "Hope" },
    { value: "success", label: "Success" },
    { value: "motivation", label: "Motivation" },
  ];

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = search === "" ||
      quote.text?.toLowerCase().includes(search.toLowerCase()) ||
      quote.author?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || quote.category === category;
    return matchesSearch && matchesCategory;
  });

  const totalItems = filteredQuotes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentQuotes = filteredQuotes.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category]);

  return (
    <div className="flex-1 w-full min-h-screen bg-gray-50">
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition cursor-pointer"
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
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
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
        </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentQuotes.map((quote) => (
                <QuoteCard
                  key={quote._id}
                  quote={quote}
                  onEdit={() => setEditingQuote(quote)}
                  onDelete={() => setDeleteConfirm(quote)}
                  onPreview={() => setShowMobilePreview(quote)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 cursor-pointer"
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 cursor-pointer"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {editingQuote && (
        <QuoteEditModal
          quote={editingQuote}
          onClose={() => setEditingQuote(null)}
          onSave={handleUpdateQuote}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          quote={deleteConfirm}
          onConfirm={() => handleDelete(deleteConfirm._id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {showMobilePreview && (
        <MobilePreview
          quote={showMobilePreview}
          onClose={() => setShowMobilePreview(null)}
        />
      )}
    </div>
  );
}