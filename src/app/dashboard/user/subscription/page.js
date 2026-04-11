"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import {
    Crown, Calendar, DollarSign, CreditCard,
    AlertCircle, Loader2, XCircle, Settings,
    Shield, ExternalLink
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";
import Loader from "@/shared/Loader";

export default function UserSubscriptionsPage() {
    const { user } = useAuthStore();
    const { mySubscriptions, fetchMySubscriptions, loading } = useSubscriptionStore();
    const [loadingPortal, setLoadingPortal] = useState(false);

    useEffect(() => {
        if (user) {
            fetchMySubscriptions();
        }
    }, [user, fetchMySubscriptions]);

    const handleManageSubscription = async () => {
        setLoadingPortal(true);
        try {
            const response = await api.post("/subscriptions/create-portal-session");
            if (response.data?.data?.url) {
                window.location.href = response.data.data.url;
            } else {
                toast.error("Failed to open subscription manager");
            }
        } catch (error) {
            console.error("Portal error:", error);
            toast.error(error.response?.data?.message || "Failed to open subscription manager");
        } finally {
            setLoadingPortal(false);
        }
    };

    const activeSubscriptions = mySubscriptions.filter(
        sub => sub.status === "active" || sub.status === "trialing"
    );

    const pendingCancellations = mySubscriptions.filter(
        sub => sub.status === "active" && sub.cancelAtPeriodEnd === true
    );

    const cancelledSubscriptions = mySubscriptions.filter(
        sub => sub.status === "canceled"
    );

    if (loading && mySubscriptions.length === 0) {
        return <Loader text="Qkey..." size={50} fullScreen />;
    }

    return (
        <div className="flex-1 w-full p-4 lg:p-8 bg-white">
            <div className="mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-black flex items-center gap-2">
                            <Crown size={24} className="text-black" />
                            My Subscriptions
                        </h1>
                        <p className="text-gray-600">Manage your premium subscriptions securely</p>
                    </div>

                    {/* Security Notice - Black & White */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-700">
                        <Shield size={14} />
                        <span>Secured by Stripe</span>
                    </div>
                </div>
            </div>

            {/* Upgrade Banner - Black & White */}
            {activeSubscriptions.length === 0 && cancelledSubscriptions.length === 0 && (
                <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="font-semibold text-black mb-1">Unlock Premium Features</h3>
                            <p className="text-sm text-gray-600">
                                Get 3 quotes per day, choose from 5+ categories, and more!
                            </p>
                        </div>
                        <Link
                            href="/subscription"
                            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                        >
                            Upgrade Now
                        </Link>
                    </div>
                </div>
            )}

            {/* Manage Subscription Button - Black & White */}
            {activeSubscriptions.length > 0 && (
                <div className="mb-6">
                    <button
                        onClick={handleManageSubscription}
                        disabled={loadingPortal}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 shadow-sm cursor-pointer"
                    >
                        {loadingPortal ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Redirecting to Stripe...
                            </>
                        ) : (
                            <>
                                <Settings size={18} />
                                Manage Subscription
                                <ExternalLink size={14} />
                            </>
                        )}
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                        You will be redirected to Stripe's secure customer portal to cancel, update payment, or view invoices
                    </p>
                </div>
            )}

            {/* Active Subscriptions */}
            {activeSubscriptions.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                        <CreditCard size={18} className="text-gray-700" />
                        Active Subscriptions ({activeSubscriptions.length})
                    </h2>
                    <div className="grid gap-4">
                        {activeSubscriptions.map((sub) => (
                            <div key={sub._id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <Crown size={16} className="text-gray-700" />
                                            <span className="font-mono font-semibold text-black">{sub.tag?.tagCode}</span>
                                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full capitalize">
                                                {sub.status}
                                            </span>
                                            {sub.cancelAtPeriodEnd && (
                                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                                                    Cancels on {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                <span>Started: {new Date(sub.currentPeriodStart).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                <span>{sub.cancelAtPeriodEnd ? "Expires" : "Renews"}: {new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-700 font-medium">
                                                <DollarSign size={14} />
                                                <span>$2.99/month</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pending Cancellations Section - Black & White */}
            {pendingCancellations.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                        <AlertCircle size={18} className="text-gray-600" />
                        Pending Cancellations
                    </h2>
                    <div className="grid gap-4">
                        {pendingCancellations.map((sub) => (
                            <div key={sub._id} className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-mono font-semibold text-black">{sub.tag?.tagCode}</span>
                                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                                                Cancelling
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <span>Active until {new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Manage via Stripe portal
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cancelled/Expired Subscriptions - Black & White */}
            {cancelledSubscriptions.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                        <XCircle size={18} className="text-gray-500" />
                        Expired & Cancelled
                    </h2>
                    <div className="grid gap-4">
                        {cancelledSubscriptions.map((sub) => (
                            <div key={sub._id} className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-mono font-semibold text-gray-600">{sub.tag?.tagCode}</span>
                                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                                                {sub.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Expired on {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <Link
                                        href="/subscription"
                                        className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition text-center"
                                    >
                                        Subscribe Again
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Subscriptions Message - Black & White */}
            {activeSubscriptions.length === 0 && cancelledSubscriptions.length === 0 && pendingCancellations.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <Crown size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-black mb-2">No Subscriptions Yet</h3>
                    <p className="text-gray-500 mb-6">Upgrade to premium to unlock more quotes daily!</p>
                    <Link
                        href="/subscription"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                    >
                        View Plans
                    </Link>
                </div>
            )}
        </div>
    );
}