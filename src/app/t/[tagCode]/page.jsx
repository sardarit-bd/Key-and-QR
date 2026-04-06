"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import LoadingScreen from "@/components/scan/LoadingScreen";
import ActivationScreen from "@/components/scan/ActivationScreen";
import UnlockScreen from "@/components/scan/UnlockScreen";
import MessageDisplay from "@/components/scan/MessageDisplay";
import LimitReachedScreen from "@/components/scan/LimitReachedScreen";
import { toast } from "react-hot-toast";
import Loader from "@/shared/Loader";
import { CgProfile } from "react-icons/cg";

export default function TagPage() {
    const { tagCode } = useParams();
    const router = useRouter();
    const { user, accessToken, isLoading: authLoading } = useAuthStore();

    // States
    const [loading, setLoading] = useState(true);
    const [tagStatus, setTagStatus] = useState(null);
    const [tagData, setTagData] = useState(null);
    const [unlockResult, setUnlockResult] = useState(null);
    const [error, setError] = useState(null);
    const [showCategorySelector, setShowCategorySelector] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");

    // Step 1: Resolve tag status on page load
    const resolveTag = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get(`/tags/resolve/${tagCode}`, {
                headers: {
                    "ngrok-skip-browser-warning": "true",
                },
            });

            const data = response.data.data;

            setTagData(data);
            setTagStatus(data.status);

            // If tag is activated and user is logged in, proceed to unlock
            if (data.status === "READY_FOR_UNLOCK" && accessToken) {
                await checkAndUnlock(data);
            }
        } catch (err) {
            console.error("Error resolving tag:", err);
            setError(err.response?.data?.message || "Failed to load tag");
            toast.error("Failed to load tag");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Check if user can unlock (for activated tags)
    const checkAndUnlock = async (resolvedTagData = tagData) => {
        if (!accessToken) return;

        try {
            setLoading(true);

            // For subscribers, show category selector first
            if (resolvedTagData?.subscriptionType === "subscriber") {
                setShowCategorySelector(true);
                return;
            }

            // For free users, unlock directly
            await performUnlock();
        } catch (err) {
            console.error("Error checking unlock:", err);
            setError(err.response?.data?.message || "Failed to process");
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Perform unlock with optional category
    const performUnlock = async (category = null) => {
        try {
            setLoading(true);

            const payload = category ? { category } : {};
            const response = await api.post(
                `/scan/unlock/${tagCode}`,
                payload,
                {
                    headers: {
                        "ngrok-skip-browser-warning": "true",
                    },
                }
            );

            const result = response.data.data;
            setUnlockResult(result);

            // Handle different statuses
            if (result.status === "SUCCESS") {
                // Show message
                setShowCategorySelector(false);
            } else if (result.status === "ALREADY_SCANNED_TODAY") {
                toast(result.data.message, { icon: "🔄" });
                setUnlockResult(result);
            } else if (result.status === "LIMIT_REACHED") {
                setUnlockResult(result);
            }
        } catch (err) {
            console.error("Error unlocking:", err);
            setError(err.response?.data?.message || "Failed to unlock");
            toast.error("Failed to unlock message");
        } finally {
            setLoading(false);
        }
    };

    // Handle category selection
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        performUnlock(category);
    };

    // Handle activation after login
    const handleActivation = async () => {
        if (!accessToken) {
            // Redirect to login with return URL
            router.push(`/login?redirect=/t/${tagCode}`);
            return;
        }

        try {
            setLoading(true);
            const response = await api.post(
                `/tags/activate/${tagCode}`,
                {},
                {
                    headers: {
                        "ngrok-skip-browser-warning": "true",
                    },
                }
            );

            toast.success("Tag activated successfully!");
            // Re-resolve tag status
            await resolveTag();
        } catch (err) {
            console.error("Error activating tag:", err);
            setError(err.response?.data?.message || "Failed to activate tag");
            toast.error("Failed to activate tag");
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        if (tagCode) {
            resolveTag();
        }
    }, [tagCode]);

    // When user logs in, re-check unlock
    useEffect(() => {
        if (!authLoading && accessToken && tagStatus === "READY_FOR_UNLOCK" && tagData) {
            checkAndUnlock(tagData);
        }
    }, [accessToken, authLoading, tagStatus, tagData]);

    // Loading state
    // if (loading) {
    //     return <LoadingScreen message="Opening your InspireTag..." />;
    // }

    if (loading) {
        return <Loader text="Qkey" size={50} fullScreen />;
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Tag needs activation
    if (tagStatus === "NEEDS_ACTIVATION") {
        return (
            <ActivationScreen
                tagCode={tagCode}
                onActivate={handleActivation}
                isLoggedIn={!!accessToken}
            />
        );
    }

    // Tag is disabled
    if (tagStatus === "DISABLED") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Tag Disabled</h2>
                    <p className="text-gray-600">This tag is no longer active. Please contact support.</p>
                </div>
            </div>
        );
    }

    if (tagStatus === "READY_FOR_UNLOCK" && !accessToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CgProfile  size={45} className="text-blue-400"/>
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Login Required
                    </h2>

                    <p className="text-gray-600 mb-4">
                        Please login to unlock your message.
                    </p>

                    <button
                        onClick={() => router.push(`/login?redirect=/t/${tagCode}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
                    >
                        Login to Continue
                    </button>
                </div>
            </div>
        );
    }

    // Show category selector for subscribers
    if (showCategorySelector && tagData?.subscriptionType === "subscriber") {
        return (
            <UnlockScreen
                onSelectCategory={handleCategorySelect}
                selectedCategory={selectedCategory}
                dailyLimit={tagData?.dailyLimit || 3}
            />
        );
    }

    // Show message result
    if (unlockResult) {
        if (unlockResult.status === "LIMIT_REACHED") {
            return (
                <LimitReachedScreen
                    dailyLimit={unlockResult.data?.dailyLimit || 3}
                />
            );
        }

        return (
            <MessageDisplay
                message={unlockResult.data?.quote}
                category={unlockResult.data?.category}
                isPersonalMessage={unlockResult.data?.isPersonalMessage}
                remaining={unlockResult.data?.remaining}
                dailyLimit={unlockResult.data?.dailyLimit}
                isAlreadyScanned={unlockResult.status === "ALREADY_SCANNED_TODAY"}
            />
        );
    }

    // Default loading fallback
    return <Loader text="Preparing your message..." />;
}