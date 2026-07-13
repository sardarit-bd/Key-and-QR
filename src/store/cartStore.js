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

            // Add item to cart - Optimized with single stock check
            addToCart: async (product) => {
                const { cart } = get();
                
                // Check stock once
                let stock;
                try {
                    stock = await getProductStockWithCache(product.id);
                    if (stock < (product.qty || 1)) {
                        return { 
                            success: false, 
                            error: `Only ${stock} items available in stock.` 
                        };
                    }
                } catch (error) {
                    console.warn('Stock check failed:', error);
                }

                const existingItem = cart.find((item) => item.id === product.id);
                const quantityToAdd = product.qty || 1;

                if (existingItem) {
                    const newQty = existingItem.qty + quantityToAdd;
                    
                    // Check stock for new quantity
                    try {
                        const currentStock = await getProductStockWithCache(product.id);
                        if (currentStock < newQty) {
                            return { 
                                success: false, 
                                error: `Only ${currentStock} items available in stock.` 
                            };
                        }
                    } catch (error) {
                        console.warn('Stock check failed:', error);
                    }

                    const updatedCart = cart.map((item) =>
                        item.id === product.id
                            ? { ...item, qty: newQty }
                            : item
                    );
                    set({ cart: updatedCart });
                } else {
                    set({ 
                        cart: [...cart, { 
                            ...product, 
                            qty: quantityToAdd,
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

            // Increase quantity - Optimized with cache
            increaseQty: async (id) => {
                const { cart } = get();
                const item = cart.find((i) => i.id === id);
                if (!item) {
                    return { success: false, error: 'Item not found' };
                }

                try {
                    const stock = await getProductStockWithCache(id);
                    if (stock <= item.qty) {
                        return { 
                            success: false, 
                            error: `Only ${stock} items available in stock.` 
                        };
                    }
                } catch (error) {
                    console.warn('Stock check failed:', error);
                }

                set({
                    cart: cart.map((item) =>
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
                        if (stock < item.qty) {
                            return {
                                id: item.id,
                                name: item.name,
                                available: stock,
                                requested: item.qty,
                            };
                        }
                        return null;
                    } catch (error) {
                        console.warn('Stock check failed for:', item.id);
                        return null;
                    }
                });

                const results = await Promise.all(stockChecks);
                
                // Filter out null results (successful checks)
                const errors = results.filter(result => result !== null);
                
                return errors;
            },

            // Reset cart (for testing)
            reset: () => {
                stockCache.clear();
                set({ cart: [], isLoading: false, error: null });
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

// ============================================================
// Stock Cache Helper (prevents duplicate API calls)
// ============================================================

async function getProductStockWithCache(productId) {
    const cacheKey = `stock_${productId}`;
    const cached = stockCache.get(cacheKey);
    
    // Check if cache is still valid
    if (cached && (Date.now() - cached.timestamp) < STOCK_CACHE_TTL) {
        return cached.stock;
    }

    // Fetch fresh stock
    const stock = await productService.getProductStock(productId);
    
    // Update cache
    stockCache.set(cacheKey, {
        stock,
        timestamp: Date.now(),
    });

    return stock;
}

// ✅ Clean up stock cache periodically
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