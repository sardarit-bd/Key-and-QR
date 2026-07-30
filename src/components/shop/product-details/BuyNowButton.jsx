import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { ShieldBan } from "lucide-react";

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
                className="px-6 py-3 opacity-50 cursor-not-allowed"
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
            className="px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white cursor-pointer disabled:cursor-not-allowed"
        >
            Buy it Now
        </Button>
    );
};

export default BuyNowButton;
