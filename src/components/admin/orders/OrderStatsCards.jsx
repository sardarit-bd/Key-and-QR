import { Package, Clock, Tag, Truck, CheckCircle, CreditCard, Ban, Undo2, RotateCcw } from "lucide-react";

export default function OrderStatsCards({ stats, totalOrders }) {
    const statsCards = [
        { label: "Total Orders", value: stats.total || totalOrders, icon: Package, color: "text-gray-900", bgIcon: "text-gray-400" },
        { label: "Pending", value: stats.pending || 0, icon: Clock, color: "text-yellow-600", bgIcon: "text-yellow-500" },
        { label: "Assigned", value: stats.assigned || 0, icon: Tag, color: "text-purple-600", bgIcon: "text-purple-500" },
        { label: "Shipped", value: stats.shipped || 0, icon: Truck, color: "text-blue-600", bgIcon: "text-blue-500" },
        { label: "Delivered", value: stats.delivered || 0, icon: CheckCircle, color: "text-green-600", bgIcon: "text-green-500" },
        { label: "Cancelled", value: stats.cancelled || 0, icon: Ban, color: "text-red-600", bgIcon: "text-red-500" },
        { label: "Returned", value: stats.returned || 0, icon: Undo2, color: "text-orange-600", bgIcon: "text-orange-500" },
        { label: "Paid", value: stats.paid || 0, icon: CreditCard, color: "text-green-600", bgIcon: "text-green-500" },
        { label: "Refunded", value: stats.refunded || 0, icon: RotateCcw, color: "text-purple-600", bgIcon: "text-purple-500" }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-3 mb-6">
            {statsCards.map((card, idx) => (
                <div key={idx} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">{card.label}</span>
                        <card.icon size={14} className={card.bgIcon} />
                    </div>
                    <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
                </div>
            ))}
        </div>
    );
}