"use client";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Eye,
  Heart,
  Package,
  QrCode,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { user } = useAuthStore();
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalFavorites: 0,
    totalScans: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");

  // Greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // ✅ Fetch user's orders from backend
        const ordersResponse = await api.get("/orders");
        const orders = ordersResponse.data.data || [];
        setRecentOrders(orders.slice(0, 5));

        // ✅ Fetch user's favorites (if you have this endpoint)
        let favorites = [];
        try {
          const favoritesResponse = await api.get("/favorites");
          favorites = favoritesResponse.data.data || [];
        } catch (error) {
          console.log("Favorites endpoint not available yet");
        }

        // ✅ Fetch user's scan history (if you have this endpoint)
        let scans = [];
        try {
          const scansResponse = await api.get("/scan/history");
          scans = scansResponse.data.data || [];
        } catch (error) {
          console.log("Scan history endpoint not available yet");
        }

        setStats({
          totalOrders: orders.length,
          totalFavorites: favorites.length,
          totalScans: scans.length,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    return `$${Number(price).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-50 text-yellow-700",
      assigned: "bg-blue-50 text-blue-700",
      shipped: "bg-purple-50 text-purple-700",
      delivered: "bg-green-50 text-green-700",
      paid: "bg-green-50 text-green-700",
    };
    return colors[status] || "bg-gray-50 text-gray-700";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "assigned":
        return <Package className="w-3 h-3" />;
      case "shipped":
        return <Package className="w-3 h-3" />;
      case "delivered":
        return <Package className="w-3 h-3" />;
      default:
        return <Package className="w-3 h-3" />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pending",
      assigned: "Assigned",
      shipped: "Shipped",
      delivered: "Delivered",
      paid: "Paid",
    };
    return labels[status] || status?.toUpperCase() || "Pending";
  };

  return (
    <main className="flex-1 w-full">
      <div className="p-4 lg:p-8">
        {/* Header with User Name */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-2">
            <div>
              <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
                {greeting},{" "}
                <span className="text-gray-900">
                  {user?.name?.split(" ")[0] || "User"}!
                </span>
              </h1>
              <p className="text-sm text-gray-500">
                Welcome back to your dashboard
              </p>
            </div>
            <div className="text-left lg:text-right text-sm text-gray-500">
              <div>
                {new Date().toLocaleDateString("en-US", { weekday: "long" })}
              </div>
              <div>{formatDate(new Date())}</div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Backend Data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Link href="/account/orders" className="block">
            <div className="bg-white rounded-lg p-4 lg:p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Orders</span>
                <Package size={20} className="text-gray-400" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                {loading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.totalOrders
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">Click to view all</p>
            </div>
          </Link>

          <Link href="/favorites" className="block">
            <div className="bg-white rounded-lg p-4 lg:p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Favorites</span>
                <Heart size={20} className="text-gray-400" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                {loading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.totalFavorites
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">Your favorite products</p>
            </div>
          </Link>

          <Link href="/scan/history" className="block">
            <div className="bg-white rounded-lg p-4 lg:p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Scans</span>
                <QrCode size={20} className="text-gray-400" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                {loading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.totalScans
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">QR & NFC scans</p>
            </div>
          </Link>
        </div>

        {/* Recent Orders - Backend Data */}
        <div className="bg-white rounded-lg border border-gray-200 mb-4 lg:mb-6">
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingBag size={18} />
              Recent Orders
            </h2>
            <Link
              href="/account/orders"
              className="px-3 lg:px-4 py-2 bg-gray-900 text-white text-xs lg:text-sm rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center gap-1"
            >
              View All
              <Eye size={14} />
            </Link>
          </div>

          {loading ? (
            // Loading Skeleton
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-200 animate-pulse rounded"
                ></div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            // No Orders
            <div className="p-8 text-center text-gray-500">
              <ShoppingBag size={40} className="mx-auto mb-3 text-gray-300" />
              <p>No orders yet</p>
              <Link
                href="/shop"
                className="inline-block mt-4 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        Order ID
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          Date
                        </div>
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        Product
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        <div className="flex items-center gap-1">
                          <DollarSign size={14} />
                          Total
                        </div>
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        Status
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <span className="font-mono text-sm text-gray-900">
                            #{order._id?.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {order.product?.image?.url && (
                              <img
                                src={order.product.image.url}
                                alt={order.product.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                            <span className="text-sm text-gray-900">
                              {order.product?.name?.length > 25
                                ? order.product.name.slice(0, 25) + "..."
                                : order.product?.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-sm font-semibold text-gray-900">
                          {formatPrice(order.product?.price || 0)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getStatusColor(
                              order.fulfillmentStatus
                            )}`}
                          >
                            {getStatusIcon(order.fulfillmentStatus)}
                            {getStatusLabel(order.fulfillmentStatus)}
                          </span>
                        </td>
                        <td className="p-4">
                          <Link
                            href={`/account/orders/${order._id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1"
                          >
                            View Details
                            <Eye size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-100">
                {recentOrders.map((order, index) => (
                  <div key={order._id} className="p-4">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() =>
                        setExpandedOrder(expandedOrder === order._id ? null : order._id)
                      }
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-semibold text-gray-900 text-sm">
                            #{order._id?.slice(-8).toUpperCase()}
                          </span>
                          {expandedOrder === order._id ? (
                            <ChevronUp size={20} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={20} className="text-gray-400" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.product?.name}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                          {formatPrice(order.product?.price || 0)}
                        </div>
                      </div>
                    </div>

                    {expandedOrder === order._id && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 animate-fadeIn">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Calendar size={12} />
                            Date:
                          </span>
                          <span className="text-gray-900">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Product:</span>
                          <span className="text-gray-900">
                            {order.product?.name}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Quantity:</span>
                          <span className="text-gray-900">1</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Total:</span>
                          <span className="text-gray-900 font-medium">
                            {formatPrice(order.product?.price || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                          <span className="text-gray-500">Status:</span>
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getStatusColor(
                              order.fulfillmentStatus
                            )}`}
                          >
                            {getStatusIcon(order.fulfillmentStatus)}
                            {getStatusLabel(order.fulfillmentStatus)}
                          </span>
                        </div>
                        <div className="pt-2">
                          <Link
                            href={`/account/orders/${order._id}`}
                            className="w-full inline-flex items-center justify-center gap-1 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition"
                          >
                            View Details
                            <Eye size={14} />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}