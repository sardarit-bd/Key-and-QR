"use client";

import { Filter, RefreshCw } from "lucide-react";
import QuoteCustomSelect from "./QuoteCustomSelect";

export default function FilterBar({ filters, setFilters, onReset }) {
  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "tag", label: "Tag Assignments" },
    { value: "user", label: "User Assignments" },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "true", label: "Active Only" },
    { value: "false", label: "Inactive Only" },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap gap-3 items-center">
        <Filter size={18} className="text-gray-400" />
        <QuoteCustomSelect
          options={typeOptions}
          value={filters.assignmentType}
          onChange={(val) => setFilters(prev => ({ ...prev, assignmentType: val, currentPage: 1 }))}
          placeholder="All Types"
        />
        <QuoteCustomSelect
          options={statusOptions}
          value={filters.isActive}
          onChange={(val) => setFilters(prev => ({ ...prev, isActive: val, currentPage: 1 }))}
          placeholder="All Status"
        />
        <button
          onClick={onReset}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
          title="Reset Filters"
        >
          <RefreshCw size={16} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}