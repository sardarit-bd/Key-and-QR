"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const products = [
    {
        id: 1,
        title: "One Smart Keychain",
        desc: "Premium Matte Keychain with NFC & Dynamic QR",
        price: 500,
        oldPrice: 700,
        img: "/shop/chabi1.png",
    },
    {
        id: 2,
        title: "Digital Keychain",
        desc: "NFC + QR Smart Metal Keychain for Instant Sharing",
        price: 250,
        oldPrice: 350,
        img: "/shop/chabi2.png",
    },
    {
        id: 3,
        title: "Flex QR Keyring",
        desc: "Silicone Loop Keychain with QR Contact Code",
        price: 600,
        oldPrice: 350,
        img: "/shop/chabi4.png",
    },
    {
        id: 4,
        title: "One Smart Keychain",
        desc: "Premium Matte Keychain with NFC & Dynamic QR",
        price: 500,
        oldPrice: 700,
        img: "/shop/chabi6.png",
    },
    {
        id: 5,
        title: "Digital Keychain",
        desc: "NFC + QR Smart Metal Keychain for Instant Sharing",
        price: 250,
        oldPrice: 350,
        img: "/shop/chabi3.png",
    },
    {
        id: 6,
        title: "Flex QR Keyring",
        desc: "Silicone Loop Keychain with QR Contact Code",
        price: 600,
        oldPrice: 350,
        img: "/shop/chabi5.png",
    },
];

export default function RelatedProducts() {
    const [visibleCount, setVisibleCount] = useState(4);

    const handleShowMore = () => {
        setVisibleCount((prev) => prev + 4);
    };

    return (
        <section className="py-10 mt-16">
            <h2 className="text-center text-3xl font-semibold mb-8">
                Related Products
            </h2>

            {/* Product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {products.slice(0, visibleCount).map((item) => (
                    <div key={item.id} className="border rounded-lg overflow-hidden">
                        {/* Image */}
                        <div className="relative w-full h-[220px]">
                            <Link href={`/shop/${item.id}`}>
                                <Image
                                    src={item.img}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                />
                            </Link>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <h3 className="font-medium text-gray-900">
                                <Link href={`/shop/${item.id}`}>{item.title}</Link>
                            </h3>
                            <p className="text-gray-500 text-sm">{item.desc}</p>

                            <div className="mt-3 flex items-center gap-3">
                                <span className="text-black font-semibold">
                                    ${item.price}
                                </span>
                                <span className="line-through text-gray-400">${item.oldPrice}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Show More button */}
            {visibleCount < products.length && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={handleShowMore}
                        className="px-6 py-2 border rounded-md hover:bg-gray-100 transition"
                    >
                        Show More
                    </button>
                </div>
            )}
        </section>
    );
}
