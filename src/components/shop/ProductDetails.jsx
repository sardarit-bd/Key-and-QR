"use client";

import { useCartStore } from "@/store/cartStore";
import { useProductStore } from "@/store/productStore";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import RelatedProducts from "./Relatedproduct";

export default function ProductDetails() {
    // ========== ALL HOOKS FIRST ==========
    const { id } = useParams();
    const { products, fetchProducts, getProductById } = useProductStore();
    const addToCart = useCartStore((state) => state.addToCart);

    // State declarations
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState('gift');
    const [customMessage, setCustomMessage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState("");

    // ========== EFFECTS ==========
    // Load product data
    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);

            // If products not loaded yet, fetch them
            if (products.length === 0) {
                await fetchProducts();
            }

            // Find product by id
            const found = getProductById(id);
            setProduct(found || null);
            setLoading(false);
        };

        loadProduct();
    }, [id, products.length, fetchProducts, getProductById]);

    // Set selected image when product loads
    useEffect(() => {
        if (product) {
            const gallery = product.gallery?.length ? product.gallery : [product.image];
            setSelectedImage(gallery[0] || "/placeholder.jpg");
        }
    }, [product]);

    // ========== HANDLER FUNCTIONS ==========
    const handleAdd = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart({
                id: product._id || product.id,
                name: product.name,
                price: product.price,
                img: selectedImage,
            });
        }
    };

    // ========== CONDITIONAL RETURNS (AFTER ALL HOOKS) ==========

    // Loading state
    if (loading) {
        return (
            <section className="bg-white text-black py-16">
                <div className="max-w-7xl px-4 mx-auto flex justify-center items-center min-h-[400px]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading product...</p>
                    </div>
                </div>
            </section>
        );
    }

    // Not found
    if (!product) {
        return (
            <section className="bg-white text-black py-16">
                <div className="max-w-7xl px-4 mx-auto text-center">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Product Not Found</h2>
                    <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
                    <Link
                        href="/shop"
                        className="inline-block px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition"
                    >
                        Back to Shop
                    </Link>
                </div>
            </section>
        );
    }

    // Gallery images
    const gallery = product.gallery?.length ? product.gallery : [product.image];

    return (
        <section className="bg-white text-black py-16">
            <div className="max-w-7xl px-4 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* LEFT: IMAGE GALLERY */}
                <div>
                    <div className="w-full rounded-xl overflow-hidden shadow-sm mb-2">
                        <Image
                            src={selectedImage}
                            alt={product.name}
                            width={600}
                            height={600}
                            className="w-full h-auto object-cover rounded-xl"
                            onError={(e) => {
                                e.target.src = "/placeholder.jpg";
                            }}
                        />
                    </div>

                    {gallery.length > 1 && (
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
                                        onError={(e) => {
                                            e.target.src = "/placeholder.jpg";
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
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
                        <strong>Brand:</strong> {product.brand || "Sardar IT"} &nbsp;|&nbsp;
                        <strong>Category:</strong> {product.category}
                    </p>

                    {/* customize quotes box here */}
                    <div className="">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Choose Your Message
                        </h2>

                        <div className="space-y-4">
                            {/* Option 1: Purchase for yourself */}
                            <button
                                onClick={() => setSelectedOption('yourself')}
                                className={`w-full text-left p-5 rounded-xl border-2 transition-all ${selectedOption === 'yourself'
                                        ? 'border-gray-900 bg-gray-50'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedOption === 'yourself'
                                                ? 'border-gray-900'
                                                : 'border-gray-300'
                                            }`}>
                                            {selectedOption === 'yourself' && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-gray-900"></div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            Purchase for yourself
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            We'll select a beautiful quote from our collection
                                        </p>
                                    </div>
                                </div>
                            </button>

                            {/* Option 2: Purchase for Gift */}
                            <button
                                onClick={() => setSelectedOption('gift')}
                                className={`w-full text-left p-5 rounded-xl border-2 transition-all ${selectedOption === 'gift'
                                        ? 'border-gray-900 bg-gray-900'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedOption === 'gift'
                                                ? 'border-white'
                                                : 'border-gray-300'
                                            }`}>
                                            {selectedOption === 'gift' && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className={`font-semibold mb-1 ${selectedOption === 'gift' ? 'text-white' : 'text-gray-900'
                                            }`}>
                                            Purchase for Gift
                                        </h3>
                                        <p className={`text-sm ${selectedOption === 'gift' ? 'text-gray-300' : 'text-gray-500'
                                            }`}>
                                            Personalize with your own words
                                        </p>
                                    </div>
                                </div>
                            </button>

                            {/* Text Area - Only show when "gift" is selected */}
                            {selectedOption === 'gift' && (
                                <div className="animate-fadeIn">
                                    <textarea
                                        value={customMessage}
                                        onChange={(e) => setCustomMessage(e.target.value)}
                                        placeholder="Write something meaningful..."
                                        rows={4}
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors resize-none text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quantity + Buttons */}
                    <div className="flex items-center gap-4 mt-1">
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

                        <button
                            onClick={handleAdd}
                            className="px-6 py-3 border border-gray-700 rounded-md hover:bg-gray-700 hover:text-white transition"
                        >
                            Add to Cart
                        </button>

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
            <RelatedProducts currentProductId={product._id || product.id} />
        </section>
    );
}