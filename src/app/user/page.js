"use client";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import QuoteCard from "./components/QuoteCard";
import StatsCard from "./components/StatsCard";
import RecentOrders from "./components/RecentOrders";

export default function Dashboard() {
    return (
        <section className="flex gap-6 px-4 max-w-7xl mx-auto">
            {/* Main Content */}
            <div className="flex-1">

                <Header />

                <QuoteCard />

                <StatsCard />

                <RecentOrders />

            </div>

        </section>
    );
}
