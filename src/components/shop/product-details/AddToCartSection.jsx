"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, ShieldBan, ShoppingCart } from "lucide-react";
import QuantitySelector from "./QuantitySelector";
import toast from "react-hot-toast";

export const AddToCartSection = ({
    product,
    selectedImage,
    selectedOption,
    customMessage,
}) => {
    const router = useRouter();
    const cart = useCartStore((state) => state.cart);
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.role === "admin";

    const isProductInCart = cart.some(item => item.id === product._id);

    const addToCart = useCartStore((state) => state.addToCart);
    const updateQuantity = useCartStore((state) => state.updateQuantity);

    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = async () => {
        if (!product || product.stock <= 0 || isAdding || isAdmin) return;

        // If the product is already in the cart, never create a duplicate —
        // update quantity via existing cart logic and inform the user.
        if (isProductInCart) {
            toast("This item is already in your cart.", {
                icon: "🛒",
                duration: 2500,
            });
            return;
        }

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
            toast.success("Added to cart successfully", {
                duration: 2500,
                icon: "✓",
                action: {
                    label: "Go to Cart",
                    onClick: () => router.push("/cart"),
                },
            });
        } else if (result?.error) {
            toast.error(result.error);
        }
    };

    const handleQuantityChange = (newQty) => {
        if (isProductInCart) {
            updateQuantity(product._id, newQty);
        } else {
            setQuantity(newQty);
        }
    };

    if (isAdmin) {
        return (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                <ShieldBan size={16} />
                <span>Admin accounts cannot purchase products.</span>
            </div>
        );
    }

    const isOutOfStock = product.stock <= 0;

    return (
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <QuantitySelector
                quantity={isProductInCart ? (cart.find(i => i.id === product._id)?.qty || quantity) : quantity}
                onQuantityChange={handleQuantityChange}
                maxStock={product.stock}
                disabled={isOutOfStock || isAdding}
            />

            <motion.div
                layout
                className="flex-1 sm:flex-none"
            >
                <Button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAdding}
                    aria-label={isProductInCart ? "Added to cart" : "Add to cart"}
                    className={`flex-1 sm:flex-none h-12 px-7 py-3 rounded-xl text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
                        isProductInCart
                            ? "bg-[#2E5B3A] hover:bg-[#24502F] shadow-[0_8px_24px_-8px_rgba(46,91,58,0.55)]"
                            : "bg-[#2E2A24] hover:bg-[#1F1C18] shadow-[0_8px_24px_-8px_rgb(46_42_36/0.5)]"
                    }`}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {isAdding ? (
                            <motion.span
                                key="adding"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center"
                            >
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                            </motion.span>
                        ) : isProductInCart ? (
                            <motion.span
                                key="added"
                                initial={{ scale: 0.85, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                                className="flex items-center"
                            >
                                <motion.span
                                    initial={{ scale: 0, rotate: -90 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.05 }}
                                    className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/20"
                                >
                                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                                </motion.span>
                                Added to Cart
                            </motion.span>
                        ) : (
                            <motion.span
                                key="default"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center"
                            >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Add to Cart
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Button>
            </motion.div>
        </div>
    );
};

export default AddToCartSection;
