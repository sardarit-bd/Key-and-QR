"use client";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  ChevronDown,
  ChevronUp,
  Heart,
  Package,
  QrCode,
  ShoppingBag,
} from "lucide-react";
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

        // Fetch user's orders
        // const ordersResponse = await api.get('/orders/my-orders');
        const orders = ordersResponse.data.data || [];
        setRecentOrders(orders.slice(0, 5)); // Show only 5 recent orders

        // Fetch user's favorites
        const favoritesResponse = await api.get("/favorites");
        const favorites = favoritesResponse.data.data || [];

        // Fetch user's scan history
        const scansResponse = await api.get("/qr-history");
        const scans = scansResponse.data.data || [];

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
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "/");
  };

  // Get current date
  const currentDate = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/(\d+)\/(\d+)\/(\d+)/, "$1/$2/$3");

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
          <div className="bg-white rounded-lg p-4 lg:p-6 border border-gray-200">
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
          </div>

          <div className="bg-white rounded-lg p-4 lg:p-6 border border-gray-200">
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
          </div>

          <div className="bg-white rounded-lg p-4 lg:p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Scans</span>
              <QrCode size={20} className="text-gray-400" />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900">
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                stats.totalScans
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders - Backend Data */}
        <div className="bg-white rounded-lg border border-gray-200 mb-4 lg:mb-6">
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <button className="px-3 lg:px-4 py-2 bg-gray-900 text-white text-xs lg:text-sm rounded-lg hover:bg-gray-800 transition-colors">
              View All
            </button>
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
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        Order ID
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        Date
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        Items
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        Total
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order, index) => (
                      <tr
                        key={order._id || index}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 text-sm text-gray-900">
                          {order.orderId ||
                            `ORD-${String(index + 1).padStart(3, "0")}`}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {order.items?.length || 1}{" "}
                          {order.items?.length === 1 ? "item" : "items"}
                        </td>
                        <td className="p-4 text-sm text-gray-900 font-medium">
                          ${order.totalAmount?.toFixed(2) || "0.00"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-xs px-3 py-1 rounded-full ${
                              order.status?.toLowerCase() === "delivered"
                                ? "bg-green-50 text-green-700"
                                : order.status?.toLowerCase() === "pending"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {order.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-100">
                {recentOrders.map((order, index) => (
                  <div key={order._id || index} className="p-4">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() =>
                        setExpandedOrder(expandedOrder === index ? null : index)
                      }
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900 text-sm">
                            {order.orderId ||
                              `ORD-${String(index + 1).padStart(3, "0")}`}
                          </span>
                          {expandedOrder === index ? (
                            <ChevronUp size={20} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={20} className="text-gray-400" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          {order.items?.length || 1} items
                        </div>
                      </div>
                    </div>

                    {expandedOrder === index && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 animate-fadeIn">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Date:</span>
                          <span className="text-gray-900">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Total:</span>
                          <span className="text-gray-900 font-medium">
                            ${order.totalAmount?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                          <span className="text-gray-500">Status:</span>
                          <span
                            className={`text-xs px-3 py-1 rounded-full ${
                              order.status?.toLowerCase() === "delivered"
                                ? "bg-green-50 text-green-700"
                                : order.status?.toLowerCase() === "pending"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {order.status || "Pending"}
                          </span>
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
