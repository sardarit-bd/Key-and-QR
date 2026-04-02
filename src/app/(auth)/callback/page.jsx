"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fetchMe = useAuthStore((state) => state.fetchMe);

    useEffect(() => {
        const handleAuthCallback = async () => {
            const success = searchParams.get("success");

            if (success === "true") {
                try {
                    const user = await fetchMe();

                    if (user?.role === "admin") {
                        router.replace("/dashboard/admin");
                    } else {
                        router.replace("/dashboard/user");
                    }
                } catch (error) {
                    router.replace("/login?error=auth_callback_failed");
                }
            } else {
                router.replace("/login");
            }
        };

        handleAuthCallback();
    }, [fetchMe, router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Signing you in...</p>
            </div>
        </div>
    );
}