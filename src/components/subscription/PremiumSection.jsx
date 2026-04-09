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
  FaFire,
  FaHeart,
  FaPrayingHands,
  FaTrophy,
  FaStar,
} from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Crown, Sparkles, Check } from "lucide-react";
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

  // Category display config with React Icons and Colors
  const categoryConfig = {
    motivation: { 
      label: "Motivation", 
      icon: FaFire, 
      bgColor: "bg-orange-100", 
      iconColor: "text-orange-600",
      borderColor: "border-orange-200"
    },
    love: { 
      label: "Love", 
      icon: FaHeart, 
      bgColor: "bg-pink-100", 
      iconColor: "text-pink-600",
      borderColor: "border-pink-200"
    },
    faith: { 
      label: "Faith", 
      icon: FaPrayingHands, 
      bgColor: "bg-purple-100", 
      iconColor: "text-purple-600",
      borderColor: "border-purple-200"
    },
    success: { 
      label: "Success", 
      icon: FaTrophy, 
      bgColor: "bg-yellow-100", 
      iconColor: "text-yellow-600",
      borderColor: "border-yellow-200"
    },
    hope: { 
      label: "Hope", 
      icon: FaStar, 
      bgColor: "bg-green-100", 
      iconColor: "text-green-600",
      borderColor: "border-green-200"
    },
  };

  const currentCategory = categoryConfig[selectedCategory] || categoryConfig.motivation;
  const CategoryIcon = currentCategory.icon;

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
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown size={28} className="text-gray-800" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              You're a Premium Member! 🎉
            </h2>
            <p className="text-gray-500 mb-6">
              Enjoy unlimited inspiration with categorized quotes.
            </p>
            <button
              onClick={() => router.push("/dashboard/user/subscription")}
              className="w-full rounded-lg bg-gray-900 text-white py-3 font-medium hover:bg-gray-800 transition"
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
        {/* Premium Badge - Black & White */}
        <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-md text-gray-700 mb-6">
          <Crown size={16} className="text-gray-700" />
          <span>Premium Membership</span>
        </div>

        <h2 className="text-3xl font-semibold text-gray-900 mb-2">
          Unlock Premium Quotes
        </h2>

        <p className="text-gray-500 mb-6">
          Get access to categorized quotes for only $2.99/month
        </p>

        {/* Glassmorphism Selected Category Display - With Colors */}
        <div className="mb-8 flex justify-center">
          <div className="relative group">
            <div className={`absolute -inset-0.5 ${currentCategory.bgColor.replace('bg-', 'bg-').replace('100', '200')} rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300`}></div>
            <div className={`relative inline-flex items-center gap-3 px-5 py-3 bg-white/30 backdrop-blur-sm rounded-2xl border ${currentCategory.borderColor} shadow-lg`}>
              <div className={`w-10 h-10 ${currentCategory.bgColor} rounded-full flex items-center justify-center`}>
                <CategoryIcon size={20} className={currentCategory.iconColor} />
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Selected Category</p>
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-gray-600" />
                  <span className="font-semibold text-gray-800 text-lg">
                    {currentCategory.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tag Selector - Custom Style */}
        {showTagSelector && userTags.length > 1 && (
          <div className="mb-6 p-5 bg-gray-50 rounded-2xl border border-gray-200 text-left">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select tag to upgrade:
            </label>
            <div className="space-y-2">
              {userTags.map((tag) => (
                <label
                  key={tag._id}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl border cursor-pointer
                    transition-all duration-200
                    ${selectedTag === tag._id 
                      ? "border-gray-800 bg-gray-100" 
                      : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="tagSelect"
                    value={tag._id}
                    checked={selectedTag === tag._id}
                    onChange={() => setSelectedTag(tag._id)}
                    className="w-4 h-4 text-gray-800 focus:ring-gray-800"
                  />
                  <div className="flex-1">
                    <p className="font-mono font-medium text-gray-900">{tag.tagCode}</p>
                    {tag.activatedAt && (
                      <p className="text-xs text-gray-400">
                        Activated: {new Date(tag.activatedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {selectedTag === tag._id && (
                    <Check size={16} className="text-gray-800" />
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        {loadingTags && (
          <div className="flex justify-center mb-4">
            <FaSpinner size={20} className="animate-spin text-gray-600" />
          </div>
        )}

        {/* Pricing Card - Black & White with Glassmorphism */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div className="relative rounded-2xl border border-gray-200 p-8 shadow-lg bg-white/90 backdrop-blur-sm">
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$2.99</span>
              <span className="text-gray-500">/month</span>
              <p className="text-sm text-gray-400 mt-1">
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
                <li key={i} className="flex items-start gap-3 text-gray-600">
                  <TiTickOutline size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleSubscribe}
              disabled={subscribing || loadingTags || userTags.length === 0}
              className="w-full rounded-xl bg-gray-900 text-white py-3 font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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

            <p className="mt-4 text-xs text-gray-400">
              Then $2.99/month. Cancel anytime.
            </p>
          </div>
        </div>

        {/* Messages - Glassmorphism */}
        {!user && (
          <div className="mt-4 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
            <FiAlertCircle size={16} className="text-gray-600 inline mr-2" />
            <span className="text-sm text-gray-600">
              Please{" "}
              <button
                onClick={() => router.push("/login?redirect=/subscription")}
                className="font-medium underline text-gray-800"
              >
                login
              </button>{" "}
              to subscribe
            </span>
          </div>
        )}

        {user && userTags.length === 0 && !loadingTags && (
          <div className="mt-4 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600">
              You don't have any tags yet.
              <button
                onClick={() => router.push("/shop")}
                className="font-medium underline text-gray-800 ml-1"
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