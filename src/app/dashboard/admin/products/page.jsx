"use client";

import api from "@/services/api";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

    // Fetch products
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get("/products");
            setProducts(response.data.data || []);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        try {
            await api.delete(`/products/${deleteModal.id}`);
            setProducts(products.filter(p => p._id !== deleteModal.id));
            setDeleteModal({ show: false, id: null });
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    // Filter products based on search
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 w-full p-4 lg:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Products</h1>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 w-full sm:w-64"
                        />
                    </div>

                    {/* Add Product Button */}
                    <Link
                        href="/dashboard/admin/products/add"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                    >
                        <Plus size={18} />
                        Add Product
                    </Link>
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
                        <p className="text-gray-500">No products found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left p-4 text-sm font-medium text-gray-600">Image</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-600">Name</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-600">Category</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-600">Price</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-600">Stock</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50 transition">
                                        <td className="p-4">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-12 h-12 object-cover rounded-lg"
                                                onError={(e) => {
                                                    e.target.src = "https://via.placeholder.com/48?text=No+Image";
                                                }}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{product.name}</div>
                                            <div className="text-xs text-gray-500">{product.brand}</div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">{product.category}</td>
                                        <td className="p-4 text-sm font-medium text-gray-900">${product.price}</td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 0
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-red-50 text-red-700'
                                                }`}>
                                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/dashboard/admin/products/edit/${product._id}`}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteModal({ show: true, id: product._id })}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteModal({ show: false, id: null })}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}