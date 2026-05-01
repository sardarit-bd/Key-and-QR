"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, RefreshCw, Filter, Link2, Eye } from "lucide-react";
import api from "@/lib/api";
import { toast, Toaster } from "react-hot-toast";
import Loader from "@/shared/Loader";
import useAuthInit from "@/hooks/useAuthInit";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

// Import Components
import AssignmentsTable from "@/components/admin/quote-assignments/AssignmentsTable";
import StatsCards from "@/components/admin/quote-assignments/StatsCards";
import DeleteConfirmModal from "@/components/admin/quote-assignments/DeleteConfirmModal";
import EditAssignmentModal from "@/components/admin/quote-assignments/EditAssignmentModal";
import CreateNewQuoteModal from "@/components/admin/quote-assignments/CreateNewQuoteModal";
import FilterBar from "@/components/admin/quote-assignments/FiltersBar";

export default function QuoteAssignmentsPage() {
  useAuthInit();
  const { user, isInitialized } = useAuthStore();
  const router = useRouter();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({ assignmentType: "", isActive: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showNewQuoteModal, setShowNewQuoteModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const itemsPerPage = 10;

  const fetchAssignments = useCallback(async () => {
    if (!user || user.role !== "admin") return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("limit", itemsPerPage);
      if (filters.assignmentType) params.append("assignmentType", filters.assignmentType);
      if (filters.isActive !== "") params.append("isActive", filters.isActive);

      const response = await api.get(`/quote-assignments?${params.toString()}`);
      setAssignments(response.data?.data || []);
      setTotalPages(response.data?.meta?.totalPage || 1);
      setTotalItems(response.data?.meta?.total || 0);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, [user, currentPage, filters]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) return;
    if (user.role !== "admin") {
      router.push("/");
      return;
    }
    fetchAssignments();
  }, [isInitialized, user, currentPage, filters, fetchAssignments, router]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/quote-assignments/${id}`);
      toast.success("Assignment deleted successfully");
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
    setShowDeleteConfirm(null);
  };

  const handleQuoteCreated = (newQuote) => {
    if (newQuote && newQuote._id) {
      setShowNewQuoteModal(false);
      fetchAssignments();

      toast.success(
        `Quote "${newQuote.text.substring(0, 50)}..." created successfully!`
      );
    }
  };

  const stats = {
    total: totalItems,
    tagAssignments: assignments.filter(a => a.assignmentType === "tag").length,
    userAssignments: assignments.filter(a => a.assignmentType === "user").length,
    active: assignments.filter(a => a.isActive).length,
    inactive: assignments.filter(a => !a.isActive).length,
    highPriority: assignments.filter(a => a.priority > 0).length,
  };

  if (!isInitialized) return <Loader text="Loading..." size={50} fullScreen />;
  if (user && user.role !== "admin") return null;

  // if (showCreatePage) {
  //   return (
  //     <UseExistingQuote
  //       editingAssignment={editingAssignment}
  //       onClose={() => {
  //         setShowCreatePage(false);
  //         setEditingAssignment(null);
  //       }}
  //       onSuccess={fetchAssignments}
  //     />
  //   );
  // }

  // Main List View
  return (
    <div className="flex-1 w-full min-h-screen p-4 lg:p-8">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link2 size={24} className="text-gray-900" />
              <h1 className="text-2xl font-semibold text-gray-900">Quote Assignments</h1>
            </div>
            <p className="text-gray-500 text-sm">
              Assign specific quotes to specific tags or users
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/dashboard/admin/use-existing-quote")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition cursor-pointer"
            >
              <Plus size={18} />
              Use Existing Quote
            </button>
            <button
              onClick={() => setShowNewQuoteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            >
              <Plus size={18} />
              Create New Quote
            </button>
            <button
              onClick={() => router.push("/dashboard/admin/allquotes")}
              className="inline-flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition cursor-pointer"
            >
              <Eye size={18} />
              View All Quotes
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Filters */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        onReset={() => {
          setCurrentPage(1);
          setFilters({ assignmentType: "", isActive: "" });
          fetchAssignments();
        }}
      />

      {/* Assignments Table */}
      <AssignmentsTable
        loading={loading}
        assignments={assignments}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onEdit={(assignment) => {
          setEditingAssignment(assignment);
          setShowEditModal(true);
        }}
        onDelete={(assignment) => setShowDeleteConfirm(assignment)}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          assignment={showDeleteConfirm}
          onConfirm={() => handleDelete(showDeleteConfirm._id)}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}

      {/* Edit Assignment Modal */}
      {showEditModal && editingAssignment && (
        <EditAssignmentModal
          isOpen={showEditModal}
          assignment={editingAssignment}
          onClose={() => {
            setShowEditModal(false);
            setEditingAssignment(null);
          }}
          onSuccess={fetchAssignments}
        />
      )}

      {/* Create New Quote Modal */}
      <CreateNewQuoteModal
        isOpen={showNewQuoteModal}
        onClose={() => setShowNewQuoteModal(false)}
        onSuccess={handleQuoteCreated}
      />
    </div>
  );
}