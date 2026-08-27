"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoriteStatus, useToggleFavoriteMutation } from "@/hooks/favorite-service/useFavorites";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export const FavoriteButton = ({ productId, className, showText = false }) => {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();

    const { data: favoriteData, isLoading: isFavoriteLoading } = useFavoriteStatus(productId, null);
    const toggleFavoriteMutation = useToggleFavoriteMutation();

    const isFavorite = favoriteData?.exists || false;
    const favoriteId = favoriteData?.favoriteId || null;
    const isPending = toggleFavoriteMutation.isPending;

    const handleFavorite = async () => {
        if (!isAuthenticated()) {
            sessionStorage.setItem('pendingFavorite', JSON.stringify({ productId }));
            toast.error("Please login to add favorites");
            router.push(`/login?redirect=/shop/${productId}`);
            return;
        }

        try {
            await toggleFavoriteMutation.mutateAsync({
                productId,
                isFavorite,
                favoriteId,
            });
        } catch (error) {
            console.error('Favorite error:', error);
        }
    };

    return (
        <Button
            variant={isFavorite ? "default" : "outline"}
            onClick={handleFavorite}
            disabled={isPending || isFavoriteLoading}
            title={isFavorite ? "Remove from Wishlist" : "Save to Wishlist"}
            className={cn(
                "h-12 rounded-xl border-[#E5DCC8] bg-white text-[#5C5346] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C25B5B]/50 hover:text-[#C25B5B] active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:hover:translate-y-0 shrink-0",
                showText ? "px-5 py-3 gap-2" : "w-12 p-0 flex items-center justify-center",
                isFavorite && "!border-[#C25B5B]/40 !bg-[#FDF2F2] !text-[#C25B5B] hover:!border-[#C25B5B]/60 hover:!text-[#C25B5B]",
                className
            )}
            aria-label={isFavorite ? "Remove from wishlist" : "Save to wishlist"}
        >
            {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                <Heart className={cn("w-5 h-5 transition-transform duration-200", isFavorite && "fill-current text-[#C25B5B]")} />
            )}
            {showText && (isFavorite ? "Saved" : "Save")}
        </Button>
    );
};

export default FavoriteButton;
