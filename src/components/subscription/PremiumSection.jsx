"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import {
  FaCrown,
  FaSpinner,
  FaArrowRight,
  FaCheck,
} from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { TiTickOutline } from "react-icons/ti";

export default function PremiumSection({ selectedCategory }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createCheckout, mySubscriptions, fetchMySubscriptions } =
    useSubscriptionStore();

  const [subscribing, setSubscribing] = useState(false);
  const [selectedTag, setSelectedTag] = useState("");
  const [userTags, setUserTags] = useState([]);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);

  const isAlreadySubscribed = () => {
    if (!Array.isArray(mySubscriptions)) return false;

    return mySubscriptions.some(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );
  };

  useEffect(() => {
    if (user) {
      fetchMySubscriptions();
      fetchUserTags();
    }
  }, [user]);

  const fetchUserTags = async () => {
    setLoadingTags(true);
    try {
      const response = await api.get("/tags/me");
      const ownedTags = response.data?.data || [];
      setUserTags(ownedTags);

      if (ownedTags.length === 1) {
        setSelectedTag(ownedTags[0]._id);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setLoadingTags(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast.error("Please login to subscribe");
      router.push("/login?redirect=/subscription");
      return;
    }

    if (userTags.length === 0) {
      toast.error("You don't have any tags. Please purchase a product first.");
      router.push("/shop");
      return;
    }

    if (userTags.length > 1 && !selectedTag) {
      setShowTagSelector(true);
      return;
    }

    const tagId = selectedTag || userTags[0]?._id;
    const tag = userTags.find((t) => t._id === tagId);
    const tagCode = tag?.tagCode || userTags[0]?.tagCode;

    if (!tagCode) {
      toast.error("Tag code not found");
      return;
    }

    setSubscribing(true);

    const result = await createCheckout(tagCode, selectedCategory);

    if (!result.success) {
      toast.error(result.error);
    }

    setSubscribing(false);
  };

  if (isAlreadySubscribed()) {
    return (
      <section className="flex items-center justify-center bg-white py-20 pb-6 px-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-xl border border-green-200 bg-green-50 p-8 shadow-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCrown size={28} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              You're a Premium Member! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              Enjoy unlimited inspiration with categorized quotes.
            </p>
            <button
              onClick={() => router.push("/dashboard/user/subscription")}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 py-3 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition"
            >
              Manage Subscription
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex items-center justify-center bg-white py-20 pb-6 px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-md text-gray-700 mb-6">
          <FaCrown className="text-yellow-600" size={18} />
          <span>Premium Membership</span>
        </div>

        <h2 className="text-3xl font-semibold text-gray-900 mb-2">
          Unlock Premium Quotes
        </h2>

        <p className="text-gray-500 mb-4">
          Get access to categorized quotes for only $2.99/month
        </p>

        <p className="text-sm text-purple-600 mb-8">
          Selected category: <span className="font-semibold">{selectedCategory}</span>
        </p>

        {showTagSelector && userTags.length > 1 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select tag to upgrade:
            </label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select a tag...</option>
              {userTags.map((tag) => (
                <option key={tag._id} value={tag._id}>
                  {tag.tagCode}
                </option>
              ))}
            </select>
          </div>
        )}

        {loadingTags && (
          <div className="flex justify-center mb-4">
            <FaSpinner size={20} className="animate-spin text-purple-500" />
          </div>
        )}

        <div className="rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">$2.99</span>
            <span className="text-gray-500">/month</span>
            <p className="text-sm text-gray-500 mt-1">
              Cancel anytime, no commitment
            </p>
          </div>

          <ul className="space-y-3 text-left mb-8">
            {[
              "3 quotes per day (instead of 1)",
              "Choose from premium categories",
              "Faith, Love, Hope, Success, Motivation",
              "New quotes added weekly",
              "Priority customer support",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-700">
                <TiTickOutline size={25} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleSubscribe}
            disabled={subscribing || loadingTags || userTags.length === 0}
            className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 py-3 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {subscribing ? (
              <>
                <FaSpinner size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Start Premium
                <FaArrowRight size={14} />
              </>
            )}
          </button>

          <p className="mt-4 text-xs text-gray-500">
            Then $2.99/month. Cancel anytime.
          </p>
        </div>

        {!user && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <FiAlertCircle size={16} className="text-yellow-600 inline mr-2" />
            <span className="text-sm text-yellow-700">
              Please{" "}
              <button
                onClick={() => router.push("/login?redirect=/subscription")}
                className="font-medium underline"
              >
                login
              </button>{" "}
              to subscribe
            </span>
          </div>
        )}

        {user && userTags.length === 0 && !loadingTags && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              You don't have any tags yet.
              <button
                onClick={() => router.push("/shop")}
                className="font-medium underline ml-1"
              >
                Purchase a product first →
              </button>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}