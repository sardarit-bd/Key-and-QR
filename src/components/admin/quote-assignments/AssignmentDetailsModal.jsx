"use client";

import { X, Calendar, Tag, User, Hash, Power, PowerOff, Link2, Quote, Info, TrendingUp } from "lucide-react";

export default function AssignmentDetailsModal({ isOpen, onClose, assignment }) {
    if (!isOpen || !assignment) return null;

    const getPriorityBadge = (priority) => {
        if (priority >= 10) return { label: "High Priority", color: "bg-red-100 text-red-700" };
        if (priority >= 5) return { label: "Medium Priority", color: "bg-orange-100 text-orange-700" };
        if (priority > 0) return { label: "Low Priority", color: "bg-yellow-100 text-yellow-700" };
        return { label: "Normal Priority", color: "bg-gray-100 text-gray-600" };
    };

    const priorityInfo = getPriorityBadge(assignment.priority || 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                            <Info size={18} className="text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Assignment Details</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {/* Quote Section */}
                    <div className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Quote size={16} className="text-blue-500" />
                            <h3 className="font-semibold text-gray-900">Assigned Quote</h3>
                        </div>
                        <p className="text-gray-800 text-lg italic leading-relaxed">
                            “{assignment?.quote?.text || "Quote has been deleted"}”
                        </p>
                        {assignment?.quote?.author && (
                            <p className="text-right text-gray-500 text-sm mt-2">— {assignment.quote.author}</p>
                        )}
                        {assignment?.quote?.category && (
                            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
                                {assignment.quote.category}
                            </div>
                        )}
                    </div>

                    {/* Assignment Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <Link2 size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-500">Type:</span>
                            <span className="text-sm font-medium">
                                {assignment.assignmentType === "tag" ? "Tag Assignment" : "User Assignment"}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            {assignment.isActive ? (
                                <Power size={16} className="text-green-500" />
                            ) : (
                                <PowerOff size={16} className="text-red-500" />
                            )}
                            <span className="text-sm text-gray-500">Status:</span>
                            <span className={`text-sm font-medium ${assignment.isActive ? "text-green-600" : "text-red-600"}`}>
                                {assignment.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <TrendingUp size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-500">Priority:</span>
                            <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${priorityInfo.color}`}>
                                {priorityInfo.label} ({assignment.priority || 0})
                            </span>
                        </div>

                        {assignment.assignmentType === "tag" ? (
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                <Tag size={16} className="text-gray-400" />
                                <span className="text-sm text-gray-500">Tag:</span>
                                <span className="font-mono text-sm">{assignment?.tag?.tagCode || "N/A"}</span>
                                {assignment?.tag?.owner && (
                                    <span className="text-xs text-gray-400">(Owned)</span>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                <User size={16} className="text-gray-400" />
                                <span className="text-sm text-gray-500">User:</span>
                                <div>
                                    <div className="text-sm font-medium">{assignment?.user?.name || "N/A"}</div>
                                    <div className="text-xs text-gray-400">{assignment?.user?.email}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timestamps */}
                    <div className="border-t border-gray-100 pt-3">
                        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Timestamps</h3>
                        <div className="space-y-1 text-xs text-gray-400">
                            <div className="flex items-center gap-2">
                                <Calendar size={12} />
                                <span>Created: {new Date(assignment.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={12} />
                                <span>Last Updated: {new Date(assignment.updatedAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* How this assignment works */}
                    <div className="bg-blue-50 rounded-lg p-3 mt-2">
                        <h3 className="text-xs font-medium text-blue-800 mb-1 flex items-center gap-1">
                            <Info size={12} />
                            How this assignment works
                        </h3>
                        <p className="text-xs text-blue-700">
                            {assignment.assignmentType === "tag" 
                                ? `When tag "${assignment?.tag?.tagCode || "assigned"}" is scanned, this quote will be delivered based on its priority level.`
                                : `When user ${assignment?.user?.name || "assigned"} scans any tag, this quote will be delivered based on its priority level.`}
                        </p>
                    </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}