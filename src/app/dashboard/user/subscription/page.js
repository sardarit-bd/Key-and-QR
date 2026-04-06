"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { Crown, Calendar, DollarSign, CreditCard, AlertCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function UserSubscriptionsPage() {
    const { user } = useAuthStore();
    const { mySubscriptions, fetchMySubscriptions, cancelSubscription, loading } = useSubscriptionStore();
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        if (user) {
            fetchMySubscriptions();
        }
    }, [user]);

    const handleCancel = async (subscriptionId, tagCode) => {
        if (!confirm(`Are you sure you want to cancel subscription for tag "${tagCode}"? You'll still have access until the end of your billing period.`)) {
            return;
        }
        setCancellingId(subscriptionId);
        const result = await cancelSubscription(tagCode);
        if (result.success) {
            toast.success("Subscription will be cancelled at period end");
        } else {
            toast.error(result.error);
        }
        setCancellingId(null);
    };

    const activeSubscriptions = mySubscriptions.filter(
        sub => sub.status === "active" || sub.status === "trialing"
    );
    const cancelledSubscriptions = mySubscriptions.filter(
        sub => sub.status === "canceled" || sub.cancelAtPeriodEnd === true
    );
    const pastSubscriptions = mySubscriptions.filter(
        sub => sub.status === "past_due" || sub.status === "unpaid"
    );

    if (loading && mySubscriptions.length === 0) {
        return (
            <div className="flex-1 w-full p-8 flex items-center justify-center min-h-[400px]">
                <Loader2 size={40} className="animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="flex-1 w-full p-4 lg:p-8">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                        <Crown size={24} className="text-purple-500" />
                        My Subscriptions
                    </h1>
                </div>
                <p className="text-gray-500">Manage your premium subscriptions</p>
            </div>

            {/* Upgrade Banner */}
            {activeSubscriptions.length === 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-8 border border-purple-200">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Unlock Premium Features</h3>
                            <p className="text-sm text-gray-600">
                                Get 3 quotes per day, choose from 5+ categories, and more!
                            </p>
                        </div>
                        <Link
                            href="/subscription"
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
                        >
                            Upgrade Now
                        </Link>
                    </div>
                </div>
            )}

            {/* Active Subscriptions */}
            {activeSubscriptions.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard size={18} className="text-green-500" />
                        Active Subscriptions
                    </h2>
                    <div className="grid gap-4">
                        {activeSubscriptions.map((sub) => (
                            <div key={sub._id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Crown size={16} className="text-purple-500" />
                                            <span className="font-mono font-semibold text-gray-900">{sub.tag?.tagCode}</span>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full capitalize">
                                                {sub.status}
                                            </span>
                                            {sub.cancelAtPeriodEnd && (
                                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                                    Cancels at period end
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                <span>Started: {new Date(sub.currentPeriodStart).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                <span>Renews: {new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-purple-600">
                                                <DollarSign size={16} />
                                                <span className="font-semibold">$2.99</span>
                                                <span className="text-xs text-gray-500">/month</span>
                                            </div>
                                        </div>
                                        {!sub.cancelAtPeriodEnd && (
                                            <button
                                                onClick={() => handleCancel(sub._id, sub.tag?.tagCode)}
                                                disabled={cancellingId === sub._id}
                                                className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                                            >
                                                {cancellingId === sub._id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    "Cancel"
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cancelled Subscriptions */}
            {cancelledSubscriptions.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <XCircle size={18} className="text-gray-500" />
                        Cancelled Subscriptions
                    </h2>
                    <div className="grid gap-4">
                        {cancelledSubscriptions.map((sub) => (
                            <div key={sub._id} className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-mono font-semibold text-gray-500">{sub.tag?.tagCode}</span>
                                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                                {sub.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {sub.cancelAtPeriodEnd ? (
                                                <span>Access until {new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>
                                            ) : (
                                                <span>Expired on {new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    <Link
                                        href="/subscription"
                                        className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-center"
                                    >
                                        Resubscribe
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Subscriptions Message */}
            {activeSubscriptions.length === 0 && cancelledSubscriptions.length === 0 && pastSubscriptions.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <Crown size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Subscriptions Yet</h3>
                    <p className="text-gray-500 mb-6">Upgrade to premium to unlock more quotes daily!</p>
                    <Link
                        href="/subscription"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
                    >
                        View Plans
                    </Link>
                </div>
            )}
        </div>
    );
}