"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoriteStatus, useToggleFavoriteMutation } from "@/hooks/favorite-service/useFavorites";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export const FavoriteButton = ({ productId, className }) => {
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
            className={cn(
                "h-12 px-5 py-3 gap-2 rounded-xl border-[#E5DCC8] bg-white text-[#5C5346] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C6922D]/40 hover:text-[#C6922D] active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:hover:translate-y-0",
                isFavorite && "!border-[#C25B5B]/30 !bg-[#FCE8E8] !text-[#C25B5B] hover:!border-[#C25B5B]/40 hover:!text-[#C25B5B]",
                className
            )}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Heart className={cn("w-4 h-4 transition-all duration-200", isFavorite && "fill-current")} />
            )}
            {isFavorite ? "Saved" : "Save"}
        </Button>
    );
};

export default FavoriteButton;
