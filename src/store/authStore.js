"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            loading: false,
            hydrated: false,

            login: async ({ email, password }) => {
                set({ loading: true });

                if (email === "ahsan@gmail.com" && password === "123456") {
                    const userData = {
                        id: 1,
                        name: "Demo User",
                        email: "ahsan@gmail.com",
                    };

                    set({ user: userData, loading: false });
                    return true;
                }

                set({ loading: false });
                return false;
            },

            logout: () => set({ user: null }),

            setHydrated: () => set({ hydrated: true }),
        }),

        {
            name: "auth-storage",
            onRehydrateStorage: () => (state) => {
                state.setHydrated();
            },
        }
    )
);
