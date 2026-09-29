"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { ShieldBan, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export const BuyNowButton = ({
    product,
    selectedImage,
    selectedOption,
    customMessage,
    quantity,
    className,
}) => {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.role === "admin";
    const addToCart = useCartStore((state) => state.addToCart);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleBuyNow = async () => {
        if (!product || product.stock <= 0 || isAdmin || isProcessing) return;

        setIsProcessing(true);
        const qtyToAdd = Math.min(quantity, product.stock);

        const result = await addToCart({
            id: product._id,
            name: product.name,
            price: product.price,
            img: selectedImage,
            qty: qtyToAdd,
            replaceQty: true,
            stock: product.stock,
            stockQuantity: product.stock,
            purchaseType: selectedOption === "gift" ? "gift" : "self",
            giftMessage: selectedOption === "gift" ? customMessage?.trim() || null : null,
        });

        setIsProcessing(false);

        if (result?.success) {
            router.push("/checkout");
        } else if (result?.error) {
            toast.error(result.error);
        }
    };

    if (isAdmin) {
        return (
            <Button
                variant="outline"
                disabled
                className={cn("h-12 px-6 py-3 rounded-xl opacity-50 cursor-not-allowed", className)}
            >
                <ShieldBan size={14} className="mr-1.5" />
                Purchases Disabled
            </Button>
        );
    }

    return (
        <Button
            variant="default"
            onClick={handleBuyNow}
            disabled={product.stock <= 0 || isProcessing}
            className={cn(
                "h-12 px-7 py-3 rounded-xl bg-[#C6922D] hover:bg-[#A6782B] text-white shadow-[0_8px_24px_-8px_rgba(198,146,45,0.6)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer font-medium",
                className
            )}
        >
            {isProcessing ? (
                <>
                    <Loader2 size={14} className="mr-1.5 animate-spin" />
                    Processing...
                </>
            ) : (
                <>
                    <Zap size={14} className="mr-1.5 fill-current" />
                    Buy it Now
                </>
            )}
        </Button>
    );
};

export default BuyNowButton;
