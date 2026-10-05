"use client";

import { orderService } from "@/services/order.service";
import { useCartStore, useCartHydration } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { ProductImage } from "@/components/ui/ProductImage";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import CheckoutSkeleton from "@/components/ui/skeletons/CheckoutSkeleton";
import { CHECKOUT_CONFIG, formatPrice, getCountryName } from "@/config/checkout.config";
import { validateCheckoutForm } from "@/lib/validators/checkout.validator";
import { cn } from "@/lib/utils";
import { ChevronDown, ShieldCheck, Lock, CreditCard, Gift, Sparkles, AlertCircle } from "lucide-react";
import CountryCombobox from "@/components/ui/CountryCombobox";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import toast from "react-hot-toast";

const PLACEHOLDER_IMAGE = "https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image";
const DRAFT_STORAGE_KEY = "qkey_checkout_draft";

// Shared input styling for consistent premium form fields
const inputClass = (hasError) =>
    `w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-[#2E2A24] placeholder:text-[#A99B7F] transition-all duration-300 focus:outline-none focus:ring-2 ${hasError
        ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
        : "border-[#E5DCC8] focus:border-[#C6922D]/60 focus:ring-[#C6922D]/15 hover:border-[#C9BB9C]"
    }`;

function Field({ label, htmlFor, required = false, error, children }) {
    return (
        <div>
            <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-[#5C5346]">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

export default function Checkout() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const reduceMotion = useReducedMotion();
    const isHydrated = useCartHydration();

    const { user } = useAuthStore();
    const {
        cart,
        clearCart,
        getTotalPrice,
        getTotalQuantity,
        hasItems,
        validateStock,
        getCheckoutItems,
    } = useCartStore();

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [imageErrors, setImageErrors] = useState({});
    const [existingOrder, setExistingOrder] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [checkoutError, setCheckoutError] = useState(null);

    const [formData, setFormData] = useState(() => {
        if (typeof window !== "undefined") {
            try {
                const savedDraft = sessionStorage.getItem(DRAFT_STORAGE_KEY);
                if (savedDraft) {
                    const parsed = JSON.parse(savedDraft);
                    if (parsed && typeof parsed === "object") {
                        return {
                            email: parsed.email || "",
                            fullName: parsed.fullName || "",
                            phone: parsed.phone || "",
                            address: parsed.address || "",
                            city: parsed.city || "",
                            state: parsed.state || "",
                            postalCode: parsed.postalCode || "",
                            country: parsed.country || CHECKOUT_CONFIG.defaults.country,
                            purchaseType: parsed.purchaseType || CHECKOUT_CONFIG.defaults.purchaseType,
                            giftMessage: parsed.giftMessage || "",
                        };
                    }
                }
            } catch (e) {
                console.warn("Failed to load checkout draft:", e);
            }
        }
        return {
            email: "",
            fullName: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            postalCode: "",
            country: CHECKOUT_CONFIG.defaults.country,
            purchaseType: CHECKOUT_CONFIG.defaults.purchaseType,
            giftMessage: "",
        };
    });

    // Get checkout items from cart
    const checkoutItems = useMemo(() => {
        if (orderId && existingOrder?.product) {
            // Legacy single product order
            return [
                {
                    id: existingOrder.product._id,
                    name: existingOrder.product.name,
                    price: existingOrder.product.price,
                    qty: existingOrder.quantity || 1,
                    img: existingOrder.product.image?.url || PLACEHOLDER_IMAGE,
                },
            ];
        }

        // Multi-product from cart
        if (cart.length > 0) {
            return cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                qty: item.qty || 1,
                img: item.img || PLACEHOLDER_IMAGE,
                purchaseType: item.purchaseType || CHECKOUT_CONFIG.defaults.purchaseType,
                giftMessage: item.giftMessage || null,
            }));
        }

        return [];
    }, [orderId, existingOrder, cart]);

    const firstItem = checkoutItems?.[0];

    // Persist form data draft to sessionStorage on changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
            } catch (e) {
                // Ignore storage issues
            }
        }
    }, [formData]);

    // Set user data to form if not already filled
    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                email: prev.email || user.email || "",
                fullName: prev.fullName || user.name || "",
            }));
        }
    }, [user]);

    // Fetch existing order
    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;

            try {
                setPageLoading(true);
                const response = await orderService.getOrderStatus(orderId);
                const orderData = response.data || response;
                setExistingOrder(orderData);

                setFormData((prev) => ({
                    ...prev,
                    purchaseType: orderData?.purchaseType || CHECKOUT_CONFIG.defaults.purchaseType,
                    giftMessage: orderData?.giftMessage || "",
                }));
            } catch (error) {
                console.error("Failed to load order:", error);
                toast.error("Failed to load order details");
            } finally {
                setPageLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    // Pre-populate gift status and message from cart items if user configured it on product page
    useEffect(() => {
        if (!orderId && isHydrated && checkoutItems.length > 0) {
            const giftItem = checkoutItems.find(
                (item) => item.purchaseType === "gift" || Boolean(item.giftMessage)
            );
            if (giftItem) {
                setFormData((prev) => {
                    if (prev.purchaseType === "gift" && (prev.giftMessage || !giftItem.giftMessage)) {
                        return prev;
                    }
                    return {
                        ...prev,
                        purchaseType: "gift",
                        giftMessage: prev.giftMessage || giftItem.giftMessage || "",
                    };
                });
            }
        }
    }, [orderId, isHydrated, checkoutItems]);

    // Calculate totals
    const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
    const shippingCost = CHECKOUT_CONFIG.shipping.cost;
    const total = subtotal + shippingCost;

    // Validate cart before checkout
    const validateCart = async () => {
        const errors = await validateStock();
        if (errors.length > 0) {
            for (const error of errors) {
                toast.error(
                    `${error.name}: Only ${error.available} available, you requested ${error.requested}`
                );
            }
            return false;
        }
        return true;
    };

    // Build checkout payload with items
    const buildCheckoutPayload = () => {
        if (orderId) {
            return {
                orderId,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                postalCode: formData.postalCode,
                country: formData.country,
            };
        }

        const cartItems = getCheckoutItems();

        // Determine if this order or any item is a gift, and resolve unified message
        const isGiftOrder =
            formData.purchaseType === "gift" || cartItems.some((item) => item.purchaseType === "gift");
        const resolvedGiftMessage = isGiftOrder
            ? (formData.giftMessage?.trim() || cartItems.find((item) => item.giftMessage)?.giftMessage?.trim() || null)
            : null;

        // Convert to backend expected format
        const items = cartItems.map(item => ({
            product: item.productId,
            quantity: item.quantity || 1,
            purchaseType: isGiftOrder ? "gift" : (item.purchaseType || "self"),
            giftMessage: isGiftOrder ? (resolvedGiftMessage || item.giftMessage || null) : null,
        }));

        return {
            items,
            // Legacy support for single product
            productId: items.length === 1 ? items[0].product : undefined,
            quantity: items.length === 1 ? items[0].quantity : undefined,
            purchaseType: isGiftOrder ? "gift" : "self",
            giftMessage: isGiftOrder ? resolvedGiftMessage : null,
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
        };
    };

    // Handle checkout submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting || loading || isRedirecting) return;

        // Validate cart
        if (!orderId && !hasItems()) {
            toast.error("Your cart is empty. Please add items before checking out.");
            router.push("/shop");
            return;
        }

        // Use extracted validation
        const validation = validateCheckoutForm(formData);
        if (!validation.valid) {
            setFieldErrors(validation.errors);
            const firstError = Object.values(validation.errors)[0];
            if (firstError) toast.error(firstError);
            return;
        }

        // Clear field and checkout errors
        setFieldErrors({});
        setCheckoutError(null);

        setIsSubmitting(true);
        setLoading(true);

        try {
            if (!orderId) {
                const isValid = await validateCart();
                if (!isValid) {
                    setLoading(false);
                    setIsSubmitting(false);
                    return;
                }
            }

            const payload = buildCheckoutPayload();
            console.log("Checkout payload:", payload);

            const response = await orderService.createCheckout(payload);

            if (response?.data?.url) {
                if (typeof window !== "undefined") {
                    try {
                        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
                    } catch (e) {}
                }
                // Do NOT clear cart here - will be cleared on success page
                setIsRedirecting(true);
                window.location.href = response.data.url;
                return;
            }

            throw new Error("No checkout URL received");
        } catch (error) {
            console.error("Checkout failed:", error);

            let errorMessage = "Something went wrong. Please try again.";
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = typeof error.response.data.error === "string" 
                    ? error.response.data.error 
                    : JSON.stringify(error.response.data.error);
            } else if (error.message) {
                errorMessage = error.message;
            }

            setCheckoutError(errorMessage);
            toast.error(errorMessage);
            setIsRedirecting(false);
        } finally {
            if (!isRedirecting) {
                setLoading(false);
                setIsSubmitting(false);
            }
        }
    };

    // Image error handler
    const handleImageError = (productId) => {
        setImageErrors((prev) => ({ ...prev, [productId]: true }));
    };

    const getImageUrl = (item) => {
        if (imageErrors[item.id]) return PLACEHOLDER_IMAGE;
        return item.img || PLACEHOLDER_IMAGE;
    };

    // Loading & hydration guard — premium skeleton, no layout shift or flash of empty cart
    if (!isHydrated || pageLoading) {
        return <CheckoutSkeleton />;
    }

    // Redirecting state - Show loading while redirecting to Stripe
    if (isRedirecting) {
        return (
            <section className="max-w-7xl mx-auto py-32 px-4 text-center">
                <div className="bg-[#FDFBF6] p-8 sm:p-10 rounded-2xl border border-[#EDE4D0] max-w-md mx-auto shadow-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-md animate-pulse" />
                            <svg
                                className="relative h-7 w-7 animate-spin text-amber-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium tracking-wide text-[#5C5346]">Redirecting to secure payment...</p>
                    </div>
                </div>
            </section>
        );
    }

    // Empty cart - Only show when fully hydrated, not submitting, and not redirecting
    if (!orderId && isHydrated && !hasItems() && !isSubmitting && !loading) {
        return (
            <section className="max-w-7xl mx-auto py-32 px-4 text-center">
                <div className="bg-[#FDFBF6] p-8 rounded-2xl border border-[#EDE4D0] max-w-md mx-auto">
                    <h2 className="text-2xl font-bold text-[#2E2A24] mb-4">Your cart is empty</h2>
                    <p className="text-[#8A7A5C] mb-6">Add some products to your cart before checking out.</p>
                    <Link
                        href="/shop"
                        className="inline-block bg-[#2E2A24] text-white px-6 py-3 rounded-xl hover:bg-[#1F1C18] transition cursor-pointer"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </section>
        );
    }

    // Check if cart has multiple items
    const hasMultipleItems = checkoutItems.length > 1;

    return (
        <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 bg-[#FDFBF6] text-[#2E2A24]"
        >
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2E2A24]">
                        {orderId ? "Complete Payment" : "Checkout"}
                    </h1>
                    <p className="mt-1 text-sm text-[#8A7A5C]">
                        {orderId ? "Finish securing your order" : "Secure checkout — fill in your details to continue"}
                    </p>
                </div>
                <Link
                    href={orderId ? "/dashboard/user/orders" : "/cart"}
                    className="text-sm font-medium text-[#A99B7F] transition-colors hover:text-[#A6782B] cursor-pointer"
                >
                    ← {orderId ? "Back to Orders" : "Back to Cart"}
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
                {/* LEFT: Checkout Form */}
                <div className="lg:col-span-3">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Contact */}
                        <div className="rounded-2xl border border-[#EDE4D0]/80 bg-white p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgb(60_45_15/0.06)]">
                            <h2 className="mb-5 flex items-center gap-2 text-base font-bold tracking-tight text-[#2E2A24]">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2E2A24] text-[13px] font-bold text-white">1</span>
                                Contact
                            </h2>

                            <div className="space-y-4">
                                <Field label="Email" htmlFor="email" required error={fieldErrors.email}>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => {
                                            setFormData({ ...formData, email: e.target.value });
                                            if (fieldErrors.email) {
                                                const { errors } = validateCheckoutForm({ ...formData, email: e.target.value });
                                                setFieldErrors(prev => ({ ...prev, email: errors.email }));
                                            }
                                        }}
                                        placeholder="you@example.com"
                                        className={inputClass(fieldErrors.email)}
                                        disabled={isSubmitting || loading || isRedirecting}
                                        aria-label="Email address"
                                    />
                                </Field>

                                <Field label="Phone number" htmlFor="phone" error={fieldErrors.phone}>
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            setFormData({ ...formData, phone: e.target.value });
                                            if (fieldErrors.phone) {
                                                const { errors } = validateCheckoutForm({ ...formData, phone: e.target.value });
                                                setFieldErrors(prev => ({ ...prev, phone: errors.phone }));
                                            }
                                        }}
                                        placeholder="+1 (555) 000-0000"
                                        className={inputClass(fieldErrors.phone)}
                                        disabled={isSubmitting || loading || isRedirecting}
                                        aria-label="Phone number"
                                    />
                                </Field>
                            </div>
                        </div>

                        {/* Shipping Information */}
                        <div className="rounded-2xl border border-[#EDE4D0]/80 bg-white p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgb(60_45_15/0.06)]">
                            <h2 className="mb-5 flex items-center gap-2 text-base font-bold tracking-tight text-[#2E2A24]">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2E2A24] text-[13px] font-bold text-white">2</span>
                                Shipping Information
                            </h2>

                            <div className="space-y-4">
                                <Field label="Full name" htmlFor="fullName" required error={fieldErrors.fullName}>
                                    <input
                                        id="fullName"
                                        type="text"
                                        required
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={(e) => {
                                            setFormData({ ...formData, fullName: e.target.value });
                                            if (fieldErrors.fullName) {
                                                const { errors } = validateCheckoutForm({ ...formData, fullName: e.target.value });
                                                setFieldErrors(prev => ({ ...prev, fullName: errors.fullName }));
                                            }
                                        }}
                                        className={inputClass(fieldErrors.fullName)}
                                        disabled={isSubmitting || loading || isRedirecting}
                                        aria-label="Full name"
                                    />
                                </Field>

                                {/* Country Combobox (Searchable ISO-3166) */}
                                <Field label="Country" htmlFor="country" required error={fieldErrors.country}>
                                    <CountryCombobox
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={(code) => {
                                            setFormData({ ...formData, country: code });
                                            if (fieldErrors.country) {
                                                const { errors } = validateCheckoutForm({ ...formData, country: code });
                                                setFieldErrors(prev => ({ ...prev, country: errors.country }));
                                            }
                                        }}
                                        error={fieldErrors.country}
                                        disabled={isSubmitting || loading || isRedirecting}
                                        placeholder="Select your country"
                                    />
                                </Field>

                                <Field label="Address" htmlFor="address" required error={fieldErrors.address}>
                                    <input
                                        id="address"
                                        type="text"
                                        required
                                        placeholder="123 Main Street"
                                        value={formData.address}
                                        onChange={(e) => {
                                            setFormData({ ...formData, address: e.target.value });
                                            if (fieldErrors.address) {
                                                const { errors } = validateCheckoutForm({ ...formData, address: e.target.value });
                                                setFieldErrors(prev => ({ ...prev, address: errors.address }));
                                            }
                                        }}
                                        className={inputClass(fieldErrors.address)}
                                        disabled={isSubmitting || loading || isRedirecting}
                                        aria-label="Address"
                                    />
                                </Field>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Field label="City" htmlFor="city" required error={fieldErrors.city}>
                                        <input
                                            id="city"
                                            type="text"
                                            placeholder="City"
                                            value={formData.city}
                                            onChange={(e) => {
                                                setFormData({ ...formData, city: e.target.value });
                                                if (fieldErrors.city) {
                                                    const { errors } = validateCheckoutForm({ ...formData, city: e.target.value });
                                                    setFieldErrors(prev => ({ ...prev, city: errors.city }));
                                                }
                                            }}
                                            className={inputClass(fieldErrors.city)}
                                            disabled={isSubmitting || loading || isRedirecting}
                                            aria-label="City"
                                        />
                                    </Field>
                                    <Field label="State" htmlFor="state" required error={fieldErrors.state}>
                                        <input
                                            id="state"
                                            type="text"
                                            placeholder="State"
                                            value={formData.state}
                                            onChange={(e) => {
                                                setFormData({ ...formData, state: e.target.value });
                                                if (fieldErrors.state) {
                                                    const { errors } = validateCheckoutForm({ ...formData, state: e.target.value });
                                                    setFieldErrors(prev => ({ ...prev, state: errors.state }));
                                                }
                                            }}
                                            className={inputClass(fieldErrors.state)}
                                            disabled={isSubmitting || loading || isRedirecting}
                                            aria-label="State"
                                        />
                                    </Field>
                                    <Field label="ZIP Code" htmlFor="postalCode" required error={fieldErrors.postalCode}>
                                        <input
                                            id="postalCode"
                                            type="text"
                                            placeholder="ZIP"
                                            value={formData.postalCode}
                                            onChange={(e) => {
                                                setFormData({ ...formData, postalCode: e.target.value });
                                                if (fieldErrors.postalCode) {
                                                    const { errors } = validateCheckoutForm({ ...formData, postalCode: e.target.value });
                                                    setFieldErrors(prev => ({ ...prev, postalCode: errors.postalCode }));
                                                }
                                            }}
                                            className={inputClass(fieldErrors.postalCode)}
                                            disabled={isSubmitting || loading || isRedirecting}
                                            aria-label="ZIP Code"
                                        />
                                    </Field>
                                </div>
                            </div>
                        </div>

                        {/* Purchase Type & Gift Information */}
                        {!orderId && (
                            <div className="rounded-2xl border border-[#EDE4D0]/80 bg-white p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgb(60_45_15/0.06)]">
                                <h2 className="mb-5 flex items-center gap-2 text-base font-bold tracking-tight text-[#2E2A24]">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2E2A24] text-[13px] font-bold text-white">3</span>
                                    Gift Information
                                </h2>

                                <div className="space-y-4">
                                    <Field label="Purchase Type" htmlFor="purchaseType">
                                        <Select
                                            key={`purchaseType-${formData.purchaseType || "self"}`}
                                            value={formData.purchaseType || "self"}
                                            onValueChange={(val) => {
                                                setFormData(prev => ({ ...prev, purchaseType: val }));
                                                if (fieldErrors.purchaseType) {
                                                    setFieldErrors(prev => ({ ...prev, purchaseType: undefined }));
                                                }
                                            }}
                                            disabled={isSubmitting || loading || isRedirecting}
                                        >
                                            <SelectTrigger
                                                id="purchaseType"
                                                className="h-11 w-full bg-white text-[#2E2A24] [&>span]:text-[#2E2A24]"
                                                aria-label="Purchase type"
                                            >
                                                <SelectValue placeholder="Select purchase type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="self">For myself</SelectItem>
                                                <SelectItem value="gift">As a gift</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    {formData.purchaseType === "gift" && (
                                        <motion.div
                                            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            transition={{ duration: 0.25, ease: 'easeOut' }}
                                            className="overflow-hidden space-y-3"
                                        >
                                            {/* Unified Personal Gift Message Card */}
                                            {formData.giftMessage && (
                                                <div className="rounded-xl border border-[#C6922D]/30 bg-[#FDF8EE] p-3.5 text-[#2E2A24] space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#A6782B]">
                                                            <Sparkles size={13} className="text-[#C6922D]" />
                                                            Personal Gift Message (Synced from item)
                                                        </span>
                                                        <span className="text-[11px] font-medium text-[#8A7A5C]">
                                                            Included with tag
                                                        </span>
                                                    </div>
                                                    <div className="relative rounded-lg bg-white/90 p-2.5 border border-[#EDE4D0] italic text-xs text-[#2E2A24] leading-relaxed max-h-28 overflow-y-auto break-words whitespace-pre-wrap [scrollbar-width:thin]">
                                                        &ldquo;{formData.giftMessage}&rdquo;
                                                    </div>
                                                    <p className="text-[11.5px] text-[#8A7A5C]">
                                                        Your dedication is synced from your selection. You can refine or edit it below before checkout.
                                                    </p>
                                                </div>
                                            )}

                                            <Field label="Gift Message" htmlFor="giftMessage" error={fieldErrors.giftMessage}>
                                                <textarea
                                                    id="giftMessage"
                                                    placeholder="Write something heartfelt and meaningful to be read upon scanning..."
                                                    value={formData.giftMessage}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, giftMessage: e.target.value });
                                                        if (fieldErrors.giftMessage) {
                                                            const { errors } = validateCheckoutForm({ ...formData, giftMessage: e.target.value });
                                                            setFieldErrors(prev => ({ ...prev, giftMessage: errors.giftMessage }));
                                                        }
                                                    }}
                                                    rows={5}
                                                    maxLength={500}
                                                    className={`min-h-[120px] w-full resize-none rounded-xl border bg-white p-3.5 text-sm text-[#2E2A24] leading-relaxed placeholder:text-[#A99B7F] transition-all duration-200 focus:outline-none ${
                                                        fieldErrors.giftMessage
                                                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                                                            : "border-[#E5DCC8] hover:border-[#C6922D]/40 focus:border-[#C6922D] focus:ring-3 focus:ring-[#C6922D]/15"
                                                    }`}
                                                    disabled={isSubmitting || loading || isRedirecting}
                                                    aria-label="Gift message"
                                                />
                                                <div className="mt-2 flex items-center justify-between text-xs">
                                                    <span className="text-[#8A7A5C] text-[12px] flex items-center gap-1.5">
                                                        <span>✨</span>
                                                        <span>Write a heartfelt message to be linked to this physical tag and delivered on first scan.</span>
                                                    </span>
                                                    <span className={cn(
                                                        "font-medium tabular-nums shrink-0 ml-3 text-[11.5px] px-2 py-0.5 rounded-md",
                                                        (formData.giftMessage?.length || 0) === 0 ? "text-[#A99B7F] bg-[#F5EDDC]/50" : (formData.giftMessage?.length || 0) >= 450 ? "text-[#A6782B] bg-[#FCE8CB]" : "text-[#7A6A4E] bg-[#F5EDDC]"
                                                    )}>
                                                        {formData.giftMessage?.length || 0}/500
                                                    </span>
                                                </div>
                                            </Field>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Multiple Items Notice */}
                        {!orderId && checkoutItems.length > 1 && (
                            <div className="flex items-start gap-3 rounded-xl bg-[#EAF0F8] p-4 text-sm text-[#4A6A8A]">
                                <Gift size={16} className="mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold">Multiple Items</p>
                                    <p className="mt-0.5 text-xs">
                                        You have {checkoutItems.length} items in your cart. Each item will be processed separately.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Inline Error Alert Banner */}
                        {checkoutError && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                                className="rounded-xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-700 flex items-start gap-3 shadow-sm"
                                role="alert"
                            >
                                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-red-800 text-[13.5px]">Unable to process order</h4>
                                    <p className="mt-0.5 text-xs text-red-600 leading-relaxed break-words">{checkoutError}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCheckoutError(null)}
                                    className="text-red-400 hover:text-red-600 cursor-pointer text-sm p-1 rounded-md transition-colors"
                                    aria-label="Dismiss error"
                                >
                                    ✕
                                </button>
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        {(() => {
                            const isProcessing = Boolean(isSubmitting || loading || isRedirecting);
                            const isEmpty = checkoutItems.length === 0;

                            return (
                                <button
                                    type="submit"
                                    disabled={isProcessing || isEmpty}
                                    className={`relative w-full h-[54px] flex items-center justify-center gap-2.5 rounded-xl text-sm font-bold overflow-hidden transition-all duration-300 select-none ${
                                        isProcessing
                                            ? "bg-neutral-900 text-white border border-neutral-800 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.35),0_0_15px_rgba(245,158,11,0.08)] cursor-wait"
                                            : isEmpty
                                            ? "bg-[#EDE4D0] text-[#A99B7F] cursor-not-allowed"
                                            : "bg-[#2E2A24] text-white hover:bg-[#1F1C18] active:scale-[0.99] cursor-pointer shadow-md hover:shadow-lg hover:shadow-black/10"
                                    }`}
                                >
                                    {/* Luxury shimmer sweep animation when processing */}
                                    {isProcessing && (
                                        <motion.div
                                            initial={{ x: "-100%" }}
                                            animate={{ x: "200%" }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 1.8,
                                                ease: "easeInOut",
                                            }}
                                            className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.12] to-transparent"
                                        />
                                    )}

                                    {isProcessing ? (
                                        <span className="relative z-10 flex items-center justify-center gap-2.5">
                                            {/* Warm amber circular spinner */}
                                            <span className="relative flex items-center justify-center shrink-0">
                                                <span className="absolute inset-0 rounded-full bg-amber-500/20 blur-sm animate-pulse" />
                                                <svg
                                                    className="relative h-4 w-4 animate-spin text-amber-400"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    aria-hidden="true"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="3.5"
                                                    />
                                                    <path
                                                        className="opacity-95"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    />
                                                </svg>
                                            </span>
                                            <span className="tracking-wide text-white/95 font-medium text-[13.5px]">
                                                Securing your order...
                                            </span>
                                        </span>
                                    ) : (
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            <Lock size={15} className="text-[#D8B36E] shrink-0" />
                                            <span>{orderId ? "Pay Now" : "Place Order"}</span>
                                            <span className="text-white/40">•</span>
                                            <span className="tabular-nums font-bold text-amber-200/90">{formatPrice(total)}</span>
                                        </span>
                                    )}
                                </button>
                            );
                        })()}

                        {/* Security note */}
                        <p className="flex items-center justify-center gap-1.5 text-xs text-[#A99B7F]">
                            <ShieldCheck size={14} className="text-green-600" />
                            Your payment information is encrypted and processed securely.
                        </p>
                    </form>
                </div>

                {/* RIGHT: Sticky Order Summary */}
                <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-[#EDE4D0]/80 bg-white p-6 shadow-[0_12px_40px_-16px_rgb(60_45_15/0.12)] lg:sticky lg:top-8">
                        <h2 className="text-lg font-bold tracking-tight text-[#2E2A24]">
                            Order Summary ({checkoutItems.reduce((sum, i) => sum + (i.qty || 1), 0)} items)
                        </h2>

                        {checkoutItems.length === 0 ? (
                            <div className="py-8 text-center text-[#A99B7F]">
                                No items in cart
                            </div>
                        ) : (
                            <>
                                {/* Items */}
                                <div className="mt-5 space-y-4 max-h-80 overflow-y-auto pr-1">
                                    {checkoutItems.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F5F0E4]">
                                                <ProductImage
                                                    src={getImageUrl(item)}
                                                    alt={item.name}
                                                    width={64}
                                                    height={64}
                                                    className="h-full w-full object-cover"
                                                    fill={false}
                                                />

                                                <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2E2A24] px-1 text-[11px] font-bold text-white z-50 shadow-md">
                                                    {item.qty || 1}
                                                </span>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate text-sm font-semibold text-[#2E2A24]">{item.name}</h3>
                                                <p className="text-xs text-[#8A7A5C]">{formatPrice(item.price)} each</p>
                                            </div>
                                            <p className="text-sm font-semibold text-[#2E2A24] tabular-nums">
                                                {formatPrice((item.price || 0) * (item.qty || 1))}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="mt-6 space-y-2.5 border-t border-[#EDE4D0]/70 pt-5 text-sm">
                                    <div className="flex justify-between text-[#8A7A5C]">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-[#2E2A24] tabular-nums">{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-[#8A7A5C]">
                                        <span>Shipping</span>
                                        <span className="font-medium text-[#2E5B3A]">{CHECKOUT_CONFIG.shipping.label}</span>
                                    </div>
                                    {hasMultipleItems && (
                                        <div className="flex justify-between text-[#A99B7F] text-xs italic">
                                            <span>Multiple items</span>
                                            <span>✓</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t border-[#EDE4D0]/70 pt-4 text-base font-bold text-[#2E2A24]">
                                        <span>Total</span>
                                        <span className="tabular-nums">{formatPrice(total)}</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Trust badges */}
                        <div className="mt-6 space-y-3 border-t border-[#EDE4D0]/70 pt-5">
                            <p className="flex items-center gap-2.5 text-xs text-[#8A7A5C]">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E4F2E8]">
                                    <ShieldCheck size={15} className="text-[#2E5B3A]" />
                                </span>
                                Secure 256-bit SSL encrypted checkout
                            </p>
                            <p className="flex items-center gap-2.5 text-xs text-[#8A7A5C]">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF0F8]">
                                    <CreditCard size={15} className="text-[#4A6A8A]" />
                                </span>
                                Payments processed securely by Stripe
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
