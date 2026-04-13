"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function useAuthInit() {
    const initializeAuth = useAuthStore((state) => state.initializeAuth);
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const loading = useAuthStore((state) => state.loading);
    const hasInitialized = useRef(false);
    const pathname = usePathname();
    
    const isPublicPage = pathname === "/login" || 
                        pathname === "/signup" || 
                        pathname === "/forgot-password" || 
                        pathname === "/reset-password" ||
                        pathname === "/callback";

    useEffect(() => {
        // Don't initialize on public pages
        if (isPublicPage) return;
        
        // Already initialized
        if (isInitialized) return;
        
        // Already initializing
        if (loading) return;
        
        // Prevent duplicate initialization
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            initializeAuth();
        }
    }, [initializeAuth, isInitialized, loading, isPublicPage]);
}