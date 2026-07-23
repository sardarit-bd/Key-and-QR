/**
 * Checkout Validation Utilities
 * Reusable validation functions for checkout
 */

// Email validation
export const isValidEmail = (email) => {
    if (!email) return { valid: false, error: 'Email is required' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, error: 'Please enter a valid email address' };
    }
    return { valid: true, error: null };
};

// Phone validation (optional)
export const isValidPhone = (phone) => {
    if (!phone) return { valid: true, error: null };
    const phoneRegex = /^[\d\s\-+()]{7,20}$/;
    if (!phoneRegex.test(phone)) {
        return { valid: false, error: 'Please enter a valid phone number' };
    }
    return { valid: true, error: null };
};

// Name validation
export const isValidName = (name) => {
    if (!name || name.trim().length < 2) {
        return { valid: false, error: 'Full name is required (minimum 2 characters)' };
    }
    return { valid: true, error: null };
};

// Address validation
export const isValidAddress = (address) => {
    if (!address || address.trim().length < 5) {
        return { valid: false, error: 'Address is required (minimum 5 characters)' };
    }
    return { valid: true, error: null };
};

// City validation
export const isValidCity = (city) => {
    if (!city || city.trim().length < 2) {
        return { valid: false, error: 'City is required' };
    }
    return { valid: true, error: null };
};

// State validation
export const isValidState = (state) => {
    if (!state || state.trim().length < 2) {
        return { valid: false, error: 'State is required' };
    }
    return { valid: true, error: null };
};

// Postal code validation (required)
export const isValidPostalCode = (postalCode) => {
    if (!postalCode || postalCode.trim().length < 3) {
        return { valid: false, error: 'ZIP Code is required' };
    }
    return { valid: true, error: null };
};

// Country validation
export const isValidCountry = (country) => {
    if (!country || country === 'Select your country') {
        return { valid: false, error: 'Please select a country' };
    }
    return { valid: true, error: null };
};

// Gift message validation
export const isValidGiftMessage = (message) => {
    if (!message) return { valid: true, error: null };
    if (message.length > 500) {
        return { valid: false, error: 'Gift message cannot exceed 500 characters' };
    }
    return { valid: true, error: null };
};

// Complete checkout form validation
export const validateCheckoutForm = (formData) => {
    const errors = {};

    const emailValidation = isValidEmail(formData.email);
    if (!emailValidation.valid) errors.email = emailValidation.error;

    const nameValidation = isValidName(formData.fullName);
    if (!nameValidation.valid) errors.fullName = nameValidation.error;

    const addressValidation = isValidAddress(formData.address);
    if (!addressValidation.valid) errors.address = addressValidation.error;

    const cityValidation = isValidCity(formData.city);
    if (!cityValidation.valid) errors.city = cityValidation.error;

    const stateValidation = isValidState(formData.state);
    if (!stateValidation.valid) errors.state = stateValidation.error;

    const countryValidation = isValidCountry(formData.country);
    if (!countryValidation.valid) errors.country = countryValidation.error;

    const phoneValidation = isValidPhone(formData.phone);
    if (!phoneValidation.valid) errors.phone = phoneValidation.error;

    const postalValidation = isValidPostalCode(formData.postalCode);
    if (!postalValidation.valid) errors.postalCode = postalValidation.error;

    if (formData.purchaseType === 'gift') {
        const giftValidation = isValidGiftMessage(formData.giftMessage);
        if (!giftValidation.valid) errors.giftMessage = giftValidation.error;
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
};