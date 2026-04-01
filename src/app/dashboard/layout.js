'use client'

import { useAuthStore } from '@/store/authStore';
import { Clock, CreditCard, Heart, House, LayoutDashboard, LogOut, Mail, Menu, Package, QrCode, Quote, Send, ShoppingBag, Tag, User, X } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa'; // ← react-icons থেকে Google icon

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const { user, logout } = useAuthStore();
    const pathname = usePathname();
    const router = useRouter();

    /********************* menu item for admin **************************/
    const menuItemsforAdmin = [
        { icon: LayoutDashboard, label: 'Dashboard', active: true, link: "/dashboard/admin" },
        { icon: Package, label: 'Add Products', active: true, link: "/dashboard/admin/products" },
        { icon: Tag, label: 'Add Tags', active: true, link: "/dashboard/admin/tags" },
        { icon: Quote, label: 'Add Quotes', active: true, link: "/dashboard/admin/quotes" },
        { icon: ShoppingBag, label: 'All Orders', active: false, link: "/dashboard/admin/orders" },
        { icon: Clock, label: 'Pending Quotes', active: false, link: "/dashboard/admin/pending" },
        { icon: QrCode, label: 'Scan History', active: false, link: "/dashboard/admin/qr-history" },
        { icon: CreditCard, label: 'Subscription', active: false, link: "/dashboard/admin/subscription" },
        { icon: User, label: 'My Profile', active: false, link: "/dashboard/admin/profile" },
    ];

    /********************* menu item for user **************************/
    const menuItemsforUser = [
        { icon: House, label: 'Home', active: true, link: "/dashboard/user" },
        { icon: Quote, label: 'My Quote', active: true, link: "/dashboard/user/myquotes" },
        { icon: Send, label: 'Submit Quote', active: true, link: "/dashboard/user/submit-quote" },
        { icon: Heart, label: 'Favorites', active: false, link: "/dashboard/user/favorites" },
        { icon: ShoppingBag, label: 'Orders', active: false, link: "/dashboard/user/orders" },
        { icon: CreditCard, label: 'Subscription', active: false, link: "/dashboard/user/subscription" },
        { icon: User, label: 'Profile', active: false, link: "/dashboard/user/profile" },
    ];

    const orders = [
        { id: 'ORD-001', date: '11/10/2025', item: 'Digital Keychain', amount: '$32.032', status: 'Delivered' },
        { id: 'ORD-002', date: '11/10/2025', item: 'Digital Keychain', amount: '$32.032', status: 'Delivered' },
    ];

    const RoleDesider = user?.role === "admin" ? menuItemsforAdmin : menuItemsforUser;

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user?.name) return "U";
        return user.name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Get provider icon
    const getProviderIcon = () => {
        if (user?.provider === "google") {
            return <FaGoogle size={12} className="text-blue-500" />;
        }
        return <Mail size={12} className="text-gray-500" />;
    };

    // Get provider text
    const getProviderText = () => {
        if (user?.provider === "google") {
            return "Google";
        }
        return "Email";
    };

    //handle logout function is here
    const handleLogout = () => {
        logout();
        router.push("/login");
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed top-2 right-4 w-fit md:left-4 z-50 p-2"
            >
                {isSidebarOpen ? <X size={26} className='cursor-pointer' /> : <Menu size={26} className='cursor-pointer' />}
            </button>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black opacity-40 z-30"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Desktop Only */}
            <aside className="hidden sticky h-screen top-14 lg:block w-64 bg-white border-r border-gray-200 p-6">
                {/* Profile Section */}
                <div className="flex flex-col items-center mb-8">

                    {/* Gradient Border Wrapper */}
                    <div className="p-[2px] rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-4">

                        {/* Inner circle */}
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden flex items-center justify-center">

                            {user?.profileImage?.url ? (
                                <img
                                    src={user.profileImage.url}
                                    alt={user.name}
                                    className="w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                <span className="text-white text-2xl font-bold">
                                    {getUserInitials()}
                                </span>
                            )}
                        </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 capitalize">
                        {user?.name}
                    </h3>

                    <p className="text-sm text-gray-500">
                        {user?.email}
                    </p>

                    <div className="flex items-center gap-1 mt-1">
                        {getProviderIcon()}
                        <p className="text-xs text-gray-400">
                            {getProviderText()} account
                        </p>
                    </div>

                    <p className="text-xs bg-green-100 text-green-700 w-fit px-3 py-1 rounded-full mt-2">
                        {user?.role === "admin" ? "Administrator" : "User"}
                    </p>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                    {RoleDesider?.map((item, index) => (
                        <Link
                            href={item.link}
                            key={index}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${item.link === pathname
                                ? 'bg-gray-300'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="bg-gray-900 text-white absolute bottom-20 w-[200px] flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-gray-800 hover:translate-x-1 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 ease-in-out cursor-pointer"
                    >
                        <LogOut size={18} />
                        <span>Log Out</span>
                    </button>
                </nav>
            </aside>

            {/* Mobile Sidebar */}
            <aside
                className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 p-6 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="mb-6 pt-12">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden flex items-center justify-center">
                            {user?.profileImage?.url ? (
                                <img
                                    src={user.profileImage.url}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white text-base font-bold">
                                    {getUserInitials()}
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 capitalize">{user?.name}</h3>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                                {getProviderIcon()}
                                <p className="text-xs text-gray-400">{getProviderText()}</p>
                            </div>
                            <p className="text-xs bg-green-100 text-green-700 w-fit px-2 py-0.5 rounded-full mt-1">
                                {user?.role === "admin" ? "Admin" : "User"}
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="space-y-1">
                    {RoleDesider?.map((item, index) => (
                        <Link
                            href={item?.link}
                            key={index}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${item.link === pathname
                                ? 'bg-gray-300'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="bg-gray-900 text-white absolute bottom-5 w-[200px] flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-gray-800 transition-colors mt-4 cursor-pointer"
                    >
                        <LogOut size={18} />
                        <span>Log Out</span>
                    </button>
                </nav>
            </aside>

            <main className="flex-1 w-full">
                {children}
            </main>
        </div>
    );
}