"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  QrCode,
  Calendar,
  Sparkles,
  TrendingUp,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Tag,
  Clock,
  Heart,
  Target,
  Star,
  Flame,
  Crown
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Loader from "@/shared/Loader";

export default function UserScanHistoryPage() {
  const { user, isInitialized } = useAuthStore();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalScans: 0,
    todayScans: 0,
    uniqueTags: 0,
    categoryDistribution: {}
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalScans, setTotalScans] = useState(0);
  const itemsPerPage = 10;

  // Category icons mapping
  const categoryIcons = {
    motivation: <Flame size={14} className="text-orange-500" />,
    love: <Heart size={14} className="text-pink-500" />,
    faith: <Target size={14} className="text-purple-500" />,
    success: <Star size={14} className="text-yellow-500" />,
    hope: <Sparkles size={14} className="text-green-500" />,
    personal: <Crown size={14} className="text-gray-500" />
  };

  // Category colors mapping
  const categoryColors = {
    motivation: "bg-orange-100 text-orange-700",
    love: "bg-pink-100 text-pink-700",
    faith: "bg-purple-100 text-purple-700",
    success: "bg-yellow-100 text-yellow-700",
    hope: "bg-green-100 text-green-700",
    personal: "bg-gray-100 text-gray-700"
  };

  // Fetch scan history
  const fetchScanHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("limit", itemsPerPage);

      const response = await api.get(`/scan/history?${params.toString()}`);
      setScans(response.data?.data || []);
      setTotalPages(response.data?.meta?.totalPage || 1);
      setTotalScans(response.data?.meta?.total || 0);
    } catch (error) {
      console.error("Error fetching scan history:", error);
      toast.error("Failed to load scan history");
    } finally {
      setLoading(false);
    }
  };

  // Fetch scan stats
  const fetchScanStats = async () => {
    try {
      const response = await api.get("/scan/stats");
      setStats(response.data?.data || stats);
    } catch (error) {
      console.error("Error fetching scan stats:", error);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) return;

    fetchScanHistory();
    fetchScanStats();
  }, [user, currentPage, isInitialized]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getCategoryIcon = (category) => {
    return categoryIcons[category] || <Sparkles size={14} className="text-gray-500" />;
  };

  const getCategoryColor = (category) => {
    return categoryColors[category] || "bg-gray-100 text-gray-700";
  };

  if (loading && scans.length === 0) {
    return <Loader text="Qkey..." size={50} fullScreen />;
  }

  return (
    <div className="flex-1 w-full p-4 lg:p-8 bg-white">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <QrCode size={24} className="text-gray-700" />
            Scan History
          </h1>
        </div>
        <p className="text-gray-500">Track all your quote unlocks across all tags</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Total Scans</span>
            <Eye size={16} className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalScans}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Today's Scans</span>
            <Calendar size={16} className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.todayScans}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Unique Tags</span>
            <Tag size={16} className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.uniqueTags}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Avg Daily</span>
            <TrendingUp size={16} className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.totalScans > 0 ? Math.round(stats.totalScans / 30) : 0}
          </p>
        </div>
      </div>

      {/* Category Distribution */}
      {Object.keys(stats.categoryDistribution).length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-gray-600" />
            Category Distribution
          </h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.categoryDistribution).map(([category, count]) => (
              <div key={category} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                {getCategoryIcon(category)}
                <span className="text-sm capitalize text-gray-700">{category}</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scan History Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Tag</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Quote</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Category</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Date & Time</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {scans.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">
                    <QrCode size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No scan history yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Scan a QR code to unlock your first quote
                    </p>
                  </td>
                </tr>
              ) : (
                scans.map((scan) => (
                  <tr key={scan._id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <QrCode size={14} className="text-gray-400" />
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {scan.tag?.tagCode || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="max-w-md">
                        <p className="text-sm text-gray-700 italic line-clamp-2">
                          "{scan.quote?.text || "Personal Message"}"
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getCategoryColor(scan.category)}`}>
                        {getCategoryIcon(scan.category)}
                        <span className="capitalize">{scan.category === "personal" ? "Personal" : scan.category}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        {formatDate(scan.createdAt)}
                      </div>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/t/${scan.tag?.tagCode}`}
                        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition"
                      >
                        <Eye size={14} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalScans)} of {totalScans} scans
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}