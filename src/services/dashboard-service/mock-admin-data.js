/**
 * Mock Admin Dashboard Overview Data
 * 
 * Structure mirrors the expected backend response from GET /admin/dashboard/overview.
 * Replace with real API data by setting useMock=false in adminDashboardService.
 */

const now = new Date();

function ago(minutes) {
  return new Date(now.getTime() - minutes * 60 * 1000).toISOString();
}

const RECENT_ORDERS = [
  {
    _id: '6709a1b2c3d4e5f6a7b8c9d0',
    orderNumber: 'ORD-20260728-001',
    user: { _id: 'u1', name: 'Sarah Johnson', email: 'sarah@example.com' },
    product: { name: 'Ocean Shell Tag', price: 19.99 },
    paymentStatus: 'paid',
    fulfillmentStatus: 'shipped',
    total: 19.99,
    createdAt: ago(12),
  },
  {
    _id: '6709a1b2c3d4e5f6a7b8c9d1',
    orderNumber: 'ORD-20260728-002',
    user: { _id: 'u2', name: 'Michael Chen', email: 'michael@example.com' },
    product: { name: 'Ocean Shell Tag', price: 19.99 },
    paymentStatus: 'paid',
    fulfillmentStatus: 'pending',
    total: 19.99,
    createdAt: ago(45),
  },
  {
    _id: '6709a1b2c3d4e5f6a7b8c9d2',
    orderNumber: 'ORD-20260727-003',
    user: { _id: 'u3', name: 'Emily Davis', email: 'emily@example.com' },
    product: { name: 'Premium Bundle', price: 29.99 },
    paymentStatus: 'pending',
    fulfillmentStatus: 'pending',
    total: 29.99,
    createdAt: ago(180),
  },
  {
    _id: '6709a1b2c3d4e5f6a7b8c9d3',
    orderNumber: 'ORD-20260727-004',
    user: { _id: 'u4', name: 'James Wilson', email: 'james@example.com' },
    product: { name: 'Ocean Shell Tag', price: 19.99 },
    paymentStatus: 'paid',
    fulfillmentStatus: 'delivered',
    total: 19.99,
    createdAt: ago(300),
  },
  {
    _id: '6709a1b2c3d4e5f6a7b8c9d4',
    orderNumber: 'ORD-20260726-005',
    user: { _id: 'u5', name: 'Lisa Brown', email: 'lisa@example.com' },
    product: { name: 'Gifted Tag', price: 24.99 },
    paymentStatus: 'paid',
    fulfillmentStatus: 'assigned',
    total: 24.99,
    createdAt: ago(600),
  },
];

const RECENT_USERS = [
  {
    _id: 'u1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'user',
    provider: 'email',
    isEmailVerified: true,
    createdAt: ago(60),
  },
  {
    _id: 'u2',
    name: 'Michael Chen',
    email: 'michael@example.com',
    role: 'user',
    provider: 'google',
    isEmailVerified: true,
    createdAt: ago(120),
  },
  {
    _id: 'u3',
    name: 'Emily Davis',
    email: 'emily@example.com',
    role: 'user',
    provider: 'email',
    isEmailVerified: false,
    createdAt: ago(300),
  },
  {
    _id: 'u4',
    name: 'James Wilson',
    email: 'james@example.com',
    role: 'user',
    provider: 'apple',
    isEmailVerified: true,
    createdAt: ago(480),
  },
  {
    _id: 'u5',
    name: 'Lisa Brown',
    email: 'lisa@example.com',
    role: 'user',
    provider: 'email',
    isEmailVerified: true,
    createdAt: ago(720),
  },
];

const RECENT_ACTIVITY = [
  {
    _id: 'act1',
    type: 'order_created',
    message: 'New order placed by Sarah Johnson',
    details: 'ORD-20260728-001 — Ocean Shell Tag',
    createdAt: ago(12),
  },
  {
    _id: 'act2',
    type: 'user_registered',
    message: 'New user registered',
    details: 'Sarah Johnson joined via email',
    createdAt: ago(60),
  },
  {
    _id: 'act3',
    type: 'quote_submitted',
    message: 'New quote submitted for review',
    details: 'Pending approval queue: 3 quotes',
    createdAt: ago(90),
  },
  {
    _id: 'act4',
    type: 'tag_activated',
    message: 'Tag activated',
    details: 'TAG-A3F7B2 activated by Michael Chen',
    createdAt: ago(150),
  },
  {
    _id: 'act5',
    type: 'subscription_upgraded',
    message: 'Subscription upgraded',
    details: 'Emily Davis upgraded to Premium',
    createdAt: ago(240),
  },
  {
    _id: 'act6',
    type: 'order_paid',
    message: 'Payment confirmed',
    details: 'ORD-20260726-005 — $24.99',
    createdAt: ago(360),
  },
  {
    _id: 'act7',
    type: 'refund_processed',
    message: 'Refund processed',
    details: 'ORD-20260725-002 — $19.99 refunded',
    createdAt: ago(500),
  },
];

const SYSTEM_STATUS = {
  api: { status: 'healthy', latency: '45ms', uptime: '99.98%' },
  database: { status: 'healthy', latency: '12ms', uptime: '99.99%' },
  stripe: { status: 'healthy', latency: '89ms', uptime: '99.95%' },
  email: { status: 'healthy', latency: '210ms', uptime: '99.90%' },
  storage: { status: 'healthy', latency: '34ms', usage: '42%' },
};

const QUICK_ACTIONS = [
  { id: 'add-product', label: 'Add Product', icon: 'Package', href: '/new-dashboard/admin/products' },
  { id: 'create-tag', label: 'Create QR Tag', icon: 'Tag', href: '/new-dashboard/admin/tags' },
  { id: 'view-orders', label: 'View Orders', icon: 'ShoppingBag', href: '/new-dashboard/admin/orders' },
  { id: 'manage-users', label: 'Manage Users', icon: 'Users', href: '/new-dashboard/admin/users' },
  { id: 'review-quotes', label: 'Review Quotes', icon: 'Quote', href: '/new-dashboard/admin/quotes' },
  { id: 'analytics', label: 'View Analytics', icon: 'BarChart3', href: '/new-dashboard/admin/analytics' },
];

export const MOCK_ADMIN_OVERVIEW = {
  stats: {
    totalUsers: 1248,
    totalOrders: 532,
    totalProducts: 8,
    totalRevenue: 12843.50,
    activeTags: 389,
    pendingTags: 47,
    totalQuotes: 2256,
  },
  recentOrders: RECENT_ORDERS,
  recentUsers: RECENT_USERS,
  recentActivity: RECENT_ACTIVITY,
  quickActions: QUICK_ACTIONS,
  systemStatus: SYSTEM_STATUS,
};
