import api from "@/lib/api";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useProductStore = create(
  persist(
    (set, get) => ({
      products: [],
      loading: false,
      error: null,

      // Fetch all products from backend
      fetchProducts: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.get("/products");
          const products = response.data.data || [];

          // Transform _id to id and handle missing images
          const formattedProducts = products.map((product) => ({
            ...product,
            id: product._id,
            image: product.image,
            gallery: product.gallery?.filter((img) => img) || [],
          }));

          set({ products: formattedProducts, loading: false });
        } catch (error) {
          console.error("Error fetching products:", error);
          set({ error: "Failed to fetch products", loading: false });
        }
      },

      // Get single product by ID
      getProductById: (id) => {
        const { products } = get();
        return products.find((p) => p.id === id || p._id === id);
      },

      // Clear products (if needed)
      clearProducts: () => set({ products: [] }),
    }),
    {
      name: "tagtag-products",
    },
  ),
);
