"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useProductStore = create(
    persist(
        (set) => ({
            products: [
                {
                    id: 1,
                    name: "Digital Keychain",
                    price: 400,
                    category: "Smart NFC Keychain",
                    image: "/shop/chabi1.png",
                    gallery: ["/shop/chabi1.png", "/shop/chabi2.png", "/shop/chabi3.png"],
                    brand: "Sardar IT",
                    description: `US lawmakers have released more than 20,000 pages of documents from the estate of the disgraced financier and convicted sex offender Jeffrey Epstein, including some that mention President Donald Trump.
                    Early on Wednesday, Democrats on the House Oversight Committee published three email exchanges, including correspondence between Epstein, who died in 2019 in prison, and his long- time associate Ghislaine Maxwell, who is currently serving a 20 - year prison sentence for sex trafficking.`,
                },
                {
                    id: 2,
                    name: "Flex QR Keyring",
                    price: 600,
                    category: "Custom Engraved Tag",
                    image: "/shop/chabi2.png",
                    brand: "Sardar IT",
                    description: `US lawmakers have released more than 20,000 pages of documents from the estate of the disgraced financier and convicted sex offender Jeffrey Epstein, including some that mention President Donald Trump.
                    Early on Wednesday, Democrats on the House Oversight Committee published three email exchanges, including correspondence between Epstein, who died in 2019 in prison, and his long- time associate Ghislaine Maxwell, who is currently serving a 20 - year prison sentence for sex trafficking.`,
                },
                {
                    id: 3,
                    name: "One Smart Keychain",
                    price: 500,
                    category: "NFC & QR Hybrid",
                    image: "/shop/chabi3.png",
                    brand: "Sardar IT",
                    description: `US lawmakers have released more than 20,000 pages of documents from the estate of the disgraced financier and convicted sex offender Jeffrey Epstein, including some that mention President Donald Trump.
                    Early on Wednesday, Democrats on the House Oversight Committee published three email exchanges, including correspondence between Epstein, who died in 2019 in prison, and his long- time associate Ghislaine Maxwell, who is currently serving a 20 - year prison sentence for sex trafficking.`,
                },
                {
                    id: 4,
                    name: "Digital Keychain",
                    price: 250,
                    category: "NFC Ready Gift",
                    image: "/shop/chabi4.png",
                    brand: "Sardar IT",
                    description: `US lawmakers have released more than 20,000 pages of documents from the estate of the disgraced financier and convicted sex offender Jeffrey Epstein, including some that mention President Donald Trump.
                    Early on Wednesday, Democrats on the House Oversight Committee published three email exchanges, including correspondence between Epstein, who died in 2019 in prison, and his long- time associate Ghislaine Maxwell, who is currently serving a 20 - year prison sentence for sex trafficking.`,
                },
                {
                    id: 5,
                    name: "Flex QR Keyring",
                    price: 550,
                    category: "Laser Engraved Metal",
                    image: "/shop/chabi5.png",
                    brand: "Sardar IT",
                    description: `US lawmakers have released more than 20,000 pages of documents from the estate of the disgraced financier and convicted sex offender Jeffrey Epstein, including some that mention President Donald Trump.
                    Early on Wednesday, Democrats on the House Oversight Committee published three email exchanges, including correspondence between Epstein, who died in 2019 in prison, and his long- time associate Ghislaine Maxwell, who is currently serving a 20 - year prison sentence for sex trafficking.`,
                },
                {
                    id: 6,
                    name: "One Smart Keychain",
                    price: 500,
                    category: "NFC + QR Edition",
                    image: "/shop/chabi6.png",
                    brand: "Sardar IT",
                    description: `US lawmakers have released more than 20,000 pages of documents from the estate of the disgraced financier and convicted sex offender Jeffrey Epstein, including some that mention President Donald Trump.
                    Early on Wednesday, Democrats on the House Oversight Committee published three email exchanges, including correspondence between Epstein, who died in 2019 in prison, and his long- time associate Ghislaine Maxwell, who is currently serving a 20 - year prison sentence for sex trafficking.`,
                },
                {
                    id: 7,
                    name: "Flex QR Keyring",
                    price: 450,
                    category: "Premium Finish",
                    image: "/shop/chabi7.png",
                    brand: "Sardar IT",
                    description: `US lawmakers have released more than 20,000 pages of documents from the estate of the disgraced financier and convicted sex offender Jeffrey Epstein, including some that mention President Donald Trump.
                    Early on Wednesday, Democrats on the House Oversight Committee published three email exchanges, including correspondence between Epstein, who died in 2019 in prison, and his long- time associate Ghislaine Maxwell, who is currently serving a 20 - year prison sentence for sex trafficking.`,
                },
                {
                    id: 8,
                    name: "One Smart Keychain",
                    price: 510,
                    category: "Digital NFC Tag",
                    image: "/shop/chabi8.png",
                    brand: "Sardar IT",
                    description: `US lawmakers have released more than 20,000 pages of documents from the estate of the disgraced financier and convicted sex offender Jeffrey Epstein, including some that mention President Donald Trump.
                    Early on Wednesday, Democrats on the House Oversight Committee published three email exchanges, including correspondence between Epstein, who died in 2019 in prison, and his long- time associate Ghislaine Maxwell, who is currently serving a 20 - year prison sentence for sex trafficking.`,
                },
                {
                    id: 9,
                    name: "Flex QR Keyring",
                    price: 490,
                    category: "Engraved Black Steel",
                    image: "/shop/chabi9.png",
                    brand: "Sardar IT",
                    description: `US lawmakers have released more than 20,000 pages of documents from the estate of the disgraced financier and convicted sex offender Jeffrey Epstein, including some that mention President Donald Trump.
                    Early on Wednesday, Democrats on the House Oversight Committee published three email exchanges, including correspondence between Epstein, who died in 2019 in prison, and his long- time associate Ghislaine Maxwell, who is currently serving a 20 - year prison sentence for sex trafficking.`,
                },
                {
                    id: 10,
                    name: "One Smart Keychain",
                    price: 520,
                    category: "Smart Gift Edition",
                    image: "/shop/chabi10.png",
                    brand: "Sardar IT",
                    description: `US lawmakers have released more than 20,000 pages of documents from the estate of the disgraced financier and convicted sex offender Jeffrey Epstein, including some that mention President Donald Trump.
                    Early on Wednesday, Democrats on the House Oversight Committee published three email exchanges, including correspondence between Epstein, who died in 2019 in prison, and his long- time associate Ghislaine Maxwell, who is currently serving a 20 - year prison sentence for sex trafficking.`,
                },
                {
                    id: 11,
                    name: "Digital Keychain",
                    price: 500,
                    category: "Personal NFC Tag",
                    image: "/shop/chabi11.png",
                    brand: "Sardar IT",
                    description: `US lawmakers have released more than 20,000 pages of documents from the estate of the disgraced financier and convicted sex offender Jeffrey Epstein, including some that mention President Donald Trump.
                    Early on Wednesday, Democrats on the House Oversight Committee published three email exchanges, including correspondence between Epstein, who died in 2019 in prison, and his long- time associate Ghislaine Maxwell, who is currently serving a 20 - year prison sentence for sex trafficking.`,
                },
                {
                    id: 12,
                    name: "Flex QR Keyring",
                    price: 460,
                    category: "Engraved Leather",
                    image: "/shop/chabi12.png",
                    brand: "Sardar IT",
                    description: `US lawmakers have released more than 20,000 pages of documents from the estate of the disgraced financier and convicted sex offender Jeffrey Epstein, including some that mention President Donald Trump.
                    Early on Wednesday, Democrats on the House Oversight Committee published three email exchanges, including correspondence between Epstein, who died in 2019 in prison, and his long- time associate Ghislaine Maxwell, who is currently serving a 20 - year prison sentence for sex trafficking.`,
                },
            ],

            // get single product by ID
            getProductById: (id) =>
                set((state) => ({
                    selectedProduct: state.products.find((p) => p.id === Number(id)),
                })),
        }),

        {
            name: "tagtag-products", // saved in localStorage
        }
    )
);
