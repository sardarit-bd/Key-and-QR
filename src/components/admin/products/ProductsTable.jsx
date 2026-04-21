"use client";

import Link from "next/link";
import { Archive, Edit, RotateCcw, Trash2, Eye } from "lucide-react";
import ProductsPagination from "./ProductsPagination";

export default function ProductsTable({
    products,
    viewTrash,
    onRestore,
    onSoftDelete,
    onPermanentDelete,
    currentPage,
    totalPages,
    onPageChange
}) {
    if (products.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
                {viewTrash ? "Trash is empty" : "No products found"}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Image</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stock</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product._id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    {product.image?.url ? (
                                        <img
                                            src={product.image.url}
                                            alt={product.name}
                                            className="w-12 h-12 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.target.src = "https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image";
                                            }}
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <span className="text-xs text-gray-400">No img</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{product.name}</div>
                                    <div className="text-xs text-gray-500">{product.brand}</div>
                                    {product.deletedAt && (
                                        <div className="text-xs text-red-500 mt-1">
                                            Deleted: {new Date(product.deletedAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">${product.price}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${product.stock > 0
                                            ? product.stock <= 2
                                                ? "bg-orange-50 text-orange-700"
                                                : "bg-green-50 text-green-700"
                                            : "bg-red-50 text-red-700"
                                            }`}
                                    >
                                        {product.stock > 0
                                            ? product.stock <= 2
                                                ? `Only ${product.stock} left`
                                                : `${product.stock} in stock`
                                            : "Out of stock"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/dashboard/admin/products/${product._id}`}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </Link>

                                        {viewTrash ? (
                                            <>
                                                <button
                                                    onClick={() => onRestore(product._id)}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition cursor-pointer"
                                                    title="Restore product"
                                                >
                                                    <RotateCcw size={18} />
                                                </button>
                                                <button
                                                    onClick={() => onPermanentDelete(product._id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                                                    title="Delete permanently"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    href={`/dashboard/admin/products/edit/${product._id}`}
                                                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition"
                                                    title="Edit product"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => onSoftDelete(product._id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                                                    title="Move to trash"
                                                >
                                                    <Archive size={18} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <ProductsPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
            </div>
        </div>
    );
}