import Collection from "@/components/home/Collection";
import Cta from "@/components/home/Cta";
import Hero from "@/components/home/Hero";
import HowItWorksSection from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/testimonials";
import { productKeys } from "@/hooks/product-service/useProducts";
import productService from "@/services/product-service/product.service";
import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query";

export default async function HomePage() {
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
        queryKey: productKeys.featured(),
        queryFn: () => productService.getFeaturedProducts(6),
        staleTime: 5 * 60 * 1000,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Hero />
            <HowItWorksSection />
            <Collection />
            <Testimonials />
            {/* <Cta /> */}
        </HydrationBoundary>
    );
}