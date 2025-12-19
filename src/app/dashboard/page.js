'use client'



import { ChevronDown, ChevronUp, CreditCard, Heart, LogOut, Menu, Package, QrCode, Scan, Settings, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const menuItems = [
    { icon: Package, label: 'Dashboard', active: true },
    { icon: ShoppingBag, label: 'My Orders', active: false },
    { icon: Heart, label: 'Favorites', active: false },
    { icon: QrCode, label: 'QR History', active: false },
    { icon: CreditCard, label: 'Subscription', active: false },
    { icon: Settings, label: 'Account Settings', active: false },
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
            <button
              key={index}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${item.active
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
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
            <button
              key={index}
              onClick={() => setIsSidebarOpen(false)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${item.active
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
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

      {/* Main Content */}
      <main className="flex-1 w-full">
        {/* Mobile Profile Header */}
        <div className="lg:hidden px-4 pt-16 pb-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
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
              <ChevronDown size={20} className="text-gray-400" />
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-2">
              <div>
                <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
                  Good Afternoon, <span className="text-gray-900">John!</span>
                </h1>
                <p className="text-sm text-gray-500">Welcome back to your dashboard</p>
              </div>
              <div className="text-left lg:text-right text-sm text-gray-500">
                <div>Wednesday</div>
                <div>11/12/2025</div>
              </div>
            </div>
          </div>

          {/* Daily Quote */}
          <div className="bg-white rounded-lg p-4 lg:p-6 mb-4 lg:mb-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900 text-sm lg:text-base">Your Daily Quote</h2>
              <span className="text-xs bg-gray-100 px-2 lg:px-3 py-1 rounded-full text-gray-600 flex items-center gap-1">
                <span className="text-base lg:text-lg">💡</span> Motivation
              </span>
            </div>
            <p className="text-sm lg:text-base text-gray-700 italic mb-2">
              "Happiness can be found even in the darkest of times, if one only remembers to turn on the light."
            </p>
            <p className="text-xs lg:text-sm text-gray-500">— J.K. Rowling</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-white rounded-lg p-4 lg:p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Orders</span>
                <Package size={20} className="text-gray-400" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900">08</div>
            </div>

            <div className="bg-white rounded-lg p-4 lg:p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Favorites</span>
                <Heart size={20} className="text-gray-400" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900">02</div>
            </div>

            <div className="bg-white rounded-lg p-4 lg:p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">QR Scans</span>
                <QrCode size={20} className="text-gray-400" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900">03</div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg border border-gray-200 mb-4 lg:mb-6">
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Recent Orders</h2>
              <button className="px-3 lg:px-4 py-2 bg-gray-900 text-white text-xs lg:text-sm rounded-lg hover:bg-gray-800 transition-colors">
                View All
              </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Order ID</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Items</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Total</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm text-gray-900">{order.id}</td>
                      <td className="p-4 text-sm text-gray-600">{order.date}</td>
                      <td className="p-4 text-sm text-gray-600">{order.item}</td>
                      <td className="p-4 text-sm text-gray-900 font-medium">{order.amount}</td>
                      <td className="p-4">
                        <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-100">
              {orders.map((order, index) => (
                <div key={index} className="p-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedOrder(expandedOrder === index ? null : index)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900 text-sm">{order.id}</span>
                        {expandedOrder === index ? (
                          <ChevronUp size={20} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{order.item}</div>
                    </div>
                  </div>

                  {expandedOrder === index && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 animate-fadeIn">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Date:</span>
                        <span className="text-gray-900">{order.date}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total:</span>
                        <span className="text-gray-900 font-medium">{order.amount}</span>
                      </div>
                      <div className="flex justify-between text-sm items-center">
                        <span className="text-gray-500">Status:</span>
                        <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <button className="bg-white rounded-lg p-4 lg:p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShoppingBag size={24} className="text-gray-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 mb-1">Shop Keychains</h3>
                  <p className="text-sm text-gray-500">Browse our collection</p>
                </div>
              </div>
            </button>

            <button className="bg-white rounded-lg p-4 lg:p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Scan size={24} className="text-gray-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 mb-1">Scan QR Code</h3>
                  <p className="text-sm text-gray-500">View your keychain cycle</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}