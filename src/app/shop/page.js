import Banner from "@/shared/Banner";
import Products from "@/components/shop/Products";
export default function page() {
  return (
    <>
      <Banner
        title="Shop"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
        ]}
      />
      <Products />
    </>
  )
}
