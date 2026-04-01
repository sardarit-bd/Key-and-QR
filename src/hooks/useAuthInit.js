"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

export default function useAuthInit() {
    const initializeAuth = useAuthStore((state) => state.initializeAuth);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);
}