import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (product) => {
        const { cart } = get();
        const existingItem = cart.find((item) => item.id === product.id);
        const quantityToAdd = product.qty || 1;
        
        if (existingItem) {
          const updatedCart = cart.map((item) =>
            item.id === product.id
              ? { ...item, qty: item.qty + quantityToAdd }
              : item
          );
          set({ cart: updatedCart });
        } else {
          set({ 
            cart: [...cart, { 
              ...product, 
              qty: quantityToAdd 
            }] 
          });
        }
        
        // Debug log
        console.log("Cart after add:", get().cart);
      },

      increaseQty: (id) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id ? { ...item, qty: item.qty + 1 } : item
          ),
        })),

      decreaseQty: (id) =>
        set((state) => ({
          cart: state.cart
            .map((item) =>
              item.id === id ? { ...item, qty: item.qty - 1 } : item
            )
            .filter((item) => item.qty > 0),
        })),

      removeItem: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        })),

      clearCart: () => set({ cart: [] }),
      
      getTotalQuantity: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + (item.qty || 1), 0);
      },
      
      getTotalPrice: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + (item.price * (item.qty || 1)), 0);
      },
    }),
    {
      name: "qkey-cart",
      storage: typeof window !== "undefined" ? localStorage : undefined,
    }
  )
);