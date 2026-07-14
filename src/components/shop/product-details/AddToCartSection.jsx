import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import QuantitySelector from "./QuantitySelector";
import toast from "react-hot-toast";

export const AddToCartSection = ({
    product,
    selectedImage,
    selectedOption,
    customMessage,
}) => {
    // ************* Subscribe to cart state directly *************
    // This creates a subscription and triggers re-renders when cart changes
    const cart = useCartStore((state) => state.cart);
    
    // ************* Derive values from subscribed state *************
    const isProductInCart = cart.some(item => item.id === product._id);
    const cartItem = cart.find(item => item.id === product._id) || null;

    // ************* Get action methods *************
    // These don't need to trigger re-renders
    const addToCart = useCartStore((state) => state.addToCart);
    const removeFromCart = useCartStore((state) => state.removeFromCart);
    const updateQuantity = useCartStore((state) => state.updateQuantity);

    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = async () => {
        if (!product || product.stock <= 0 || isAdding) return;

        setIsAdding(true);
        const qtyToAdd = Math.min(quantity, product.stock);

        const result = await addToCart({
            id: product._id,
            name: product.name,
            price: product.price,
            img: selectedImage,
            qty: qtyToAdd,
            purchaseType: selectedOption === "gift" ? "gift" : "self",
            giftMessage: selectedOption === "gift" ? customMessage?.trim() || null : null,
        });

        setIsAdding(false);

        if (result?.success) {
            toast.success(`Added ${qtyToAdd} ${product.name} to cart`);
        } else if (result?.error) {
            toast.error(result.error);
        }
    };

    const handleRemoveFromCart = () => {
        const result = removeFromCart(product._id);
        if (result?.success) {
            toast.success(`${result.name || product.name} removed from cart`);
            setQuantity(1);
        }
    };

    const handleQuantityChange = (newQty) => {
        if (isProductInCart) {
            updateQuantity(product._id, newQty);
        } else {
            setQuantity(newQty);
        }
    };

    // ************* Product is in cart - Show "Added" state *************
    if (isProductInCart && cartItem) {
        return (
            <div className="flex flex-col gap-3 w-full">
                <div className="flex flex-wrap items-center gap-3">
                    <Link href="/cart">
                        <Button variant="default" className="cursor-pointer">
                            Go to Cart
                        </Button>
                    </Link>

                    <Button
                        variant="outline"
                        onClick={handleRemoveFromCart}
                        className="cursor-pointer"
                    >
                        Remove
                    </Button>

                    <div className="flex items-center gap-2 ml-0 md:ml-2">
                        <QuantitySelector
                            quantity={cartItem.qty}
                            onQuantityChange={handleQuantityChange}
                            maxStock={product.stock}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 text-green-600 font-medium">
                    <Check className="w-5 h-5" />
                    <span>Added to Cart</span>
                    <span className="text-sm text-gray-500 font-normal">
                        (Qty: {cartItem.qty})
                    </span>
                </div>
            </div>
        );
    }

    // ************* Product not in cart - Show "Add to Cart" *************
    const isOutOfStock = product.stock <= 0;

    return (
        <div className="flex flex-wrap items-center gap-4 w-full">
            <QuantitySelector
                quantity={quantity}
                onQuantityChange={setQuantity}
                maxStock={product.stock}
                disabled={isOutOfStock || isAdding}
            />

            <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className="flex-1 md:flex-none px-6 py-3 cursor-pointer disabled:cursor-not-allowed"
                aria-label="Add to cart"
            >
                {isAdding ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                    </>
                ) : (
                    'Add to Cart'
                )}
            </Button>
        </div>
    );
};

export default AddToCartSection;