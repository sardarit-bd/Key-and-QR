import { Search, RefreshCw, Package, Clock, Tag, Truck, CheckCircle } from "lucide-react";

const filterOptions = [
    { value: "all", label: "All Orders", icon: Package, color: "bg-gray-800" },
    { value: "pending", label: "Pending", icon: Clock, color: "bg-yellow-500" },
    { value: "assigned", label: "Assigned", icon: Tag, color: "bg-purple-500" },
    { value: "shipped", label: "Shipped", icon: Truck, color: "bg-blue-500" },
    { value: "delivered", label: "Delivered", icon: CheckCircle, color: "bg-green-500" }
];

export default function OrderFilters({
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    onRefresh
}) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by order ID, customer name, email, or product..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {filterOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setFilterStatus(option.value)}
                            className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition ${filterStatus === option.value
                                    ? `${option.color} text-white`
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            <option.icon size={14} />
                            {option.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={onRefresh}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    title="Refresh"
                >
                    <RefreshCw size={18} />
                </button>
            </div>
        </div>
    );
}