/**
 * Checkout Configuration
 * All checkout-related configuration in one place
 */

export const CHECKOUT_CONFIG = {
    // Countries
    countries: [
        { code: 'BD', name: 'Bangladesh' },
        { code: 'IN', name: 'India' },
        { code: 'US', name: 'United States' },
        { code: 'UK', name: 'United Kingdom' },
        { code: 'CA', name: 'Canada' },
        { code: 'AU', name: 'Australia' },
        { code: 'DE', name: 'Germany' },
        { code: 'FR', name: 'France' },
        { code: 'JP', name: 'Japan' },
        { code: 'AE', name: 'UAE' },
    ],

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

// Helper: Get country name by code
export const getCountryName = (code) => {
    const country = CHECKOUT_CONFIG.countries.find(c => c.code === code);
    return country?.name || code;
};

// Helper: Format price
export const formatPrice = (amount) => {
    return `${CHECKOUT_CONFIG.currency.symbol}${Number(amount).toFixed(2)}`;
};