import Checkout from "@/components/Checkout";
import Banner from "@/shared/Banner";
import { Suspense } from "react";

export default function Page() {
    return (
        <section className="bg-white">
            <Banner
                title="Checkout"
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Shop", href: "/shop" },
                    { label: "Product Details", href: "#" },
                    { label: "Cart", href: "/cart" },
                    { label: "Checkout", href: "/checkout" },
                ]}
            />

            <Suspense fallback={<div className="py-20 text-center">Loading checkout...</div>}>
                <Checkout />
            </Suspense>
        </section>
    );
}