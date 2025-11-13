"use client";

import Image from "next/image";
import Link from "next/link";

const favorites = [
    {
        id: 1,
        name: "Digital Keychain",
        price: "$250",
        image: "/shop/chabi1.png",
    },
    {
        id: 2,
        name: "Flex QR Keyring",
        price: "$600",
        image: "/shop/chabi2.png",
    },
];

export default function Favorites() {
    return (
        <div className="p-6 bg-white rounded-xl shadow-sm">

            <h2 className="text-xl font-semibold mb-6">Your Favorites</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {favorites.map((item) => (
                    <div key={item.id} className="border rounded-xl p-4 flex gap-4">

                        <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="rounded-lg"
                        />

                        <div className="flex-1">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-gray-500">{item.price}</p>

                            <Link
                                href={`/shop/${item.id}`}
                                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                            >
                                View Product →
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
