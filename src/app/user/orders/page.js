"use client";

import Image from "next/image";

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
        date: "11/05/2025",
        item: "Flex QR Keyring",
        price: "$600.00",
        status: "Processing",
    },
];

export default function MyOrders() {
    return (
        <div className="p-6 bg-white rounded-xl shadow-sm">

            <h2 className="text-xl font-semibold mb-4">My Orders</h2>

            <table className="w-full text-sm">
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
                    {orders.map((o, i) => (
                        <tr key={i} className="border-b">
                            <td className="py-3">{o.id}</td>
                            <td>{o.date}</td>
                            <td>{o.item}</td>
                            <td>{o.price}</td>
                            <td
                                className={`${o.status === "Delivered"
                                    ? "text-green-600"
                                    : "text-yellow-600"
                                    }`}
                            >
                                {o.status}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
