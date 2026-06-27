import Banner from "@/shared/Banner";
import Cart from "@/components/Cart";
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
