"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Loader from "@/shared/Loader";

export default function CallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { fetchMe, isInitialized } = useAuthStore();

    useEffect(() => {
        const handleCallback = async () => {
            const success = searchParams.get("success");
            const error = searchParams.get("error");

            if (error) {
                router.replace(`/login?error=${error}`);
                return;
            }

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
            {/* <Loader text="Qkey..." size={40} fullScreen={false} /> */}
        </div>
    );
}