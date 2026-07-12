"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Auth Provider - Initializes authentication on app load
 * 
 * Improvements:
 * - Initializes on ALL pages (not just protected)
 * - Prevents duplicate initialization
 * - Prevents infinite loops
 * - Handles already authenticated users
 * - No hydration issues
 */
export default function AuthProvider({ children }) {
    const { 
        initializeAuth, 
        isInitialized, 
        loading, 
        user,
        isAuthenticated,
    } = useAuthStore();
    
    const hasInitialized = useRef(false);
    const initializationAttempted = useRef(false);
    const pathname = usePathname();

    useEffect(() => {
        // Prevent duplicate initialization
        if (hasInitialized.current) return;
        if (isInitialized) {
            hasInitialized.current = true;
            return;
        }
        if (loading) return;
        if (initializationAttempted.current) return;

        // Mark as attempted to prevent multiple calls
        initializationAttempted.current = true;

        // Initialize auth (works on all pages)
        initializeAuth().finally(() => {
            hasInitialized.current = true;
            initializationAttempted.current = false;
        });
    }, [initializeAuth, isInitialized, loading]);

    // Handle case where initialization completes but we need to mark it
    useEffect(() => {
        if (isInitialized && !hasInitialized.current) {
            hasInitialized.current = true;
        }
    }, [isInitialized]);

    return children;
}