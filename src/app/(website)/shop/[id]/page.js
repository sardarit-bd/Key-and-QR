import Banner from "@/shared/Banner";
import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query";
import { productKeys } from "@/hooks/product-service/useProducts";
import productService from "@/services/product-service/product.service";
import ProductDetails from "@/components/shop/product-details/ProductDetails";

export default async function ProductDetailsPage({ params }) {
    const { id } = await params;
    const queryClient = new QueryClient();

    // Prefetch product details on the server
    await queryClient.prefetchQuery({
        queryKey: productKeys.detail(id),
        queryFn: () => productService.getProductById(id),
        staleTime: 60 * 1000,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Banner
                title="Shop"
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Shop", href: "/shop" },
                    { label: "Product Details", href: "#" },
                ]}
            />
            <ProductDetails />
        </HydrationBoundary>
    );
}