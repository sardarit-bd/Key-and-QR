"use client";

import { useState, useEffect } from "react";
import { X, Tag, User, Power, PowerOff, Calendar, Link2, Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function QuoteDetailsModal({ assignment, onClose }) {
  const [relatedAssignments, setRelatedAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState(null);

  useEffect(() => {
    if (assignment?.quote?._id) {
      fetchRelatedAssignments();
      fetchQuoteDetails();
    }
  }, [assignment]);

  const fetchRelatedAssignments = async () => {
    if (!assignment?.quote?._id) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/quote-assignments?limit=100`);
      const allAssignments = response.data?.data || [];
      
      const filtered = allAssignments.filter(
        a => a.quote?._id === assignment.quote?._id
      );
      setRelatedAssignments(filtered);
    } catch (error) {
      console.error("Failed to fetch related assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuoteDetails = async () => {
    try {
      const response = await api.get(`/quotes/${assignment.quote._id}`);
      setQuoteDetails(response.data?.data);
    } catch (error) {
      console.error("Failed to fetch quote details:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <Link2 size={20} className="text-gray-900" />
            <h2 className="text-lg font-semibold text-gray-900">Assignment Details</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quote Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quote Information</h3>
            <div className="space-y-2">
              <p className="text-gray-900 text-lg leading-relaxed">“{assignment?.quote?.text}”</p>
              <div className="flex flex-wrap gap-3">
                <span className="text-sm text-gray-500">— {assignment?.quote?.author || "Unknown"}</span>
                <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full">{assignment?.quote?.category}</span>
                {!assignment?.quote?.allowReuse && (
                  <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">One-time use</span>
                )}
              </div>
            </div>
          </div>

          {/* Current Assignment Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Current Assignment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Assignment Type</p>
                <div className="flex items-center gap-2 mt-1">
                  {assignment.assignmentType === "tag" ? (
                    <><Tag size={14} className="text-gray-700" /><span className="font-medium">Tag Assignment</span></>
                  ) : (
                    <><User size={14} className="text-gray-700" /><span className="font-medium">User Assignment</span></>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Target</p>
                <p className="font-medium mt-1">
                  {assignment.assignmentType === "tag" 
                    ? assignment?.tag?.tagCode 
                    : assignment?.user?.name}
                </p>
                {assignment.assignmentType === "user" && (
                  <p className="text-xs text-gray-500">{assignment?.user?.email}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500">Priority</p>
                <p className="font-medium mt-1">{assignment.priority || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-full ${
                    assignment.isActive ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-600"
                  }`}>
                    {assignment.isActive ? <Power size={10} /> : <PowerOff size={10} />}
                    {assignment.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Created At</p>
                <p className="text-sm mt-1">{new Date(assignment.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* All Assignments for this Quote */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              All Assignments for this Quote ({relatedAssignments.length})
            </h3>
            
            {loading ? (
              <div className="py-8 text-center">
                <Loader2 size={30} className="animate-spin mx-auto text-gray-400" />
              </div>
            ) : relatedAssignments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No other assignments found</p>
            ) : (
              <div className="space-y-2">
                {relatedAssignments.map((assign) => (
                  <div key={assign._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {assign.assignmentType === "tag" ? (
                          <>
                            <Tag size={12} className="text-gray-500" />
                            <span className="font-mono text-sm">{assign?.tag?.tagCode}</span>
                            {assign?.tag?.owner && (
                              <span className="text-xs text-gray-500">(Owner: {assign.tag.owner?.name || "Unknown"})</span>
                            )}
                          </>
                        ) : (
                          <>
                            <User size={12} className="text-gray-500" />
                            <div>
                              <span className="text-sm font-medium">{assign?.user?.name}</span>
                              <span className="text-xs text-gray-500 ml-2">{assign?.user?.email}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span>Priority: {assign.priority || 0}</span>
                        <span>Created: {new Date(assign.createdAt).toLocaleDateString()}</span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs ${
                          assign.isActive ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-600"
                        }`}>
                          {assign.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}