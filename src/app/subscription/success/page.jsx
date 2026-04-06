"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { CheckCircle, Crown, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SubscriptionSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tagCode = searchParams.get("tagCode");
    const { fetchMySubscriptions } = useSubscriptionStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (tagCode) {
            // Refresh subscriptions after successful payment
            const refresh = async () => {
                await fetchMySubscriptions();
                setTimeout(() => setLoading(false), 1000);
            };
            refresh();
        } else {
            setLoading(false);
        }
    }, [tagCode]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-purple-500 mx-auto mb-4" />
                    <p className="text-gray-600">Confirming your subscription...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-green-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Subscription Activated! 🎉</h1>
                <p className="text-gray-600 mb-4">
                    Your premium subscription has been successfully activated.
                </p>

                {tagCode && (
                    <div className="bg-purple-50 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-center gap-2 text-purple-700">
                            <Crown size={16} />
                            <span className="font-mono font-semibold">{tagCode}</span>
                            <span className="text-sm">is now premium!</span>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <Link
                        href="/dashboard/user/subscription"
                        className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition"
                    >
                        View My Subscriptions
                    </Link>
                    <Link
                        href="/"
                        className="block w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                        Go to Homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}