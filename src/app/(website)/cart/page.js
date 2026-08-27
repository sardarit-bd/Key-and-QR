import Cart from "@/components/public/cart/Cart";
import ShopBreadcrumb from "@/components/public/shop/ShopBreadcrumb";

export default function page() {
    return (
        <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <ShopBreadcrumb
                    items={[
                        { label: "Home", href: "/" },
                        { label: "Shop", href: "/shop" },
                        { label: "Cart" },
                    ]}
                />
            </div>
            <Cart />
        </>
    );
}
