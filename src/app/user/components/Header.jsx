"use client";
import { useUserStore } from "@/store/userStore";

export default function Header() {
    const { user } = useUserStore();

    return (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-800">Good Afternoon, {user.name}!</h2>
                <p className="text-gray-500">Welcome back to your dashboard</p>
            </div>

            <div className="text-right">
                <p className="text-sm text-gray-500">{user.day}</p>
                <p className="text-sm text-gray-400">{user.joinDate}</p>
            </div>
        </div>
    );
}
