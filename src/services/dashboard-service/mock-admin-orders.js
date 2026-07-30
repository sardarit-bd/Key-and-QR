const now = new Date();

function ago(days = 0, hours = 0, minutes = 0) {
  return new Date(now.getTime() - days * 86400000 - hours * 3600000 - minutes * 60000).toISOString();
}

const CUSTOMERS = [
  { name: 'Sarah Johnson', email: 'sarah.johnson@gmail.com' },
  { name: 'Michael Chen', email: 'michael.chen@outlook.com' },
  { name: 'Emily Davis', email: 'emily.davis@icloud.com' },
  { name: 'James Wilson', email: 'james.wilson@yahoo.com' },
  { name: 'Lisa Brown', email: 'lisa.brown@gmail.com' },
  { name: 'David Miller', email: 'david.miller@proton.me' },
  { name: 'Anna Garcia', email: 'anna.garcia@outlook.com' },
  { name: 'Robert Thompson', email: 'robert.t@icloud.com' },
  { name: 'Jessica Anderson', email: 'jessica.a@gmail.com' },
  { name: 'William Taylor', email: 'will.taylor@yahoo.com' },
  { name: 'Olivia Thomas', email: 'olivia.t@outlook.com' },
  { name: 'Daniel Jackson', email: 'daniel.j@gmail.com' },
  { name: 'Sophia White', email: 'sophia.w@icloud.com' },
  { name: 'Matthew Harris', email: 'matthew.h@proton.me' },
  { name: 'Isabella Clark', email: 'isabella.c@gmail.com' },
  { name: 'Ryan Lewis', email: 'ryan.lewis@outlook.com' },
  { name: 'Amelia Walker', email: 'amelia.w@icloud.com' },
  { name: 'Nathan Hall', email: 'nathan.hall@yahoo.com' },
  { name: 'Charlotte Allen', email: 'charlotte.a@gmail.com' },
  { name: 'Tyler Young', email: 'tyler.young@outlook.com' },
];

const PRODUCTS = [
  { name: 'Ocean Shell Tag', price: 19.99 },
  { name: 'Premium Bundle', price: 29.99 },
  { name: 'Starter Kit', price: 14.99 },
  { name: 'Gifted Tag', price: 24.99 },
  { name: 'Inspiration Pack', price: 34.99 },
  { name: 'Zen Collection', price: 39.99 },
  { name: 'Mindfulness Set', price: 44.99 },
  { name: 'Daily Quote Tag', price: 19.99 },
];

const FULFILLMENT_STATUSES = ['pending', 'assigned', 'shipped', 'delivered', 'cancelled', 'returned'];
const PAYMENT_STATUSES = ['pending', 'paid', 'refunded', 'failed', 'cancelled'];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateOrderNumber(index) {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const seq = String(index + 1).padStart(3, '0');
  return `ORD-${date.getFullYear()}${month}${day}-${seq}`;
}

const ORDERS = Array.from({ length: 60 }, (_, i) => {
  const customer = CUSTOMERS[i % CUSTOMERS.length];
  const productCount = i % 5 === 0 ? 2 : 1;

  // Deterministic but varied statuses
  let fulfillmentStatus;
  if (i < 12) fulfillmentStatus = 'pending';
  else if (i < 24) fulfillmentStatus = 'assigned';
  else if (i < 36) fulfillmentStatus = 'shipped';
  else if (i < 48) fulfillmentStatus = 'delivered';
  else if (i < 54) fulfillmentStatus = 'cancelled';
  else fulfillmentStatus = 'returned';

  let paymentStatus;
  if (fulfillmentStatus === 'cancelled') paymentStatus = 'cancelled';
  else if (fulfillmentStatus === 'returned') paymentStatus = 'refunded';
  else if (i < 42) paymentStatus = 'paid';
  else if (i < 50) paymentStatus = 'pending';
  else paymentStatus = 'paid';

  const items = Array.from({ length: productCount }, (_, pi) => {
    const product = PRODUCTS[(i * 3 + pi) % PRODUCTS.length];
    const qty = pi === 0 ? 1 : 2;
    return {
      product: {
        _id: `prod_${String((i * 3 + pi) % PRODUCTS.length + 1).padStart(2, '0')}`,
        name: product.name,
        price: product.price,
        image: null,
      },
      quantity: qty,
      unitPrice: product.price,
      subtotal: product.price * qty,
      purchaseType: pi === 0 ? 'self' : 'gift',
      giftMessage: pi === 0 ? null : 'Hope you love this gift! 💫',
      assignedTags: fulfillmentStatus !== 'pending' && pi === 0
        ? [`tag_${String(i + 1).padStart(4, '0')}`]
        : [],
    };
  });

  const subtotal = items.reduce((s, it) => s + it.subtotal, 0);
  const shippingCost = subtotal >= 30 ? 0 : 4.99;
  const grandTotal = subtotal + shippingCost;

  const daysAgo = Math.floor(i / 2);
  const hoursAgo = (i % 2) * 6;

  return {
    _id: `ord_${String(i + 1).padStart(4, '0')}`,
    orderNumber: generateOrderNumber(i),
    user: {
      _id: `usr_${String(i + 1).padStart(4, '0')}`,
      name: customer.name,
      email: customer.email,
    },
    isGuestOrder: i % 5 === 4,
    guestCustomer: i % 5 === 4 ? { fullName: customer.name, email: customer.email } : null,
    items,
    subtotal,
    shippingCost,
    discount: i % 10 === 0 ? 5 : 0,
    grandTotal,
    paymentStatus,
    fulfillmentStatus,
    tagAssignmentStatus: fulfillmentStatus === 'pending' ? 'none' : fulfillmentStatus === 'assigned' ? 'partial' : 'complete',
    shippingAddress: {
      fullName: customer.name,
      address: `${100 + i} Main Street`,
      city: pick(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Seattle', 'Miami', 'Denver']),
      state: pick(['NY', 'CA', 'IL', 'TX', 'AZ', 'WA', 'FL', 'CO']),
      postalCode: String(10000 + i * 137).slice(0, 5),
      country: 'US',
    },
    refundStatus: fulfillmentStatus === 'returned' ? 'completed' : 'none',
    returnStatus: fulfillmentStatus === 'returned' ? 'completed' : 'none',
    cancellationReason: fulfillmentStatus === 'cancelled' ? 'Customer changed mind' : null,
    createdAt: ago(daysAgo, hoursAgo),
    updatedAt: ago(daysAgo - 1, hoursAgo),
    deliveredAt: fulfillmentStatus === 'delivered' || fulfillmentStatus === 'returned' ? ago(daysAgo - 3) : null,
  };
});

export const MOCK_ADMIN_ORDERS = ORDERS;

export const MOCK_ORDERS_STATS = {
  total: ORDERS.length,
  pending: ORDERS.filter((o) => o.fulfillmentStatus === 'pending').length,
  assigned: ORDERS.filter((o) => o.fulfillmentStatus === 'assigned').length,
  shipped: ORDERS.filter((o) => o.fulfillmentStatus === 'shipped').length,
  delivered: ORDERS.filter((o) => o.fulfillmentStatus === 'delivered').length,
  cancelled: ORDERS.filter((o) => o.fulfillmentStatus === 'cancelled').length,
  returned: ORDERS.filter((o) => o.fulfillmentStatus === 'returned').length,
  paid: ORDERS.filter((o) => o.paymentStatus === 'paid').length,
  refunded: ORDERS.filter((o) => o.paymentStatus === 'refunded').length,
  totalRevenue: ORDERS.reduce((sum, o) => sum + (o.grandTotal || 0), 0),
};
