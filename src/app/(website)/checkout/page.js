import Checkout from "@/components/public/cart/Checkout";
import ShopBreadcrumb from "@/components/public/shop/ShopBreadcrumb";
import { Suspense } from "react";

export default function Page() {
    return (
        <section className="bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <ShopBreadcrumb
                    items={[
                        { label: "Home", href: "/" },
                        { label: "Shop", href: "/shop" },
                        { label: "Cart", href: "/cart" },
                        { label: "Checkout" },
                    ]}
                />
            </div>

            <Suspense fallback={<div className="py-20 text-center">Loading checkout...</div>}>
                <Checkout />
            </Suspense>
        </section>
    );
}
