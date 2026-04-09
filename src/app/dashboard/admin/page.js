"use client";

import api from "@/lib/api";
import Loader from "@/shared/Loader";
import { useAuthStore } from "@/store/authStore";
import { DollarSign, Eye, Mail, Package, QrCode, Tag, TrendingUp, Calendar, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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
  const [salesData, setSalesData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);

  // Available months
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Get current month name
  const currentMonthName = months[new Date().getMonth()];

  useEffect(() => {
    fetchDashboardData();
  }, [selectedYear]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const productsRes = await api.get("/products", { params: { limit: 1 } });
      const tagsRes = await api.get("/tags");
      const tags = tagsRes.data.data.data || [];
      const ordersRes = await api.get("/orders/admin/all", { params: { limit: 1000 } });
      const orders = ordersRes.data.data || [];

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

      processAllData(orders);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processAllData = (orders) => {
    // Get available years from orders
    const years = new Set();
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    
    // Add years from orders
    orders.forEach(order => {
      if (order.createdAt) {
        const date = new Date(order.createdAt);
        years.add(date.getFullYear());
      }
    });

    const sortedYears = Array.from(years).sort((a, b) => b - a);
    setAvailableYears(sortedYears);

    // Generate sales data for selected year
    generateSalesData(orders, selectedYear);
    generateOrdersData(orders, selectedYear);
    processOrderStatusData(orders);
    
    // Set default selected month to current month if not set
    if (!selectedMonth) {
      setSelectedMonth(currentMonthName);
    }
  };

  const generateSalesData = (orders, year) => {
    const monthlySales = months.map((monthName, monthIndex) => ({
      month: monthName,
      sales: 0,
      orders: 0,
    }));

    orders.forEach(order => {
      if (order.createdAt && order.paymentStatus === "paid") {
        const date = new Date(order.createdAt);
        if (date.getFullYear() === year) {
          const monthIndex = date.getMonth();
          monthlySales[monthIndex].sales += order.product?.price || 0;
          monthlySales[monthIndex].orders += 1;
        }
      }
    });

    setSalesData(monthlySales);
  };

  const generateOrdersData = (orders, year) => {
    const monthlyOrders = months.map((monthName, monthIndex) => ({
      month: monthName,
      total: 0,
      paid: 0,
      pending: 0,
    }));

    orders.forEach(order => {
      if (order.createdAt) {
        const date = new Date(order.createdAt);
        if (date.getFullYear() === year) {
          const monthIndex = date.getMonth();
          monthlyOrders[monthIndex].total += 1;
          if (order.paymentStatus === "paid") {
            monthlyOrders[monthIndex].paid += 1;
          } else {
            monthlyOrders[monthIndex].pending += 1;
          }
        }
      }
    });

    setOrdersData(monthlyOrders);
  };

  const processOrderStatusData = (orders) => {
    const statusCount = {
      pending: 0,
      assigned: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0
    };

    orders.forEach(order => {
      const status = order.fulfillmentStatus;
      if (statusCount.hasOwnProperty(status)) {
        statusCount[status]++;
      }
    });

    const pieData = [
      { name: 'Pending', value: statusCount.pending, color: '#f59e0b' },
      { name: 'Assigned', value: statusCount.assigned, color: '#8b5cf6' },
      { name: 'Shipped', value: statusCount.shipped, color: '#3b82f6' },
      { name: 'Delivered', value: statusCount.delivered, color: '#10b981' },
      { name: 'Cancelled', value: statusCount.cancelled, color: '#ef4444' },
      { name: 'Returned', value: statusCount.returned, color: '#6b7280' },
    ].filter(item => item.value > 0);

    setOrderStatusData(pieData);
  };

  const handleYearChange = (newYear) => {
    setSelectedYear(newYear);
    setSelectedMonth(currentMonthName);
  };

  const handleMonthClick = (monthName) => {
    setSelectedMonth(monthName);
  };

  const getFilteredData = () => {
    if (selectedMonth) {
      const monthIndex = months.indexOf(selectedMonth);
      return {
        sales: salesData[monthIndex]?.sales || 0,
        orders: ordersData[monthIndex]?.total || 0,
        paid: ordersData[monthIndex]?.paid || 0,
        pending: ordersData[monthIndex]?.pending || 0,
      };
    }
    return null;
  };

  const filteredData = getFilteredData();

  const formatPrice = (price) => `$${Number(price).toFixed(2)}`;

  // Stats Cards with dynamic values
  const statsCards = [
    { title: "Total Products", value: stats.totalProducts, icon: Package, color: "bg-blue-500", link: "/dashboard/admin/products" },
    { title: "Total Tags", value: stats.totalTags, icon: Tag, color: "bg-purple-500", link: "/dashboard/admin/tags" },
    { title: "Total Orders", value: stats.totalOrders, icon: DollarSign, color: "bg-green-500", link: "/dashboard/admin/orders" },
    { title: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: TrendingUp, color: "bg-orange-500", link: "/dashboard/admin/orders" },
  ];

  // Modern Custom Tooltip
  const ModernTooltip = ({ active, payload, label, type = "sales" }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 border border-gray-100 rounded-2xl shadow-xl">
          <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
          {type === "sales" ? (
            <>
              <p className="text-2xl font-bold text-purple-600">
                ${payload[0].value.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Total Sales</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-blue-600">
                {payload[0].value}
              </p>
              <p className="text-xs text-gray-400 mt-1">Total Orders</p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = orderStatusData.reduce((a, b) => a + b.value, 0);
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 border border-gray-100 rounded-xl shadow-lg">
          <p className="text-sm font-semibold text-gray-900">{data.name}</p>
          <p className="text-xl font-bold" style={{ color: data.color }}>
            {data.value} orders
          </p>
          <p className="text-xs text-gray-400">
            {total > 0 ? ((data.value / total) * 100).toFixed(1) : 0}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <Loader text="Qkey..." size={50} fullScreen />;
  }

  return (
    <div className="flex-1 w-full p-4 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Welcome back, {user?.name?.split(" ")[0] || "Admin"}!
            </h1>
            <p className="text-gray-500 mt-2">Here's what's happening with your store today.</p>
          </div>
          
          {/* Year Selector */}
          {availableYears.length > 0 && (
            <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-gray-200">
              {availableYears.map(year => (
                <button
                  key={year}
                  onClick={() => handleYearChange(year)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedYear === year
                      ? "bg-gray-900 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {statsCards.map((card, index) => (
          <Link key={index} href={card.link} className="block group">
            <div className="bg-white rounded-2xl p-4 lg:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <div className={`${card.color} p-3 rounded-xl text-white shadow-lg`}>
                  <card.icon size={20} />
                </div>
                <TrendingUp size={16} className="text-gray-300 group-hover:text-gray-400 transition" />
              </div>
              <p className="text-sm text-gray-500 mb-1">{card.title}</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Month Selector & Summary */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-gray-200 flex-wrap">
          {months.map(month => (
            <button
              key={month}
              onClick={() => handleMonthClick(month)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedMonth === month
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {month}
              {month === currentMonthName && selectedMonth === month && (
                <span className="ml-1 text-xs">(Current)</span>
              )}
            </button>
          ))}
        </div>
        
        {filteredData && (
          <div className="flex items-center gap-4 bg-white rounded-xl p-3 border border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-400">Sales</p>
              <p className="text-lg font-bold text-purple-600">{formatPrice(filteredData.sales)}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <p className="text-xs text-gray-400">Orders</p>
              <p className="text-lg font-bold text-blue-600">{filteredData.orders}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <p className="text-xs text-gray-400">Paid</p>
              <p className="text-lg font-bold text-green-600">{filteredData.paid}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <p className="text-xs text-gray-400">Pending</p>
              <p className="text-lg font-bold text-yellow-600">{filteredData.pending}</p>
            </div>
          </div>
        )}
      </div>

      {/* Modern Charts Section - Fixed Height for ResponsiveContainer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Modern Sales Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp size={16} className="text-purple-600" />
                </div>
                Revenue Overview
              </h2>
              <p className="text-xs text-gray-400 mt-1">Monthly sales for {selectedYear}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600" />
              <span className="text-xs text-gray-500">Sales ($)</span>
            </div>
          </div>
          {/* Fixed: Added explicit height for ResponsiveContainer */}
          <div style={{ height: '350px', width: '100%', minHeight: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="modernSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#d1d5db" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#d1d5db" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={(props) => <ModernTooltip {...props} type="sales" />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#modernSales)"
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#7c3aed' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Modern Orders Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ShoppingBag size={16} className="text-blue-600" />
                </div>
                Orders Overview
              </h2>
              <p className="text-xs text-gray-400 mt-1">Monthly orders for {selectedYear}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-gray-500">Paid</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <span className="text-xs text-gray-500">Pending</span>
              </div>
            </div>
          </div>
          {/* Fixed: Added explicit height for ResponsiveContainer */}
          <div style={{ height: '350px', width: '100%', minHeight: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#d1d5db" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#d1d5db" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={(props) => <ModernTooltip {...props} type="orders" />} />
                <Bar dataKey="paid" name="Paid" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Modern Pie Chart */}
      {orderStatusData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 lg:p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Package size={16} className="text-emerald-600" />
                </div>
                Order Status Distribution
              </h2>
              <p className="text-xs text-gray-400 mt-1">Breakdown of all orders by status</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {orderStatusData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-500">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Fixed: Added explicit height for ResponsiveContainer */}
          <div style={{ height: '400px', width: '100%', minHeight: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={130}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6 pt-4 border-t border-gray-100">
            {orderStatusData.map((item, idx) => (
              <div key={idx} className="text-center">
                <p className="text-2xl font-bold" style={{ color: item.color }}>
                  {item.value}
                </p>
                <p className="text-xs text-gray-500">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders and Recent Tags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Package size={16} className="text-indigo-600" />
              </div>
              Recent Orders
            </h2>
            <Link
              href="/dashboard/admin/orders"
              className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              View All <Eye size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
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
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Tags */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-100 rounded-xl flex items-center justify-center">
                <QrCode size={16} className="text-teal-600" />
              </div>
              Recent Tags
            </h2>
            <div className="flex items-center gap-2">
              {/* <span className="text-xs text-gray-400">
                {stats.activeTags} activated / {stats.pendingTags} pending
              </span> */}
              <Link
                href="/dashboard/admin/tags"
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                Manage <Eye size={14} />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTags.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Tag size={40} className="mx-auto mb-3 text-gray-300" />
                <p>No tags created yet</p>
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
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}