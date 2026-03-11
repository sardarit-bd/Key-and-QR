"use client";

import ResetPasswordPage from "@/components/resetpasswordpage/ResetPasswordPage";
import { Suspense } from "react";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordPage />
        </Suspense>
    );
}