"use client";
import { Heart, ShoppingBag, QrCode } from "lucide-react";
import { useUserStore } from "@/store/userStore";

export default function StatsCard() {
    const { orders, favorites, qrScans } = useUserStore();

    const items = [
        { label: "Total Orders", value: orders, icon: ShoppingBag },
        { label: "Favorites", value: favorites, icon: Heart },
        { label: "QR Scans", value: qrScans, icon: QrCode },
    ];

    return (
        <div className="grid grid-cols-3 gap-4 mt-6">
            {items.map((item, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow-sm text-center">
                    <item.icon className="mx-auto mb-1 text-gray-700" size={20} />
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-xl font-semibold">{String(item.value).padStart(2, "0")}</p>
                </div>
            ))}
        </div>
    );
}
