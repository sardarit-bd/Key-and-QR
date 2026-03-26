"use client";

import api from "@/lib/api";
import { Archive, Edit, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    id: null,
    type: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewTrash, setViewTrash] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restoreModal, setRestoreModal] = useState({ show: false, id: null });

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, viewTrash]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products", {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          trash: viewTrash,
        },
      });
      setProducts(response.data.data || []);
      setTotalPages(response.data.meta?.totalPage || 1);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle soft delete (move to trash)
  const handleSoftDelete = async () => {
    try {
      await api.delete(`/products/${deleteModal.id}`);
      setDeleteModal({ show: false, id: null, type: null });
      fetchProducts();
    } catch (error) {
      console.error("Error moving product to trash:", error);
    }
  };

  // Handle permanent delete
  const handlePermanentDelete = async () => {
    try {
      await api.delete(`/products/permanent/${deleteModal.id}`);
      setDeleteModal({ show: false, id: null, type: null });
      fetchProducts();
    } catch (error) {
      console.error("Error permanently deleting product:", error);
    }
  };

  // Handle restore
  const handleRestore = async () => {
    try {
      await api.patch(`/products/restore/${restoreModal.id}`);
      setRestoreModal({ show: false, id: null });
      fetchProducts();
    } catch (error) {
      console.error("Error restoring product:", error);
    }
  };

  // Filter products based on search (though we already do on backend)
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex-1 w-full p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            {viewTrash ? "Trash" : "Products"}
          </h1>
          <button
            onClick={() => setViewTrash(!viewTrash)}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition ${viewTrash
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            <Archive size={16} />
            {viewTrash ? "View Products" : "View Trash"}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 w-full sm:w-64"
            />
          </div>

          {/* Add Product Button - only show when not in trash */}
          {!viewTrash && (
            <Link
              href="/dashboard/admin/products/add"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            >
              <Plus size={18} />
              Add Product
            </Link>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-500">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              {viewTrash ? "Trash is empty" : "No products found"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Image
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Name
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Category
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Price
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Stock
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      {product.image?.url ? (
                        <img
                          src={product.image.url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/48?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-gray-400">No img</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.brand}
                      </div>
                      {product.deletedAt && (
                        <div className="text-xs text-red-500 mt-1">
                          Deleted:{" "}
                          {new Date(product.deletedAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {product.category}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">
                      ${product.price}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${product.stock > 0
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                          }`}
                      >
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </span>
                    </td>
                    <td className="p-4">
                      {viewTrash ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setRestoreModal({ show: true, id: product._id })
                            }
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Restore product"
                          >
                            <RotateCcw size={18} />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteModal({
                                show: true,
                                id: product._id,
                                type: "permanent",
                              })
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete permanently"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/admin/products/edit/${product._id}`}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() =>
                              setDeleteModal({
                                show: true,
                                id: product._id,
                                type: "soft",
                              })
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Move to trash"
                          >
                            <Archive size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {deleteModal.type === "permanent"
                ? "Permanently Delete Product"
                : "Move to Trash"}
            </h3>
            <p className="text-gray-600 mb-6">
              {deleteModal.type === "permanent"
                ? "Are you sure you want to permanently delete this product? This action cannot be undone and will remove all images from Cloudinary."
                : "Are you sure you want to move this product to trash? You can restore it later from the trash."}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setDeleteModal({ show: false, id: null, type: null })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={
                  deleteModal.type === "permanent"
                    ? handlePermanentDelete
                    : handleSoftDelete
                }
                className={`px-4 py-2 text-white rounded-lg transition ${deleteModal.type === "permanent"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-orange-600 hover:bg-orange-700"
                  }`}
              >
                {deleteModal.type === "permanent"
                  ? "Permanently Delete"
                  : "Move to Trash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {restoreModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Restore Product
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to restore this product? It will appear in
              the main products list again.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRestoreModal({ show: false, id: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
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
