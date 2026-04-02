"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect, useRef } from "react";

export default function useAuthInit() {
    const initializeAuth = useAuthStore((state) => state.initializeAuth);
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!hasInitialized.current && !isInitialized) {
            hasInitialized.current = true;
            initializeAuth();
        }
    }, [initializeAuth, isInitialized]);
}