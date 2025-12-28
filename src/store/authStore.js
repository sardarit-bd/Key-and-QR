"use client";

import generateJWT from "@/utilitis/generateJWT";
import Cookies from "js-cookie";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            loading: false,
            hydrated: false,

            login: async ({ email, password }) => {
                set({ loading: true });

                if (email === "mdemong87@gmail.com" && password === "1234567890") {
                    const userData = {
                        id: 1,
                        name: "Md Emon Hossen",
                        email: "mdemong87@gmailcom",
                        role: "user",
                    };

                    const token = await generateJWT(userData);

                    // Set cookie instead of localStorage
                    Cookies.set("authToken", token, {
                        expires: 7, // 7 days expiry
                        secure: true, // set true if your site is https
                        sameSite: "strict",
                        path: "/", // make it accessible everywhere
                    });

                    // Set cookie instead of localStorage
                    Cookies.set("name", userData.name, {
                        expires: 7, // 7 days expiry
                        secure: true, // set true if your site is https
                        sameSite: "strict",
                        path: "/", // make it accessible everywhere
                    });

                    // Set cookie instead of localStorage
                    Cookies.set("ID", userData.id, {
                        expires: 7, // 7 days expiry
                        secure: true, // set true if your site is https
                        sameSite: "strict",
                        path: "/", // make it accessible everywhere
                    });

                    // Set cookie instead of localStorage
                    Cookies.set("role", userData.role, {
                        expires: 7, // 7 days expiry
                        secure: true, // set true if your site is https
                        sameSite: "strict",
                        path: "/", // make it accessible everywhere
                    });

                    set({ user: userData, token: token, loading: false });
                    return userData;
                } else if (email === "admin@gmail.com" && password === "1234567890") {
                    const userData = {
                        id: 2,
                        name: "Admin",
                        email: "admin@gmailcom",
                        role: "admin",
                    };


                    const token = await generateJWT(userData);




                    // Set cookie instead of localStorage
                    Cookies.set("authToken", token, {
                        expires: 7, // 7 days expiry
                        secure: true, // set true if your site is https
                        sameSite: "strict",
                        path: "/", // make it accessible everywhere
                    });

                    // Set cookie instead of localStorage
                    Cookies.set("name", userData.name, {
                        expires: 7, // 7 days expiry
                        secure: true, // set true if your site is https
                        sameSite: "strict",
                        path: "/", // make it accessible everywhere
                    });

                    // Set cookie instead of localStorage
                    Cookies.set("ID", userData.id, {
                        expires: 7, // 7 days expiry
                        secure: true, // set true if your site is https
                        sameSite: "strict",
                        path: "/", // make it accessible everywhere
                    });

                    // Set cookie instead of localStorage
                    Cookies.set("role", userData.role, {
                        expires: 7, // 7 days expiry
                        secure: true, // set true if your site is https
                        sameSite: "strict",
                        path: "/", // make it accessible everywhere
                    });





                    set({ user: userData, token: token, loading: false });
                    return userData;
                }

                set({ loading: false });
                return false;
            },

            logout: () => {
                Cookies.remove("authToken", { path: "/", sameSite: "strict", secure: true });
                Cookies.remove("name", { path: "/", sameSite: "strict", secure: true });
                Cookies.remove("ID", { path: "/", sameSite: "strict", secure: true });
                Cookies.remove("role", { path: "/", sameSite: "strict", secure: true });

                set({ user: null, token: null }); // also clear token
            },

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
