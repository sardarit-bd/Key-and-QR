import { COUNTRIES, getCountryName, getCountryByCode, getCountryFlag } from "./countries.data";

/**
 * Checkout Configuration
 * All checkout-related configuration in one place
 */
export const CHECKOUT_CONFIG = {
    // Standard worldwide country list
    countries: COUNTRIES,

    // Currency
    currency: {
        code: 'USD',
        symbol: '$',
        locale: 'en-US',
    },

    // Shipping
    shipping: {
        cost: 0,
        freeThreshold: 50,
        label: 'Free',
    },

    // Default form values
    defaults: {
        purchaseType: 'self',
        country: 'US',
    },

    // Validation
    validation: {
        maxGiftMessageLength: 500,
        minNameLength: 2,
        minPasswordLength: 6,
    },
};

export { getCountryName, getCountryByCode, getCountryFlag };

// Helper: Format price
export const formatPrice = (amount) => {
    return `${CHECKOUT_CONFIG.currency.symbol}${Number(amount).toFixed(2)}`;
};