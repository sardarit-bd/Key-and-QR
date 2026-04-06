"use client";

import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Heart,
  Package,
  QrCode,
  Quote,
  RefreshCw,
  Settings,
  ShoppingBag,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

// Category icons and config
const CATEGORY_CONFIG = {
  motivation: { label: "Motivation", icon: Sparkles, color: "bg-orange-100 text-orange-700" },
  love: { label: "Love", icon: Heart, color: "bg-pink-100 text-pink-700" },
  gratitude: { label: "Gratitude", icon: TrendingUp, color: "bg-green-100 text-green-700" },
  faith: { label: "Faith", icon: Quote, color: "bg-purple-100 text-purple-700" },
  healing: { label: "Healing", icon: Heart, color: "bg-blue-100 text-blue-700" },
  random: { label: "Random", icon: RefreshCw, color: "bg-gray-100 text-gray-700" },
};

export default function UserDashboard() {
  const router = useRouter();
  const { user } = useAuthStore(); // 👈 Removed accessToken
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("random");
  const [dailyQuote, setDailyQuote] = useState(null);
  const [weeklyQuotes, setWeeklyQuotes] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalFavorites: 0,
    totalScans: 0,
    subscriptionType: "free",
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [greeting, setGreeting] = useState("Good Afternoon");
  const [currentDate, setCurrentDate] = useState("");

  const quoteCategories = [
    { id: "motivation", label: "Motivation", icon: Sparkles },
    { id: "love", label: "Love", icon: Heart },
    { id: "gratitude", label: "Gratitude", icon: TrendingUp },
    { id: "faith", label: "Faith", icon: Quote },
    { id: "healing", label: "Healing", icon: Heart },
    { id: "random", label: "Random", icon: RefreshCw },
  ];

  // Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    setCurrentDate(new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }));
  }, []);

  // Fetch daily quote
  const fetchDailyQuote = async () => {
    try {
      const response = await api.get("/quotes/random");
      console.log("Daily quote response:", response.data);
      // Handle different response structures
      const quoteData = response.data?.data || response.data;
      setDailyQuote(quoteData);
    } catch (error) {
      console.error("Error fetching daily quote:", error);
      setDailyQuote({
        text: "Happiness can be found even in the darkest of times, if one only remembers to turn on the light.",
        category: "motivation",
        author: "J.K. Rowling",
      });
    }
  };

  // Fetch weekly quotes (last 7 days scans)
  const fetchWeeklyQuotes = async () => {
    try {
      const response = await api.get("/scan/history?limit=7");
      console.log("Weekly quotes response:", response.data);

      // Handle different response structures
      const scans = response.data?.data || response.data || [];
      const quotes = scans.map(scan => ({
        text: scan.quote?.text || scan.text || "No quote available",
        category: scan.category || "general",
        date: scan.createdAt || scan.date,
      }));
      setWeeklyQuotes(quotes);
    } catch (error) {
      console.error("Error fetching weekly quotes:", error);
      setWeeklyQuotes([]);
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const [ordersRes, favoritesRes, scansRes] = await Promise.all([
        api.get("/orders").catch(() => ({ data: { data: [] } })),
        api.get("/favorites").catch(() => ({ data: { data: [] } })),
        api.get("/scan/history").catch(() => ({ data: { data: [] } })),
      ]);

      console.log("Orders response:", ordersRes.data);
      console.log("Favorites response:", favoritesRes.data);
      console.log("Scans response:", scansRes.data);

      // Handle different response structures
      const orders = ordersRes.data?.data || ordersRes.data || [];
      const favorites = favoritesRes.data?.data || favoritesRes.data || [];
      const scans = scansRes.data?.data || scansRes.data || [];

      setStats({
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        totalFavorites: Array.isArray(favorites) ? favorites.length : 0,
        totalScans: Array.isArray(scans) ? scans.length : 0,
        subscriptionType: user?.subscriptionType || "free",
      });

      setRecentOrders(Array.isArray(orders) ? orders.slice(0, 3) : []);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Handle category selection and get quote
  const handleCategorySelect = async (categoryId) => {
    setSelectedCategory(categoryId);
    try {
      const response = await api.post("/scan/unlock/demo", { category: categoryId });
      const result = response.data?.data || response.data;
      toast.success(`New quote from ${CATEGORY_CONFIG[categoryId]?.label || categoryId} category!`);

      // Optionally update daily quote with the new one
      if (result?.quote) {
        setDailyQuote(result.quote);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to get quote");
    }
  };

  // Initial data load - UPDATED: now checks for user instead of accessToken
  useEffect(() => {
    console.log("User from store:", user); // Debug log

    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchDailyQuote(),
          fetchWeeklyQuotes(),
          fetchStats(),
        ]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      console.log("User found, loading dashboard data...");
      loadData();
    } else {
      console.log("No user found");
      setLoading(false);
    }
  }, [user]); // 👈 Now depends on user instead of accessToken

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getCategoryDisplay = (category) => {
    const config = CATEGORY_CONFIG[category?.toLowerCase()];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${config.color}`}>
        <Icon size={10} />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 w-full p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw size={40} className="animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 w-full">
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-2">
            <div>
              <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
                {greeting}, <span className="text-gray-900">{user?.name?.split(" ")[0] || "User"}!</span>
              </h1>
              <p className="text-sm text-gray-500">Welcome back to your dashboard</p>
            </div>
            <div className="text-left lg:text-right text-sm text-gray-500">
              <div className="flex items-center gap-1 lg:justify-end">
                <Calendar size={14} />
                {currentDate}
              </div>
            </div>
          </div>
        </div>

        {/* Daily Quote */}
        <div className="bg-white rounded-lg p-4 lg:p-6 mb-4 lg:mb-6 border border-gray-200 hover:shadow-md transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 text-sm lg:text-base flex items-center gap-2">
              <Sparkles size={16} className="text-orange-500" />
              Your Daily Quote
            </h2>
            {dailyQuote?.category && getCategoryDisplay(dailyQuote.category)}
          </div>
          <p className="text-sm lg:text-base text-gray-700 italic mb-2">
            "{dailyQuote?.text || "Loading..."}"
          </p>
          <p className="text-xs lg:text-sm text-gray-500">
            — {dailyQuote?.author || "InspireTag"}
          </p>
        </div>

        {/* Category Selector */}
        <div className="bg-white rounded-lg p-4 lg:p-6 mb-4 lg:mb-6 border border-gray-200">
          <h2 className="text-center text-gray-800 text-lg font-semibold pb-6 flex items-center justify-center gap-2">
            <Sparkles size={20} />
            Choose Your Quote Category
          </h2>
          <div className="flex items-center gap-3 justify-center flex-wrap mb-3">
            {quoteCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`cursor-pointer text-sm px-3 lg:px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-200 ${selectedCategory === cat.id
                      ? "bg-gray-800 text-white shadow-md scale-105"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105"
                    }`}
                >
                  <Icon size={14} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Weekly Quotes Section */}
        <div className="bg-white rounded-lg p-4 lg:p-6 mb-4 lg:mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-sm lg:text-base flex items-center gap-2">
              <Clock size={16} className="text-blue-500" />
              Your Weekly Quotes
            </h2>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 flex items-center gap-1">
              Last 7 days
            </span>
          </div>

          {weeklyQuotes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Quote size={40} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No quotes yet this week</p>
              <p className="text-xs">Scan your InspireTag to unlock quotes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {weeklyQuotes.map((quote, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-sm transition-all duration-200">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-700 italic flex-1">
                      "{quote.text?.substring(0, 100)}..."
                    </p>
                    <div className="flex flex-col items-end gap-1">
                      {getCategoryDisplay(quote.category)}
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDate(quote.date)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => router.push("/account/orders")}
            className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Total Orders</span>
              <Package size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
            <p className="text-xs text-gray-400 mt-1">Click to view all</p>
          </button>

          <button
            onClick={() => router.push("/favorites")}
            className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Favorites</span>
              <Heart size={20} className="text-gray-400 group-hover:text-pink-500 transition-colors duration-300" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalFavorites}</div>
            <p className="text-xs text-gray-400 mt-1">Your favorite products</p>
          </button>

          <button
            onClick={() => router.push("/scan/history")}
            className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Total Scans</span>
              <QrCode size={20} className="text-gray-400 group-hover:text-purple-500 transition-colors duration-300" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalScans}</div>
            <p className="text-xs text-gray-400 mt-1">QR & NFC scans</p>
          </button>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingBag size={18} />
              Recent Orders
            </h2>
            {/* <button
              onClick={() => router.push("/account/orders")}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors duration-200 cursor-pointer"
            >
              View All
              <Eye size={14} />
            </button> */}
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Package size={40} className="mx-auto mb-3 text-gray-300" />
              <p>No orders yet</p>
              <button
                onClick={() => router.push("/shop")}
                className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 cursor-pointer"
              >
                Start Shopping
                <ShoppingBag size={14} />
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Order ID</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Product</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Total</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="p-4">
                          <span className="font-mono text-sm text-gray-900">
                            #{order._id?.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {order.product?.name || "Product"}
                        </td>
                        <td className="p-4 text-sm font-medium text-gray-900">
                          ${order.product?.price?.toFixed(2) || "0.00"}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full capitalize ${order.fulfillmentStatus === "delivered"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                            }`}>
                            {order.fulfillmentStatus || "pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <div key={order._id} className="p-4">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-semibold text-gray-900 text-sm">
                            #{order._id?.slice(-8).toUpperCase()}
                          </span>
                          {expandedOrder === order._id ? (
                            <ChevronUp size={18} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={18} className="text-gray-400" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.product?.name}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                          ${order.product?.price?.toFixed(2) || "0.00"}
                        </div>
                      </div>
                    </div>

                    {expandedOrder === order._id && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Date:</span>
                          <span className="text-gray-900">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Status:</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${order.fulfillmentStatus === "delivered"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                            }`}>
                            {order.fulfillmentStatus || "pending"}
                          </span>
                        </div>
                        {/* <button
                          onClick={() => router.push(`/account/orders/${order._id}`)}
                          className="w-full mt-2 py-2 text-center text-sm text-blue-600 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                        >
                          View Details
                        </button> */}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push("/shop")}
            className="bg-white rounded-lg p-4 lg:p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors duration-300">
                <ShoppingBag size={24} className="text-gray-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-1">Shop Keychains</h3>
                <p className="text-sm text-gray-500">Browse our collection</p>
              </div>
            </div>
          </button>

          {/* <button
            onClick={() => router.push("/account/settings")}
            className="bg-white rounded-lg p-4 lg:p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors duration-300">
                <Settings size={24} className="text-gray-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-1">Account Settings</h3>
                <p className="text-sm text-gray-500">Manage your profile</p>
              </div>
            </div>
          </button> */}
        </div>
      </div>
    </main>
  );
}