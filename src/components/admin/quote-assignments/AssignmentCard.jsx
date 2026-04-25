import { Eye, Edit, Trash2, Power, PowerOff, Calendar, Tag, User } from "lucide-react";
import PriorityBadge from "./PriorityBadge";

export default function AssignmentCard({
    assignment,
    onView,
    onEdit,
    onDelete,
    onToggleActive
}) {
    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString();
    };

    const getAssignedToLabel = () => {
        if (assignment.assignmentType === "tag") {
            return assignment.tag?.tagCode || "Unknown Tag";
        }
        return assignment.user?.email || "Unknown User";
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            {/* Quote */}
            <div className="mb-3">
                <p className="text-sm text-gray-900 italic">
                    "{assignment.quote?.text?.substring(0, 100)}..."
                </p>
                {assignment.quote?.category && (
                    <span className="text-xs text-gray-400 mt-1 inline-block">
                        📖 {assignment.quote.category}
                    </span>
                )}
            </div>

            {/* Assigned To */}
            <div className="flex items-center gap-2 mb-2">
                {assignment.assignmentType === "tag" ? (
                    <Tag size={14} className="text-purple-500" />
                ) : (
                    <User size={14} className="text-green-500" />
                )}
                <span className="text-sm text-gray-700 font-mono">
                    {getAssignedToLabel()}
                </span>
            </div>

            {/* Priority & Status */}
            <div className="flex items-center justify-between mb-3">
                <PriorityBadge priority={assignment.priority || 0} />
                <button
                    onClick={() => onToggleActive(assignment._id, assignment.isActive)}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                        assignment.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                    }`}
                >
                    {assignment.isActive ? <Power size={10} /> : <PowerOff size={10} />}
                    {assignment.isActive ? "Active" : "Inactive"}
                </button>
            </div>

            {/* Date */}
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                <Calendar size={12} />
                <span>Created: {formatDate(assignment.createdAt)}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <button
                    onClick={() => onView(assignment)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                    <Eye size={14} />
                    View
                </button>
                <button
                    onClick={() => onEdit(assignment)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                    <Edit size={14} />
                    Edit
                </button>
                <button
                    onClick={() => onDelete(assignment)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                    <Trash2 size={14} />
                    Delete
                </button>
            </div>
        </div>
    );
}