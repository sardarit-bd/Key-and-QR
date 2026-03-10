"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

export default function AuthProvider({ children }) {
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return <>{children}</>;
}