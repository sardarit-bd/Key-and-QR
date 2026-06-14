"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

import {
  FaInstagram,
  FaTiktok,
  FaPinterestP,
  FaArrowRight,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaApplePay,
} from "react-icons/fa";
import Image from "next/image";

const footerLinks = {
  shop: [
    { label: "All Products", href: "/shop" },
    { label: "Best Sellers", href: "/shop" },
    { label: "New Arrivals", href: "/shop" },
    { label: "Gift Cards", href: "/shop" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Our Story", href: "/story" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Contact Us", href: "/contact" },
  ],
  support: [
    { label: "FAQ", href: "/faq" },
    { label: "Shipping & Returns", href: "/shipping" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.1, 1] },
  },
};

export default function Footer() {
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, { once: false, amount: 0.15 });

  return (
    <footer className="w-full border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-[1200px] xl:max-w-[1340px] 2xl:max-w-[1440px] px-6 md:px-8 lg:px-14 py-14">
        {/* Top Section with Stagger Animation */}
        <motion.div
          ref={footerRef}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-12"
        >
          {/* Brand */}
          <motion.div variants={itemVariants} className="xl:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <Image
                src="/logo/logo.png"
                alt="InspireTag Logo"
                width={150}
                height={80}
                className="object-contain"
                priority
              />
            </div>

            <div className="space-y-1 text-[16px] text-neutral-700 font-serif">
              <p>Meaningful messages.</p>
              <p>Lasting inspiration.</p>
              <p>Every day.</p>
            </div>

            <div className="mt-4 flex items-center gap-5">
              <motion.a
                href="#"
                whileHover={{
                  y: -4,
                  scale: 1.15,
                  color: "#E1306C",
                }}
                transition={{ duration: 0.2 }}
                className="cursor-pointer text-neutral-500"
              >
                <FaInstagram size={18} />
              </motion.a>

              <motion.a
                href="#"
                whileHover={{
                  y: -4,
                  scale: 1.15,
                  color: "#000000",
                }}
                transition={{ duration: 0.2 }}
                className="cursor-pointer text-neutral-500"
              >
                <FaTiktok size={16} />
              </motion.a>

              <motion.a
                href="#"
                whileHover={{
                  y: -4,
                  scale: 1.15,
                  color: "#BD081C",
                }}
                transition={{ duration: 0.2 }}
                className="cursor-pointer text-neutral-500"
              >
                <FaPinterestP size={16} />
              </motion.a>
            </div>
          </motion.div>

          {/* Shop */}
          <motion.div variants={itemVariants}>
            <h3 className="font-serif mb-5 text-sm font-semibold uppercase tracking-wider text-black">
              Shop
            </h3>

            <ul className="space-y-4">
              {footerLinks.shop.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="font-serif text-neutral-700 transition hover:text-black hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div variants={itemVariants}>
            <h3 className="font-serif mb-5 text-sm font-semibold uppercase tracking-wider text-black">
              Company
            </h3>

            <ul className="space-y-4">
              {footerLinks.company.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="font-serif text-neutral-700 transition hover:text-black hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div variants={itemVariants}>
            <h3 className="font-serif mb-5 text-sm font-semibold uppercase tracking-wider text-black">
              Support
            </h3>

            <ul className="space-y-4">
              {footerLinks.support.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="font-serif text-neutral-700 transition hover:text-black hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={itemVariants}>
            <h3 className="font-serif mb-5 text-sm font-semibold uppercase tracking-wider text-black">
              Stay Inspired
            </h3>

            <p className="font-serif mb-6 text-[17px] text-neutral-700 leading-relaxed">
              Subscribe to get daily inspiration and special offers.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex overflow-hidden rounded-md border border-neutral-300"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="font-serif flex-1 px-2 md:px-2 xl:px-1 lg:px-4 py-3 text-sm outline-none placeholder-neutral-400 font-medium"
                required
              />

              <button
                type="submit"
                className="flex w-14 items-center justify-center bg-black text-white transition hover:bg-neutral-800"
              >
                <FaArrowRight size={14} />
              </button>
            </form>
          </motion.div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-8 pt-4"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-neutral-500">
              © {new Date().getFullYear()} InspireTag. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-6 text-3xl text-neutral-700">
              <FaCcVisa className="hover:text-black transition-colors" />
              <FaCcMastercard className="hover:text-black transition-colors" />
              <FaCcPaypal className="hover:text-black transition-colors" />
              <FaApplePay className="text-4xl hover:text-black transition-colors" />
              <span className="text-sm font-bold tracking-wider hover:text-black transition-colors">
                G PAY
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
