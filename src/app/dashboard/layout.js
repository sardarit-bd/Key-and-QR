'use client'

import { useAuthStore } from '@/store/authStore';
import { Clock, CreditCard, Heart, Home, House, LayoutDashboard, LogOut, Mail, Menu, Package, QrCode, Quote, Send, ShoppingBag, Tag, User, X, Settings, Image, FileText, Palette, Eye, LayoutTemplate } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { BsQrCodeScan } from 'react-icons/bs';
import Avatar from '@/shared/Avatar';

export default function DashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuthStore();
    const pathname = usePathname();
    const router = useRouter();

    const [isMobile, setIsMobile] = useState(false);
    const [isPageSettingsOpen, setIsPageSettingsOpen] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isSidebarOpen]);

    // Auto expand Page Settings if current path is under settings
    useEffect(() => {
        if (pathname?.includes('/dashboard/admin/settings')) {
            setIsPageSettingsOpen(true);
        }
    }, [pathname]);

    /********************* Page Settings Submenu Items **************************/
    const pageSettingsItems = [
        { icon: LayoutTemplate, label: 'Hero Section', link: "/dashboard/admin/settings/hero" },
        { icon: Image, label: 'Banner Images', link: "/dashboard/admin/settings/banners" },
        { icon: Palette, label: 'Theme Settings', link: "/dashboard/admin/settings/theme" },
        { icon: FileText, label: 'Pages', link: "/dashboard/admin/settings/pages" },
        { icon: Eye, label: 'SEO Settings', link: "/dashboard/admin/settings/seo" },
    ];

    /********************* menu item for admin **************************/
    const menuItemsforAdmin = [
        { icon: LayoutDashboard, label: 'Dashboard', link: "/dashboard/admin" },
        { icon: Package, label: 'Products', link: "/dashboard/admin/products" },
        { icon: Tag, label: 'Tags', link: "/dashboard/admin/tags" },
        { icon: Quote, label: 'Quotes', link: "/dashboard/admin/quotes" },
        { icon: ShoppingBag, label: 'All Orders', link: "/dashboard/admin/orders" },
        { icon: Clock, label: 'Pending Quotes', link: "/dashboard/admin/pending" },
        { icon: QrCode, label: 'Scan History', link: "/dashboard/admin/qr-history" },
        { icon: CreditCard, label: 'Subscription', link: "/dashboard/admin/subscription" },
        { icon: Settings, label: 'Page Settings', link: "#", isSubmenu: true, submenuItems: pageSettingsItems },
        { icon: User, label: 'My Profile', link: "/dashboard/admin/profile" },
    ];

    /********************* menu item for user **************************/
    const menuItemsforUser = [
        { icon: House, label: 'Dashboard', link: "/dashboard/user" },
        { icon: BsQrCodeScan, label: 'Scan History', link: "/dashboard/user/scan-history" },
        { icon: Quote, label: 'My Quote', link: "/dashboard/user/myquotes" },
        { icon: Send, label: 'Submit Quote', link: "/dashboard/user/submit-quote" },
        { icon: Heart, label: 'Favorites', link: "/dashboard/user/favorites" },
        { icon: ShoppingBag, label: 'Orders', link: "/dashboard/user/orders" },
        { icon: CreditCard, label: 'Subscription', link: "/dashboard/user/subscription" },
        { icon: User, label: 'Profile', link: "/dashboard/user/profile" },
    ];

    const RoleDesider = user?.role === "admin" ? menuItemsforAdmin : menuItemsforUser;

    // Get user initials for avatar (fallback)
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

    //handle logout function
    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const goToHome = () => {
        router.push("/");
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile Header with Menu Button */}
            {isMobile && (
                <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label="Open menu"
                    >
                        <Menu size={24} className="text-gray-700" />
                    </button>
                    <h1 className="text-sm font-semibold text-gray-900">
                        {user?.role === "admin" ? "Admin Panel" : "Dashboard"}
                    </h1>
                    <button
                        onClick={goToHome}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label="Go to home"
                    >
                        <Home size={20} className="text-blue-600" />
                    </button>
                </div>
            )}

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`lg:hidden fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Sidebar Header with Close Button */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label="Close menu"
                    >
                        <X size={22} className="text-gray-600" />
                    </button>
                </div>

                {/* Profile Section - Using Avatar Component */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <Avatar user={user} size="md" />
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 capitalize truncate">
                                {user?.name}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">
                                {user?.email}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                                {getProviderIcon()}
                                <p className="text-xs text-gray-400">{getProviderText()}</p>
                            </div>
                            <p className="text-xs bg-green-100 text-green-700 w-fit px-2 py-0.5 rounded-full mt-1">
                                {user?.role === "admin" ? "Administrator" : "User"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                    {/* Home Button */}
                    <button
                        onClick={() => {
                            goToHome();
                            setIsSidebarOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-blue-600 hover:bg-blue-50 mb-3 border border-blue-200 cursor-pointer"
                    >
                        <Home size={18} />
                        <span>Go to Homepage</span>
                    </button>

                    <div className="border-t border-gray-200 my-2"></div>

                    {/* Dashboard Menu Items */}
                    {RoleDesider?.map((item, index) => {
                        // Check if it's Page Settings with submenu
                        if (item.isSubmenu && user?.role === "admin") {
                            return (
                                <div key={index}>
                                    <button
                                        onClick={() => setIsPageSettingsOpen(!isPageSettingsOpen)}
                                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm transition-colors cursor-pointer ${
                                            isPageSettingsOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={18} />
                                            <span>{item.label}</span>
                                        </div>
                                        <svg 
                                            className={`w-4 h-4 transition-transform duration-200 ${isPageSettingsOpen ? 'rotate-180' : ''}`}
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    
                                    {/* Submenu Items */}
                                    {isPageSettingsOpen && (
                                        <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-200 pl-3">
                                            {item.submenuItems.map((subItem, subIndex) => {
                                                const isActive = pathname === subItem.link;
                                                return (
                                                    <Link
                                                        href={subItem.link}
                                                        key={subIndex}
                                                        onClick={() => setIsSidebarOpen(false)}
                                                        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                                                            isActive 
                                                                ? 'bg-gray-200 text-gray-900 font-medium' 
                                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                                        }`}
                                                    >
                                                        <subItem.icon size={16} />
                                                        <span>{subItem.label}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }
                        
                        // Regular menu item
                        return (
                            <Link
                                href={item.link}
                                key={index}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors cursor-pointer ${
                                    item.link === pathname 
                                        ? 'bg-gray-200 text-gray-900 font-medium' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-red-600 hover:bg-red-50 border border-red-200 cursor-pointer"
                    >
                        <LogOut size={18} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block sticky top-0 h-screen w-64 bg-white border-r border-gray-200 p-6 overflow-y-auto">
                {/* Profile Section - Using Avatar Component */}
                <div className="flex flex-col items-center mb-8">
                    <div className="p-[2px] rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
                        <Avatar user={user} size="lg" />
                    </div>

                    <h3 className="font-semibold text-gray-900 capitalize text-center">
                        {user?.name}
                    </h3>

                    <p className="text-sm text-gray-500 text-center break-all">
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
                    {RoleDesider?.map((item, index) => {
                        // Check if it's Page Settings with submenu
                        if (item.isSubmenu && user?.role === "admin") {
                            return (
                                <div key={index}>
                                    <button
                                        onClick={() => setIsPageSettingsOpen(!isPageSettingsOpen)}
                                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                                            isPageSettingsOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={18} />
                                            <span>{item.label}</span>
                                        </div>
                                        <svg 
                                            className={`w-4 h-4 transition-transform duration-200 ${isPageSettingsOpen ? 'rotate-180' : ''}`}
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    
                                    {/* Submenu Items */}
                                    {isPageSettingsOpen && (
                                        <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-200 pl-3">
                                            {item.submenuItems.map((subItem, subIndex) => {
                                                const isActive = pathname === subItem.link;
                                                return (
                                                    <Link
                                                        href={subItem.link}
                                                        key={subIndex}
                                                        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                                                            isActive 
                                                                ? 'bg-gray-200 text-gray-900 font-medium' 
                                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                                        }`}
                                                    >
                                                        <subItem.icon size={16} />
                                                        <span>{subItem.label}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }
                        
                        // Regular menu item
                        return (
                            <Link
                                href={item.link}
                                key={index}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                                    item.link === pathname
                                        ? 'bg-gray-200 text-gray-900 font-medium'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button - Desktop */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-red-600 hover:bg-red-50 border border-red-200 mt-6 cursor-pointer"
                >
                    <LogOut size={18} />
                    <span>Log Out</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 w-full ${isMobile ? 'mt-14' : ''}`}>
                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}