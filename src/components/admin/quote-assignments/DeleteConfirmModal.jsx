"use client";

import { X } from "lucide-react";

export default function DeleteConfirmModal({ assignment, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Delete Assignment</h2>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-gray-700">Are you sure you want to delete this assignment?</p>
          <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
          
          {assignment?.quote?.text && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Quote:</p>
              <p className="text-sm text-gray-700 line-clamp-2">“{assignment.quote.text.substring(0, 100)}...”</p>
            </div>
          )}
          
          <div className="mt-3">
            <p className="text-xs text-gray-500">
              Target: {assignment.assignmentType === "tag" 
                ? assignment?.tag?.tagCode 
                : assignment?.user?.name}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}