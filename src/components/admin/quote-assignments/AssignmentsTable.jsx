"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Tag, User, Power, PowerOff, Edit, Trash2, Eye } from "lucide-react";
import Loader from "@/shared/Loader";
import QuoteDetailsModal from "./QuoteDetailsModal";

const StatusBadge = ({ isActive }) => (
  <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-full ${
    isActive ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-600"
  }`}>
    {isActive ? <Power size={10} /> : <PowerOff size={10} />}
    {isActive ? "Active" : "Inactive"}
  </span>
);

const TypeBadge = ({ type }) => {
  const isTag = type === "tag";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-full ${
      isTag ? "bg-gray-900 text-white" : "bg-gray-700 text-white"
    }`}>
      {isTag ? <Tag size={10} /> : <User size={10} />}
      {isTag ? "Tag" : "User"}
    </span>
  );
};

const PriorityBadge = ({ priority }) => (
  <span className={`inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded-full text-xs font-medium ${
    priority > 5 ? "bg-gray-900 text-white" : 
    priority > 0 ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-600"
  }`}>
    {priority}
  </span>
);

export default function AssignmentsTable({
  loading,
  assignments,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onEdit,
  onDelete,
}) {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden p-12 text-center">
        <Loader size={40} />
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden p-12 text-center">
        <p className="text-gray-500">No assignments found</p>
        <p className="text-sm text-gray-400 mt-1">Click "New Assignment" to create one</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Quote</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Assigned To</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Type</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Priority</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <tr key={assignment._id} className="hover:bg-gray-50 transition">
                  <td className="p-3">
                    <div className="text-sm text-gray-900 max-w-md line-clamp-2">
                      “{assignment?.quote?.text?.substring(0, 80)}...”
                    </div>
                    {assignment?.quote?.author && (
                      <div className="text-xs text-gray-500 mt-1">— {assignment.quote.author}</div>
                    )}
                  </td>
                  <td className="p-3">
                    {assignment.assignmentType === "tag" ? (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Tag size={14} className="text-gray-500" />
                          <span className="font-mono text-sm">{assignment?.tag?.tagCode || "N/A"}</span>
                        </div>
                        {assignment?.tag?.owner && (
                          <div className="text-xs text-gray-500 mt-1">
                            Owner: {assignment.tag.owner?.name || "Unknown"}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{assignment?.user?.name || "N/A"}</div>
                        <div className="text-xs text-gray-500">{assignment?.user?.email || ""}</div>
                      </div>
                    )}
                  </td>
                  <td className="p-3"><TypeBadge type={assignment.assignmentType} /></td>
                  <td className="p-3"><PriorityBadge priority={assignment.priority || 0} /></td>
                  <td className="p-3"><StatusBadge isActive={assignment.isActive} /></td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowDetailsModal(true);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                        title="View Details"
                      >
                        <Eye size={16} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => onEdit(assignment)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                        title="Edit"
                      >
                        <Edit size={16} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => onDelete(assignment)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-gray-100">
          {assignments.map((assignment) => (
            <div key={assignment._id} className="p-4 space-y-3">
              <div className="text-sm text-gray-900 line-clamp-2">
                “{assignment?.quote?.text?.substring(0, 100)}...”
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <TypeBadge type={assignment.assignmentType} />
                  <StatusBadge isActive={assignment.isActive} />
                  <PriorityBadge priority={assignment.priority || 0} />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => {
                    setSelectedAssignment(assignment);
                    setShowDetailsModal(true);
                  }} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                    <Eye size={16} className="text-gray-600" />
                  </button>
                  <button onClick={() => onEdit(assignment)} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                    <Edit size={16} className="text-gray-600" />
                  </button>
                  <button onClick={() => onDelete(assignment)} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                    <Trash2 size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>
              {assignment.assignmentType === "tag" ? (
                <div className="text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Tag size={12} /> {assignment?.tag?.tagCode || "N/A"}
                  </div>
                  {assignment?.tag?.owner && (
                    <div className="mt-1">Owner: {assignment.tag.owner?.name}</div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-500">
                  <div>{assignment?.user?.name || "N/A"}</div>
                  <div>{assignment?.user?.email || ""}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500 order-2 sm:order-1">
              Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
            </div>
            <div className="flex gap-2 order-1 sm:order-2">
              <button
                onClick={() => onPageChange(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                onClick={() => onPageChange(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedAssignment && (
        <QuoteDetailsModal
          assignment={selectedAssignment}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAssignment(null);
          }}
        />
      )}
    </>
  );
}