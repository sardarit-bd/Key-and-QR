import { RefreshCw } from "lucide-react";

export default function TagFilters({
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    onRefresh
}) {
    const filters = [
        { label: "All", value: "all", color: "bg-black" },
        { label: "Activated", value: "active", color: "bg-green-600" },
        { label: "Pending", value: "pending", color: "bg-yellow-600" },
        { label: "Disabled", value: "disabled", color: "bg-red-600" }
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search by tag code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                </div>
                <div className="flex gap-2">
                    {filters.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setFilterStatus(filter.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterStatus === filter.value
                                    ? `${filter.color} text-white`
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={onRefresh}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                    <RefreshCw size={18} />
                </button>
            </div>
        </div>
    );
}