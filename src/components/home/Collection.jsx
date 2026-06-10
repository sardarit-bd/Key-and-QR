"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProductStore } from "@/store/productStore";
import Loader from "@/shared/Loader";

export default function CollectionSection() {
  const { products, fetchProducts, loading } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Latest 3 Products
  const latestProducts = [...products]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )
    .slice(0, 3);

  if (loading && products.length === 0) {
    return <Loader text="Loading Collection..." size={50} />;
  }

  return (
    <section className="mx-auto max-w-[1800px]">
      <div className="rounded-[20px] bg-[#FAF9F7] px-8 py-20 lg:px-60">
        <div className="  p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
            {/* Left Content */}
            <div className="flex flex-col justify-center">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#666666]">
                Our Collection
              </p>

              <h2 className="font-serif text-[42px] leading-[1.05] text-black">
                Timeless charms.
                <br />
                Made to inspire.
              </h2>

              <Link
                href="/shop"
                className="mt-8 inline-flex w-fit items-center justify-center rounded-lg bg-black px-8 py-4 text-white transition-all duration-300 hover:scale-[1.02]"
              >
                Explore Collection
              </Link>
            </div>

            {/* Products */}
            {latestProducts.length === 0 ? (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-gray-300 p-10">
                <p className="text-gray-500">No products available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {latestProducts.map((product) => (
                  <Link
                    key={product._id}
                    href={`/shop/${product._id}`}
                    className="group overflow-hidden rounded-2xl border border-[#F0ECE6] bg-white transition-all duration-300 hover:shadow-lg"
                  >
                    {/* Product Image */}
                    <div className="aspect-[4/3] overflow-hidden bg-[#F7F4EF]">
                      <Image
                        src={
                          product.image?.url ||
                          product.image ||
                          "/placeholder.jpg"
                        }
                        alt={product.name}
                        width={600}
                        height={450}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      <h3 className="font-serif text-[18px] text-black">
                        {product.name}
                      </h3>

                      <p className="mt-2 text-[18px] font-medium text-black">
                        ${Number(product.price).toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}