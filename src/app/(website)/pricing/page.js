"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { FaCrown, FaCheck, FaArrowRight, FaSpinner, FaTag } from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";
import { PiSparkleFill } from "react-icons/pi";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function PricingPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { 
        plans, 
        mySubscriptions, 
        fetchPlans, 
        fetchMySubscriptions, 
        createCheckout, 
        loading 
    } = useSubscriptionStore();
    
    const [selectedTag, setSelectedTag] = useState("");
    const [userTags, setUserTags] = useState([]);
    const [loadingTags, setLoadingTags] = useState(false);
    const [subscribing, setSubscribing] = useState(false);

    useEffect(() => {
        fetchPlans();
        if (user) {
            fetchMySubscriptions();
            fetchUserTags();
        }
    }, [user]);

    const fetchUserTags = async () => {
        setLoadingTags(true);
        try {
            const response = await api.get("/tags?limit=100");
            const allTags = response.data?.data?.data || [];
            const ownedTags = allTags.filter(tag => 
                tag.owner?._id === user?._id || tag.owner === user?._id
            );
            setUserTags(ownedTags);
            
            // Auto-select first tag without active subscription
            const subscribedTagIds = mySubscriptions
                .filter(sub => sub.status === "active" || sub.status === "trialing")
                .map(sub => sub.tag?._id);
            const availableTag = ownedTags.find(tag => !subscribedTagIds.includes(tag._id));
            if (availableTag) setSelectedTag(availableTag._id);
        } catch (error) {
            console.error("Error fetching tags:", error);
        } finally {
            setLoadingTags(false);
        }
    };

    const handleSubscribe = async () => {
        if (!user) {
            toast.error("Please login to subscribe");
            router.push("/login?redirect=/pricing");
            return;
        }

        if (!selectedTag) {
            toast.error("Please select a tag to subscribe");
            return;
        }

        const tag = userTags.find(t => t._id === selectedTag);
        if (!tag) {
            toast.error("Tag not found");
            return;
        }

        setSubscribing(true);
        const result = await createCheckout(tag.tagCode);
        if (!result.success) {
            toast.error(result.error);
        }
        setSubscribing(false);
    };

    const isAlreadySubscribed = () => {
        return mySubscriptions.some(sub => 
            (sub.status === "active" || sub.status === "trialing")
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg mb-4">
                        <FaCrown size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Choose Your Plan
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Unlock unlimited inspiration with daily motivational quotes
                    </p>
                </div>

                {/* Tag Selection Section */}
                {user && userTags.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-10 max-w-2xl mx-auto">
                        <div className="flex items-center gap-2 mb-4">
                            <FaTag size={18} className="text-purple-500" />
                            <h2 className="font-semibold text-gray-900">Select Your Tag</h2>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Choose which tag you want to upgrade to premium subscription
                        </p>
                        <select
                            value={selectedTag}
                            onChange={(e) => setSelectedTag(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={loadingTags}
                        >
                            <option value="">Select a tag...</option>
                            {userTags.map((tag) => {
                                const hasActiveSub = mySubscriptions.some(
                                    sub => sub.tag?._id === tag._id && 
                                    (sub.status === "active" || sub.status === "trialing")
                                );
                                return (
                                    <option key={tag._id} value={tag._id} disabled={hasActiveSub}>
                                        {tag.tagCode} {hasActiveSub ? "(Already subscribed)" : ""}
                                    </option>
                                );
                            })}
                        </select>
                        {loadingTags && (
                            <div className="flex justify-center mt-3">
                                <FaSpinner size={20} className="animate-spin text-gray-400" />
                            </div>
                        )}
                    </div>
                )}

                {/* Login Prompt */}
                {!user && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-center max-w-2xl mx-auto">
                        <FiAlertCircle size={20} className="text-yellow-600 inline mr-2" />
                        <span className="text-yellow-700">Please login to subscribe to a plan</span>
                        <Link href="/login?redirect=/pricing" className="ml-3 text-yellow-800 font-medium underline">
                            Login →
                        </Link>
                    </div>
                )}

                {/* Plans Grid */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300">
                        <div className="p-6 text-center bg-gray-50 border-b border-gray-200">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <PiSparkleFill size={28} className="text-gray-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Free</h2>
                            <p className="text-gray-500 mt-1">Basic inspiration</p>
                        </div>
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <span className="text-4xl font-bold text-gray-900">$0</span>
                                <span className="text-gray-500">/forever</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-gray-600">
                                    <FaCheck size={14} className="text-green-500 flex-shrink-0" />
                                    <span className="text-sm">1 quote per day</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-600">
                                    <FaCheck size={14} className="text-green-500 flex-shrink-0" />
                                    <span className="text-sm">Random quotes only</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-600">
                                    <FaCheck size={14} className="text-green-500 flex-shrink-0" />
                                    <span className="text-sm">Basic inspiration</span>
                                </li>
                            </ul>
                            <button
                                disabled
                                className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl font-medium cursor-not-allowed"
                            >
                                Current Plan
                            </button>
                        </div>
                    </div>

                    {/* Premium Plan */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-purple-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] relative">
                        <div className="absolute top-0 right-0">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                                <FaCrown size={12} />
                                POPULAR
                            </div>
                        </div>
                        <div className="p-6 text-center bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <FaCrown size={28} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Premium</h2>
                            <p className="text-gray-500 mt-1">Unlimited inspiration</p>
                        </div>
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <span className="text-4xl font-bold text-gray-900">$2.99</span>
                                <span className="text-gray-500">/month</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-gray-600">
                                    <FaCheck size={14} className="text-purple-500 flex-shrink-0" />
                                    <span className="text-sm">3 quotes per day</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-600">
                                    <FaCheck size={14} className="text-purple-500 flex-shrink-0" />
                                    <span className="text-sm">Choose from 7+ categories</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-600">
                                    <FaCheck size={14} className="text-purple-500 flex-shrink-0" />
                                    <span className="text-sm">Faith, Love, Hope, Success, Motivation & more</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-600">
                                    <FaCheck size={14} className="text-purple-500 flex-shrink-0" />
                                    <span className="text-sm">Priority support</span>
                                </li>
                            </ul>
                            <button
                                onClick={handleSubscribe}
                                disabled={subscribing || !user || !selectedTag || isAlreadySubscribed()}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {subscribing ? (
                                    <>
                                        <FaSpinner size={16} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : isAlreadySubscribed() ? (
                                    "Already Subscribed"
                                ) : (
                                    <>
                                        Subscribe Now
                                        <FaArrowRight size={14} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Feature Comparison Table */}
                <div className="mt-16 bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold text-gray-900 text-center mb-6">Feature Comparison</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-medium text-gray-600">Feature</th>
                                    <th className="text-center py-3 px-4 font-medium text-gray-600">Free</th>
                                    <th className="text-center py-3 px-4 font-medium text-purple-600">Premium</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-3 px-4 text-gray-700">Daily Quotes</td>
                                    <td className="text-center py-3 px-4">1</td>
                                    <td className="text-center py-3 px-4 font-semibold text-purple-600">3</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-3 px-4 text-gray-700">Category Selection</td>
                                    <td className="text-center py-3 px-4">❌</td>
                                    <td className="text-center py-3 px-4">✅</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-3 px-4 text-gray-700">Quote Categories</td>
                                    <td className="text-center py-3 px-4">Random only</td>
                                    <td className="text-center py-3 px-4">7+ Categories</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-3 px-4 text-gray-700">Priority Support</td>
                                    <td className="text-center py-3 px-4">❌</td>
                                    <td className="text-center py-3 px-4">✅</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-3 px-4 text-gray-700">Cancel Anytime</td>
                                    <td className="text-center py-3 px-4">-</td>
                                    <td className="text-center py-3 px-4">✅</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ / Footer */}
                <div className="mt-12 text-center max-w-2xl mx-auto">
                    <p className="text-sm text-gray-400">
                        Subscription automatically renews monthly. Cancel anytime from your dashboard.
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        By subscribing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}