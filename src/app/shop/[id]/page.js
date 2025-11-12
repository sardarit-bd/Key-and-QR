import ProductDetails from "@/components/shop/ProductDetails";
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
                ]}
            />
            <ProductDetails />
        </>
    )
}
