import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { ShieldBan, Zap } from "lucide-react";

export const BuyNowButton = ({
    product,
    selectedImage,
    selectedOption,
    customMessage,
    quantity,
}) => {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.role === "admin";
    const addToCart = useCartStore((state) => state.addToCart);

    const handleBuyNow = () => {
        if (!product || product.stock <= 0 || isAdmin) return;

        const qtyToAdd = Math.min(quantity, product.stock);

        addToCart({
            id: product._id,
            name: product.name,
            price: product.price,
            img: selectedImage,
            qty: qtyToAdd,
            purchaseType: selectedOption === "gift" ? "gift" : "self",
            giftMessage: selectedOption === "gift" ? customMessage?.trim() || null : null,
        });

        router.push("/checkout");
    };

    if (isAdmin) {
        return (
            <Button
                variant="outline"
                disabled
                className="h-12 px-6 py-3 rounded-xl opacity-50 cursor-not-allowed"
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
            disabled={product.stock <= 0}
            className="h-12 px-7 py-3 rounded-xl bg-[#C6922D] hover:bg-[#A6782B] text-white shadow-[0_8px_24px_-8px_rgba(198,146,45,0.6)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
        >
            <Zap size={14} className="mr-1.5" />
            Buy it Now
        </Button>
    );
};

export default BuyNowButton;
