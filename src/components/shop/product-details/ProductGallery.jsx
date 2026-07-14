import { useState, useEffect } from "react";
import { ProductImage } from "@/components/ui/ProductImage";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export const ProductGallery = ({ product }) => {
    const [selectedImage, setSelectedImage] = useState("");
    const [isMainImageSelected, setIsMainImageSelected] = useState(true);

    useEffect(() => {
        if (product) {
            const mainImage = product.image?.url || "/placeholder.png";
            setSelectedImage(mainImage);
            setIsMainImageSelected(true);
        }
    }, [product]);

    const getGalleryImages = () => {
        const images = [];

        if (product?.image?.url) {
            images.push({
                url: product.image.url,
                isMain: true,
                label: "Main Image"
            });
        }

        if (product?.gallery?.length) {
            product.gallery.forEach((img, idx) => {
                if (img?.url) {
                    images.push({
                        url: img.url,
                        isMain: false,
                        label: `Gallery ${idx + 1}`
                    });
                }
            });
        }

        if (images.length === 0) {
            images.push({
                url: "/placeholder.png",
                isMain: true,
                label: "Placeholder"
            });
        }

        return images;
    };

    const gallery = getGalleryImages();
    const hasMultipleImages = gallery.length > 1;

    const handleThumbnailClick = (imageUrl, isMain) => {
        setSelectedImage(imageUrl);
        setIsMainImageSelected(isMain);
    };

    return (
        <div>
            <div className="relative w-full rounded-xl overflow-hidden shadow-lg mb-2 bg-gray-100">
                {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <span className="bg-red-600 text-white text-xl font-bold px-6 py-3 rounded-lg transform -rotate-12">
                            OUT OF STOCK
                        </span>
                    </div>
                )}

                <ProductImage
                    src={selectedImage}
                    alt={product.name}
                    width={600}
                    height={600}
                    className="w-full h-auto object-cover rounded-xl transition-all duration-300"
                    fill={false}
                    priority
                />
            </div>

            {hasMultipleImages && (
                <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                        <span>Product Images</span>
                        <span className="text-xs text-gray-400">({gallery.length} images)</span>
                    </p>
                    <div className="flex gap-3 flex-wrap">
                        {gallery.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => handleThumbnailClick(img.url, img.isMain)}
                                className={cn(
                                    "relative group transition-all duration-200 cursor-pointer",
                                    selectedImage === img.url
                                        ? "ring-2 ring-offset-2 ring-black scale-105"
                                        : "hover:scale-105"
                                )}
                                aria-label={`View ${img.label}`}
                            >
                                <div className={cn(
                                    "relative border-2 rounded-lg overflow-hidden",
                                    selectedImage === img.url
                                        ? "border-black"
                                        : "border-transparent group-hover:border-gray-300"
                                )}>
                                    <ProductImage
                                        src={img.url}
                                        alt={img.label}
                                        width={80}
                                        height={80}
                                        className="object-cover w-20 h-20 transition"
                                        fill={false}
                                    />

                                    {img.isMain && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] font-medium py-1 text-center flex items-center justify-center gap-1">
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            <span>MAIN</span>
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductGallery;