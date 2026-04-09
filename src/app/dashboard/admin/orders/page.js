"use client";

import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Package, RefreshCw, XCircle, Mail } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import OrderDetailsModal from "@/components/admin/orders/OrderDetailsModal";
import AssignTagModal from "@/components/admin/orders/AssignTagModal";
import OrderMobileCard from "@/components/admin/orders/OrderMobileCard";
import OrdersTable from "@/components/admin/orders/OrdersTable";
import OrderFilters from "@/components/admin/orders/OrderFilters";
import OrderStatsCards from "@/components/admin/orders/OrderStatsCards";
import CancelOrderModal from "@/components/admin/orders/CancelOrderModal";
import ProcessRefundModal from "@/components/admin/orders/ProcessRefundModal";
import ProcessReturnModal from "@/components/admin/orders/ProcessReturnModal";
import Loader from "@/shared/Loader";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const itemsPerPage = 10;

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

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!user) {
                setError("Please login to view orders");
                toast.error("Please login to view orders");
                return;
            }

            const params = new URLSearchParams();
            params.append("page", currentPage);
            params.append("limit", itemsPerPage);
            if (searchTerm) params.append("search", searchTerm);
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
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get("/orders/admin/stats");
            setStats(response.data?.data || stats);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchAvailableTags = async () => {
        try {
            const response = await api.get("/tags?limit=100");

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

            const unusedTags = tags.filter(tag => {
                return tag && !tag.owner && tag.isActive === true;
            });

            setAvailableTags(unusedTags);

        } catch (err) {
            console.error("Fetch available tags error:", err);
            toast.error("Failed to fetch available tags");
            setAvailableTags([]);
        }
    };

    const handleOpenTagModal = async (order) => {
        setSelectedOrder(order);
        await fetchAvailableTags();
        setSelectedTag("");
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
            fetchOrders();
            fetchStats();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to assign tag");
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
            fetchOrders();
            fetchStats();
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
            fetchOrders();
            fetchStats();
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
            fetchOrders();
            fetchStats();
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
            fetchOrders();
            fetchStats();
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
            fetchOrders();
            fetchStats();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to complete return");
        } finally {
            setProcessingAction(false);
        }
    };

    const handleRefresh = () => {
        setSearchTerm("");
        setFilterStatus("all");
        setCurrentPage(1);
        fetchOrders();
        fetchStats();
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage === 1) fetchOrders();
            else setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
        fetchOrders();
    }, [filterStatus]);

    useEffect(() => {
        fetchOrders();
    }, [currentPage]);

    useEffect(() => {
        if (!isInitialized) return;
        if (user?.role === "admin") {
            fetchOrders();
            fetchStats();
        }
    }, [user, isInitialized]);

    if (loading && currentPage === 1 && orders.length === 0) {
        return <Loader text="QKey" size={50} fullScreen />;
    }

    if (error) {
        return (
            <div className="flex-1 w-full p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <XCircle size={40} className="text-red-400 mx-auto mb-4" />
                    <p className="text-red-600">{error}</p>
                    <button onClick={fetchOrders} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        Try Again
                    </button>
                </div>
            </div>
        );
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

            <OrderFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                onRefresh={handleRefresh}
            />

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

            <AssignTagModal isOpen={showTagModal} onClose={() => setShowTagModal(false)}
                order={selectedOrder} availableTags={availableTags}
                selectedTag={selectedTag} setSelectedTag={setSelectedTag}
                onAssign={handleAssignTag} assigning={assigningTag} />

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