import { AlertCircle, BadgeCheck } from "lucide-react";

export const StockStatusBadge = ({ stock }) => {
    if (stock <= 0) {
        return (
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FCE8E8] px-3.5 py-1.5 font-semibold text-[#8A2E2E]">
                <AlertCircle className="h-4 w-4" />
                <span className="text-[13px]">Out of Stock</span>
            </div>
        );
    }

    if (stock <= 2) {
        return (
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FCE8CB] px-3.5 py-1.5 font-semibold text-[#7A4A10]">
                <AlertCircle className="h-4 w-4" />
                <span className="text-[13px]">Only {stock} {stock === 1 ? 'keychain' : 'keychains'} left!</span>
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-2 rounded-full bg-[#E4F2E8] px-3.5 py-1.5 text-[#2E5B3A]">
            <BadgeCheck className="h-4 w-4" />
            <span className="text-[13px] font-medium">In Stock ({stock} available)</span>
        </div>
    );
};

export default StockStatusBadge;
