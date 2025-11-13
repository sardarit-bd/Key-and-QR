"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useProductStore } from "@/store/productStore";
import { useCartStore } from "@/store/cartStore";
import RelatedProducts from "./Relatedproduct";

export default function ProductDetails() {
    const { id } = useParams();                          // dynamic id from URL
    const products = useProductStore((state) => state.products);

    const product = products.find((p) => p.id === Number(id));  // find product

    const addToCart = useCartStore((state) => state.addToCart);

    const [quantity, setQuantity] = useState(1);

    // fallback (404 style)
    if (!product) {
        return (
            <section className="py-20 text-center text-xl">
                Product Not Found
            </section>
        );
    }

    // If product has multiple images, use them, otherwise fallback to one image
    const gallery = product.gallery ?? [product.image];
    const [selectedImage, setSelectedImage] = useState(gallery[0]);

    const handleAdd = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                img: selectedImage,
            });
        }
    };

    return (
        <section className="bg-white text-black py-16 px-4 md:px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">

                {/* LEFT: IMAGE GALLERY */}
                <div>
                    {/* Main Image */}
                    <div className="w-full rounded-xl overflow-hidden shadow-sm mb-2">
                        <Image
                            src={selectedImage}
                            alt={product.name}
                            width={600}
                            height={600}
                            className="w-full h-auto object-cover rounded-xl"
                        />
                    </div>

                    {/* Thumbnails */}
                    <div className="flex gap-3">
                        {gallery.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(img)}
                                className={`border-2 rounded-lg overflow-hidden ${selectedImage === img ? "border-black" : "border-transparent"
                                    }`}
                            >
                                <Image
                                    src={img}
                                    alt={`Thumbnail ${index}`}
                                    width={80}
                                    height={80}
                                    className="object-cover hover:opacity-80 transition"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* RIGHT: PRODUCT INFO */}
                <div className="flex flex-col justify-center space-y-5">
                    <h1 className="text-3xl font-semibold">{product.name}</h1>
                    <p className="text-2xl font-medium text-gray-800">
                        ${product.price}
                    </p>

                    <p className="text-gray-600 leading-relaxed">
                        {product.description || "High-quality premium NFC/QR smart keychain."}
                    </p>

                    <p className="text-sm text-gray-500">
                        <strong>Brand:</strong> {product.brand} &nbsp;|&nbsp;
                        <strong>Category:</strong> {product.category}
                    </p>

                    {/* Quantity + Buttons */}
                    <div className="flex items-center gap-4 mt-4">

                        {/* Quantity Selector */}
                        <div className="flex items-center border border-gray-300 py-1 rounded-md">
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

                        {/* Add to Cart */}
                        <button
                            onClick={handleAdd}
                            className="px-6 py-3 border border-gray-700 rounded-md hover:bg-gray-700 hover:text-white transition"
                        >
                            Add to Cart
                        </button>

                        {/* Buy Now */}
                        <Link
                            href="/checkout"
                            className="px-6 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition"
                        >
                            Buy it Now
                        </Link>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            <RelatedProducts />
        </section>
    );
}
