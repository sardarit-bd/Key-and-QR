"use client";

import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Package, RefreshCw, XCircle, Mail, Search, X } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import OrderDetailsModal from "@/components/admin/orders/OrderDetailsModal";
import AssignTagModal from "@/components/admin/orders/AssignTagModal";
import OrderMobileCard from "@/components/admin/orders/OrderMobileCard";
import OrdersTable from "@/components/admin/orders/OrdersTable";
import OrderStatsCards from "@/components/admin/orders/OrderStatsCards";
import CancelOrderModal from "@/components/admin/orders/CancelOrderModal";
import ProcessRefundModal from "@/components/admin/orders/ProcessRefundModal";
import ProcessReturnModal from "@/components/admin/orders/ProcessReturnModal";
import Loader from "@/shared/Loader";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingTags, setLoadingTags] = useState(false);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showTagModal, setShowTagModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState("");
    const [assigningTag, setAssigningTag] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusUpdateOrder, setStatusUpdateOrder] = useState(null);
    const [processingAction, setProcessingAction] = useState(false);

    // Search and Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [activeSearchTerm, setActiveSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [isSearching, setIsSearching] = useState(false);
    const itemsPerPage = 10;
    const searchInputRef = useRef(null);

    const { user, isInitialized } = useAuthStore();

    const getProviderInfo = () => {
        if (user?.provider === "google") {
            return { icon: <FaGoogle size={14} className="text-blue-500" />, text: "Google" };
        }
        return { icon: <Mail size={14} className="text-gray-500" />, text: "Email" };
    };

    const providerInfo = getProviderInfo();

    const [stats, setStats] = useState({
        total: 0, pending: 0, assigned: 0, shipped: 0,
        delivered: 0, cancelled: 0, returned: 0,
        paid: 0, unpaid: 0, refunded: 0
    });

    const fetchOrders = useCallback(async () => {
        if (!user || user.role !== "admin") return;

        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            params.append("page", currentPage);
            params.append("limit", itemsPerPage);
            if (activeSearchTerm) params.append("search", activeSearchTerm);
            if (filterStatus !== "all") params.append("fulfillmentStatus", filterStatus);

            const response = await api.get(`/orders/admin/all?${params.toString()}`);

            setOrders(response.data?.data || []);
            setTotalPages(response.data?.meta?.totalPage || 1);
            setTotalOrders(response.data?.meta?.total || 0);
        } catch (err) {
            console.error("Fetch orders error:", err);
            let errorMessage = "Failed to fetch orders";
            if (err.response?.status === 401) {
                errorMessage = "Session expired. Please login again.";
                toast.error(errorMessage);
                setError(errorMessage);
                setTimeout(() => { window.location.href = "/login"; }, 2000);
            } else if (err.response?.status === 403) {
                errorMessage = "You are not authorized to view orders.";
                toast.error(errorMessage);
                setError(errorMessage);
            } else {
                errorMessage = err.response?.data?.message || "Failed to fetch orders";
                toast.error(errorMessage);
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
            setIsSearching(false);
        }
    }, [user, currentPage, activeSearchTerm, filterStatus]);

    const fetchStats = useCallback(async () => {
        if (!user || user.role !== "admin") return;

        try {
            const response = await api.get("/orders/admin/stats");
            setStats(response.data?.data || stats);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    }, [user]);

    const fetchAvailableTags = async () => {
        try {
            setLoadingTags(true);
            const timestamp = Date.now();
            const response = await api.get(`/tags?limit=1000&unused=true&_=${timestamp}`);

            let tags = [];

            if (response.data && typeof response.data === 'object') {
                if (response.data.data && Array.isArray(response.data.data)) {
                    tags = response.data.data;
                }
                else if (response.data.data?.data && Array.isArray(response.data.data.data)) {
                    tags = response.data.data.data;
                }
                else if (response.data.tags && Array.isArray(response.data.tags)) {
                    tags = response.data.tags;
                }
                else if (Array.isArray(response.data)) {
                    tags = response.data;
                }
                else if (response.data.result && Array.isArray(response.data.result)) {
                    tags = response.data.result;
                }
            }

            if (!Array.isArray(tags)) {
                console.error("Tags is not an array:", tags);
                setAvailableTags([]);
                return;
            }

            const trulyUnusedTags = tags.filter(tag => {
                return tag &&
                    !tag.owner &&
                    tag.isActive === true &&
                    tag.isActivated === false;
            });
            setAvailableTags(trulyUnusedTags);

        } catch (err) {
            console.error("Fetch available tags error:", err);
            toast.error("Failed to fetch available tags");
            setAvailableTags([]);
        } finally {
            setLoadingTags(false);
        }
    };

    // Fetch data on dependency changes
    useEffect(() => {
        if (!isInitialized || !user || user.role !== "admin") return;
        fetchOrders();
    }, [fetchOrders, isInitialized, user]);

    useEffect(() => {
        if (!isInitialized || !user || user.role !== "admin") return;
        fetchStats();
    }, [fetchStats, isInitialized, user]);

    // Search handlers
    const performSearch = () => {
        if (!searchTerm || searchTerm.trim() === "") {
            if (activeSearchTerm !== "") {
                setActiveSearchTerm("");
                setCurrentPage(1);
            }
            return;
        }

        setIsSearching(true);
        setActiveSearchTerm(searchTerm);
        setCurrentPage(1);
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

    const handleRefresh = () => {
        setSearchTerm("");
        setActiveSearchTerm("");
        setFilterStatus("all");
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleOpenTagModal = async (order) => {
        setSelectedOrder(order);
        setSelectedTag("");
        await fetchAvailableTags();
        setShowTagModal(true);
    };

    const handleAssignTag = async () => {
        if (!selectedTag) {
            toast.error("Please select a tag");
            return;
        }
        setAssigningTag(true);
        try {
            await api.patch(`/orders/${selectedOrder._id}`, { assignedTag: selectedTag });
            toast.success("Tag assigned successfully");
            setShowTagModal(false);
            setSelectedTag("");
            await Promise.all([fetchAvailableTags(), fetchOrders(), fetchStats()]);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to assign tag";
            toast.error(errorMsg);
            if (errorMsg.includes("already") || errorMsg.includes("owner")) {
                await fetchAvailableTags();
            }
        } finally {
            setAssigningTag(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        const currentOrder = orders.find(o => o._id === orderId);
        const currentStatus = currentOrder?.fulfillmentStatus;

        const statusOrder = ["pending", "assigned", "shipped", "delivered"];
        const currentIndex = statusOrder.indexOf(currentStatus);
        const newIndex = statusOrder.indexOf(newStatus);

        if (newIndex < currentIndex) {
            toast.error(`Cannot change status from "${currentStatus}" back to "${newStatus}".`, {
                duration: 4000, icon: '⚠️'
            });
            return;
        }

        setUpdatingStatus(true);
        setStatusUpdateOrder(orderId);

        try {
            await api.patch(`/orders/${orderId}`, { fulfillmentStatus: newStatus });
            toast.success(`Status updated to "${newStatus}" successfully`);
            await Promise.all([fetchOrders(), fetchStats()]);
        } catch (err) {
            let errorMessage = "Failed to update status";
            if (err.response?.status === 400) {
                errorMessage = err.response?.data?.message || "Invalid status transition";
                if (errorMessage.includes("tag first")) {
                    errorMessage = "Cannot mark as assigned: Please assign a tag first.";
                } else if (errorMessage.includes("paid before shipping")) {
                    errorMessage = "Cannot mark as shipped: Payment not confirmed.";
                }
            } else if (err.response?.status === 401) {
                errorMessage = "Session expired. Please login again.";
                setTimeout(() => window.location.href = "/login", 2000);
            }
            toast.error(errorMessage, { duration: 5000, icon: '❌' });
        } finally {
            setUpdatingStatus(false);
            setStatusUpdateOrder(null);
        }
    };

    const handleCancelOrder = async (orderId, reason) => {
        setProcessingAction(true);
        try {
            await api.post(`/orders/${orderId}/cancel`, { reason });
            toast.success("Order cancelled successfully");
            setShowCancelModal(false);
            await Promise.all([fetchOrders(), fetchStats()]);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to cancel order");
        } finally {
            setProcessingAction(false);
        }
    };

    const handleProcessRefund = async (orderId, approve, rejectReason = null) => {
        setProcessingAction(true);
        try {
            await api.post(`/orders/${orderId}/refund/process`, { approve, rejectReason });
            toast.success(approve ? "Refund processed successfully" : "Refund request rejected");
            setShowRefundModal(false);
            await Promise.all([fetchOrders(), fetchStats()]);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to process refund");
        } finally {
            setProcessingAction(false);
        }
    };

    const handleProcessReturn = async (orderId, approve, trackingNumber = null, rejectReason = null) => {
        setProcessingAction(true);
        try {
            await api.post(`/orders/${orderId}/return/process`, { approve, trackingNumber, rejectReason });
            toast.success(approve ? "Return request approved" : "Return request rejected");
            setShowReturnModal(false);
            await Promise.all([fetchOrders(), fetchStats()]);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to process return");
        } finally {
            setProcessingAction(false);
        }
    };

    const handleCompleteReturn = async (orderId) => {
        setProcessingAction(true);
        try {
            await api.post(`/orders/${orderId}/return/complete`, {});
            toast.success("Return completed and refund processed");
            await Promise.all([fetchOrders(), fetchStats()]);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to complete return");
        } finally {
            setProcessingAction(false);
        }
    };

    if (!isInitialized) {
        return <Loader text="QKey..." size={50} fullScreen />;
    }

    if (user && user.role !== "admin") {
        return null;
    }

    if (loading && currentPage === 1 && orders.length === 0 && !activeSearchTerm) {
        return <Loader text="QKey..." size={50} fullScreen />;
    }

    return (
        <div className="flex-1 w-full p-4 lg:p-8">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-semibold text-gray-900">Orders Management</h1>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                        {providerInfo.icon}
                        <span className="text-gray-600">{providerInfo.text} Admin</span>
                    </div>
                </div>
                <p className="text-gray-500 mt-1">Manage and track all customer orders</p>
            </div>

            <OrderStatsCards stats={stats} totalOrders={totalOrders} />

            {/* Search Section with Manual Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search by order ID, customer name, email, or product..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyPress={handleKeyPress}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                        />
                        {searchTerm && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition"
                            >
                                <X size={16} className="text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={performSearch}
                        disabled={isSearching || !searchTerm || searchTerm.trim() === ""}
                        className={`px-6 py-2 rounded-lg transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${!searchTerm || searchTerm.trim() === ""
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-gray-900 text-white hover:bg-gray-800"
                            }`}
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

                    <div className="flex gap-2 flex-wrap">
                        {[
                            { value: "all", label: "All Orders" },
                            { value: "pending", label: "Pending" },
                            { value: "assigned", label: "Assigned" },
                            { value: "shipped", label: "Shipped" },
                            { value: "delivered", label: "Delivered" }
                        ].map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => {
                                    setFilterStatus(filter.value);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 rounded-lg text-sm transition cursor-pointer whitespace-nowrap ${filterStatus === filter.value
                                        ? "bg-gray-900 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                        title="Refresh"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>

                {activeSearchTerm && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
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
                        {totalOrders > 0 && (
                            <span className="text-sm text-gray-500">
                                Found {totalOrders} order{totalOrders !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-600">
                    {error}
                </div>
            )}

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden">
                <OrdersTable
                    orders={orders}
                    onAssignTag={handleOpenTagModal}
                    onViewDetails={(order) => { setSelectedOrder(order); setShowDetailsModal(true); }}
                    onUpdateStatus={handleUpdateStatus}
                    onCancelOrder={(order) => { setSelectedOrder(order); setShowCancelModal(true); }}
                    onProcessRefund={(order) => { setSelectedOrder(order); setShowRefundModal(true); }}
                    onProcessReturn={(order) => { setSelectedOrder(order); setShowReturnModal(true); }}
                    onCompleteReturn={handleCompleteReturn}
                    updatingStatus={updatingStatus}
                    statusUpdateOrder={statusUpdateOrder}
                    processingAction={processingAction}
                />
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="text-sm text-gray-500">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalOrders)} of {totalOrders} orders
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
                                className="px-3 py-1 rounded-lg text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer">
                                Previous
                            </button>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded-lg text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer">
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden bg-white rounded-lg border border-gray-200 overflow-hidden">
                {orders.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Package size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>No orders found</p>
                    </div>
                ) : (
                    <>
                        {orders.map((order) => (
                            <OrderMobileCard
                                key={order._id}
                                order={order}
                                onAssignTag={handleOpenTagModal}
                                onViewDetails={(order) => { setSelectedOrder(order); setShowDetailsModal(true); }}
                                onUpdateStatus={handleUpdateStatus}
                                onCancelOrder={(order) => { setSelectedOrder(order); setShowCancelModal(true); }}
                                onProcessRefund={(order) => { setSelectedOrder(order); setShowRefundModal(true); }}
                                onProcessReturn={(order) => { setSelectedOrder(order); setShowReturnModal(true); }}
                                updatingStatus={updatingStatus}
                                statusUpdateOrder={statusUpdateOrder}
                            />
                        ))}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                                <div className="text-xs text-gray-500">Page {currentPage} of {totalPages}</div>
                                <div className="flex gap-2">
                                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
                                        className="px-3 py-1 rounded-lg text-xs border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                                        Previous
                                    </button>
                                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}
                                        className="px-3 py-1 rounded-lg text-xs border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            <AssignTagModal
                isOpen={showTagModal}
                onClose={() => {
                    setShowTagModal(false);
                    setSelectedTag("");
                }}
                order={selectedOrder}
                availableTags={availableTags}
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
                onAssign={handleAssignTag}
                assigning={assigningTag}
                loadingTags={loadingTags}
            />

            <OrderDetailsModal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)}
                order={selectedOrder} onAssignTag={handleOpenTagModal}
                onCancelOrder={(order) => { setShowDetailsModal(false); setSelectedOrder(order); setShowCancelModal(true); }}
                onProcessRefund={(order) => { setShowDetailsModal(false); setSelectedOrder(order); setShowRefundModal(true); }}
                onProcessReturn={(order) => { setShowDetailsModal(false); setSelectedOrder(order); setShowReturnModal(true); }}
                onCompleteReturn={handleCompleteReturn} processingAction={processingAction} />

            <CancelOrderModal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)}
                order={selectedOrder} onConfirm={handleCancelOrder} processing={processingAction} />

            <ProcessRefundModal isOpen={showRefundModal} onClose={() => setShowRefundModal(false)}
                order={selectedOrder} onConfirm={handleProcessRefund} processing={processingAction} />

            <ProcessReturnModal isOpen={showReturnModal} onClose={() => setShowReturnModal(false)}
                order={selectedOrder} onConfirm={handleProcessReturn}
                onCompleteReturn={handleCompleteReturn} processing={processingAction} />
        </div>
    );
}