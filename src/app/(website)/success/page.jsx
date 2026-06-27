import SuccessPage from "@/shared/Success";
import { Suspense } from "react";

export default function Page() {
    return (
        <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
            <SuccessPage />
        </Suspense>
    );
}