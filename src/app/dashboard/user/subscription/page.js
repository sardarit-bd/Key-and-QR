
'use client'



import { useState } from 'react';


const DashboardSubscription = () => {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState(null);



    const orders = [
        { id: '1', date: '11/10/2025', item: '28/10/2025', amount: '$32.032', status: 'Trial' },
    ];



    return (
        <div className="flex-1 w-full p-4">


            {/* Recent Orders */}
            <div className="bg-white rounded-lg border border-gray-200 mb-4 lg:mb-6">
                <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">Subscriptions</h2>
                </div>


                <div className='py-6 px-4 flex flex-col'>



                    <div className="overflow-x-auto mb-6">
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


                    <button className='text-white w-full md:w-fit bg-black px-3 py-2 rounded-md cursor-pointer'>Manage Subscriptions</button>

                </div>

            </div>


        </div>
    )
}

export default DashboardSubscription;