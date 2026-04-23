import { Eye, Edit, Trash2, Power, PowerOff } from "lucide-react";
import PriorityBadge from "./PriorityBadge";

export default function AssignmentTableRow({
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

    const getAssignedToIcon = () => {
        if (assignment.assignmentType === "tag") {
            return "🏷️";
        }
        return "👤";
    };

    return (
        <tr className="hover:bg-gray-50 transition">
            <td className="px-4 py-3">
                <div className="max-w-xs">
                    <p className="text-sm text-gray-900 italic line-clamp-2">
                        "{assignment.quote?.text?.substring(0, 80)}..."
                    </p>
                    {assignment.quote?.category && (
                        <span className="text-xs text-gray-400 mt-1">
                            {assignment.quote.category}
                        </span>
                    )}
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <span>{getAssignedToIcon()}</span>
                    <span className="text-sm text-gray-700 font-mono">
                        {getAssignedToLabel()}
                    </span>
                </div>
            </td>
            <td className="px-4 py-3">
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    assignment.assignmentType === "tag"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-green-100 text-green-700"
                }`}>
                    {assignment.assignmentType === "tag" ? "Tag" : "User"}
                </span>
            </td>
            <td className="px-4 py-3">
                <PriorityBadge priority={assignment.priority || 0} />
            </td>
            <td className="px-4 py-3">
                <button
                    onClick={() => onToggleActive(assignment._id, assignment.isActive)}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full transition ${
                        assignment.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                >
                    {assignment.isActive ? <Power size={10} /> : <PowerOff size={10} />}
                    {assignment.isActive ? "Active" : "Inactive"}
                </button>
            </td>
            <td className="px-4 py-3 text-sm text-gray-500">
                {formatDate(assignment.createdAt)}
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onView(assignment)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                        title="View Details"
                    >
                        <Eye size={16} className="text-blue-500" />
                    </button>
                    <button
                        onClick={() => onEdit(assignment)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                        title="Edit"
                    >
                        <Edit size={16} className="text-gray-500" />
                    </button>
                    <button
                        onClick={() => onDelete(assignment)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                        title="Delete"
                    >
                        <Trash2 size={16} className="text-red-500" />
                    </button>
                </div>
            </td>
        </tr>
    );
}