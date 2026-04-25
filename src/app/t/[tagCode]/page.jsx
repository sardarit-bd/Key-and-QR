"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import MessageDisplay from "@/components/scan/MessageDisplay";
import LimitReachedScreen from "@/components/scan/LimitReachedScreen";
import { toast } from "react-hot-toast";
import Loader from "@/shared/Loader";
import MessageLoadingScreen from "@/components/scan/MessageLoadingScreen";

export default function TagPage() {
    const { tagCode } = useParams();

    const [loading, setLoading] = useState(true);
    const [tagStatus, setTagStatus] = useState(null);
    const [unlockResult, setUnlockResult] = useState(null);
    const [error, setError] = useState(null);

    const performUnlock = async () => {
        try {
            setLoading(true);

            const response = await api.post(`/scan/unlock/${tagCode}`, {});
            const result = response.data.data;
            setUnlockResult(result);

            if (result.status === "ALREADY_SCANNED_TODAY") {
                toast(result.data.message, { icon: "🔄" });
            }
        } catch (err) {
            console.error("Error unlocking:", err);
            setError(err.response?.data?.message || "Failed to unlock");
            toast.error("Failed to unlock message");
        } finally {
            setLoading(false);
        }
    };

    const resolveTag = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get(`/tags/resolve/${tagCode}`);
            const data = response.data.data;

            setTagStatus(data.status);

            if (data.status === "READY_FOR_UNLOCK") {
                await performUnlock();
            }
        } catch (err) {
            console.error("Error resolving tag:", err);
            setError(err.response?.data?.message || "Failed to load tag");
            toast.error("Failed to load tag");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tagCode) {
            resolveTag();
        }
    }, [tagCode]);

    // if (loading) {
    //     return <MessageLoadingScreen category="faith" />;
    // }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center max-w-md">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (tagStatus === "DISABLED") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center max-w-md">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Tag Disabled</h2>
                    <p className="text-gray-600">This tag is no longer active.</p>
                </div>
            </div>
        );
    }

    if (unlockResult?.status === "LIMIT_REACHED") {
        return <LimitReachedScreen dailyLimit={unlockResult.data?.dailyLimit || 3} />;
    }

    if (unlockResult) {
        return (
            <MessageDisplay
                message={
                    unlockResult.data?.quoteData || {
                        _id: unlockResult.data?._id,
                        text: unlockResult.data?.quote,
                        category: unlockResult.data?.category,
                        author: unlockResult.data?.author,
                        image: unlockResult.data?.image,
                        theme: unlockResult.data?.theme,
                    }
                }
                category={unlockResult.data?.category}
                isPersonalMessage={unlockResult.data?.isPersonalMessage}
                isAlreadyScanned={unlockResult.status === "ALREADY_SCANNED_TODAY"}
                quoteId={unlockResult.data?._id}
                tagCode={tagCode}
            />
        );
    }

    return <Loader text="QKey..." fullScreen />;
}