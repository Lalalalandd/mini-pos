export interface OrderItem {
  id: string;
  productName: string;
  productSku: string;
  price: number;
  quantity: number;
  discount: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  source: string;
  status: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  customerName: string;
  customerEmail?: string;
  createdAt: string;
  items: OrderItem[];
}

export const DEFAULT_INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'POS-20260907-001',
    source: 'POS',
    status: 'COMPLETED',
    totalAmount: 104000,
    discountAmount: 0,
    finalAmount: 104000,
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    customerName: 'Budi Santoso',
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    items: [
      { id: 'item-1', productName: 'Single Origin Espresso', productSku: 'BEV-ESP-001', price: 28000, quantity: 2, discount: 0, subtotal: 56000 },
      { id: 'item-2', productName: 'Smoked Beef Brioche Sandwich', productSku: 'MEA-SND-001', price: 48000, quantity: 1, discount: 0, subtotal: 48000 },
    ],
  },
  {
    id: 'ord-102',
    orderNumber: 'POS-20260907-002',
    source: 'POS',
    status: 'COMPLETED',
    totalAmount: 62000,
    discountAmount: 0,
    finalAmount: 62000,
    paymentMethod: 'QRIS',
    paymentStatus: 'PAID',
    customerName: 'Siti Rahma',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    items: [
      { id: 'item-3', productName: 'Butter Croissant French AOP', productSku: 'BAK-CRS-001', price: 24000, quantity: 1, discount: 0, subtotal: 24000 },
      { id: 'item-4', productName: 'Iced Oat Caramel Macchiato', productSku: 'BEV-MAC-002', price: 38000, quantity: 1, discount: 0, subtotal: 38000 },
    ],
  },
  {
    id: 'ord-103',
    orderNumber: 'WEB-20260907-003',
    source: 'ONLINE',
    status: 'PENDING',
    totalAmount: 70000,
    discountAmount: 10500,
    finalAmount: 69500,
    paymentMethod: 'ONLINE_VA',
    paymentStatus: 'PENDING',
    customerName: 'Andi Wijaya',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    items: [
      { id: 'item-5', productName: 'Ceremonial Uji Matcha Latte', productSku: 'BEV-MTC-003', price: 35000, quantity: 2, discount: 0, subtotal: 70000 },
    ],
  },
];

const ORDERS_STORAGE_KEY = 'aurastore_orders';

export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return DEFAULT_INITIAL_ORDERS;
  try {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_INITIAL_ORDERS;
}

export function saveStoredOrders(orders: Order[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch {}
}

export function addStoredOrder(order: Order): void {
  const current = getStoredOrders();
  // Check duplicate by orderNumber or id
  const filtered = current.filter((o) => o.id !== order.id && o.orderNumber !== order.orderNumber);
  const updated = [order, ...filtered];
  saveStoredOrders(updated);
}
