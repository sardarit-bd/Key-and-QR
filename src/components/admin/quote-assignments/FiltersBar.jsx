import { Search, X, RefreshCw, Filter } from "lucide-react";
import { useState, useRef } from "react";

export default function FiltersBar({
    assignmentType,
    setAssignmentType,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    onRefresh
}) {
    const [localSearch, setLocalSearch] = useState(searchTerm);
    const searchTimeout = useRef(null);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setLocalSearch(value);
        
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setSearchTerm(value);
        }, 500);
    };

    const handleClearSearch = () => {
        setLocalSearch("");
        setSearchTerm("");
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by quote text, tag code, or user email..."
                        value={localSearch}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400"
                    />
                    {localSearch && (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                            <X size={16} className="text-gray-400 hover:text-gray-600" />
                        </button>
                    )}
                </div>

                {/* Assignment Type Filter */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setAssignmentType("all")}
                        className={`px-3 py-1.5 rounded-lg text-sm transition ${
                            assignmentType === "all"
                                ? "bg-gray-900 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        All Types
                    </button>
                    <button
                        onClick={() => setAssignmentType("tag")}
                        className={`px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-1 ${
                            assignmentType === "tag"
                                ? "bg-purple-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Tag
                    </button>
                    <button
                        onClick={() => setAssignmentType("user")}
                        className={`px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-1 ${
                            assignmentType === "user"
                                ? "bg-green-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        User
                    </button>
                </div>

                {/* Status Filter */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setStatusFilter("all")}
                        className={`px-3 py-1.5 rounded-lg text-sm transition ${
                            statusFilter === "all"
                                ? "bg-gray-900 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setStatusFilter("active")}
                        className={`px-3 py-1.5 rounded-lg text-sm transition ${
                            statusFilter === "active"
                                ? "bg-green-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setStatusFilter("inactive")}
                        className={`px-3 py-1.5 rounded-lg text-sm transition ${
                            statusFilter === "inactive"
                                ? "bg-red-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Inactive
                    </button>
                </div>

                {/* Refresh */}
                <button
                    onClick={onRefresh}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    title="Refresh"
                >
                    <RefreshCw size={18} className="text-gray-500" />
                </button>
            </div>
        </div>
    );
}