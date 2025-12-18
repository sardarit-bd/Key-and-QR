import Checkout from "@/components/Checkout"
import Banner from "@/shared/Banner"

export default function page() {
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

            <Checkout />
        </section>
    )
}
