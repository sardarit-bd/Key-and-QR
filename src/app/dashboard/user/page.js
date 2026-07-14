"use client";

import api from "@/lib/api";
import Loader from "@/shared/Loader";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Circle,
  Gift,
  Heart,
  LayoutGrid,
  QrCode,
  Quote,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { BsStars } from "react-icons/bs";
import { WiStars } from "react-icons/wi";

// Category config with premium dark theme colors
const CATEGORY_CONFIG = {
  motivation: {
    label: "Motivation",
    icon: Sparkles,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  love: {
    label: "Love",
    icon: Heart,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    animate: true,
  },
  strength: {
    label: "Strength",
    icon: Sparkles,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  healing: {
    label: "Healing",
    icon: Heart,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  faith: {
    label: "Faith",
    icon: Quote,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  gratitude: {
    label: "Gratitude",
    icon: Sparkles,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  random: {
    label: "Random",
    icon: RefreshCw,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  general: {
    label: "General",
    icon: Quote,
    color: "text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
  },
};

export default function UserDashboard() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
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
  const [greeting, setGreeting] = useState("Good Afternoon");

  const quoteCategories = [
    { id: "random", label: "Inspire Random", icon: Sparkles },
    { id: "love", label: "Love", icon: Heart },
    { id: "strength", label: "Strength", icon: Sparkles },
    { id: "healing", label: "Healing", icon: Heart },
    { id: "faith", label: "Faith", icon: Quote },
    { id: "gratitude", label: "Gratitude", icon: Sparkles },
  ];

  // Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const fetchDailyQuote = async () => {
    try {
      const response = await api.get("/quotes/random");
      const quoteData = response.data?.data || response.data;
      setDailyQuote(quoteData);
    } catch (error) {
      setDailyQuote({
        text: "Stay positive, work hard, make it happen.",
        category: "motivation",
        author: "InspireTag",
      });
    }
  };

  const fetchWeeklyQuotes = async () => {
    try {
      const response = await api.get("/scan/history?limit=7");
      const scans = response.data?.data || response.data || [];
      const quotes = scans.map((scan) => ({
        text: scan.quote?.text || scan.text || "No quote available...",
        category: scan.category || "general",
        date: scan.createdAt || scan.date,
      }));

      // Fallback dummy data to match the design if API returns empty
      if (quotes.length === 0) {
        setWeeklyQuotes([
          {
            text: "Faith test quote Ochoa...",
            category: "faith",
            date: "2026-06-01",
          },
          { text: "Holden...", category: "motivation", date: "2026-05-27" },
          {
            text: "No quote available...",
            category: "motivation",
            date: "2026-05-19",
          },
          {
            text: "You know you're in love when...",
            category: "love",
            date: "2026-05-02",
          },
          {
            text: "If you want to know what a man's like...",
            category: "motivation",
            date: "2026-05-02",
          },
        ]);
      } else {
        setWeeklyQuotes(quotes);
      }
    } catch (error) {
      setWeeklyQuotes([]);
    }
  };

  const fetchStats = async () => {
    try {
      const [ordersRes, favoritesRes, scansRes] = await Promise.all([
        api.get("/orders").catch(() => ({ data: { data: [] } })),
        api.get("/favorites").catch(() => ({ data: { data: [] } })),
        api.get("/scan/history").catch(() => ({ data: { data: [] } })),
      ]);

      const orders = ordersRes.data?.data || ordersRes.data || [];
      const favorites = favoritesRes.data?.data || favoritesRes.data || [];
      const scans = scansRes.data?.data || scansRes.data || [];

      setStats({
        totalOrders: Array.isArray(orders) ? orders.length : 24, // Fallback to match design
        totalFavorites: Array.isArray(favorites) ? favorites.length : 8,
        totalScans: Array.isArray(scans) ? scans.length : 15,
        subscriptionType: user?.subscriptionType || "free",
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleCategorySelect = async (categoryId) => {
    setSelectedCategory(categoryId);
    try {
      const response = await api.post("/scan/unlock/demo", {
        category: categoryId,
      });
      const result = response.data?.data || response.data;
      toast.success(
        `New quote from ${CATEGORY_CONFIG[categoryId]?.label || categoryId} category!`,
        {
          style: { background: "#1e1e2d", color: "#fff" },
        },
      );

      if (result?.quote) {
        setDailyQuote(result.quote);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to get quote", {
        style: { background: "#1e1e2d", color: "#fff" },
      });
    }
  };

  useEffect(() => {
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

    if (!isInitialized) return;

    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user, isInitialized]);

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

  if (loading) {
    return <Loader text="Qkey..." size={50} fullScreen />;
  }

  // Animation variants
  const heartbeatPulse = {
    scale: [1, 1.15, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <main className="flex-1 w-full bg-[#020817] min-h-screen text-slate-200 font-sans p-4 lg:p-6 overflow-hidden">
      {/* SECTION 1 & 2: Header & Daily Quote */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Welcome Text */}
        <div className="flex flex-col justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl lg:text-4xl font-serif text-white flex items-center gap-2 mb-2"
          >
            {greeting}, {user?.name?.split(" ")[0] || "Dd"}!{" "}
            <span className="text-yellow-400">✨</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-sm lg:text-base"
          >
            Welcome back to your inspiration journey.
          </motion.p>
        </div>

        {/* Daily Quote Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0f172a] to-[#1e1b4b] border border-white/5 p-6 lg:p-8 min-h-[220px] shadow-2xl flex flex-col justify-center"
        >
          {/* Decorative Background */}
          <div className="absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-yellow-900/40 via-[#0f172a]/0 to-transparent z-0"></div>
          <div className="absolute right-[-10%] top-[-20%] w-64 h-64 bg-orange-500/20 rounded-full blur-[80px] z-0"></div>

          <div className="relative z-10 max-w-[80%]">
            <Quote className="text-white/20 w-10 h-10 mb-4" />
            <p className="font-serif text-lg lg:text-xl italic text-slate-100 mb-3 leading-relaxed">
              "{dailyQuote?.text || "Stay positive, work hard, make it happen."}
              "
            </p>
            <p className="text-slate-400 text-sm mb-6">
              — {dailyQuote?.author || "InspireTag"}
            </p>

            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e293b]/80 backdrop-blur-md text-yellow-500 text-xs font-medium border border-yellow-500/20 hover:bg-[#1e293b] transition-colors cursor-pointer">
              <Sparkles size={14} className="text-yellow-500" />
              Your Daily Quote
            </button>
          </div>
        </motion.div>
      </div>

      {/* SECTION 3: Category Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-[32px] border border-[#3b2a1d] bg-[#070d18] px-8 py-8 shadow-[0_0_40px_rgba(255,140,0,0.08)] mb-8"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(255,140,0,0.06),transparent_40%),radial-gradient(circle_at_right,rgba(255,200,120,0.03),transparent_40%)]" />

        <div className="relative flex flex-col xl:flex-row xl:items-center gap-8">
          {/* Left text */}
          <div className="min-w-[400px]">
            <h3 className="text-3xl font-serif text-white mb-4">
              Ready for more inspiration?
            </h3>

            <p className="text-slate-400 text-[14px] leading-relaxed">
              Choose a category and discover a new quote
              <br />
              that speaks to your heart.
            </p>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide flex-1 px-10 py-8">
            {quoteCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              const config = CATEGORY_CONFIG[cat.id] || CATEGORY_CONFIG.general;

              return (
                <motion.button
                  key={cat.id}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`w-[110px] h-[90px] rounded-[28px] border flex flex-col justify-center items-center transition-all duration-300 flex-shrink-0
              ${
                isActive
                  ? "bg-[#2b1d4a] border-purple-400 shadow-[0_0_30px_rgba(168,85,247,.7)]"
                  : "bg-[#111827]/80 border-[#2a2f39] hover:border-[#3b4350]"
              }`}
                >
                  <div className={`mb-3 ${config.color}`}>
                    <Icon size={20} />
                  </div>

                  <span className="text-white text-[14px] font-medium text-center leading-tight">
                    {cat.id === "random" ? (
                      <>
                        Inspire
                        <br />
                        <span className="text-slate-300 text-[10px]">
                          Random
                        </span>
                      </>
                    ) : (
                      cat.label
                    )}
                  </span>
                </motion.button>
              );
            })}

            {/* Divider */}
            <div className="h-24 w-px bg-white/10 mx-3 flex-shrink-0" />

            {/* View all */}
            <motion.button
              whileHover={{ y: -4 }}
              className="flex items-center justify-center gap-4 flex-shrink-0"
            >
              <div className="w-12 h-12 rounded-full border border-white/10 bg-[#111827] flex items-center justify-center">
                <LayoutGrid className="text-white" size={18} />
              </div>

              <span className="text-white text-sm leading-tight text-center">
                View All
                <br />
                Categories
              </span>
            </motion.button>
          </div>
        </div>

        {/* Sparkles */}
        <div className="absolute left-[450px] top-8 text-yellow-300 text-xl">
          {/* ✦ */}
          <BsStars />
        </div>
        <div className="absolute left-[460px] bottom-10 text-yellow-300 text-sm">
          <WiStars size={30} />
        </div>
        <div className="absolute right-[328px] top-6 text-yellow-300 text-xl">
          ✦
        </div>
      </motion.div>

      {/* SECTION 4 & 5: Recent Quotes & Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Quotes List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-[#0b1120] border border-white/5 rounded-[24px] p-6 shadow-lg"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg text-white font-serif tracking-wide">
              Your Recent Quotes
            </h2>
            <button className="text-xs font-medium px-4 py-2 rounded-full border border-white/10 text-slate-300 hover:bg-white/5 transition-colors cursor-pointer">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {weeklyQuotes.map((quote, idx) => {
              const categoryConfig =
                CATEGORY_CONFIG[quote.category?.toLowerCase()] ||
                CATEGORY_CONFIG.general;
              const Icon = categoryConfig.icon;

              return (
                <motion.div
                  key={idx}
                  whileHover={{
                    x: 4,
                    backgroundColor: "rgba(255,255,255,0.03)",
                  }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#111827] border border-white/5 transition-all group"
                >
                  <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    <div
                      className={`w-6 h-6 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryConfig.bg} ${categoryConfig.color}`}
                    >
                      <Icon size={18} />
                    </div>
                    <p className="text-sm text-slate-300 truncate font-medium">
                      {quote.text}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                    <span
                      className={`hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${categoryConfig.bg} ${categoryConfig.color} ${categoryConfig.border} border`}
                    >
                      <Icon size={10} />
                      <span className="capitalize">{quote.category}</span>
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Calendar size={12} />
                      {formatDate(quote.date)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Inspiration Streak */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#0b1120] border border-white/5 rounded-[24px] p-6 shadow-lg flex flex-col items-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[50px] z-0"></div>

          <h2 className="text-lg text-white font-serif tracking-wide w-full text-center mb-8 relative z-10">
            Inspiration Streak
          </h2>

          <div className="relative w-[250px] h-[250px] mb-6 z-10 flex items-center justify-center">
            <svg
              className="absolute rounded-full inset-0 w-full h-full -rotate-90"
              viewBox="0 0 100 100"
            >
              <defs>
                <linearGradient
                  id="goldGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="50%"
                >
                  <stop offset="0%" stopColor="#FFD58A" />
                  <stop offset="40%" stopColor="#FFB74D" />
                  <stop offset="100%" stopColor="#C97A1A" />
                </linearGradient>

                <filter
                  id="goldGlow"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="2.8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Outer glow */}
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="#FFB347"
                strokeWidth="1"
                opacity="0.18"
                filter="url(#goldGlow)"
              />

              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="rgba(255,255,255,.08)"
                strokeWidth="1.5"
              />

              {/* Progress ring */}
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="url(#goldGradient)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeDasharray="289"
                strokeDashoffset="72"
                filter="url(#goldGlow)"
              />
            </svg>

            <div className="flex flex-col items-center">
              <span className="font-serif text-[88px] leading-none text-[#F5C97A]">
                7
              </span>

              <span className="mt-2 font-serif text-[22px] text-[#E9C27B]">
                Days
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-6 relative z-10">
            Keep your streak going!
          </p>

          <div className="flex gap-2.5 sm:gap-4 relative z-10">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-slate-400 font-medium">
                  {day}
                </span>
                {i < 6 ? (
                  <CheckCircle2 size={16} className="text-yellow-500" />
                ) : (
                  <Circle size={16} className="text-slate-600" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* SECTION 6: Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
      >
        <div className="bg-[#0b1120] border border-white/5 rounded-[24px] p-5 shadow-lg flex items-center gap-5 hover:bg-[#111827] transition-all cursor-default">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <Quote size={24} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Total Quotes</p>
            <h4 className="text-2xl font-bold text-white leading-none mb-1">
              {stats.totalOrders}
            </h4>
            <p className="text-[10px] text-slate-500">Quotes received</p>
          </div>
        </div>

        <div className="bg-[#0b1120] border border-white/5 rounded-[24px] p-5 shadow-lg flex items-center gap-5 hover:bg-[#111827] transition-all cursor-default">
          <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(236,72,153,0.15)]">
            <motion.div animate={heartbeatPulse}>
              <Heart size={24} className="text-pink-400" fill="currentColor" />
            </motion.div>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Favorites</p>
            <h4 className="text-2xl font-bold text-white leading-none mb-1">
              {stats.totalFavorites}
            </h4>
            <p className="text-[10px] text-slate-500">Your favorite quotes</p>
          </div>
        </div>

        <div className="bg-[#0b1120] border border-white/5 rounded-[24px] p-5 shadow-lg flex items-center gap-5 hover:bg-[#111827] transition-all cursor-default">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <QrCode size={24} className="text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Total Scans</p>
            <h4 className="text-2xl font-bold text-white leading-none mb-1">
              {stats.totalScans}
            </h4>
            <p className="text-[10px] text-slate-500">QR & NFC scans</p>
          </div>
        </div>

        <div className="bg-[#0b1120] border border-white/5 rounded-[24px] p-5 shadow-lg flex items-center gap-5 hover:bg-[#111827] transition-all cursor-default">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Gift size={24} className="text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Gifted Messages</p>
            <h4 className="text-2xl font-bold text-white leading-none mb-1">
              3
            </h4>
            <p className="text-[10px] text-slate-500">Messages received</p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
