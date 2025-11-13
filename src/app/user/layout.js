"use client";

import { useAuthStore } from "@/store/authStore";
import { redirect } from "next/navigation";
import Sidebar from "./components/Sidebar";

export default function DashboardLayout({ children }) {
    const { user, hydrated } = useAuthStore();

    if (!hydrated) return null; // ← important

    if (!user) redirect("/login");

    return (
        <section className="flex gap-6 px-4 py-10 container mx-auto">
            <Sidebar />
            <div className="flex-1">{children}</div>
        </section>
    );
}
