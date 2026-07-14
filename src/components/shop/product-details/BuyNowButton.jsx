import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";

export const BuyNowButton = ({
    product,
    selectedImage,
    selectedOption,
    customMessage,
    quantity,
}) => {
    const router = useRouter();
    const addToCart = useCartStore((state) => state.addToCart);

    const handleBuyNow = () => {
        if (!product || product.stock <= 0) return;

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