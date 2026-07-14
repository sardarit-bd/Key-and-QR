import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoriteStatus, useToggleFavoriteMutation } from "@/hooks/favorite-service/useFavorites";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export const FavoriteButton = ({ productId }) => {
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
            // Error handled by mutation
            console.error('Favorite error:', error);
        }
    };

    return (
        <Button
            variant={isFavorite ? "default" : "outline"}
            onClick={handleFavorite}
            disabled={isPending || isFavoriteLoading}
            className={cn(
                "px-4 py-3 gap-2 cursor-pointer disabled:cursor-not-allowed",
                isFavorite && "bg-red-500 hover:bg-red-600 border-red-500 text-white"
            )}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Heart className={cn("w-4 h-4", isFavorite && "fill-white")} />
            )}
            {isFavorite ? "Saved" : "Save"}
        </Button>
    );
};

export default FavoriteButton;