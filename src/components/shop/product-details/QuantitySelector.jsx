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
        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <Button
                variant="ghost"
                size="icon"
                onClick={handleDecrease}
                disabled={disabled || quantity <= 1}
                className="h-10 w-10 rounded-none hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
                aria-label="Decrease quantity"
            >
                <Minus className="w-4 h-4" />
            </Button>

            <span className="w-12 text-center font-medium" aria-label={`Quantity: ${quantity}`}>
                {quantity}
            </span>

            <Button
                variant="ghost"
                size="icon"
                onClick={handleIncrease}
                disabled={disabled || quantity >= maxStock}
                className="h-10 w-10 rounded-none hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
                aria-label="Increase quantity"
            >
                <Plus className="w-4 h-4" />
            </Button>
        </div>
    );
};

export default QuantitySelector;