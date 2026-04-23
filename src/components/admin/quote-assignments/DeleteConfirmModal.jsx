import { AlertTriangle } from "lucide-react";

export default function DeleteConfirmModal({ isOpen, onClose, assignment, onConfirm }) {
    if (!isOpen || !assignment) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-full">
                            <AlertTriangle size={24} className="text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Delete Assignment</h3>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                        Are you sure you want to delete this assignment?
                    </p>
                    
                    <div className="p-3 bg-gray-50 rounded-lg mb-4">
                        <p className="text-sm text-gray-700">
                            <span className="font-medium">Quote:</span> "{assignment.quote?.text?.substring(0, 80)}..."
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                            <span className="font-medium">Assigned to:</span>{" "}
                            {assignment.assignmentType === "tag" 
                                ? assignment.tag?.tagCode 
                                : assignment.user?.email}
                        </p>
                        {assignment.priority > 0 && (
                            <p className="text-sm text-gray-700 mt-1">
                                <span className="font-medium">Priority:</span> {assignment.priority}
                            </p>
                        )}
                    </div>
                    
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onConfirm(assignment._id)}
                            className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}