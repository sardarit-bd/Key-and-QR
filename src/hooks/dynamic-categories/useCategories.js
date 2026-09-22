import {
  useProductCategories,
  productCategoryKeys,
} from "@/hooks/product-category/useProductCategories";

// Backwards compatibility alias
export const categoryKeys = productCategoryKeys;
export { productCategoryKeys };

/**
 * Get product categories from /product-categories.
 * NOTE: this is the physical PRODUCT category list — not the quote category list.
 * Quote categories come from useQuoteCategories() (GET /categories).
 */
export function useCategories(params = {}) {
  return useProductCategories(params);
}

export default useCategories;

