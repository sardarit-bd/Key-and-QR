
'use client'



import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';


const DashboardFavorites = () => {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState(null);


    const orders = [
        { id: '1', date: '11/10/2025', item: '28/10/2025', amount: '$32.032', status: 'Trial' },
        { id: '2', date: '11/10/2025', item: '28/10/2025', amount: '$32.032', status: 'Trial' },
        { id: '3', date: '11/10/2025', item: '28/10/2025', amount: '$32.032', status: 'Trial' },
        { id: '4', date: '11/10/2025', item: '28/10/2025', amount: '$32.032', status: 'Trial' },
        { id: '5', date: '11/10/2025', item: '28/10/2025', amount: '$32.032', status: 'Trial' },
    ];


    return (
        <div className="flex-1 w-full p-4">


            {/* Recent Orders */}
            <div className="bg-white rounded-lg border border-gray-200 mb-4 lg:mb-6">
                <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">Subscriptions</h2>
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left p-4 text-sm font-medium text-gray-600">SL</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-600">Start Date</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-600">End Date</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-600">Amount</th>
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
    )
}

export default DashboardFavorites;