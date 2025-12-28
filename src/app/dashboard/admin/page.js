'use client'



import { ChevronDown, ChevronUp, CreditCard, Heart, Package, QrCode, Settings, ShoppingBag } from 'lucide-react';
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

    <>
      {/* Main Content */}
      < main className="flex-1 w-full">
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
        </div>
      </main >

    </>
  );
}