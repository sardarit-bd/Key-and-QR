export const PAYMENT_CONFIG = {
    // Currency
    currency: {
        code: process.env.NEXT_PUBLIC_CURRENCY_CODE || "usd",
        symbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$",
        locale: process.env.NEXT_PUBLIC_CURRENCY_LOCALE || "en-US",
    },

    // URLs
    urls: {
        success: process.env.NEXT_PUBLIC_SUCCESS_URL || "/success",
        cancel: process.env.NEXT_PUBLIC_CANCEL_URL || "/cancel",
    },

    // Stripe Settings
    stripe: {
        paymentMethodTypes: ["card"],
        mode: "payment",
        // Future: Tax settings
        tax: {
            enabled: process.env.NEXT_PUBLIC_TAX_ENABLED === "true",
            rate: parseFloat(process.env.NEXT_PUBLIC_TAX_RATE || "0"),
        },
        // Future: Shipping settings
        shipping: {
            enabled: process.env.NEXT_PUBLIC_SHIPPING_ENABLED === "true",
            cost: parseFloat(process.env.NEXT_PUBLIC_SHIPPING_COST || "0"),
        },
    },

    // ************* Helper: Get full success URL *************
    getSuccessUrl: (orderId) => {
        const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 
                       (typeof window !== "undefined" ? window.location.origin : "");
        return `${baseUrl}${PAYMENT_CONFIG.urls.success}?orderId=${orderId}`;
    },

    // ************* Helper: Get full cancel URL *************
    getCancelUrl: () => {
        const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 
                       (typeof window !== "undefined" ? window.location.origin : "");
        return `${baseUrl}${PAYMENT_CONFIG.urls.cancel}`;
    },

    // ************* Helper: Format price *************
    formatPrice: (amount) => {
        return `${PAYMENT_CONFIG.currency.symbol}${Number(amount).toFixed(2)}`;
    },

    // ************* Helper: Get currency code *************
    getCurrency: () => PAYMENT_CONFIG.currency.code,

    // ************* Helper: Get payment method types *************
    getPaymentMethodTypes: () => PAYMENT_CONFIG.stripe.paymentMethodTypes,

    // ************* Helper: Get tax rate *************
    getTaxRate: () => PAYMENT_CONFIG.stripe.tax.rate,

    // ************* Helper: Get shipping cost *************
    getShippingCost: () => PAYMENT_CONFIG.stripe.shipping.cost,
};

export default PAYMENT_CONFIG;