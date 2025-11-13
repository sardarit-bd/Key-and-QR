"use client";

const orders = [
    {
        id: "ORD-001",
        date: "11/10/2025",
        item: "Digital Keychain",
        price: "$250.00",
        status: "Delivered",
    },
    {
        id: "ORD-002",
        date: "11/09/2025",
        item: "Digital Keychain",
        price: "$250.00",
        status: "Delivered",
    },
];

export default function RecentOrders() {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Recent Orders</h3>
                <button className="text-sm text-gray-600 hover:underline">View All</button>
            </div>

            <table className="w-full text-sm text-left">
                <thead>
                    <tr className="text-gray-500 border-b">
                        <th className="py-2">Order ID</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    {orders.map((order, i) => (
                        <tr key={i} className="border-b">
                            <td className="py-2">{order.id}</td>
                            <td>{order.date}</td>
                            <td>{order.item}</td>
                            <td>{order.price}</td>
                            <td className="text-green-600">{order.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
