'use client'



import { CreditCard, Heart, LogOut, Menu, Package, QrCode, Settings, ShoppingBag, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function DashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const pathname = usePathname();

    const menuItems = [
        { icon: Package, label: 'Dashboard', active: true, link: "/dashboard" },
        { icon: ShoppingBag, label: 'My Orders', active: false, link: "/dashboard/orders" },
        { icon: Heart, label: 'Favorites', active: false, link: "/dashboard/favorites" },
        { icon: QrCode, label: 'QR History', active: false, link: "/dashboard/qr-history" },
        { icon: CreditCard, label: 'Subscription', active: false, link: "/dashboard/subscription" },
        { icon: Settings, label: 'Account Settings', active: false, link: "/dashboard/settings" },
    ];

    const orders = [
        { id: 'ORD-001', date: '11/10/2025', item: 'Digital Keychain', amount: '$32.032', status: 'Delivered' },
        { id: 'ORD-002', date: '11/10/2025', item: 'Digital Keychain', amount: '$32.032', status: 'Delivered' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed top-2 left-4 z-50 p-2"
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
            <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 p-6">
                {/* Profile Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mb-4 overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h3 className="font-semibold text-gray-900">John Doe</h3>
                    <p className="text-sm text-gray-500">alma.lawson@gmail.com</p>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                    {menuItems.map((item, index) => (
                        <Link
                            href={item.link}
                            key={index}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${item.link === pathname
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors mt-4">
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
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">John Doe</h3>
                            <p className="text-xs text-gray-500">alma.lawson@gmail.com</p>
                        </div>
                    </div>
                </div>

                <nav className="space-y-1">
                    {menuItems.map((item, index) => (
                        <Link
                            href={item?.link}
                            key={index}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${item.link === pathname
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors mt-4"
                    >
                        <LogOut size={18} />
                        <span>Log Out</span>
                    </button>
                </nav>
            </aside>

            {
                children
            }
        </div>
    );
}