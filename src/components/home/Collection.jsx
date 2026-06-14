"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useProductStore } from "@/store/productStore";
import Loader from "@/shared/Loader";

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const leftContentVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.1, 1] },
  },
};

const productCardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.12,
      ease: [0.25, 0.1, 0.1, 1],
    },
  }),
};

export default function CollectionSection() {
  const { products, fetchProducts, loading } = useProductStore();
  const sectionRef = useRef(null);

  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });

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
    <motion.section
      ref={sectionRef}
      variants={sectionVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="w-full bg-[#FAF9F7] py-16 md:py-24 px-6 md:px-12"
    >
      <div className="mx-auto max-w-[1200px] xl:max-w-[1440px] xl:px-13 2xl:px-23">
        <div className="py-4">
          <div className="grid gap-12 lg:grid-cols-[350px_1fr] xl:grid-cols-[400px_1fr] items-center">
            
            {/* Left Content with Animation */}
            <motion.div 
              variants={leftContentVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="flex flex-col justify-center text-center lg:text-left items-center lg:items-start"
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#666666]">
                Our Collection
              </p>

              <h2 className="font-serif text-[36px] md:text-[42px] leading-[1.1] text-black">
                Timeless charms.
                <br />
                Made to inspire.
              </h2>

              <Link
                href="/shop"
                className="mt-8 inline-flex w-fit items-center justify-center rounded-xl bg-black px-8 py-4 text-sm text-white font-medium shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Explore Collection
              </Link>
            </motion.div>

            {/* Products Grid with Staggered Animation */}
            {latestProducts.length === 0 ? (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-gray-300 p-10 bg-white">
                <p className="text-gray-500">No products available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {latestProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    custom={index}
                    variants={productCardVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                  >
                    <Link
                      href={`/shop/${product._id}`}
                      className="group block overflow-hidden rounded-2xl border border-[#F0ECE6] bg-white transition-all duration-300 hover:shadow-xl"
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
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="p-5 bg-white">
                        <h3 className="font-serif text-[18px] text-black group-hover:text-[#666] transition-colors duration-300">
                          {product.name}
                        </h3>

                        <p className="mt-2 text-[16px] md:text-[18px] font-medium text-black">
                          ${Number(product.price).toFixed(2)}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </motion.section>
  );
}