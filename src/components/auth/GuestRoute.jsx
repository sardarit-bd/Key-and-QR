"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GuestRoute({ children }) {
    const router = useRouter();
    const { user, isInitialized } = useAuthStore();

    useEffect(() => {
        if (!isInitialized) return;

        if (user) {
            if (user.role === "admin") {
                router.replace("/dashboard/admin");
            } else {
                router.replace("/dashboard/user");
            }
        }
    }, [user, isInitialized, router]);

    if (!isInitialized) {
        return <LoadingSpinner />;
    }

    if (user) return null;

    return children;
}