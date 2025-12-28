"use client";

import { create } from "zustand";

export const useUserStore = create((set) => ({
    user: {
        name: "Md Emon Hossen",
        email: "mdemong87@gmail.com",
        avatar: "/man.png",
        joinDate: "11/12/2025",
        day: "Monday",
    },

    favorites: 2,
    orders: 8,
    qrScans: 3,
}));
