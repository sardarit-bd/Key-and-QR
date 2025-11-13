import Banner from "@/shared/Banner"
import Checkout from "@/components/Checkout"

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
                    { label: "Checkout", href: "/checkout" },
                ]}
            />

            <Checkout />
        </>
    )
}
