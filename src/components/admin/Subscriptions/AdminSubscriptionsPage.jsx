"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  Crown,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Ban,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "trialing", label: "Trialing" },
  { value: "past_due", label: "Past Due" },
  { value: "canceled", label: "Canceled" },
  { value: "unpaid", label: "Unpaid" },
  { value: "incomplete", label: "Incomplete" },
];



const STATUS_STYLES = {
  active:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 dark:text-emerald-300",
  trialing:
    "border-blue-500/30 bg-blue-500/10 text-blue-400 dark:text-blue-300",
  past_due:
    "border-amber-500/30 bg-amber-500/10 text-amber-400 dark:text-amber-300",
  canceled:
    "border-red-500/25 bg-red-500/10 text-red-400 dark:text-red-300",
  unpaid:
    "border-orange-500/25 bg-orange-500/10 text-orange-400 dark:text-orange-300",
  incomplete:
    "border-zinc-500/20 bg-zinc-500/10 text-zinc-400 dark:text-zinc-300",
  checkout_pending:
    "border-zinc-500/20 bg-zinc-500/10 text-zinc-400 dark:text-zinc-300",
  inactive:
    "border-zinc-500/20 bg-zinc-500/10 text-zinc-400 dark:text-zinc-300",
};

function StatCard({ label, value, icon: Icon, suffix }) {
  return (
    <div className="rounded-2xl border border-white/6 bg-card p-5 shadow-sm light:border-[#E8DFCE]/80 light:bg-[#FBF7EF]/55">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-foreground-tertiary">
          {label}
        </span>
        <Icon size={15} className="text-foreground-tertiary/50" />
      </div>
      <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
        {suffix ? ` ${suffix}` : ""}
      </p>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-4 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex-1 h-4 rounded bg-foreground/10" />
      ))}
    </div>
  );
}

