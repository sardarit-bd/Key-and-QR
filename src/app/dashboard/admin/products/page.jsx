"use client";

import api from "@/lib/api";
import Loader from "@/shared/Loader";
import { useAuthStore } from "@/store/authStore";
import { Archive, Plus, Search, Mail, X, Filter, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { FaGoogle } from "react-icons/fa";
import useAuthInit from "@/hooks/useAuthInit";
import ProductsTable from "@/components/admin/products/ProductsTable";

export default function ProductsPage() {
  useAuthInit();
  const { user, isInitialized } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, type: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewTrash, setViewTrash] = useState(false);
  const [restoreModal, setRestoreModal] = useState({ show: false, id: null });
  const [isSearching, setIsSearching] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  const itemsPerPage = 10;
  const searchInputRef = useRef(null);

  const getProviderInfo = () => {
    if (user?.provider === "google") {
      return { icon: <FaGoogle size={14} className="text-blue-500" />, text: "Google" };
    }
    return { icon: <Mail size={14} className="text-gray-500" />, text: "Email" };
  };

  const providerInfo = getProviderInfo();

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem("productSearchHistory");
    if (savedSearches) {
      try {
        const parsed = JSON.parse(savedSearches);
        setSearchHistory(parsed.slice(0, 5));
      } catch (e) {
        console.error("Error loading search history", e);
      }
    }
  }, []);

  // Save search term to history
  const saveToSearchHistory = (term) => {
    if (!term || term.trim() === "") return;
    
    setSearchHistory(prev => {
      const newHistory = [term, ...prev.filter(t => t !== term)].slice(0, 5);
      localStorage.setItem("productSearchHistory", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const fetchProducts = useCallback(async () => {
    if (!user || user.role !== "admin") return;

    try {
      setLoading(true);
      const response = await api.get("/products", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: activeSearchTerm,
          trash: viewTrash,
        },
      });

      setProducts(response.data.data || []);
      setTotalPages(response.data.meta?.totalPage || 1);
      setTotalProducts(response.data.meta?.total || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [currentPage, activeSearchTerm, viewTrash, user]);

  // Fetch products when active search term changes
  useEffect(() => {
    if (!isInitialized) return;
    if (!user) return;
    if (user.role !== "admin") return;
    
    fetchProducts();
  }, [fetchProducts, isInitialized, user, activeSearchTerm]);

  const handleSoftDelete = async (id) => {
    setDeleteModal({ show: true, id, type: "soft" });
  };

  const handlePermanentDelete = async (id) => {
    setDeleteModal({ show: true, id, type: "permanent" });
  };

  const handleRestore = async (id) => {
    setRestoreModal({ show: true, id });
  };

  const confirmSoftDelete = async () => {
    try {
      await api.delete(`/products/${deleteModal.id}`);
      setDeleteModal({ show: false, id: null, type: null });
      fetchProducts();
    } catch (error) {
      console.error("Error moving product to trash:", error);
    }
  };

  const confirmPermanentDelete = async () => {
    try {
      await api.delete(`/products/permanent/${deleteModal.id}`);
      setDeleteModal({ show: false, id: null, type: null });
      fetchProducts();
    } catch (error) {
      console.error("Error permanently deleting product:", error);
    }
  };

  const confirmRestore = async () => {
    try {
      await api.patch(`/products/restore/${restoreModal.id}`);
      setRestoreModal({ show: false, id: null });
      fetchProducts();
    } catch (error) {
      console.error("Error restoring product:", error);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle search on button click or Enter key
  const performSearch = () => {
    if (searchTerm.trim() === "") {
      // If search is empty, clear active search
      setActiveSearchTerm("");
      setCurrentPage(1);
      setShowRecentSearches(false);
      return;
    }
    
    setIsSearching(true);
    setActiveSearchTerm(searchTerm);
    setCurrentPage(1);
    saveToSearchHistory(searchTerm);
    setShowRecentSearches(false);
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

  const handleRecentSearchClick = (term) => {
    setSearchTerm(term);
    setActiveSearchTerm(term);
    setCurrentPage(1);
    setShowRecentSearches(false);
    setIsSearching(true);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("productSearchHistory");
    setShowRecentSearches(false);
  };

  // Show loader only on initial load
  if (!isInitialized || (loading && products.length === 0 && !activeSearchTerm)) {
    return <Loader text="Qkey..." size={50} fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {viewTrash ? "Trash" : "Products"}
                </h1>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                  {providerInfo.icon}
                  <span className="text-gray-600">{providerInfo.text} Admin</span>
                </div>
              </div>
              <p className="text-gray-600 mt-1">
                {viewTrash ? "Restore or permanently delete products" : "Manage all products"}
                {totalProducts > 0 && !viewTrash && <span className="ml-2 text-sm">({totalProducts} total products)</span>}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setViewTrash(!viewTrash);
                  setCurrentPage(1);
                  setSearchTerm("");
                  setActiveSearchTerm("");
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
                  viewTrash
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Archive size={18} />
                {viewTrash ? "View Products" : "View Trash"}
              </button>

              {!viewTrash && (
                <Link
                  href="/dashboard/admin/products/add"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition cursor-pointer"
                >
                  <Plus size={18} />
                  Add Product
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Search Section with Search Button */}
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              {/* Search Icon */}
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              
              {/* Search Input */}
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by product name, brand, or category..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowRecentSearches(true)}
                onBlur={() => setTimeout(() => setShowRecentSearches(false), 200)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition"
              />
              
              {/* Clear Button */}
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition cursor-pointer"
                  title="Clear search"
                >
                  <X size={16} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}

              {/* Recent Searches Dropdown */}
              {showRecentSearches && searchHistory.length > 0 && !searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-500" />
                      <span className="text-xs font-medium text-gray-600">Recent Searches</span>
                    </div>
                    <button
                      onClick={handleClearHistory}
                      className="text-xs text-red-600 hover:text-red-700 transition"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {searchHistory.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearchClick(term)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 transition flex items-center gap-2 group cursor-pointer"
                      >
                        <Search size={14} className="text-gray-400 group-hover:text-gray-600" />
                        <span className="text-sm text-gray-700">{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Button */}
            <button
              onClick={performSearch}
              disabled={isSearching}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>

          {/* Active Search Indicator */}
          {activeSearchTerm && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
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
              {totalProducts > 0 && (
                <span className="text-sm text-gray-500">
                  Found {totalProducts} result{totalProducts !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          {/* Popular Search Suggestions */}
          {!activeSearchTerm && !viewTrash && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Filter size={12} />
                Popular searches:
              </span>
              {["Qkey", "Smart", "Classic", "Premium", "Keychain"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleRecentSearchClick(suggestion)}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading overlay for table only (not full page) */}
        {loading && products.length > 0 && (
          <div className="relative">
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-lg">
              <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600">Updating products...</span>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <ProductsTable
          products={products}
          viewTrash={viewTrash}
          onRestore={handleRestore}
          onSoftDelete={handleSoftDelete}
          onPermanentDelete={handlePermanentDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        {/* Empty State with Search Suggestion */}
        {products.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200 mt-4">
            {activeSearchTerm ? (
              <>
                <Search size={48} className="mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
                <p className="text-gray-500 mb-4">
                  No results found for "{activeSearchTerm}"
                </p>
                <button
                  onClick={handleClearSearch}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <Archive size={48} className="mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No products available</h3>
                <p className="text-gray-500">
                  {viewTrash ? "Trash is empty" : "Start by adding your first product"}
                </p>
                {!viewTrash && (
                  <Link
                    href="/dashboard/admin/products/add"
                    className="inline-block mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    <Plus size={18} className="inline mr-1" />
                    Add Product
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {deleteModal.type === "permanent" ? "Permanently Delete Product" : "Move to Trash"}
            </h3>
            <p className="text-gray-600 mb-6">
              {deleteModal.type === "permanent"
                ? "Are you sure you want to permanently delete this product? This action cannot be undone."
                : "Are you sure you want to move this product to trash? You can restore it later."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, id: null, type: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={deleteModal.type === "permanent" ? confirmPermanentDelete : confirmSoftDelete}
                className={`px-4 py-2 text-white rounded-lg transition cursor-pointer ${
                  deleteModal.type === "permanent"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                {deleteModal.type === "permanent" ? "Permanently Delete" : "Move to Trash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {restoreModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Restore Product</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to restore this product? It will appear in the main products list again.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRestoreModal({ show: false, id: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmRestore}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}