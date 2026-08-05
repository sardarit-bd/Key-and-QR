import ShopGrid from "@/components/shop/Products";
import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query";
import { productKeys } from "@/hooks/product-service/useProducts";
import productService from "@/services/product-service/product.service";


export default async function ShopPage() {
    const queryClient = new QueryClient();

    // Prefetch initial products on the server
    await queryClient.prefetchQuery({
        queryKey: productKeys.list({ page: 1, limit: 12 }),
        queryFn: () => productService.getProducts({ page: 1, limit: 12 }),
        staleTime: 60 * 1000,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ShopGrid />
        </HydrationBoundary>
    );
}