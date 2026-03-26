import { Calendar, ExternalLink, QrCode, User, Power, PowerOff, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import StatusBadge from "./StatusBadge";
import SubscriptionBadge from "./SubscriptionBadge";

export default function TagsTable({
    tags,
    onShowQR,
    onRefresh,
    currentPage,
    totalPages,
    onPageChange
}) {
    const [updating, setUpdating] = useState(null);
    const [subscriptionUpdating, setSubscriptionUpdating] = useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Toggle active/inactive status
    const handleToggleActive = async (tag) => {
        setUpdating(tag._id);
        try {
            const response = await api.patch(`/tags/${tag._id}`, {
                isActive: !tag.isActive
            });
            if (response.data.success) {
                toast.success(`Tag ${!tag.isActive ? "enabled" : "disabled"} successfully`);
                onRefresh();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update tag status");
        } finally {
            setUpdating(null);
        }
    };

    // Update subscription type
    const handleSubscriptionChange = async (tagId, newType) => {
        setSubscriptionUpdating(tagId);
        try {
            const response = await api.patch(`/tags/${tagId}`, {
                subscriptionType: newType
            });
            if (response.data.success) {
                toast.success(`Subscription type updated to ${newType}`);
                onRefresh();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update subscription");
        } finally {
            setSubscriptionUpdating(null);
        }
    };

    if (tags.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
                No tags found
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tag Code</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Owner</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Activation</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Subscription</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Activated At</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {tags.map((tag) => (
                            <tr key={tag._id} className="hover:bg-gray-50 transition">
                                {/* Tag Code */}
                                <td className="px-6 py-4">
                                    <span className="font-mono text-sm font-medium text-gray-900">
                                        {tag.tagCode}
                                    </span>
                                </td>

                                {/* Owner */}
                                <td className="px-6 py-4">
                                    {tag.owner ? (
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">
                                                {tag.owner.name || tag.owner.email}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400">Unassigned</span>
                                    )}
                                </td>

                                {/* Status (Active/Inactive) */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${tag.isActive
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                            }`}>
                                            {tag.isActive ? <Power size={10} /> : <PowerOff size={10} />}
                                            {tag.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </td>

                                {/* Activation Status */}
                                <td className="px-6 py-4">
                                    <StatusBadge tag={tag} />
                                </td>

                                {/* Subscription Type - Editable */}
                                <td className="px-6 py-4">
                                    <select
                                        value={tag.subscriptionType}
                                        onChange={(e) => handleSubscriptionChange(tag._id, e.target.value)}
                                        disabled={subscriptionUpdating === tag._id}
                                        className={`text-xs px-2 py-1 rounded-full border-0 focus:ring-2 cursor-pointer ${tag.subscriptionType === "subscriber"
                                                ? "bg-purple-100 text-purple-800"
                                                : "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        <option value="free">Free</option>
                                        <option value="subscriber">Subscriber</option>
                                    </select>
                                    {subscriptionUpdating === tag._id && (
                                        <span className="ml-2 text-xs text-gray-400">Updating...</span>
                                    )}
                                </td>

                                {/* Created Date */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12} className="text-gray-400" />
                                        <span className="text-sm text-gray-600">
                                            {formatDate(tag.createdAt)}
                                        </span>
                                    </div>
                                </td>

                                {/* Activated At */}
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-600">
                                        {tag.activatedAt ? formatDate(tag.activatedAt) : "—"}
                                    </span>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {/* View QR */}
                                        <button
                                            onClick={() => onShowQR(tag)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                                            title="Show QR Code"
                                        >
                                            <QrCode size={18} />
                                        </button>

                                        {/* Open Tag */}
                                        <Link
                                            href={`/t/${tag.tagCode}`}
                                            target="_blank"
                                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition"
                                            title="Open Tag"
                                        >
                                            <ExternalLink size={18} />
                                        </Link>

                                        {/* Enable/Disable Toggle */}
                                        <button
                                            onClick={() => handleToggleActive(tag)}
                                            disabled={updating === tag._id}
                                            className={`p-1.5 rounded transition cursor-pointer ${tag.isActive
                                                    ? "text-red-600 hover:bg-red-50"
                                                    : "text-green-600 hover:bg-green-50"
                                                }`}
                                            title={tag.isActive ? "Disable Tag" : "Enable Tag"}
                                        >
                                            {updating === tag._id ? (
                                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                            ) : tag.isActive ? (
                                                <PowerOff size={16} />
                                            ) : (
                                                <Power size={16} />
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition ${currentPage === 1
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <ChevronLeft size={14} />
                            Previous
                        </button>
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition ${currentPage === totalPages
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            Next
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}