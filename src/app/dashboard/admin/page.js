"use client";

import api from "@/lib/api";
import Loader from "@/shared/Loader";
import QrLoadingScreen from "@/shared/QrLoadingScreen";
import { useAuthStore } from "@/store/authStore";
import { DollarSign, Eye, Mail, Package, QrCode, Tag, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaGoogle } from "react-icons/fa";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalTags: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeTags: 0,
    pendingTags: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentTags, setRecentTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get provider icon and text
  const getProviderInfo = () => {
    if (user?.provider === "google") {
      return {
        icon: <FaGoogle size={14} className="text-blue-500" />,
        text: "Google",
        bgColor: "bg-blue-50",
        textColor: "text-blue-600"
      };
    }
    return {
      icon: <Mail size={14} className="text-gray-500" />,
      text: "Email",
      bgColor: "bg-gray-50",
      textColor: "text-gray-600"
    };
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "A";
    return user.name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // await new Promise((resolve) => setTimeout(resolve, 10000));
      // Fetch products count
      const productsRes = await api.get("/products", { params: { limit: 1 } });

      // Fetch tags
      const tagsRes = await api.get("/tags");
      const tags = tagsRes.data.data.data || [];

      // Fetch orders
      const ordersRes = await api.get("/orders/admin/all");
      const orders = ordersRes.data.data || [];

      // Calculate stats
      const totalRevenue = orders
        .filter(o => o.paymentStatus === "paid")
        .reduce((sum, o) => sum + (o.product?.price || 0), 0);

      setStats({
        totalProducts: productsRes.data.meta?.total || 0,
        totalTags: tags.length,
        totalOrders: orders.length,
        totalRevenue: totalRevenue,
        activeTags: tags.filter(t => t.isActivated).length,
        pendingTags: tags.filter(t => !t.isActivated && t.isActive).length,
      });

      setRecentOrders(orders.slice(0, 5));
      setRecentTags(tags.slice(0, 5));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    return `$${Number(price).toFixed(2)}`;
  };

  const statsCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-blue-500",
      link: "/dashboard/admin/products",
    },
    {
      title: "Total Tags",
      value: stats.totalTags,
      icon: Tag,
      color: "bg-purple-500",
      link: "/dashboard/admin/tags",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: DollarSign,
      color: "bg-green-500",
      link: "/dashboard/admin/orders",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: "bg-orange-500",
      link: "/dashboard/admin/orders",
    },
  ];

  if (loading) {
    return <Loader text="Qkey" size={50} fullScreen />;
  }

  const providerInfo = getProviderInfo();

  return (
    <div className="flex-1 w-full p-4 lg:p-8">
      {/* Header with Provider Info */}
      <div className="mb-8">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Welcome back, {user?.name?.split(" ")[0] || "Admin"}!
            </h1>
            <div className="flex items-center gap-2 mt-1">
            </div>
          </div>
        </div>
        <p className="text-gray-500 mt-3">Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {statsCards.map((card, index) => (
          <Link key={index} href={card.link} className="block">
            <div className="bg-white rounded-lg p-4 lg:p-6 border border-gray-200 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className={`${card.color} p-2 rounded-lg text-white`}>
                  <card.icon size={20} />
                </div>
                <TrendingUp size={16} className="text-gray-300 group-hover:text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-1">{card.title}</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Package size={18} />
              Recent Orders
            </h2>
            <Link
              href="/dashboard/admin/orders"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View All <Eye size={14} />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Package size={40} className="mx-auto mb-3 text-gray-300" />
                <p>No orders yet</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order._id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm font-medium text-gray-900">
                        #{order._id?.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {order.user?.name || order.user?.email || "Guest"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(order.product?.price || 0)}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${order.paymentStatus === "paid"
                        ? "bg-green-50 text-green-700"
                        : "bg-yellow-50 text-yellow-700"
                        }`}>
                        {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>{formatDate(order.createdAt)}</span>
                    <span>{order.product?.name || "Product"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Tags */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <QrCode size={18} />
              Recent Tags
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {stats.activeTags} activated / {stats.pendingTags} pending
              </span>
              <Link
                href="/dashboard/admin/tags"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Manage <Eye size={14} />
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {recentTags.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Tag size={40} className="mx-auto mb-3 text-gray-300" />
                <p>No tags created yet</p>
                <Link
                  href="/dashboard/admin/tags"
                  className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-800"
                >
                  Create your first tag →
                </Link>
              </div>
            ) : (
              recentTags.map((tag) => (
                <div key={tag._id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm font-semibold text-gray-900">
                        {tag.tagCode}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {tag.owner?.name || tag.owner?.email || "Unassigned"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${tag.isActivated
                        ? "bg-green-50 text-green-700"
                        : tag.isActive
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-red-50 text-red-700"
                        }`}>
                        {tag.isActivated
                          ? "Activated"
                          : tag.isActive
                            ? "Pending"
                            : "Disabled"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>Created: {formatDate(tag.createdAt)}</span>
                    {/* <Link
                      href={`/t/${tag.tagCode}`}
                      target="_blank"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      View →
                    </Link> */}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Admin Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            href="/dashboard/admin/products/add"
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:shadow-md transition text-sm"
          >
            <Package size={16} />
            Add Product
          </Link>
          <Link
            href="/dashboard/admin/tags/add"
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:shadow-md transition text-sm"
          >
            <QrCode size={16} />
            Generate Tags
          </Link>
          <Link
            href="/dashboard/admin/quotes/add"
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:shadow-md transition text-sm"
          >
            <Tag size={16} />
            Add Quote
          </Link>
          <Link
            href="/dashboard/admin/orders"
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:shadow-md transition text-sm"
          >
            <DollarSign size={16} />
            View Orders
          </Link>
          <Link
            href="/dashboard/admin/pending"
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:shadow-md transition text-sm"
          >
            <Eye size={16} />
            Pending Quotes
          </Link>
        </div>
      </div>
    </div>
  );
}