"use client";

import { useParams } from "next/navigation";
import useAuthInit from "@/hooks/useAuthInit";
import { useAuthStore } from "@/store/authStore";
import Loader from "@/shared/Loader";
import ProductDetails from "@/components/admin/products/ProductDetails";

export default function ProductDetailsPage() {
    const params = useParams();
    const productId = params.id;
    useAuthInit();
    const { user, isInitialized } = useAuthStore();

    if (!isInitialized) {
        return <Loader text="QKey..." size={50} fullScreen />;
    }

    if (!user || user.role !== "admin") {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <ProductDetails productId={productId} />
        </div>
    );
}