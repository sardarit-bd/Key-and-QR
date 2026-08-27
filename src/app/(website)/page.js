import Collection from "@/components/public/home/Collection";
import Cta from "@/components/public/home/Cta";
import Hero from "@/components/public/home/Hero";
import HowItWorksSection from "@/components/public/home/HowItWorks";
import Testimonials from "@/components/public/home/testimonials";
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