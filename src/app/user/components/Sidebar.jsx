"use client";
import Link from "next/link";
import Image from "next/image";
import { Home, Heart, QrCode, Settings, LogOut, ShoppingBag, Bookmark } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";

export default function Sidebar() {
    const { user } = useUserStore();
    const { logout } = useAuthStore();

    const menu = [
        { name: "Dashboard", icon: Home, link: "/user" },
        { name: "My Orders", icon: ShoppingBag, link: "/user/orders" },
        { name: "Favorites", icon: Heart, link: "/user/favorites" },
        { name: "QR History", icon: QrCode, link: "/user/qr-history" },
        { name: "Subscription", icon: Bookmark, link: "/user/subscription" },
        { name: "Account Settings", icon: Settings, link: "/user/settings" },
    ];

    return (
        <aside className="w-64 bg-white shadow rounded-xl p-6 h-full">
            <div className="text-center">
                <Image
                    src={user.avatar}
                    alt="User"
                    width={80}
                    height={80}
                    className="rounded-full mx-auto"
                />

                <h3 className="font-semibold mt-3">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
            </div>

            <ul className="mt-6 space-y-2">
                {menu.map((item) => (
                    <li key={item.name}>        
                        <Link
                            href={item.link}
                            className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-100 transition"
                        >
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    </li>
                ))}
 
                <li className="pt-4">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-2 rounded-md text-red-500 hover:bg-red-50 w-full transition">
                        <LogOut size={18} /> Log Out
                    </button>
                </li>
            </ul>
        </aside>
    );
}
