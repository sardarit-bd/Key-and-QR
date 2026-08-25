import productService from "@/services/product-service/product.service";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Stock cache to prevent duplicate requests
const stockCache = new Map();
const STOCK_CACHE_TTL = 5000; // 5 seconds

export const useCartStore = create(
    persist(
        (set, get) => ({
            cart: [],
            isLoading: false,
            error: null,

            // ************* EXISTING METHODS *************

            // Add item to cart - Optimized with single stock check
            addToCart: async (product) => {
                if (!product || !product.id) {
                    return { success: false, error: "Invalid product." };
                }

                const { cart } = get();
                const existingItem = cart.find((item) => item.id === product.id);
                const quantityToAdd = product.qty || 1;
                const targetQty = existingItem ? existingItem.qty + quantityToAdd : quantityToAdd;
                
                // Check stock
                let resolvedStock = product.stock ?? product.stockQuantity;
                try {
                    const stock = await getProductStockWithCache(product.id);
                    if (typeof stock === "number") {
                        resolvedStock = stock;
                        if (stock <= 0) {
                            return {
                                success: false,
                                error: "This product is currently out of stock.",
                            };
                        }
                        if (stock < targetQty) {
                            return { 
                                success: false, 
                                error: `Only ${stock} items available in stock.`,
                            };
                        }
                    }
                } catch (error) {
                    console.warn("Stock check failed:", error);
                    return {
                        success: false,
                        error: "Unable to verify product availability. Please try again.",
                    };
                }

                if (existingItem) {
                    const updatedCart = cart.map((item) =>
                        item.id === product.id
                            ? { 
                                ...item, 
                                qty: targetQty,
                                stock: typeof resolvedStock === 'number' ? resolvedStock : item.stock,
                                stockQuantity: typeof resolvedStock === 'number' ? resolvedStock : item.stockQuantity,
                              }
                            : item
                    );
                    set({ cart: updatedCart });
                } else {
                    set({ 
                        cart: [...cart, { 
                            ...product, 
                            qty: quantityToAdd,
                            stock: typeof resolvedStock === 'number' ? resolvedStock : product.stock,
                            stockQuantity: typeof resolvedStock === 'number' ? resolvedStock : product.stockQuantity,
                            addedAt: new Date().toISOString()
                        }] 
                    });
                }

                return { success: true };
            },

            // Update quantity - Pure state update
            updateQuantity: (id, quantity) => {
                const { cart } = get();
                if (quantity <= 0) {
                    set({ cart: cart.filter((item) => item.id !== id) });
                    return;
                }

                set({
                    cart: cart.map((item) =>
                        item.id === id ? { ...item, qty: quantity } : item
                    ),
                });
            },

            // Increase quantity - Optimized with cache and stock limit checks
            increaseQty: async (id) => {
                const { cart } = get();
                const item = cart.find((i) => i.id === id);
                if (!item) {
                    return { success: false, error: "Item not found" };
                }

                try {
                    const stock = await getProductStockWithCache(id);
                    if (typeof stock === "number") {
                        // Update stock on cart item
                        set({
                            cart: get().cart.map((i) =>
                                i.id === id ? { ...i, stock, stockQuantity: stock } : i
                            )
                        });

                        if (stock <= item.qty) {
                            return { 
                                success: false, 
                                error: `Only ${stock} items available in stock.`,
                                availableStock: stock,
                                maxLimitReached: true
                            };
                        }
                    }
                } catch (error) {
                    console.warn("Stock check failed:", error);
                    return {
                        success: false,
                        error: "Unable to verify product availability. Please try again.",
                    };
                }

                set({
                    cart: get().cart.map((item) =>
                        item.id === id ? { ...item, qty: item.qty + 1 } : item
                    ),
                });

                return { success: true };
            },

            // Decrease quantity
            decreaseQty: (id) => {
                const { cart } = get();
                set({
                    cart: cart
                        .map((item) =>
                            item.id === id ? { ...item, qty: item.qty - 1 } : item
                        )
                        .filter((item) => item.qty > 0),
                });
            },

            // Remove item
            removeItem: (id) => {
                set((state) => ({
                    cart: state.cart.filter((item) => item.id !== id),
                }));
            },

            // Clear cart
            clearCart: () => {
                // Clear stock cache on cart clear
                stockCache.clear();
                set({ cart: [] });
            },

            // Get cart items for checkout payload
            getCheckoutItems: () => {
                const { cart } = get();
                return cart.map(item => ({
                    productId: item.id,
                    quantity: item.qty || 1,
                    purchaseType: item.purchaseType || "self",
                    giftMessage: item.giftMessage || null,
                }));
            },

            // Getters
            getTotalQuantity: () => {
                const { cart } = get();
                return cart.reduce((total, item) => total + (item.qty || 1), 0);
            },

            getTotalPrice: () => {
                const { cart } = get();
                return cart.reduce(
                    (total, item) => total + (item.price * (item.qty || 1)), 
                    0
                );
            },

            getItemCount: () => {
                const { cart } = get();
                return cart.length;
            },

            hasItems: () => {
                const { cart } = get();
                return cart.length > 0;
            },

            getSummary: () => {
                const { cart } = get();
                return {
                    items: cart,
                    totalQuantity: cart.reduce((sum, i) => sum + (i.qty || 1), 0),
                    totalPrice: cart.reduce(
                        (sum, i) => sum + (i.price * (i.qty || 1)), 
                        0
                    ),
                    itemCount: cart.length,
                };
            },

            // Optimized stock validation - Parallel execution
            validateStock: async () => {
                const { cart } = get();
                if (cart.length === 0) return [];

                // Execute all stock checks in parallel
                const stockChecks = cart.map(async (item) => {
                    try {
                        const stock = await getProductStockWithCache(item.id);
                        return {
                            id: item.id,
                            name: item.name,
                            stock: typeof stock === 'number' ? stock : item.stock,
                            isExceeded: typeof stock === 'number' && stock < item.qty,
                            available: stock,
                            requested: item.qty,
                        };
                    } catch (error) {
                        console.warn('Stock check failed for:', item.id);
                        return null;
                    }
                });

                const results = await Promise.all(stockChecks);
                
                // Update cached stock on cart items in store
                const updatedCart = get().cart.map((item) => {
                    const found = results.find(r => r && r.id === item.id);
                    if (found && typeof found.stock === 'number') {
                        return { ...item, stock: found.stock, stockQuantity: found.stock };
                    }
                    return item;
                });
                set({ cart: updatedCart });
                
                // Filter out stock exceeded errors
                const errors = results.filter(result => result && result.isExceeded);
                
                return errors;
            },

            // Reset cart (for testing)
            reset: () => {
                stockCache.clear();
                set({ cart: [], isLoading: false, error: null });
            },

            // ************* NEW HELPER METHODS *************

            /**
             * Check if a product is in the cart
             * @param {string} productId - Product ID
             * @returns {boolean}
             */
            isInCart: (productId) => {
                const { cart } = get();
                return cart.some(item => item.id === productId);
            },

            /**
             * Get a cart item by product ID
             * @param {string} productId - Product ID
             * @returns {object|null} Cart item or null
             */
            getCartItem: (productId) => {
                const { cart } = get();
                return cart.find(item => item.id === productId) || null;
            },

            /**
             * Remove a product from cart by ID
             * @param {string} productId - Product ID
             * @returns {object} Result with success flag and item name
             */
            removeFromCart: (productId) => {
                const { cart } = get();
                const item = cart.find(i => i.id === productId);
                if (item) {
                    set({ cart: cart.filter(i => i.id !== productId) });
                    return { success: true, name: item.name };
                }
                return { success: false, error: 'Item not found' };
            },

            /**
             * Update quantity of a product in cart
             * @param {string} productId - Product ID
             * @param {number} quantity - New quantity
             * @returns {object} Result with success flag
             */
            updateQuantity: (productId, quantity) => {
                const { cart } = get();
                if (quantity <= 0) {
                    set({ cart: cart.filter((item) => item.id !== productId) });
                    return { success: true, removed: true };
                }
                set({
                    cart: cart.map((item) =>
                        item.id === productId ? { ...item, qty: quantity } : item
                    ),
                });
                return { success: true };
            },
        }),
        {
            name: "qkey-cart",
            storage: typeof window !== "undefined" ? localStorage : undefined,
            partialize: (state) => ({
                cart: state.cart,
            }),
        }
    )
);

// ************* Stock Cache Helper *************

async function getProductStockWithCache(productId) {
    if (!productId) return 0;
    const cacheKey = `stock_${productId}`;
    const cached = stockCache.get(cacheKey);
    
    // Check if cache is still valid
    if (cached && (Date.now() - cached.timestamp) < STOCK_CACHE_TTL) {
        return cached.stock;
    }

    // Fetch fresh stock
    const stock = await productService.getProductStock(productId);
    
    // Update cache only if valid number returned
    if (typeof stock === "number") {
        stockCache.set(cacheKey, {
            stock,
            timestamp: Date.now(),
        });
    }

    return typeof stock === "number" ? stock : 0;
}

// Clean up stock cache periodically
if (typeof window !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        for (const [key, value] of stockCache) {
            if (now - value.timestamp > STOCK_CACHE_TTL) {
                stockCache.delete(key);
            }
        }
    }, 60000); // Clean every minute
}