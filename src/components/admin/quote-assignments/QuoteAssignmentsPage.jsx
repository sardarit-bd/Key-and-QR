"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import Loader from "@/shared/Loader";
import useAuthInit from "@/hooks/useAuthInit";
import { Plus, RefreshCw } from "lucide-react";
import StatsCards from "./StatsCards";
import FiltersBar from "./FiltersBar";
import AssignmentTableRow from "./AssignmentTableRow";
import AssignmentCard from "./AssignmentCard";
import CreateAssignmentModal from "./CreateAssignmentModal";
import EditAssignmentModal from "./EditAssignmentModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import AssignmentDetailsModal from "./AssignmentDetailsModal";


export default function QuoteAssignmentsPage() {
    useAuthInit();
    const { user, isInitialized } = useAuthStore();
    
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Modals state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    
    // Filters
    const [assignmentType, setAssignmentType] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalAssignments, setTotalAssignments] = useState(0);
    
    // Stats
    const [stats, setStats] = useState({
        total: 0,
        tagAssignments: 0,
        userAssignments: 0,
        active: 0,
        inactive: 0,
        highPriority: 0
    });
    
    const itemsPerPage = 10;

    const fetchAssignments = useCallback(async () => {
        if (!user || user.role !== "admin") return;
        
        try {
            setLoading(true);
            setError("");
            
            const params = new URLSearchParams();
            params.append("page", currentPage);
            params.append("limit", itemsPerPage);
            
            if (assignmentType !== "all") {
                params.append("assignmentType", assignmentType);
            }
            
            if (statusFilter !== "all") {
                params.append("isActive", statusFilter === "active");
            }
            
            const response = await api.get(`/quote-assignments?${params.toString()}`);
            setAssignments(response.data?.data || []);
            setTotalPages(response.data?.meta?.totalPage || 1);
            setTotalAssignments(response.data?.meta?.total || 0);
        } catch (err) {
            console.error("Error fetching assignments:", err);
            setError(err.response?.data?.message || "Failed to load assignments");
        } finally {
            setLoading(false);
        }
    }, [user, currentPage, assignmentType, statusFilter]);

    const fetchStats = useCallback(async () => {
        if (!user || user.role !== "admin") return;
        
        try {
            const response = await api.get("/quote-assignments?limit=1000");
            const allAssignments = response.data?.data || [];
            console.log(allAssignments[0]);
            
            setStats({
                total: allAssignments.length,
                tagAssignments: allAssignments.filter(a => a.assignmentType === "tag").length,
                userAssignments: allAssignments.filter(a => a.assignmentType === "user").length,
                active: allAssignments.filter(a => a.isActive).length,
                inactive: allAssignments.filter(a => !a.isActive).length,
                highPriority: allAssignments.filter(a => (a?.priority ?? 0) >= 5).length
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    }, [user]);

    useEffect(() => {
        if (isInitialized && user?.role === "admin") {
            fetchAssignments();
        }
    }, [isInitialized, user, fetchAssignments]);

    useEffect(() => {
        if (isInitialized && user?.role === "admin") {
            fetchStats();
        }
    }, [isInitialized, user, fetchStats]);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/quote-assignments/${id}`);
            toast.success("Assignment deleted successfully");
            setShowDeleteModal(false);
            setSelectedAssignment(null);
            fetchAssignments();
            fetchStats();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete assignment");
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            await api.patch(`/quote-assignments/${id}`, { isActive: !currentStatus });
            toast.success(`Assignment ${!currentStatus ? "activated" : "deactivated"}`);
            fetchAssignments();
            fetchStats();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update status");
        }
    };

    const handleRefresh = () => {
        setAssignmentType("all");
        setStatusFilter("all");
        setSearchTerm("");
        setCurrentPage(1);
        fetchAssignments();
        fetchStats();
    };

    if (!isInitialized) {
        return <Loader text="Loading..." size={50} fullScreen />;
    }

    if (user?.role !== "admin") {
        return null;
    }

    return (
        <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            Quote Assignments
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Manage which quotes are shown to specific tags or users
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                    >
                        <Plus size={18} />
                        New Assignment
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <StatsCards stats={stats} />

            {/* Filters */}
            <FiltersBar
                assignmentType={assignmentType}
                setAssignmentType={setAssignmentType}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onRefresh={handleRefresh}
            />

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-600">
                    {error}
                    <button onClick={handleRefresh} className="ml-4 underline">Retry</button>
                </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Quote</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Assigned To</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Type</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Priority</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Created</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {assignments.map((assignment) => (
                                <AssignmentTableRow
                                    key={assignment._id}
                                    assignment={assignment}
                                    onView={(a) => {
                                        setSelectedAssignment(a);
                                        setShowDetailsModal(true);
                                    }}
                                    onEdit={(a) => {
                                        setSelectedAssignment(a);
                                        setShowEditModal(true);
                                    }}
                                    onDelete={(a) => {
                                        setSelectedAssignment(a);
                                        setShowDeleteModal(true);
                                    }}
                                    onToggleActive={(id, status) => handleToggleActive(id, status)}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {assignments.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        No assignments found
                    </div>
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                        <div className="text-sm text-gray-500">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalAssignments)} of {totalAssignments}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1 text-sm">Page {currentPage} of {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
                {assignments.map((assignment) => (
                    <AssignmentCard
                        key={assignment._id}
                        assignment={assignment}
                        onView={(a) => {
                            setSelectedAssignment(a);
                            setShowDetailsModal(true);
                        }}
                        onEdit={(a) => {
                            setSelectedAssignment(a);
                            setShowEditModal(true);
                        }}
                        onDelete={(a) => {
                            setSelectedAssignment(a);
                            setShowDeleteModal(true);
                        }}
                        onToggleActive={(id, status) => handleToggleActive(id, status)}
                    />
                ))}
                {assignments.length === 0 && (
                    <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                        No assignments found
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateAssignmentModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    fetchAssignments();
                    fetchStats();
                }}
            />

            <EditAssignmentModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedAssignment(null);
                }}
                assignment={selectedAssignment}
                onSuccess={() => {
                    fetchAssignments();
                    fetchStats();
                }}
            />

            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedAssignment(null);
                }}
                assignment={selectedAssignment}
                onConfirm={handleDelete}
            />

            <AssignmentDetailsModal
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedAssignment(null);
                }}
                assignment={selectedAssignment}
            />
        </div>
    );
}