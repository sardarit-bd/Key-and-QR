import { AlertCircle, BadgeCheck } from "lucide-react";

export const StockStatusBadge = ({ stock }) => {
    if (stock <= 0) {
        return (
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold">
                <AlertCircle className="w-5 h-5" />
                <span>Out of Stock</span>
            </div>
        );
    }

    if (stock <= 2) {
        return (
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-semibold">
                <AlertCircle className="w-5 h-5" />
                <span>Only {stock} {stock === 1 ? 'keychain' : 'keychains'} left!</span>
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg">
            <BadgeCheck className="w-5 h-5" />
            <span className="text-sm">In Stock ({stock} available)</span>
        </div>
    );
};

export default StockStatusBadge;