"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { redirect } from "next/navigation";
import Sidebar from "./components/Sidebar";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({ children }) {
    const { user, hydrated } = useAuthStore();

    // Mobile sidebar toggle
    const [open, setOpen] = useState(false);

    // Lock scroll when sidebar open
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "auto";
        return () => (document.body.style.overflow = "auto");
    }, [open]);

    // Auth check
    if (!hydrated) return null;
    if (!user) redirect("/login");

    return (
        <section className="relative min-h-screen">

            {/* 🔥 Mobile Top Bar (Sidebar toggle) */}
            <div className="md:hidden flex items-center justify-between px-4 py-4 shadow-sm bg-white sticky top-0 z-40">
                <h2 className="text-lg font-semibold">Dashboard</h2>

                <button onClick={() => setOpen(true)}>
                    <Menu size={26} />
                </button>
            </div>

            {/* Main Layout */}
            <div className="container mx-auto px-4 py-6 flex gap-6">

                {/* 🔥 DESKTOP SIDEBAR */}
                <div className="hidden md:block w-64 shrink-0">
                    <Sidebar />
                </div>

                {/* MAIN CONTENT */}
                <div className="flex-1">{children}</div>
            </div>

            {/* ================================
                MOBILE DRAWER SIDEBAR
            ================================= */}
            {/* BACKDROP */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* SLIDING SIDEBAR */}
            <div
                className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-lg transform transition-transform duration-300 
                ${open ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b">
                    <h3 className="text-lg font-semibold">Menu</h3>
                    <button onClick={() => setOpen(false)}>
                        <X size={26} className="text-gray-700" />
                    </button>
                </div>

                {/* Drawer Sidebar Component */}
                <div className="p-4">
                    <Sidebar onNavigate={() => setOpen(false)} />
                </div>
            </div>
        </section>
    );
}
