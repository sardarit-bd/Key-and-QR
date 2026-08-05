import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const QuantitySelector = ({
    quantity,
    onQuantityChange,
    maxStock,
    disabled = false
}) => {
    const handleDecrease = () => {
        if (quantity > 1) {
            onQuantityChange(quantity - 1);
        }
    };

    const handleIncrease = () => {
        if (quantity < maxStock) {
            onQuantityChange(quantity + 1);
        }
    };

    return (
        <div className="flex items-center overflow-hidden rounded-xl border border-[#E5DCC8] bg-white shadow-sm">
            <Button
                variant="ghost"
                size="icon"
                onClick={handleDecrease}
                disabled={disabled || quantity <= 1}
                className="h-12 w-12 cursor-pointer rounded-none text-[#5C5346] transition-colors duration-200 hover:bg-[#F5EDDC] hover:text-[#2E2A24] disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Decrease quantity"
            >
                <Minus className="h-4 w-4" />
            </Button>

            <span
                className="w-14 text-center text-base font-semibold text-[#2E2A24] tabular-nums"
                aria-live="polite"
                aria-label={`Quantity: ${quantity}`}
            >
                {quantity}
            </span>

            <Button
                variant="ghost"
                size="icon"
                onClick={handleIncrease}
                disabled={disabled || quantity >= maxStock}
                className="h-12 w-12 cursor-pointer rounded-none text-[#5C5346] transition-colors duration-200 hover:bg-[#F5EDDC] hover:text-[#2E2A24] disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
};

export default QuantitySelector;
