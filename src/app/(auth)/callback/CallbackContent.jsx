"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { setTokens, setUser } from "@/lib/auth-utils";
import { useAuthStore } from "@/store/authStore";

export default function CallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { setUser: setStoreUser, setIsInitialized } = useAuthStore();

    useEffect(() => {
        const success = searchParams.get("success");
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");
        const userParam = searchParams.get("user");
        const error = searchParams.get("error");

        if (error) {
            console.error("Auth error:", error);
            router.push("/login?error=" + error);
            return;
        }

        if (success === "true" && accessToken && refreshToken && userParam) {
            try {
                // Save tokens using centralized auth-utils
                setTokens(accessToken, refreshToken);

                const user = JSON.parse(decodeURIComponent(userParam));
                console.log("User from callback:", user);

                // Save user using centralized auth-utils
                setUser(user);

                // Update store
                setStoreUser(user);
                setIsInitialized(true);

                // Set cookies for middleware
                document.cookie = `accessToken=${accessToken}; path=/; max-age=900; SameSite=Lax`;
                document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Lax`;

                console.log("Auth successful, store updated");

                // Redirect based on role
                setTimeout(() => {
                    if (user.role === "admin") {
                        router.push("/new-dashboard/admin");
                    } else {
                        router.push("/new-dashboard/user");
                    }
                }, 100);

            } catch (err) {
                console.error("Callback processing error:", err);
                router.push("/login?error=callback_processing_failed");
            }
        } else {
            console.error("Invalid callback data");
            router.push("/login?error=invalid_callback");
        }
    }, [searchParams, router, setStoreUser, setIsInitialized]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Processing login...</p>
            </div>
        </div>
    );
}