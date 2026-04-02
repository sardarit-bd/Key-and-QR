"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function CallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fetchMe = useAuthStore((state) => state.fetchMe);

    useEffect(() => {
        const handleCallback = async () => {
            const success = searchParams.get("success");

            if (success !== "true") {
                router.replace("/login");
                return;
            }

            const user = await fetchMe();

            if (!user) {
                router.replace("/login?error=session_not_found");
                return;
            }

            if (user.role === "admin") {
                router.replace("/dashboard/admin");
            } else {
                router.replace("/dashboard/user");
            }
        };

        handleCallback();
    }, [fetchMe, router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mx-auto mb-4" />
                <p>Signing you in...</p>
            </div>
        </div>
    );
}