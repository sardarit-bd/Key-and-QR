'use client'



import { CreditCard, Heart, Package, QrCode, Settings, ShoppingBag } from 'lucide-react';
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
          </div>
        </div>
      </main >

    </>
  );
}