export default function AdminSubscriptionsPage() {
  const { user, isInitialized } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const [stats, setStats] = useState(null);
  const [price, setPrice] = useState(null);

  const fetchPrice = useCallback(async () => {
    try {
      const res = await api.get("/subscriptions/plans");
      const plans = res.data?.data || [];
      const subscriber = plans.find((p) => p.name === "subscriber");
      if (subscriber?.price != null) {
        setPrice({
          amount: subscriber.price,
          currency: subscriber.currency || "usd",
          interval: subscriber.interval || "month",
        });
      }
    } catch {
      /* non-blocking */
    }
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("limit", ITEMS_PER_PAGE);
      if (searchTerm) params.append("search", searchTerm);
      if (filterStatus !== "all") params.append("status", filterStatus);

      const response = await api.get(
        `/subscriptions/admin/subscriptions?${params.toString()}`
      );

      setSubscriptions(response.data?.data || []);
      setTotalPages(response.data?.meta?.totalPage || 1);
      setTotalSubscriptions(response.data?.meta?.total || 0);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterStatus]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get(
        "/subscriptions/admin/subscriptions/stats"
      );
      setStats(response.data?.data || null);
    } catch {
      /* non-blocking */
    }
  }, []);

  const handleSyncWithStripe = async () => {
    setLoading(true);
    try {
      await api.post("/subscriptions/admin/subscriptions/sync");
      toast.success("Sync completed");
      fetchSubscriptions();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to sync");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;
    if (!user || user.role !== "admin") return;
    fetchSubscriptions();
    fetchStats();
    fetchPrice();
  }, [
    user,
    currentPage,
    filterStatus,
    isInitialized,
    fetchSubscriptions,
    fetchStats,
    fetchPrice,
  ]);

  useEffect(() => {
    if (!isInitialized || !user || user.role !== "admin") return;
    const timer = setTimeout(() => {
      if (currentPage === 1) fetchSubscriptions();
      else setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, isInitialized, user, currentPage, fetchSubscriptions]);

  const priceDisplay = price
    ? `$${Number(price.amount).toFixed(2)}/${price.interval}`
    : "$4.99/month";

  if (loading && subscriptions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="h-10 w-64 rounded bg-foreground/10 animate-pulse" />
          <div className="h-4 w-96 rounded bg-foreground/10 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-card animate-pulse border border-white/6"
              />
            ))}
          </div>
          {[...Array(5)].map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 shadow-[0_0_16px_-4px_rgba(253,182,92,0.2)]">
                <Crown size={18} className="text-accent" />
              </span>
              <h1 className="text-[22px] sm:text-[26px] font-semibold tracking-tight text-foreground">
                Subscriptions
              </h1>
            </div>
            <p className="mt-1 text-sm text-foreground-tertiary">
              {priceDisplay} &middot; {stats?.total ?? 0} total subscriptions
            </p>
          </div>
          <button
            onClick={handleSyncWithStripe}
            disabled={loading}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-card px-4 py-2 text-[13px] font-medium text-foreground-secondary hover:border-accent/30 hover:text-foreground transition disabled:opacity-50 disabled:cursor-not-allowed light:border-[#E8DFCE]/80 light:bg-[#FBF7EF]/55"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Sync with Stripe
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            <StatCard label="Total" value={stats.total} icon={Users} />
            <StatCard label="Active" value={stats.active || 0} icon={CheckCircle} />
            <StatCard label="Trialing" value={stats.trialing || 0} icon={Clock} />
            <StatCard label="Past Due" value={stats.pastDue || 0} icon={AlertCircle} />
            <StatCard label="Canceled" value={stats.canceled || 0} icon={Ban} />
            <StatCard
              label="MRR"
              value={`$${(stats.monthlyRecurringRevenue || 0).toFixed(2)}`}
              icon={TrendingUp}
            />
            <StatCard
              label="Revenue"
              value={`$${(stats.totalRevenue || 0).toFixed(2)}`}
              icon={TrendingUp}
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary/50" />
            <input
              type="text"
              placeholder="Search by tag, email, name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-foreground-tertiary/40 focus:outline-none focus:ring-1 focus:ring-accent/40 transition"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(opt.value)}
                className={`inline-flex cursor-pointer items-center rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
                  filterStatus === opt.value
                    ? "border-accent/30 bg-accent/10 text-accent"
                    : "border-border bg-transparent text-foreground-tertiary hover:border-foreground-tertiary/30"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/6 bg-card overflow-hidden light:border-[#E8DFCE]/80 light:bg-[#FBF7EF]/55">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/6 light:border-[#E8DFCE]/80">
                  <th className="text-left p-4 text-[11px] font-semibold uppercase tracking-wider text-foreground-tertiary">Tag</th>
                  <th className="text-left p-4 text-[11px] font-semibold uppercase tracking-wider text-foreground-tertiary">User</th>
                  <th className="text-left p-4 text-[11px] font-semibold uppercase tracking-wider text-foreground-tertiary">Type</th>
                  <th className="text-left p-4 text-[11px] font-semibold uppercase tracking-wider text-foreground-tertiary">Status</th>
                  <th className="text-left p-4 text-[11px] font-semibold uppercase tracking-wider text-foreground-tertiary">Period</th>
                  <th className="text-left p-4 text-[11px] font-semibold uppercase tracking-wider text-foreground-tertiary">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6 light:divide-[#E8DFCE]/80">
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <Crown size={40} className="mx-auto mb-3 text-foreground-tertiary/30" />
                      <p className="text-sm text-foreground-tertiary">No subscriptions found</p>
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => {
                    const badgeStyle = STATUS_STYLES[sub.status] || STATUS_STYLES.inactive;
                    return (
                      <tr key={sub._id} className="hover:bg-foreground/[0.02] transition-colors">
                        <td className="p-4">
                          <span className="text-sm font-medium text-foreground">{sub.tag?.tagCode || "N/A"}</span>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-medium text-foreground">{sub.user?.name || "Guest"}</p>
                          <p className="text-xs text-foreground-tertiary">{sub.user?.email || "—"}</p>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                            sub.subscriptionType === 'subscriber'
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                              : 'border-zinc-500/20 bg-zinc-500/10 text-zinc-400'
                          }`}>
                            {sub.subscriptionType || 'free'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${badgeStyle}`}>
                            {sub.status.replace(/_/g, " ")}
                          </span>
                          {sub.cancelAtPeriodEnd && (
                            <span className="block text-[10px] text-amber-400 mt-1">Cancels at period end</span>
                          )}
                        </td>
                        <td className="p-4 text-xs text-foreground-tertiary space-y-0.5">
                          {sub.currentPeriodStart ? (
                            <>
                              <div>Start: {new Date(sub.currentPeriodStart).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                              <div>End: {new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                            </>
                          ) : (
                            <span>—</span>
                          )}
                        </td>
                        <td className="p-4 text-xs text-foreground-tertiary">
                          {new Date(sub.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/6 light:border-[#E8DFCE]/80">
              <span className="text-xs text-foreground-tertiary">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, totalSubscriptions)} of {totalSubscriptions}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-2 text-xs text-foreground-tertiary tabular-nums">{currentPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
