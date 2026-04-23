import { X, Calendar, User, Tag, Quote, Star, Power, PowerOff, Clock } from "lucide-react";

export default function AssignmentDetailsModal({ isOpen, onClose, assignment }) {
    if (!isOpen || !assignment) return null;

    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleString();
    };

    const getPriorityInfo = (priority) => {
        if (priority >= 8) return { label: "Highest", color: "text-red-600", bg: "bg-red-100" };
        if (priority >= 5) return { label: "High", color: "text-orange-600", bg: "bg-orange-100" };
        if (priority >= 3) return { label: "Medium", color: "text-yellow-600", bg: "bg-yellow-100" };
        return { label: "Low", color: "text-gray-600", bg: "bg-gray-100" };
    };

    const priorityInfo = getPriorityInfo(assignment.priority || 0);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <Quote size={20} className="text-blue-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Assignment Details</h2>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Assignment Type */}
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        {assignment.assignmentType === "tag" ? (
                            <>
                                <Tag size={18} className="text-purple-500" />
                                <span className="font-medium">Tag Assignment:</span>
                                <span className="font-mono">{assignment.tag?.tagCode}</span>
                            </>
                        ) : (
                            <>
                                <User size={18} className="text-green-500" />
                                <span className="font-medium">User Assignment:</span>
                                <span>{assignment.user?.email}</span>
                            </>
                        )}
                    </div>

                    {/* Quote Details */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-3">Quote</h3>
                        <p className="text-gray-700 italic">"{assignment.quote?.text}"</p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                            <span>Category: {assignment.quote?.category}</span>
                            {assignment.quote?.author && assignment.quote.author !== "InspireTag" && (
                                <span>— {assignment.quote.author}</span>
                            )}
                        </div>
                        {assignment.quote?.theme && (
                            <div className="mt-2 text-sm text-gray-500">
                                🎨 Theme: {assignment.quote.theme}
                            </div>
                        )}
                        {assignment.quote?.image?.url && (
                            <div className="mt-3">
                                <img 
                                    src={assignment.quote.image.url} 
                                    alt="Quote visual"
                                    className="max-h-32 rounded-lg object-contain"
                                />
                            </div>
                        )}
                    </div>

                    {/* Configuration */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Star size={16} className="text-amber-500" />
                                <span className="text-sm font-medium">Priority</span>
                            </div>
                            <div>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${priorityInfo.bg} ${priorityInfo.color}`}>
                                    {priorityInfo.label} ({assignment.priority || 0})
                                </span>
                            </div>
                        </div>

                        <div className="border rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                {assignment.isActive ? (
                                    <Power size={16} className="text-green-500" />
                                ) : (
                                    <PowerOff size={16} className="text-red-500" />
                                )}
                                <span className="text-sm font-medium">Status</span>
                            </div>
                            <div>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                    assignment.isActive
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                }`}>
                                    {assignment.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>

                        <div className="border rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar size={16} className="text-gray-400" />
                                <span className="text-sm font-medium">Created</span>
                            </div>
                            <p className="text-sm text-gray-600">{formatDate(assignment.createdAt)}</p>
                        </div>

                        <div className="border rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock size={16} className="text-gray-400" />
                                <span className="text-sm font-medium">Last Updated</span>
                            </div>
                            <p className="text-sm text-gray-600">{formatDate(assignment.updatedAt)}</p>
                        </div>
                    </div>

                    {/* ID */}
                    <div className="border rounded-lg p-3 bg-gray-50">
                        <p className="text-xs text-gray-500 mb-1">Assignment ID</p>
                        <p className="text-xs font-mono text-gray-600 break-all">{assignment._id}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}