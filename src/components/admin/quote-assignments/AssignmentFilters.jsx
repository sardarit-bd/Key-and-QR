"use client";

import { Filter, RefreshCw } from "lucide-react";

export default function AssignmentFilters({ filters, setFilters, onRefresh }) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap gap-3 items-center">
                <Filter size={18} className="text-gray-400" />
                <select
                    value={filters.assignmentType}
                    onChange={(e) => setFilters(prev => ({ ...prev, assignmentType: e.target.value, page: 1 }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                    <option value="">All Types</option>
                    <option value="tag">Tag Assignments</option>
                    <option value="user">User Assignments</option>
                </select>
                <select
                    value={filters.isActive}
                    onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value, page: 1 }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                    <option value="">All Status</option>
                    <option value="true">Active Only</option>
                    <option value="false">Inactive Only</option>
                </select>
                <button onClick={onRefresh} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <RefreshCw size={16} />
                </button>
            </div>
        </div>
    );
}