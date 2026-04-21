import { Calendar, ExternalLink, QrCode, User, Power, PowerOff, ChevronLeft, ChevronRight, Mail, AlertCircle } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import StatusBadge from "./StatusBadge";
import SubscriptionTypeSelect from "./SubscriptionTypeSelect";

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
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingTag, setPendingTag] = useState(null);
    const [pendingAction, setPendingAction] = useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getOwnerProviderIcon = (owner) => {
        if (!owner) return null;
        if (owner.provider === "google") {
            return <FaGoogle size={10} className="text-blue-500 ml-1 flex-shrink-0" />;
        }
        return <Mail size={10} className="text-gray-400 ml-1 flex-shrink-0" />;
    };

    const checkTagAssignment = async (tagId) => {
        try {
            const response = await api.get(`/orders/admin/all?limit=100`);
            const orders = response.data?.data || [];
            
            const isAssigned = orders.some(order => {
                const assignedTag = order.assignedTag?._id || order.assignedTag;
                return assignedTag === tagId && 
                       !["cancelled", "returned", "delivered"].includes(order.fulfillmentStatus);
            });
            
            return isAssigned;
        } catch (error) {
            console.error("Error checking tag assignment:", error);
            return false;
        }
    };

    const handleToggleActive = async (tag) => {
        if (tag.isActive && tag.isActivated) {
            const isAssignedToOrder = await checkTagAssignment(tag._id);
            if (isAssignedToOrder) {
                toast.error(
                    "Cannot disable this tag because it is currently assigned to an active order. " +
                    "Please complete or cancel the order first.",
                    { duration: 5000 }
                );
                return;
            }
        }
        
        setPendingTag(tag);
        setPendingAction(!tag.isActive ? "enable" : "disable");
        setShowConfirmModal(true);
    };

    const confirmToggle = async () => {
        if (!pendingTag) return;
        
        setUpdating(pendingTag._id);
        try {
            const response = await api.patch(`/tags/${pendingTag._id}`, {
                isActive: !pendingTag.isActive
            });
            if (response.data.success) {
                toast.success(`Tag ${!pendingTag.isActive ? "enabled" : "disabled"} successfully`);
                onRefresh();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update tag status");
        } finally {
            setUpdating(null);
            setShowConfirmModal(false);
            setPendingTag(null);
            setPendingAction(null);
        }
    };

    const handleSubscriptionChange = async (tagId, newType) => {
        setSubscriptionUpdating(tagId);
        try {
            const response = await api.patch(`/tags/${tagId}`, {
                subscriptionType: newType
            });
            if (response.data.success) {
                toast.success(`Subscription type updated to ${newType === "subscriber" ? "Subscriber" : "Free"}`);
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
        <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs md:text-sm font-semibold text-gray-900">Tag Code</th>
                                <th className="px-3 py-3 text-left text-xs md:text-sm font-semibold text-gray-900">Owner</th>
                                <th className="px-3 py-3 text-left text-xs md:text-sm font-semibold text-gray-900">Status</th>
                                <th className="px-3 py-3 text-left text-xs md:text-sm font-semibold text-gray-900">Activation</th>
                                <th className="px-3 py-3 text-left text-xs md:text-sm font-semibold text-gray-900">Subscription</th>
                                <th className="px-3 py-3 text-left text-xs md:text-sm font-semibold text-gray-900">Created</th>
                                <th className="px-3 py-3 text-left text-xs md:text-sm font-semibold text-gray-900">Activated At</th>
                                <th className="px-3 py-3 text-left text-xs md:text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {tags.map((tag) => (
                                <tr key={tag._id} className="hover:bg-gray-50 transition">
                                    <td className="px-3 py-3">
                                        <span className="font-mono text-xs md:text-sm font-medium text-gray-900 break-all">
                                            {tag.tagCode}
                                        </span>
                                    </td>

                                    <td className="px-3 py-3">
                                        {tag.owner ? (
                                            <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                                                <User size={12} className="text-gray-400 flex-shrink-0" />
                                                <span className="text-xs md:text-sm text-gray-600 break-all">
                                                    {tag.owner.name || tag.owner.email}
                                                </span>
                                                {getOwnerProviderIcon(tag.owner)}
                                            </div>
                                        ) : (
                                            <span className="text-xs md:text-sm text-gray-400">Unassigned</span>
                                        )}
                                    </td>

                                    <td className="px-3 py-3">
                                        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                                            <span className={`inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 text-xs font-medium rounded-full ${
                                                tag.isActive
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}>
                                                {tag.isActive ? <Power size={10} /> : <PowerOff size={10} />}
                                                {tag.isActive ? "Active" : "Inactive"}
                                            </span>
                                            {tag.isActive && tag.isActivated && (
                                                <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                                                    In Use
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-3 py-3">
                                        <StatusBadge tag={tag} />
                                    </td>

                                    <td className="px-3 py-3">
                                        <SubscriptionTypeSelect
                                            value={tag.subscriptionType}
                                            onChange={(newType) => handleSubscriptionChange(tag._id, newType)}
                                            isUpdating={subscriptionUpdating === tag._id}
                                            disabled={!tag.isActive}
                                        />
                                    </td>

                                    <td className="px-3 py-3">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} className="text-gray-400 flex-shrink-0" />
                                            <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">
                                                {formatDate(tag.createdAt)}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-3 py-3">
                                        <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">
                                            {tag.activatedAt ? formatDate(tag.activatedAt) : "—"}
                                        </span>
                                    </td>

                                    <td className="px-3 py-3">
                                        <div className="flex gap-1 md:gap-2">
                                            <button
                                                onClick={() => onShowQR(tag)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                                                title="Show QR Code"
                                            >
                                                <QrCode size={16} />
                                            </button>

                                            <Link
                                                href={`/t/${tag.tagCode}`}
                                                target="_blank"
                                                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition"
                                                title="Open Tag"
                                            >
                                                <ExternalLink size={16} />
                                            </Link>

                                            <button
                                                onClick={() => handleToggleActive(tag)}
                                                disabled={updating === tag._id}
                                                className={`p-1.5 rounded transition cursor-pointer ${
                                                    tag.isActive
                                                        ? "text-red-600 hover:bg-red-50"
                                                        : "text-green-600 hover:bg-green-50"
                                                }`}
                                                title={tag.isActive ? "Disable Tag" : "Enable Tag"}
                                            >
                                                {updating === tag._id ? (
                                                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                                ) : tag.isActive ? (
                                                    <PowerOff size={14} />
                                                ) : (
                                                    <Power size={14} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 bg-gray-50 flex-wrap gap-2">
                        <div className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition cursor-pointer ${
                                    currentPage === 1
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
                                className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition cursor-pointer ${
                                    currentPage === totalPages
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

            {/* Confirmation Modal for Disable/Enable */}
            {showConfirmModal && pendingTag && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-full ${
                                    pendingAction === "disable" ? "bg-red-100" : "bg-green-100"
                                }`}>
                                    <AlertCircle size={24} className={pendingAction === "disable" ? "text-red-600" : "text-green-600"} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {pendingAction === "disable" ? "Disable Tag" : "Enable Tag"}
                                </h3>
                            </div>
                            
                            <p className="text-gray-600 mb-6">
                                {pendingAction === "disable" 
                                    ? `Are you sure you want to disable tag "${pendingTag.tagCode}"? 
                                       Disabled tags cannot be activated or assigned to orders.`
                                    : `Are you sure you want to enable tag "${pendingTag.tagCode}"? 
                                       This tag will become available for assignment.`
                                }
                            </p>
                            
                            {pendingAction === "disable" && pendingTag.isActivated && (
                                <div className="mb-6 p-3 bg-yellow-50 rounded-lg">
                                    <p className="text-sm text-yellow-700">
                                        ⚠️ Warning: This tag is currently activated and may be assigned to an order.
                                        Disabling it could affect the user experience.
                                    </p>
                                </div>
                            )}
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={confirmToggle}
                                    className={`flex-1 py-2 rounded-lg text-white transition cursor-pointer ${
                                        pendingAction === "disable"
                                            ? "bg-red-600 hover:bg-red-700"
                                            : "bg-green-600 hover:bg-green-700"
                                    }`}
                                >
                                    Yes, {pendingAction === "disable" ? "Disable" : "Enable"}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        setPendingTag(null);
                                        setPendingAction(null);
                                    }}
                                    className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}