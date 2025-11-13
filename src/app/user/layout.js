import Sidebar from "./components/Sidebar";

export default function DashboardLayout({ children }) {
    return (
        <section className="flex gap-6 px-4 py-10 container mx-auto">
            <Sidebar />
            <div className="flex-1">{children}</div>
        </section>
    );
}
