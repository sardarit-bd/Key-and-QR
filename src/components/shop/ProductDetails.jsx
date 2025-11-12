"use client";
import { useState } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";

const images = [
    "/shop/chabi1.png",
    "/shop/chabi2.png",
    "/shop/chabi3.png",
    "/shop/chabi4.png",
];

export default function ProductDetails() {
    const [selectedImage, setSelectedImage] = useState(images[0]);
    const [quantity, setQuantity] = useState(1);

    return (
        <section className="bg-white text-black py-16 px-4 md:px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Left: Images */}
                <div>
                    {/* Main Image */}
                    <div className="w-full rounded-xl overflow-hidden shadow-sm mb-4">
                        <Image
                            src={selectedImage}
                            alt="Digital Keychain"
                            width={600}
                            height={600}
                            className="w-full h-auto object-cover rounded-xl"
                        />
                    </div>

                    {/* Thumbnail Gallery */}
                    <div className="flex gap-3 justify-start">
                        {images.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(img)}
                                className={`border-2 rounded-lg overflow-hidden ${selectedImage === img ? "border-black" : "border-transparent"
                                    }`}
                            >
                                <Image
                                    src={img}
                                    alt={`Thumbnail ${index + 1}`}
                                    width={80}
                                    height={80}
                                    className="object-cover hover:opacity-80 transition"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Product Info */}
                <div className="flex flex-col justify-center text-left space-y-5">
                    <h1 className="text-3xl font-semibold">Digital Keychain</h1>
                    <p className="text-2xl font-medium text-gray-800">$250.00</p>

                    <p className="text-gray-600 leading-relaxed">
                        A premium smart keychain that combines sleek design with modern
                        connectivity. Built with high-grade metal, it features both NFC and
                        QR code technology—allowing instant sharing of your digital profile,
                        website, or business links with a single tap or scan.
                    </p>

                    <p className="text-sm text-gray-500">
                        <strong>Brand:</strong> TAGTAG &nbsp; | &nbsp;
                        <strong>Color:</strong> Black
                    </p>

                    <div>
                        <h4 className="font-semibold mb-2">Key Features</h4>
                        <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                            <li>Dual Technology: NFC + QR Code</li>
                            <li>Works instantly with any smartphone</li>
                            <li>Durable metallic body & branding options</li>
                            <li>Secure data inside (read-only NFC tag)</li>
                            <li>Ships worldwide</li>
                        </ul>
                    </div>

                    {/* Quantity and Buttons */}
                    <div className="flex items-center gap-4 mt-4">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                className="p-2 hover:bg-gray-100"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="px-4 py-2">{quantity}</span>
                            <button
                                onClick={() => setQuantity((q) => q + 1)}
                                className="p-2 hover:bg-gray-100"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        {/* Buttons */}
                        <button className="px-6 py-3 border border-black rounded-md hover:bg-black hover:text-white transition">
                            Add to Cart
                        </button>
                        <button className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition">
                            Buy it Now
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
