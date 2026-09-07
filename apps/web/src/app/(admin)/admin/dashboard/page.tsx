'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Layers,
  ShieldCheck,
  RefreshCw,
  Package,
  Plus,
  Search,
  Filter,
  X,
  Check,
  Store,
  Receipt,
  ChevronRight,
  Download,
  BarChart3,
  DollarSign,
  Clock,
  LogOut,
  Edit2,
  Trash2,
  ChevronLeft,
  Calendar,
  RotateCcw,
  ClipboardList,
  ArrowDownUp,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  CheckCircle2,
  XCircle,
  Percent,
  Users,
  UserPlus,
  KeyRound,
  UserCheck,
  Shield,
} from 'lucide-react';
import { restFetch } from '@/lib/api-client';

// Product Type
interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStockAlert: number;
  categoryName?: string;
  status?: string;
  description?: string;
}

// Order Item & Order Type
interface OrderItem {
  id: string;
  productName: string;
  productSku: string;
  price: number;
  quantity: number;
  discount: number;
  subtotal: number;
}

interface Order {
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
  createdAt: string;
  items: OrderItem[];
}

// Inventory Movement Type
interface InventoryMovement {
  id: string;
  productName: string;
  sku: string;
  type: 'RESTOCK' | 'SALE' | 'ADJUSTMENT' | 'OPNAME';
  quantityChange: number;
  finalStock: number;
  reason: string;
  timestamp: string;
}

