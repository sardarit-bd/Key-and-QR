"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
    persist(
        (set) => ({
            cart: [],

            addToCart: (product) =>
                set((state) => {
                    const exists = state.cart.find((item) => item.id === product.id);

                    if (exists) {
                        return {
                            cart: state.cart.map((item) =>
                                item.id === product.id
                                    ? { ...item, qty: item.qty + 1 }
                                    : item
                            ),
                        };
                    }

                    return {
                        cart: [...state.cart, { ...product, qty: 1 }],
                    };
                }),

            removeItem: (id) =>
                set((state) => ({
                    cart: state.cart.filter((item) => item.id !== id),
                })),

            increaseQty: (id) =>
                set((state) => ({
                    cart: state.cart.map((item) =>
                        item.id === id ? { ...item, qty: item.qty + 1 } : item
                    ),
                })),

            decreaseQty: (id) =>
                set((state) => ({
                    cart: state.cart.map((item) =>
                        item.id === id && item.qty > 1
                            ? { ...item, qty: item.qty - 1 }
                            : item
                    ),
                })),
        }),

        {
            name: "tagtag-cart",
            getStorage: () => localStorage,
        }
    )
);
