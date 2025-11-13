import Banner from "@/shared/Banner";
import Checkoutcontent from "@/components/Checkoutcontent";
export default function page() {
    return (
        <>
            <Banner
                title="Shop"
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Shop", href: "/shop" },
                    { label: "Product Details", href: "#" },
                    { label: "Checkout", href: "#" },
                ]}
            />
            <Checkoutcontent />
        </>
    )
}