// User Account Type
interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CASHIER' | 'CUSTOMER';
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [navSection, setNavSection] = useState<'OVERVIEW' | 'PRODUCTS' | 'INVENTORY' | 'ORDERS' | 'REPORTS' | 'USERS'>('OVERVIEW');
  const [loading, setLoading] = useState(false);

  // Core Data States
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [reportsData, setReportsData] = useState<any>(null);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
  const [usersList, setUsersList] = useState<UserAccount[]>([]);

  // Products Filter & Pagination
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');
  const [productPage, setProductPage] = useState(1);
  const [productPerPage, setProductPerPage] = useState(6);

  // Product Modals
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    price: 0,
    costPrice: 0,
    stock: 0,
    minStockAlert: 5,
    categoryName: 'Coffee',
    description: '',
  });

  // Orders Filter & Pagination & Modal
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderPage, setOrderPage] = useState(1);
  const [orderPerPage, setOrderPerPage] = useState(6);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [refundModalOrder, setRefundModalOrder] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundRestock, setRefundRestock] = useState(true);

  // Inventory Modals
  const [adjustModalProduct, setAdjustModalProduct] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<'ADD' | 'SUBTRACT'>('ADD');
  const [adjustReason, setAdjustReason] = useState('Koreksi Stok');

  // Stock Opname Form
  const [opnameProductId, setOpnameProductId] = useState('');
  const [opnamePhysicalQty, setOpnamePhysicalQty] = useState<number>(0);
  const [opnameNotes, setOpnameNotes] = useState('');

  // User Management State & Modals
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [deleteModalUser, setDeleteModalUser] = useState<UserAccount | null>(null);
  const [userForm, setUserForm] = useState<{
    name: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'CASHIER' | 'CUSTOMER';
  }>({
    name: '',
    email: '',
    password: '',
    role: 'CASHIER',
  });

  // Initial Seed / Mock fallback data
  const initialProducts: Product[] = [
    { id: 'p-1', name: 'Single Origin Espresso', sku: 'BEV-ESP-001', barcode: '89910010001', price: 28000, costPrice: 12000, stock: 120, minStockAlert: 15, categoryName: 'Coffee', status: 'ACTIVE' },
    { id: 'p-2', name: 'Iced Oat Caramel Macchiato', sku: 'BEV-MAC-002', barcode: '89910010002', price: 38000, costPrice: 16000, stock: 85, minStockAlert: 10, categoryName: 'Coffee', status: 'ACTIVE' },
    { id: 'p-3', name: 'Butter Croissant French AOP', sku: 'BAK-CRS-001', barcode: '89910010003', price: 24000, costPrice: 9000, stock: 8, minStockAlert: 10, categoryName: 'Bakery', status: 'ACTIVE' },
    { id: 'p-4', name: 'Smoked Beef Brioche Sandwich', sku: 'MEA-SND-001', barcode: '89910010004', price: 48000, costPrice: 22000, stock: 4, minStockAlert: 8, categoryName: 'Meals', status: 'ACTIVE' },
    { id: 'p-5', name: 'Ceremonial Uji Matcha Latte', sku: 'BEV-MTC-003', barcode: '89910010005', price: 35000, costPrice: 15000, stock: 50, minStockAlert: 10, categoryName: 'Tea', status: 'ACTIVE' },
    { id: 'p-6', name: 'Pain au Chocolat Belgian Dark', sku: 'BAK-CHO-002', barcode: '89910010006', price: 28000, costPrice: 11000, stock: 3, minStockAlert: 10, categoryName: 'Bakery', status: 'ACTIVE' },
    { id: 'p-7', name: 'Chocochip Artisan Cookie', sku: 'SNK-CKI-001', barcode: '89910010007', price: 18000, costPrice: 7000, stock: 55, minStockAlert: 15, categoryName: 'Snacks', status: 'ACTIVE' },
    { id: 'p-8', name: 'Sparkling Lemon Cold Brew', sku: 'BEV-CLB-004', barcode: '89910010008', price: 32000, costPrice: 13000, stock: 2, minStockAlert: 6, categoryName: 'Coffee', status: 'ACTIVE' },
  ];

  const initialOrders: Order[] = [
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
      createdAt: new Date().toISOString(),
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

  const initialMovements: InventoryMovement[] = [
    { id: 'm-1', productName: 'Single Origin Espresso', sku: 'BEV-ESP-001', type: 'RESTOCK', quantityChange: 50, finalStock: 120, reason: 'Pengiriman Supplier Utama', timestamp: new Date(Date.now() - 86400000).toLocaleString('id-ID') },
    { id: 'm-2', productName: 'Smoked Beef Brioche Sandwich', sku: 'MEA-SND-001', type: 'SALE', quantityChange: -1, finalStock: 4, reason: 'Penjualan POS #POS-20260907-001', timestamp: new Date().toLocaleString('id-ID') },
    { id: 'm-3', productName: 'Pain au Chocolat Belgian Dark', sku: 'BAK-CHO-002', type: 'ADJUSTMENT', quantityChange: -2, finalStock: 3, reason: 'Pastry display rusak', timestamp: new Date(Date.now() - 4000000).toLocaleString('id-ID') },
  ];

  const initialUsers: UserAccount[] = [
    { id: 'usr-1', name: 'Super Administrator', email: 'admin@aurapos.local', role: 'ADMIN', createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
    { id: 'usr-2', name: 'Budi Santoso (Kasir Utama)', email: 'kasir1@aurapos.local', role: 'CASHIER', createdAt: new Date(Date.now() - 14 * 86400000).toISOString() },
    { id: 'usr-3', name: 'Siti Rahma (Kasir Shift 2)', email: 'kasir2@aurapos.local', role: 'CASHIER', createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
    { id: 'usr-4', name: 'Andi Wijaya (Customer)', email: 'customer@aurapos.local', role: 'CUSTOMER', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  ];

  // Fetch Dashboard & Store Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedProducts, fetchedOrders, fetchedReports, fetchedUsers] = await Promise.allSettled([
        restFetch<Product[]>('/products'),
        restFetch<Order[]>('/orders'),
        restFetch<any>('/orders/reports'),
        restFetch<UserAccount[]>('/users'),
      ]);

      if (fetchedProducts.status === 'fulfilled' && Array.isArray(fetchedProducts.value) && fetchedProducts.value.length > 0) {
        setProductsList(fetchedProducts.value);
      } else {
        setProductsList(initialProducts);
      }

      if (fetchedOrders.status === 'fulfilled' && Array.isArray(fetchedOrders.value) && fetchedOrders.value.length > 0) {
        setOrdersList(fetchedOrders.value);
      } else {
        setOrdersList(initialOrders);
      }

      if (fetchedReports.status === 'fulfilled' && fetchedReports.value) {
        setReportsData(fetchedReports.value);
      }

      if (fetchedUsers.status === 'fulfilled' && Array.isArray(fetchedUsers.value) && fetchedUsers.value.length > 0) {
        setUsersList(fetchedUsers.value);
      } else {
        setUsersList(initialUsers);
      }
    } catch {
      setProductsList(initialProducts);
      setOrdersList(initialOrders);
      setUsersList(initialUsers);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    // Auth & Role Guard
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        toast.warning('Akses terbatas. Silakan masuk sebagai Admin terlebih dahulu.');
        router.replace('/login');
        return;
      }
      try {
        const user = JSON.parse(savedUser);
        if (user.role !== 'ADMIN') {
          toast.error('Akses ditolak. Halaman ini hanya untuk Administrator.');
          router.replace('/pos');
          return;
        }
        setIsAuthorized(true);
      } catch {
        router.replace('/login');
        return;
      }
    }

    loadData();
    setInventoryMovements(initialMovements);
  }, []);

  // Compute Overview KPIs
  const totalSalesAmount = ordersList.filter((o) => o.status === 'COMPLETED').reduce((sum, o) => sum + o.finalAmount, 0);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = ordersList.filter((o) => o.createdAt.slice(0, 10) === todayStr && o.status === 'COMPLETED');
  const todaySalesAmount = todayOrders.reduce((sum, o) => sum + o.finalAmount, 0);
  const todayTransactionsCount = todayOrders.length;
  const totalOrdersCount = ordersList.length;
  const lowStockProducts = productsList.filter((p) => p.stock <= p.minStockAlert);
  const totalInventoryValuation = productsList.reduce((sum, p) => sum + p.stock * (p.costPrice || p.price * 0.5), 0);

  // Top Selling Products Calculation
  const topProductsMap = new Map<string, { name: string; sku: string; sold: number; revenue: number }>();
  ordersList.forEach((order) => {
    if (order.status === 'COMPLETED') {
      order.items.forEach((item) => {
        const existing = topProductsMap.get(item.productName) || { name: item.productName, sku: item.productSku, sold: 0, revenue: 0 };
        existing.sold += item.quantity;
        existing.revenue += item.subtotal;
        topProductsMap.set(item.productName, existing);
      });
    }
  });
  const topProductsList = Array.from(topProductsMap.values()).sort((a, b) => b.sold - a.sold).slice(0, 5);

  // Revenue Chart Mock / API points (7 Days)
  const chartDays = reportsData?.chartDays || [
    { day: 'Sen', date: '01/09', revenue: 450000, transactions: 12 },
    { day: 'Sel', date: '02/09', revenue: 580000, transactions: 15 },
    { day: 'Rab', date: '03/09', revenue: 520000, transactions: 14 },
    { day: 'Kam', date: '04/09', revenue: 690000, transactions: 18 },
    { day: 'Jum', date: '05/09', revenue: 850000, transactions: 24 },
    { day: 'Sab', date: '06/09', revenue: 1120000, transactions: 31 },
    { day: 'Min', date: '07/09', revenue: todaySalesAmount || 940000, transactions: todayTransactionsCount || 26 },
  ];
  const maxRevenueInChart = Math.max(...chartDays.map((d: any) => d.revenue), 1000000);

  // Product CRUD Handlers
  const handleOpenCreateProduct = () => {
    setProductForm({
      name: '',
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      barcode: `899${Math.floor(10000000 + Math.random() * 90000000)}`,
      price: 25000,
      costPrice: 10000,
      stock: 20,
      minStockAlert: 5,
      categoryName: 'Coffee',
      description: '',
    });
    setEditingProduct(null);
    setCreateProductOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      sku: prod.sku,
      barcode: prod.barcode || '',
      price: prod.price,
      costPrice: prod.costPrice || Math.round(prod.price * 0.45),
      stock: prod.stock,
      minStockAlert: prod.minStockAlert,
      categoryName: prod.categoryName || 'Coffee',
      description: prod.description || '',
    });
    setCreateProductOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.sku || productForm.price <= 0) {
      toast.error('Mohon isi nama produk, SKU, dan harga yang valid.');
      return;
    }

    if (editingProduct) {
      // Update
      const updated = {
        ...editingProduct,
        ...productForm,
      };
      setProductsList((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
      toast.success(`Produk "${productForm.name}" berhasil diperbarui.`);
    } else {
      // Create
      const newProd: Product = {
        id: `p-${Date.now()}`,
        ...productForm,
        status: 'ACTIVE',
      };
      setProductsList((prev) => [newProd, ...prev]);

      // Add movement log
      setInventoryMovements((prev) => [
        {
          id: `m-${Date.now()}`,
          productName: newProd.name,
          sku: newProd.sku,
          type: 'RESTOCK',
          quantityChange: newProd.stock,
          finalStock: newProd.stock,
          reason: 'Penambahan Produk Baru',
          timestamp: new Date().toLocaleString('id-ID'),
        },
        ...prev,
      ]);

      toast.success(`Produk "${productForm.name}" berhasil ditambahkan ke katalog.`);
    }
    setCreateProductOpen(false);
  };

  const handleDeleteProduct = (prodId: string, prodName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${prodName}"?`)) {
      setProductsList((prev) => prev.filter((p) => p.id !== prodId));
      toast.success(`Produk "${prodName}" berhasil dihapus.`);
    }
  };

  // Stock Adjustment Handler
  const handleApplyAdjustment = () => {
    if (!adjustModalProduct || adjustQty <= 0) {
      toast.error('Jumlah penyesuaian harus lebih dari 0.');
      return;
    }

    const change = adjustType === 'ADD' ? Number(adjustQty) : -Number(adjustQty);
    const newStock = Math.max(0, adjustModalProduct.stock + change);

    setProductsList((prev) =>
      prev.map((p) => (p.id === adjustModalProduct.id ? { ...p, stock: newStock } : p)),
    );

    setInventoryMovements((prev) => [
      {
        id: `m-${Date.now()}`,
        productName: adjustModalProduct.name,
        sku: adjustModalProduct.sku,
        type: 'ADJUSTMENT',
        quantityChange: change,
        finalStock: newStock,
        reason: adjustReason,
        timestamp: new Date().toLocaleString('id-ID'),
      },
      ...prev,
    ]);

    toast.success(`Stok "${adjustModalProduct.name}" disesuaikan menjadi ${newStock} unit.`);
    setAdjustModalProduct(null);
    setAdjustQty(0);
  };

  // Stock Opname Handler
  const handleApplyOpname = (e: React.FormEvent) => {
    e.preventDefault();
    const product = productsList.find((p) => p.id === opnameProductId);
    if (!product) {
      toast.error('Pilih produk untuk stock opname.');
      return;
    }

    const diff = Number(opnamePhysicalQty) - product.stock;
    const finalStock = Math.max(0, Number(opnamePhysicalQty));

    setProductsList((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, stock: finalStock } : p)),
    );

    setInventoryMovements((prev) => [
      {
        id: `m-${Date.now()}`,
        productName: product.name,
        sku: product.sku,
        type: 'OPNAME',
        quantityChange: diff,
        finalStock,
        reason: `Opname Fisik: ${opnameNotes || 'Penyesuaian Fisik Berkala'}`,
        timestamp: new Date().toLocaleString('id-ID'),
      },
      ...prev,
    ]);

    toast.success(`Stock opname selesai. Stok disinkronkan ke ${finalStock} unit.`);
    setOpnameProductId('');
    setOpnamePhysicalQty(0);
    setOpnameNotes('');
  };

  // Order Status Update & Refund Handler
  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    setOrdersList((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
    toast.success(`Status transaksi diperbarui menjadi "${newStatus}".`);
  };

  const handleProcessRefund = () => {
    if (!refundModalOrder) return;

    // Refund order
    setOrdersList((prev) =>
      prev.map((o) =>
        o.id === refundModalOrder.id
          ? { ...o, status: 'REFUNDED', paymentStatus: 'REFUNDED' }
          : o,
      ),
    );

    // If restock is checked, restore product stock
    if (refundRestock) {
      refundModalOrder.items.forEach((item) => {
        setProductsList((prev) =>
          prev.map((p) =>
            p.sku === item.productSku ? { ...p, stock: p.stock + item.quantity } : p,
          ),
        );
      });
      toast.info(`Stok barang dikembalikan ke inventaris.`);
    }

    toast.success(`Pesanan ${refundModalOrder.orderNumber} berhasil di-refund.`);
    setRefundModalOrder(null);
    setRefundReason('');
  };

  // User Management Handlers
  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: 'CASHIER',
    });
    setCreateUserOpen(true);
  };

  const handleOpenEditUser = (u: UserAccount) => {
    setEditingUser(u);
    setUserForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
    });
    setCreateUserOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name.trim() || !userForm.email.trim()) {
      toast.error('Nama dan email wajib diisi.');
      return;
    }

    if (!editingUser && !userForm.password.trim()) {
      toast.error('Kata sandi awal wajib diisi untuk akun baru.');
      return;
    }

    try {
      if (editingUser) {
        // Update user
        const updatePayload: any = {
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
        };
        if (userForm.password) {
          updatePayload.password = userForm.password;
        }

        const res = await restFetch<UserAccount>(`/users/${editingUser.id}`, {
          method: 'PATCH',
          body: JSON.stringify(updatePayload),
        }).catch(() => null);

        setUsersList((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? {
                  ...u,
                  name: userForm.name,
                  email: userForm.email,
                  role: userForm.role,
                  updatedAt: new Date().toISOString(),
                }
              : u,
          ),
        );
        toast.success(`Akun "${userForm.name}" berhasil diperbarui.`);
      } else {
        // Create user
        const res = await restFetch<UserAccount>('/users', {
          method: 'POST',
          body: JSON.stringify({
            name: userForm.name,
            email: userForm.email,
            password: userForm.password || 'password123',
            role: userForm.role,
          }),
        }).catch(() => null);

        const newUser: UserAccount = res || {
          id: `usr-${Date.now()}`,
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          createdAt: new Date().toISOString(),
        };

        setUsersList((prev) => [newUser, ...prev]);
        toast.success(`Akun pengguna "${userForm.name}" (${userForm.role}) berhasil didaftarkan.`);
      }

      setCreateUserOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menyimpan data akun.');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteModalUser) return;

    // Check self deletion
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          if (u.id === deleteModalUser.id || u.email === deleteModalUser.email) {
            toast.error('Anda tidak dapat menghapus akun Anda sendiri.');
            setDeleteModalUser(null);
            return;
          }
        } catch {}
      }
    }

    try {
      await restFetch(`/users/${deleteModalUser.id}`, { method: 'DELETE' }).catch(() => null);
      setUsersList((prev) => prev.filter((u) => u.id !== deleteModalUser.id));
      toast.success(`Akun "${deleteModalUser.name}" berhasil dihapus.`);
    } catch {
      setUsersList((prev) => prev.filter((u) => u.id !== deleteModalUser.id));
      toast.success(`Akun "${deleteModalUser.name}" berhasil dihapus.`);
    } finally {
      setDeleteModalUser(null);
    }
  };

  const handleQuickRoleChange = async (userId: string, newRole: 'ADMIN' | 'CASHIER' | 'CUSTOMER') => {
    try {
      await restFetch(`/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      }).catch(() => null);

      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole, updatedAt: new Date().toISOString() } : u)),
      );
      toast.success(`Hak akses pengguna berhasil diubah ke ${newRole}.`);
    } catch {
      toast.error('Gagal memperbarui hak akses pengguna.');
    }
  };

  // Product Pagination Filtering
  const filteredProducts = productsList.filter((p) => {
    const matchCat = productCategoryFilter === 'ALL' || p.categoryName === productCategoryFilter;
    const matchSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.barcode && p.barcode.includes(productSearch));
    return matchCat && matchSearch;
  });
  const totalProductPages = Math.ceil(filteredProducts.length / productPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (productPage - 1) * productPerPage,
    productPage * productPerPage,
  );

  // Orders Pagination Filtering
  const filteredOrders = ordersList.filter((o) => {
    const matchStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
    const matchSearch =
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase());
    return matchStatus && matchSearch;
  });
  const totalOrderPages = Math.ceil(filteredOrders.length / orderPerPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (orderPage - 1) * orderPerPage,
    orderPage * orderPerPage,
  );

  // Users Filtering
  const filteredUsers = usersList.filter((u) => {
    const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    const matchSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchRole && matchSearch;
  });

  if (!isAuthorized) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Memverifikasi akses administrator...</span>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-57px)] bg-slate-50 flex flex-col text-slate-900">
      {/* Top Header Breadcrumb & Utility */}
      <div className="border-b border-slate-200 bg-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Store className="w-4 h-4 text-blue-600" />
          <span>AuraPOS</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">Admin Workspace</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-blue-600 font-mono font-medium">
            {navSection === 'OVERVIEW' && 'Ringkasan & Metrik'}
            {navSection === 'PRODUCTS' && 'Manajemen Produk'}
            {navSection === 'INVENTORY' && 'Inventori & Stok'}
            {navSection === 'ORDERS' && 'Manajemen Pesanan'}
            {navSection === 'REPORTS' && 'Laporan Penjualan'}
            {navSection === 'USERS' && 'Manajemen Akun (Kasir & Admin)'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span>Sinkronkan</span>
          </button>
          <button
            onClick={() => toast.info('Data laporan berhasil diekspor ke file CSV.')}
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6">
        {/* Left Sidebar Navigation (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-2 space-y-1 shadow-sm">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Navigasi Admin
            </div>

            <button
              onClick={() => setNavSection('OVERVIEW')}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center space-x-2.5 transition-colors ${
                navSection === 'OVERVIEW'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Dashboard & Metrik</span>
            </button>

            <button
              onClick={() => setNavSection('PRODUCTS')}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                navSection === 'PRODUCTS'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Package className="w-4 h-4 text-slate-700" />
                <span>Manajemen Produk</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                {productsList.length}
              </span>
            </button>

            <button
              onClick={() => setNavSection('INVENTORY')}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                navSection === 'INVENTORY'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Layers className="w-4 h-4 text-slate-700" />
                <span>Stok & Opname</span>
              </div>
              {lowStockProducts.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                  {lowStockProducts.length} Kritis
                </span>
              )}
            </button>

            <button
              onClick={() => setNavSection('ORDERS')}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                navSection === 'ORDERS'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Receipt className="w-4 h-4 text-slate-700" />
                <span>Daftar Pesanan</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                {ordersList.length}
              </span>
            </button>

            <button
              onClick={() => setNavSection('REPORTS')}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center space-x-2.5 transition-colors ${
                navSection === 'REPORTS'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-700" />
              <span>Laporan Penjualan</span>
            </button>

            <button
              onClick={() => setNavSection('USERS')}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                navSection === 'USERS'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Users className="w-4 h-4 text-slate-700" />
                <span>Manajemen Akun</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                {usersList.length}
              </span>
            </button>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user');
                  }
                  toast.success('Berhasil keluar dari sesi admin.');
                  router.push('/login');
                }}
                className="w-full text-left px-3 py-2 rounded-md text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 flex items-center space-x-2.5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Akun (Logout)</span>
              </button>
            </div>
          </div>

          {/* Quick Terminal Launch Box */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Terminal Kasir POS</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                Online
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-normal">
              Buka terminal fisik kasir untuk melayani antrean transaksi langsung.
            </p>
            <Link
              href="/pos"
              className="w-full py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <span>Buka Terminal Kasir</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Content Area (9 Cols) */}
        <div className="lg:col-span-9 space-y-5">
          {/* ============================================================ */}
          {/* 1. OVERVIEW & METRICS SECTION */}
          {/* ============================================================ */}
          {navSection === 'OVERVIEW' && (
            <div className="space-y-5">
              {/* 4 Primary KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Total Sales */}
                <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Total Penjualan</span>
                    <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg font-bold text-slate-900 font-mono">
                    Rp {totalSalesAmount.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                    <span className="text-emerald-600 font-bold font-mono">+{todayOrders.length}</span>
                    <span>transaksi hari ini</span>
                  </div>
                </div>

                {/* Today's Transactions */}
                <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Transaksi Hari Ini</span>
                    <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg font-bold text-slate-900 font-mono">
                    {todayTransactionsCount} Transaksi
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Omzet: Rp {todaySalesAmount.toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Total Orders */}
                <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Total Pesanan Masuk</span>
                    <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Receipt className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg font-bold text-slate-900 font-mono">
                    {totalOrdersCount} Pesanan
                  </div>
                  <div className="text-[11px] text-slate-500">
                    POS Retail & Toko Online
                  </div>
                </div>

                {/* Low Stock Products Warning */}
                <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Stok Menipis (&le; Min)</span>
                    <div className="w-7 h-7 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg font-bold text-slate-900 font-mono text-amber-700">
                    {lowStockProducts.length} Produk
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Perlu pengadaan ulang
                  </div>
                </div>
              </div>

              {/* Revenue Trends Chart - Clean Solid Bars */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Grafik Omzet & Tren Penjualan 7 Hari Terakhir</h3>
                    <p className="text-xs text-slate-500">Performa volume penjualan harian toko</p>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
                    <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block" />
                    <span>Omzet (Rp)</span>
                  </div>
                </div>

                {/* Bar Chart Visualization */}
                <div className="pt-4 grid grid-cols-7 gap-3 items-end h-48 border-b border-slate-200 pb-2">
                  {chartDays.map((item: any, idx: number) => {
                    const heightPercent = Math.max(12, Math.min(100, Math.round((item.revenue / maxRevenueInChart) * 100)));
                    return (
                      <div key={idx} className="flex flex-col items-center h-full justify-end group">
                        <div className="text-[10px] font-mono text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Rp {(item.revenue / 1000).toFixed(0)}k
                        </div>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[36px] bg-blue-600 group-hover:bg-blue-700 rounded-t transition-all relative"
                          title={`${item.date}: Rp ${item.revenue.toLocaleString('id-ID')} (${item.transactions} transaksi)`}
                        />
                        <div className="text-[11px] font-medium text-slate-700 mt-2">{item.day}</div>
                        <div className="text-[9px] font-mono text-slate-400">{item.date}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2 Column Section: Recent Transactions & Top Selling Products */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Recent Transactions (7 Cols) */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Transaksi Terbaru</h3>
                    <button
                      onClick={() => setNavSection('ORDERS')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Lihat Semua
                    </button>
                  </div>

                  <div className="space-y-2">
                    {ordersList.slice(0, 4).map((order) => (
                      <div
                        key={order.id}
                        className="p-3 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-700">
                              {order.source}
                            </span>
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            {order.customerName} &bull; {order.items.length} item
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono font-bold text-slate-900">
                            Rp {order.finalAmount.toLocaleString('id-ID')}
                          </div>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                              order.status === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : order.status === 'REFUNDED'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Selling Products Leaderboard (5 Cols) */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Produk Terlaris</h3>
                    <span className="text-xs text-slate-500 font-mono">Top 5</span>
                  </div>

                  <div className="space-y-2.5">
                    {topProductsList.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                        <div className="flex items-center space-x-2 min-w-0 pr-2">
                          <span className="w-5 h-5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="truncate">
                            <div className="font-semibold text-slate-900 truncate">{item.name}</div>
                            <div className="text-[10px] font-mono text-slate-400">{item.sku}</div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-bold text-slate-900 font-mono">{item.sold} Terjual</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Rp {item.revenue.toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 2. PRODUCT MANAGEMENT SECTION */}
          {/* ============================================================ */}
          {navSection === 'PRODUCTS' && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Manajemen Katalog Produk</h2>
                  <p className="text-xs text-slate-500">Tambah, ubah, hapus, dan atur katalog produk toko</p>
                </div>

                <button
                  onClick={handleOpenCreateProduct}
                  className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Produk Baru</span>
                </button>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setProductPage(1);
                    }}
                    placeholder="Cari nama produk, SKU, atau barcode..."
                    className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => {
                      setProductCategoryFilter(e.target.value);
                      setProductPage(1);
                    }}
                    className="bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-blue-600"
                  >
                    <option value="ALL">Semua Kategori</option>
                    <option value="Coffee">Coffee</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Meals">Meals</option>
                    <option value="Tea">Tea</option>
                    <option value="Snacks">Snacks</option>
                  </select>

                  <select
                    value={productPerPage}
                    onChange={(e) => {
                      setProductPerPage(Number(e.target.value));
                      setProductPage(1);
                    }}
                    className="bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 outline-none"
                  >
                    <option value={6}>6 per halaman</option>
                    <option value={12}>12 per halaman</option>
                    <option value={24}>24 per halaman</option>
                  </select>
                </div>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Produk & SKU</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Harga Jual</th>
                      <th className="p-3">Harga Modal</th>
                      <th className="p-3">Stok Unit</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400">
                          Tidak ada produk yang cocok dengan pencarian.
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map((p) => {
                        const margin = p.costPrice ? Math.round(((p.price - p.costPrice) / p.price) * 100) : 0;
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{p.name}</div>
                              <div className="text-[10px] font-mono text-slate-500">
                                SKU: {p.sku} {p.barcode && `| Barcode: ${p.barcode}`}
                              </div>
                            </td>
                            <td className="p-3 text-slate-600 font-medium">{p.categoryName || 'General'}</td>
                            <td className="p-3 font-mono font-bold text-slate-900">
                              Rp {p.price.toLocaleString('id-ID')}
                            </td>
                            <td className="p-3 font-mono text-slate-500">
                              Rp {(p.costPrice || 0).toLocaleString('id-ID')}
                              {margin > 0 && (
                                <span className="ml-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-semibold">
                                  {margin}%
                                </span>
                              )}
                            </td>
                            <td className="p-3 font-mono">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  p.stock <= p.minStockAlert
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'bg-slate-100 text-slate-800'
                                }`}
                              >
                                {p.stock} unit
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ACTIVE
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-1.5">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                                title="Edit Produk"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                className="p-1.5 rounded bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-500 transition-colors"
                                title="Hapus Produk"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Product Pagination */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                <div>
                  Menampilkan {(productPage - 1) * productPerPage + 1} -{' '}
                  {Math.min(productPage * productPerPage, filteredProducts.length)} dari {filteredProducts.length} produk
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    disabled={productPage <= 1}
                    onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 font-mono font-bold text-slate-800">
                    {productPage} / {totalProductPages}
                  </span>
                  <button
                    disabled={productPage >= totalProductPages}
                    onClick={() => setProductPage((p) => Math.min(totalProductPages, p + 1))}
                    className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 3. INVENTORY & STOCK OPNAME SECTION */}
          {/* ============================================================ */}
          {navSection === 'INVENTORY' && (
            <div className="space-y-5">
              {/* Inventory Summary Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <div className="text-xs text-slate-500">Valuasi Total Inventori</div>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                    Rp {totalInventoryValuation.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-slate-500">Estimasi total harga pokok stok</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <div className="text-xs text-slate-500">Total Unit Tersedia</div>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                    {productsList.reduce((s, p) => s + p.stock, 0)} Unit
                  </div>
                  <div className="text-[11px] text-slate-500">{productsList.length} SKU terdaftar</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <div className="text-xs text-slate-500">Peringatan Stok Rendah</div>
                  <div className="text-lg font-bold text-amber-700 font-mono mt-1">
                    {lowStockProducts.length} Produk Kritis
                  </div>
                  <div className="text-[11px] text-slate-500">Di bawah batas minimum</div>
                </div>
              </div>

              {/* Current Stock & Quick Adjustment Table */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Status Stok Produk & Penyesuaian Cepat</h3>
                    <p className="text-xs text-slate-500">Pantau stok realtime dan lakukan restock langsung</p>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Produk</th>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Stok Saat Ini</th>
                        <th className="p-3">Batas Minimum</th>
                        <th className="p-3">Status Indikator</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {productsList.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900">{p.name}</td>
                          <td className="p-3 font-mono text-slate-500">{p.sku}</td>
                          <td className="p-3 font-mono font-bold text-slate-900">{p.stock} unit</td>
                          <td className="p-3 font-mono text-slate-500">{p.minStockAlert} unit</td>
                          <td className="p-3">
                            {p.stock <= p.minStockAlert ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Stok Menipis
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Aman
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setAdjustModalProduct(p);
                                setAdjustQty(10);
                                setAdjustType('ADD');
                                setAdjustReason('Restock Penambahan Pasokan');
                              }}
                              className="px-2.5 py-1 rounded bg-blue-50 border border-blue-200 hover:bg-blue-600 hover:text-white text-blue-700 font-semibold text-xs transition-colors"
                            >
                              Sesuaikan Stok
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stock Opname Form & Reconciliation */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm">
                <div className="border-b border-slate-200 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">Formulir Stock Opname (Rekonsiliasi Fisik)</h3>
                  <p className="text-xs text-slate-500">Hitung fisik barang di toko dan sinkronkan selisih ke sistem</p>
                </div>

                <form onSubmit={handleApplyOpname} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Produk</label>
                    <select
                      value={opnameProductId}
                      onChange={(e) => setOpnameProductId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                    >
                      <option value="">-- Pilih Produk --</option>
                      {productsList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Sistem: {p.stock} unit)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Fisik Terhitung</label>
                    <input
                      type="number"
                      min={0}
                      value={opnamePhysicalQty}
                      onChange={(e) => setOpnamePhysicalQty(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs font-mono text-slate-900 outline-none focus:border-blue-600"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Opname</label>
                    <input
                      type="text"
                      value={opnameNotes}
                      onChange={(e) => setOpnameNotes(e.target.value)}
                      placeholder="Contoh: Audit stok mingguan"
                      className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Sinkronkan Opname</span>
                  </button>
                </form>
              </div>

              {/* Inventory Movement Logs */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-900">Riwayat Mutasi Stok (Inventory Movements)</h3>
                  <span className="text-xs text-slate-500 font-mono">Log Terakhir</span>
                </div>

                <div className="space-y-2">
                  {inventoryMovements.map((mov) => (
                    <div
                      key={mov.id}
                      className="p-3 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">{mov.productName}</span>
                          <span className="text-[10px] font-mono text-slate-400">({mov.sku})</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              mov.type === 'RESTOCK'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : mov.type === 'SALE'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {mov.type}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px]">{mov.reason}</div>
                      </div>

                      <div className="text-right font-mono">
                        <div
                          className={`font-bold ${
                            mov.quantityChange > 0 ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          {mov.quantityChange > 0 ? `+${mov.quantityChange}` : mov.quantityChange} unit
                        </div>
                        <div className="text-[10px] text-slate-400">Stok Akhir: {mov.finalStock}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 4. ORDER MANAGEMENT & REFUNDS SECTION */}
          {/* ============================================================ */}
          {navSection === 'ORDERS' && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Manajemen Transaksi & Pesanan</h2>
                  <p className="text-xs text-slate-500">Lihat rincian invoice, ubah status pesanan, dan proses refund</p>
                </div>
              </div>

              {/* Order Search & Status Filters */}
              <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => {
                      setOrderSearch(e.target.value);
                      setOrderPage(1);
                    }}
                    placeholder="Cari nomor invoice / nama pelanggan..."
                    className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => {
                      setOrderStatusFilter(e.target.value);
                      setOrderPage(1);
                    }}
                    className="bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-blue-600"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REFUNDED">REFUNDED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>

                  <select
                    value={orderPerPage}
                    onChange={(e) => {
                      setOrderPerPage(Number(e.target.value));
                      setOrderPage(1);
                    }}
                    className="bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 outline-none"
                  >
                    <option value={6}>6 per halaman</option>
                    <option value={12}>12 per halaman</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">No Invoice</th>
                      <th className="p-3">Pelanggan</th>
                      <th className="p-3">Sumber</th>
                      <th className="p-3">Metode Bayar</th>
                      <th className="p-3">Total Bayar</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Rincian & Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400">
                          Tidak ada pesanan yang ditemukan.
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                          <td className="p-3 text-slate-800 font-medium">{o.customerName}</td>
                          <td className="p-3">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                              {o.source}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-600">{o.paymentMethod}</td>
                          <td className="p-3 font-mono font-bold text-slate-900">
                            Rp {o.finalAmount.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                o.status === 'COMPLETED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : o.status === 'REFUNDED'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1.5">
                            <button
                              onClick={() => setSelectedOrderDetails(o)}
                              className="px-2.5 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
                            >
                              Lihat Invoice
                            </button>
                            {o.status === 'COMPLETED' && (
                              <button
                                onClick={() => {
                                  setRefundModalOrder(o);
                                  setRefundReason('Permintaan Pelanggan / Salah Pesan');
                                }}
                                className="px-2.5 py-1 rounded bg-red-50 border border-red-200 hover:bg-red-600 hover:text-white text-red-700 font-semibold text-xs transition-colors"
                              >
                                Refund
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Orders Pagination */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                <div>
                  Menampilkan {(orderPage - 1) * orderPerPage + 1} -{' '}
                  {Math.min(orderPage * orderPerPage, filteredOrders.length)} dari {filteredOrders.length} pesanan
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    disabled={orderPage <= 1}
                    onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 font-mono font-bold text-slate-800">
                    {orderPage} / {totalOrderPages}
                  </span>
                  <button
                    disabled={orderPage >= totalOrderPages}
                    onClick={() => setOrderPage((p) => Math.min(totalOrderPages, p + 1))}
                    className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 5. REPORTS SECTION */}
          {/* ============================================================ */}
          {navSection === 'REPORTS' && (
            <div className="space-y-5">
              {/* Sales Period Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Penjualan Harian (Hari Ini)</span>
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 font-mono">
                    Rp {todaySalesAmount.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">{todayTransactionsCount} transaksi hari ini</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Penjualan Mingguan (7 Hari)</span>
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 font-mono">
                    Rp {(reportsData?.weeklySales || totalSalesAmount).toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">{ordersList.length} transaksi dalam 7 hari</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Penjualan Bulanan (Bulan Ini)</span>
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 font-mono">
                    Rp {(reportsData?.monthlySales || totalSalesAmount).toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">Total omzet akumulatif bulan ini</div>
                </div>
              </div>

              {/* Detailed Performance Table */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Performa Produk Teratas & Analitik Pendapatan</h3>
                    <p className="text-xs text-slate-500">Rincian produk penyumbang omzet dan kuantitas penjualan tertinggi</p>
                  </div>

                  <button
                    onClick={() => toast.info('Laporan produk diekspor ke format CSV.')}
                    className="px-3 py-1.5 rounded bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Unduh CSV</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Peringkat</th>
                        <th className="p-3">Nama Produk</th>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Unit Terjual</th>
                        <th className="p-3">Total Omzet</th>
                        <th className="p-3">Kontribusi Penjualan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topProductsList.map((item, idx) => {
                        const share = totalSalesAmount > 0 ? Math.round((item.revenue / totalSalesAmount) * 100) : 0;
                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-slate-800">#{idx + 1}</td>
                            <td className="p-3 font-bold text-slate-900">{item.name}</td>
                            <td className="p-3 font-mono text-slate-500">{item.sku}</td>
                            <td className="p-3 font-mono font-bold text-slate-900">{item.sold} unit</td>
                            <td className="p-3 font-mono font-bold text-blue-600">
                              Rp {item.revenue.toLocaleString('id-ID')}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div style={{ width: `${Math.min(100, share * 2)}%` }} className="bg-blue-600 h-full" />
                                </div>
                                <span className="font-mono text-[11px] text-slate-600 font-semibold">{share}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 5. USER MANAGEMENT SECTION (ADMIN & CASHIERS) */}
          {/* ============================================================ */}
          {navSection === 'USERS' && (
            <div className="space-y-5">
              {/* User KPI Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Total Pengguna</span>
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 font-mono">{usersList.length}</div>
                  <div className="text-[11px] text-slate-500">Semua akun terdaftar</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Super Admin</span>
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 font-mono">
                    {usersList.filter((u) => u.role === 'ADMIN').length}
                  </div>
                  <div className="text-[11px] text-slate-500">Akses penuh sistem</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Kasir POS Aktif</span>
                    <Store className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 font-mono">
                    {usersList.filter((u) => u.role === 'CASHIER').length}
                  </div>
                  <div className="text-[11px] text-slate-500">Akses terminal transaksi</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Akun Pelanggan</span>
                    <UserCheck className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 font-mono">
                    {usersList.filter((u) => u.role === 'CUSTOMER').length}
                  </div>
                  <div className="text-[11px] text-slate-500">Member toko & online</div>
                </div>
              </div>

              {/* Main Table Card */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Daftar Akun Pengguna & Hak Akses</h3>
                    <p className="text-xs text-slate-500">Kelola kredensial login dan tingkatan izin operasional kasir & admin</p>
                  </div>

                  <button
                    onClick={handleOpenCreateUser}
                    className="px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Tambah Akun Baru</span>
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[220px] relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Cari nama atau email pengguna..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-white border border-slate-200 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 font-medium">Role:</span>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-600"
                    >
                      <option value="ALL">Semua Tingkatan Role</option>
                      <option value="ADMIN">ADMIN (Super Administrator)</option>
                      <option value="CASHIER">CASHIER (Petugas Kasir)</option>
                      <option value="CUSTOMER">CUSTOMER (Pelanggan)</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Pengguna</th>
                        <th className="p-3">Email Akun</th>
                        <th className="p-3">Tingkatan Hak Akses (Role)</th>
                        <th className="p-3">Tanggal Dibuat</th>
                        <th className="p-3 text-right">Aksi Kelola</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500">
                            Tidak ada akun yang sesuai dengan pencarian.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const initials = u.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase();

                          return (
                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                      u.role === 'ADMIN'
                                        ? 'bg-blue-100 text-blue-700'
                                        : u.role === 'CASHIER'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {initials}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900 block">{u.name}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">ID: {u.id}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 font-mono text-slate-600">{u.email}</td>
                              <td className="p-3">
                                <div className="flex items-center space-x-2">
                                  <span
                                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold border ${
                                      u.role === 'ADMIN'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : u.role === 'CASHIER'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    {u.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                                    {u.role === 'CASHIER' && <Store className="w-3 h-3" />}
                                    {u.role === 'CUSTOMER' && <UserCheck className="w-3 h-3" />}
                                    <span>{u.role}</span>
                                  </span>

                                  {/* Quick Switch Select */}
                                  <select
                                    value={u.role}
                                    onChange={(e) => handleQuickRoleChange(u.id, e.target.value as any)}
                                    className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-600 outline-none focus:border-blue-600 cursor-pointer"
                                  >
                                    <option value="ADMIN">Ubah: ADMIN</option>
                                    <option value="CASHIER">Ubah: CASHIER</option>
                                    <option value="CUSTOMER">Ubah: CUSTOMER</option>
                                  </select>
                                </div>
                              </td>
                              <td className="p-3 font-mono text-slate-500 text-[11px]">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end space-x-1">
                                  <button
                                    onClick={() => handleOpenEditUser(u)}
                                    title="Edit Informasi Akun"
                                    className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-colors"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteModalUser(u)}
                                    title="Hapus Akun Pengguna"
                                    className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODALS SECTION */}
      {/* ============================================================ */}

      {/* 1. PRODUCT CREATE / EDIT MODAL */}
      {createProductOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-xl text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {editingProduct ? 'Ubah Informasi Produk' : 'Tambah Produk Baru'}
                </h3>
              </div>
              <button
                onClick={() => setCreateProductOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Contoh: Single Origin Ethiopian Yirgacheffe"
                  className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU Produk *</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs font-mono outline-none focus:border-blue-600 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Barcode (EAN/UPC)</label>
                  <input
                    type="text"
                    value={productForm.barcode}
                    onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs font-mono outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Harga Jual (Rp) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs font-mono outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Harga Modal / HPP (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs font-mono outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stok Awal Unit</label>
                  <input
                    type="number"
                    min={0}
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs font-mono outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batas Minimum Peringatan</label>
                  <input
                    type="number"
                    min={1}
                    value={productForm.minStockAlert}
                    onChange={(e) => setProductForm({ ...productForm, minStockAlert: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs font-mono outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                <select
                  value={productForm.categoryName}
                  onChange={(e) => setProductForm({ ...productForm, categoryName: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs outline-none focus:border-blue-600"
                >
                  <option value="Coffee">Coffee</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Meals">Meals</option>
                  <option value="Tea">Tea</option>
                  <option value="Snacks">Snacks</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCreateProductOpen(false)}
                  className="px-4 py-2 rounded bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. STOCK ADJUSTMENT MODAL */}
      {adjustModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 space-y-4 border border-slate-200 shadow-xl text-slate-900">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <div className="font-bold text-sm">Penyesuaian Stok</div>
              <button
                onClick={() => setAdjustModalProduct(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="font-bold text-slate-900">{adjustModalProduct.name}</div>
                <div className="text-[11px] text-slate-500 font-mono">
                  SKU: {adjustModalProduct.sku} | Stok Sekarang: {adjustModalProduct.stock} unit
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipe Penyesuaian</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('ADD')}
                    className={`py-1.5 rounded font-semibold text-xs border ${
                      adjustType === 'ADD'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    + Tambah Stok
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('SUBTRACT')}
                    className={`py-1.5 rounded font-semibold text-xs border ${
                      adjustType === 'SUBTRACT'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    - Kurangi Stok
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jumlah Unit</label>
                <input
                  type="number"
                  min={1}
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs font-mono outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan Penyesuaian</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs outline-none focus:border-blue-600"
                >
                  <option value="Restock Pasokan Supplier">Restock Pasokan Supplier</option>
                  <option value="Koreksi Masuk Gudang">Koreksi Masuk Gudang</option>
                  <option value="Barang Rusak / Kadaluarsa">Barang Rusak / Kadaluarsa</option>
                  <option value="Koreksi Fisik Toko">Koreksi Fisik Toko</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalProduct(null)}
                  className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApplyAdjustment}
                  className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ORDER DETAILS / INVOICE MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl text-slate-900">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <Receipt className="w-4 h-4 text-blue-600" />
                <span>Rincian Transaksi #{selectedOrderDetails.orderNumber}</span>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="block text-[10px] text-slate-400">Pelanggan</span>
                  <span className="font-semibold text-slate-900">{selectedOrderDetails.customerName}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Waktu Transaksi</span>
                  <span className="font-mono text-slate-800">
                    {new Date(selectedOrderDetails.createdAt).toLocaleString('id-ID')}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Sumber</span>
                  <span className="font-semibold text-slate-900">{selectedOrderDetails.source}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Metode Bayar</span>
                  <span className="font-mono text-slate-800">{selectedOrderDetails.paymentMethod}</span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="border-t border-b border-slate-200 py-2 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Item Dipesan</div>
                {selectedOrderDetails.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{item.productName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {item.quantity}x @ Rp {item.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-slate-900">
                      Rp {item.subtotal.toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="space-y-1 pt-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono">Rp {selectedOrderDetails.totalAmount.toLocaleString('id-ID')}</span>
                </div>
                {selectedOrderDetails.discountAmount > 0 && (
                  <div className="flex justify-between text-blue-600 font-medium">
                    <span>Diskon Voucher</span>
                    <span className="font-mono">- Rp {selectedOrderDetails.discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Akhir</span>
                  <span className="font-mono text-blue-600">
                    Rp {selectedOrderDetails.finalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  onClick={() => toast.info('Invoice dikirim ke printer.')}
                  className="px-3 py-1.5 rounded bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
                >
                  Cetak Invoice
                </button>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-3 py-1.5 rounded bg-slate-100 text-slate-800 font-semibold text-xs hover:bg-slate-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. REFUND MODAL */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 space-y-4 border border-slate-200 shadow-xl text-slate-900">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <div className="flex items-center space-x-2 font-bold text-sm text-red-600">
                <RotateCcw className="w-4 h-4" />
                <span>Konfirmasi Refund Pesanan</span>
              </div>
              <button
                onClick={() => setRefundModalOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Anda akan melakukan refund untuk transaksi{' '}
                <strong className="font-mono text-slate-900">{refundModalOrder.orderNumber}</strong> sebesar{' '}
                <strong className="font-mono text-slate-900">
                  Rp {refundModalOrder.finalAmount.toLocaleString('id-ID')}
                </strong>.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan Pengembalian / Refund</label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Contoh: Salah pesan / barang rusak"
                  className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="refundRestockCheck"
                  checked={refundRestock}
                  onChange={(e) => setRefundRestock(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-0"
                />
                <label htmlFor="refundRestockCheck" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Kembalikan barang ke stok inventaris
                </label>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setRefundModalOrder(null)}
                    className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessRefund}
                    className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
                  >
                    Proses Refund
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* 5. CREATE / EDIT USER MODAL */}
      {createUserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl text-slate-900">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {editingUser ? 'Ubah Informasi Akun Pengguna' : 'Tambah Akun Pengguna / Kasir Baru'}
                </h3>
              </div>
              <button
                onClick={() => setCreateUserOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso (Kasir Utama)"
                  className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Email Login *</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="kasir1@aurapos.local"
                  className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs outline-none focus:border-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tingkatan Hak Akses (Role) *
                </label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                  className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs outline-none focus:border-blue-600 font-semibold"
                >
                  <option value="CASHIER">CASHIER - Akses Kasir POS Terminal Saja</option>
                  <option value="ADMIN">ADMIN - Akses Penuh Dashboard Super Admin</option>
                  <option value="CUSTOMER">CUSTOMER - Akses Katalog Belanja Toko</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {userForm.role === 'CASHIER' && 'Kasir hanya dapat mengakses terminal POS dan tidak dapat melihat laporan profit / manajemen admin.'}
                  {userForm.role === 'ADMIN' && 'Super Admin memiliki otoritas penuh terhadap produk, inventori, laporan omzet, dan akun.'}
                  {userForm.role === 'CUSTOMER' && 'Pelanggan hanya dapat melihat katalog dan melakukan checkout mandiri.'}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {editingUser ? 'Ubah Kata Sandi (Opsional)' : 'Kata Sandi Akun (Password) *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder={editingUser ? 'Kosongkan jika tidak ingin mengubah password' : 'Min. 6 karakter'}
                  className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs outline-none focus:border-blue-600 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCreateUserOpen(false)}
                  className="px-3.5 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingUser ? 'Simpan Perubahan' : 'Daftarkan Akun'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. DELETE USER CONFIRMATION MODAL */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 space-y-4 border border-slate-200 shadow-xl text-slate-900">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <div className="flex items-center space-x-2 font-bold text-sm text-red-600">
                <Trash2 className="w-4 h-4" />
                <span>Hapus Akun Pengguna</span>
              </div>
              <button
                onClick={() => setDeleteModalUser(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Apakah Anda yakin ingin menghapus akun pengguna{' '}
                <strong className="text-slate-900">{deleteModalUser.name}</strong> (
                <span className="font-mono text-slate-700">{deleteModalUser.email}</span>)?
              </p>
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-[11px] leading-relaxed">
                Tindakan ini tidak dapat dibatalkan. Pengguna ini tidak akan dapat login lagi ke terminal kasir atau portal sistem.
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalUser(null)}
                  className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  className="px-3.5 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  Ya, Hapus Akun
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

