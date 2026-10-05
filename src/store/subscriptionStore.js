import { create } from "zustand";
import { persist } from "zustand/middleware";
import { subscriptionService } from "@/services/subscription.service";

export const useSubscriptionStore = create(
    persist(
        (set, get) => ({
            plans: [],
            mySubscriptions: [],
            loading: false,
            isLoaded: false,
            error: null,

            fetchPlans: async () => {
                set({ loading: true, error: null });
                try {
                    const response = await subscriptionService.getPlans();

                    set({
                        plans: response?.data || [],
                        loading: false,
                    });
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Failed to load plans",
                        loading: false,
                    });
                }
            },

            fetchMySubscriptions: async () => {
                set({ loading: true, error: null });
                try {
                    const response = await subscriptionService.getMySubscriptions();

                    set({
                        mySubscriptions: response?.data || [],
                        loading: false,
                        isLoaded: true,
                    });
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Failed to load subscriptions",
                        loading: false,
                        isLoaded: true,
                    });
                }
            },

    createCheckout: async (tagCode, preferredCategory) => {
        set({ loading: true, error: null });
        try {
            const response = await subscriptionService.createCheckout(
                tagCode,
                preferredCategory
            );

            const checkoutUrl = response?.data?.checkoutUrl;

            if (checkoutUrl) {
                window.location.href = checkoutUrl;
                return { success: true };
            }

            set({ loading: false });

            return {
                success: false,
                error: "Checkout URL not found",
            };
        } catch (error) {
            const message =
                error.response?.data?.message || "Failed to create checkout";

            set({
                error: message,
                loading: false,
            });

            return {
                success: false,
                error: message,
            };
        }
    },

    cancelSubscription: async (tagCode) => {
        set({ loading: true, error: null });
        try {
            const response = await subscriptionService.cancelSubscription(tagCode);

            await get().fetchMySubscriptions();

            set({
                loading: false,
            });

            return {
                success: true,
                data: response?.data,
            };
        } catch (error) {
            const message =
                error.response?.data?.message || "Failed to cancel subscription";

            set({
                error: message,
                loading: false,
            });
            return {
                success: false,
                error: message,
            };
        }
    },
}),
    {
        name: "myinspiretag-subscriptions",
        partialize: (state) => ({
            plans: state.plans,
            mySubscriptions: state.mySubscriptions,
        }),
        onRehydrateStorage: () => (state) => {
            if (state) {
                state.isLoaded = true;
            }
        },
    }
));