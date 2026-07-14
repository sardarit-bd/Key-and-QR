import Cart from "@/components/cart/Cart";
import Banner from "@/shared/Banner";
export default function page() {
    return (
        <>
            <Banner
                title="Shop"
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Shop", href: "/shop" },
                    { label: "Product Details", href: "#" },
                    { label: "Cart", href: "/cart" },
                ]}
            />
            <Cart />
        </>
    )
}
