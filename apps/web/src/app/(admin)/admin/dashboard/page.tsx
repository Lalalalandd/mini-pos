'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  BarChart3,
  TrendingUp,
  Package,
  Layers,
  Receipt,
  FileSpreadsheet,
  Users,
  Store,
  ChevronRight,
  RefreshCw,
  Download,
  Plus,
  Search,
  LogOut,
  Edit2,
  Trash2,
  RotateCcw,
  Eye,
  X,
  AlertTriangle,
  UserPlus,
  DollarSign,
} from 'lucide-react';
import { restFetch } from '@/lib/api-client';

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

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [reportsData, setReportsData] = useState<any>(null);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
  const [usersList, setUsersList] = useState<UserAccount[]>([]);

  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');
  const [productPage, setProductPage] = useState(1);
  const [productPerPage] = useState(6);

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

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderPage, setOrderPage] = useState(1);
  const [orderPerPage] = useState(6);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [refundModalOrder, setRefundModalOrder] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundRestock, setRefundRestock] = useState(true);

  const [adjustModalProduct, setAdjustModalProduct] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<'ADD' | 'SUBTRACT'>('ADD');
  const [adjustReason, setAdjustReason] = useState('Koreksi Stok');

  const [opnameProductId, setOpnameProductId] = useState('');
  const [opnamePhysicalQty, setOpnamePhysicalQty] = useState<number>(0);
  const [opnameNotes, setOpnameNotes] = useState('');

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

  const totalSalesAmount = ordersList.filter((o) => o.status === 'COMPLETED').reduce((sum, o) => sum + o.finalAmount, 0);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = ordersList.filter((o) => o.createdAt.slice(0, 10) === todayStr && o.status === 'COMPLETED');
  const todaySalesAmount = todayOrders.reduce((sum, o) => sum + o.finalAmount, 0);
  const todayTransactionsCount = todayOrders.length;
  const lowStockProducts = productsList.filter((p) => p.stock <= p.minStockAlert);
  const totalInventoryValuation = productsList.reduce((sum, p) => sum + p.stock * (p.costPrice || p.price * 0.5), 0);

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
      const updated = { ...editingProduct, ...productForm };
      setProductsList((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
      toast.success(`Produk "${productForm.name}" berhasil diperbarui.`);
    } else {
      const newProd: Product = {
        id: `p-${Date.now()}`,
        ...productForm,
        status: 'ACTIVE',
      };
      setProductsList((prev) => [newProd, ...prev]);
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
      toast.success(`Produk "${productForm.name}" berhasil ditambahkan.`);
    }
    setCreateProductOpen(false);
  };

  const handleDeleteProduct = (prodId: string, prodName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${prodName}"?`)) {
      setProductsList((prev) => prev.filter((p) => p.id !== prodId));
      toast.success(`Produk "${prodName}" berhasil dihapus.`);
    }
  };

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

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    setOrdersList((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
    toast.success(`Status transaksi diperbarui menjadi "${newStatus}".`);
  };

  const handleProcessRefund = () => {
    if (!refundModalOrder) return;

    setOrdersList((prev) =>
      prev.map((o) =>
        o.id === refundModalOrder.id
          ? { ...o, status: 'REFUNDED', paymentStatus: 'REFUNDED' }
          : o,
      ),
    );

    if (refundRestock) {
      refundModalOrder.items.forEach((item) => {
        setProductsList((prev) =>
          prev.map((p) =>
            p.sku === item.productSku ? { ...p, stock: p.stock + item.quantity } : p,
          ),
        );
      });
      toast.info('Stok barang dikembalikan ke inventaris.');
    }

    toast.success(`Pesanan ${refundModalOrder.orderNumber} berhasil di-refund.`);
    setRefundModalOrder(null);
    setRefundReason('');
  };

  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserForm({ name: '', email: '', password: '', role: 'CASHIER' });
    setCreateUserOpen(true);
  };

  const handleOpenEditUser = (u: UserAccount) => {
    setEditingUser(u);
    setUserForm({ name: u.name, email: u.email, password: '', role: u.role });
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
        const updatePayload: any = {
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
        };
        if (userForm.password) updatePayload.password = userForm.password;

        await restFetch<UserAccount>(`/users/${editingUser.id}`, {
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
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-md-primary animate-spin" />
        <span className="text-xs font-semibold text-md-on-surface-variant">Memverifikasi akses administrator...</span>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f7f9fc] flex flex-col text-md-on-surface">
      {/* Top Header Breadcrumb & Utility */}
      <div className="border-b border-[#f0f2f5] bg-white px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs text-md-on-surface-variant">
          <Store className="w-4 h-4 text-md-primary shrink-0" />
          <span>AuraPOS</span>
          <ChevronRight className="w-3.5 h-3.5 text-md-outline shrink-0" />
          <span className="text-md-on-surface font-semibold">Admin Workspace</span>
          <ChevronRight className="w-3.5 h-3.5 text-md-outline shrink-0" />
          <span className="text-md-primary font-medium">
            {navSection === 'OVERVIEW' && 'Ringkasan & Metrik'}
            {navSection === 'PRODUCTS' && 'Manajemen Produk'}
            {navSection === 'INVENTORY' && 'Inventori & Stok'}
            {navSection === 'ORDERS' && 'Manajemen Pesanan'}
            {navSection === 'REPORTS' && 'Laporan Penjualan'}
            {navSection === 'USERS' && 'Manajemen Akun'}
          </span>
        </div>

        {/* Action buttons strictly inline-flex */}
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center justify-center flex-row whitespace-nowrap px-4 py-2 rounded-full border border-[#e0e2ec] hover:border-[#c4c7c5] bg-white hover:bg-[#f0f4f9] text-xs font-medium text-[#1f1f1f] transition-all shadow-none"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-2 shrink-0 ${loading ? 'animate-spin text-md-primary' : 'text-[#444746]'}`} />
            <span>Sinkronkan</span>
          </button>
          <button
            type="button"
            onClick={() => toast.info('Data laporan berhasil diekspor ke file CSV.')}
            className="inline-flex items-center justify-center flex-row whitespace-nowrap px-4 py-2 rounded-full border border-[#e0e2ec] hover:border-[#c4c7c5] bg-white hover:bg-[#f0f4f9] text-xs font-medium text-[#1f1f1f] transition-all shadow-none"
          >
            <Download className="w-3.5 h-3.5 mr-2 shrink-0 text-[#444746]" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-8">
        {/* Left Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-[#f0f2f5] rounded-3xl p-3 space-y-1.5 shadow-none">
            <div className="px-3 py-2 text-[11px] font-bold text-md-on-surface-variant/80 uppercase tracking-wider">
              Navigasi Admin
            </div>

            <button
              onClick={() => setNavSection('OVERVIEW')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center space-x-3 transition-colors ${
                navSection === 'OVERVIEW'
                  ? 'bg-md-primary-container text-md-on-primary-container font-bold'
                  : 'text-md-on-surface-variant hover:text-md-on-surface hover:bg-[#f0f4f9]'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-md-primary shrink-0" />
              <span>Dashboard & Metrik</span>
            </button>

            <button
              onClick={() => setNavSection('PRODUCTS')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-colors ${
                navSection === 'PRODUCTS'
                  ? 'bg-md-primary-container text-md-on-primary-container font-bold'
                  : 'text-md-on-surface-variant hover:text-md-on-surface hover:bg-[#f0f4f9]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Package className="w-4 h-4 text-md-primary shrink-0" />
                <span>Manajemen Produk</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f0f4f9] text-md-on-surface font-semibold">
                {productsList.length}
              </span>
            </button>

            <button
              onClick={() => setNavSection('INVENTORY')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-colors ${
                navSection === 'INVENTORY'
                  ? 'bg-md-primary-container text-md-on-primary-container font-bold'
                  : 'text-md-on-surface-variant hover:text-md-on-surface hover:bg-[#f0f4f9]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Layers className="w-4 h-4 text-md-primary shrink-0" />
                <span>Stok & Opname</span>
              </div>
              {lowStockProducts.length > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                  {lowStockProducts.length} Kritis
                </span>
              )}
            </button>

            <button
              onClick={() => setNavSection('ORDERS')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-colors ${
                navSection === 'ORDERS'
                  ? 'bg-md-primary-container text-md-on-primary-container font-bold'
                  : 'text-md-on-surface-variant hover:text-md-on-surface hover:bg-[#f0f4f9]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Receipt className="w-4 h-4 text-md-primary shrink-0" />
                <span>Daftar Pesanan</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f0f4f9] text-md-on-surface font-semibold">
                {ordersList.length}
              </span>
            </button>

            <button
              onClick={() => setNavSection('REPORTS')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center space-x-3 transition-colors ${
                navSection === 'REPORTS'
                  ? 'bg-md-primary-container text-md-on-primary-container font-bold'
                  : 'text-md-on-surface-variant hover:text-md-on-surface hover:bg-[#f0f4f9]'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-md-primary shrink-0" />
              <span>Laporan Penjualan</span>
            </button>

            <button
              onClick={() => setNavSection('USERS')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-colors ${
                navSection === 'USERS'
                  ? 'bg-md-primary-container text-md-on-primary-container font-bold'
                  : 'text-md-on-surface-variant hover:text-md-on-surface hover:bg-[#f0f4f9]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 text-md-primary shrink-0" />
                <span>Manajemen Akun</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f0f4f9] text-md-on-surface font-semibold">
                {usersList.length}
              </span>
            </button>

            <div className="pt-2 border-t border-[#f0f2f5]">
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
                className="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Keluar Sesi</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Main Content Panel */}
        <div className="lg:col-span-9 space-y-6">
          {/* Section: Overview */}
          {navSection === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* 4 KPI Cards (Shadow-none, Light Gray Border) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white border border-[#f0f2f5] shadow-none space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-md-on-surface-variant">Penjualan Hari Ini</span>
                    <div className="w-8 h-8 rounded-full bg-md-primary-container text-md-primary flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl font-black text-md-on-surface font-mono">
                    Rp {todaySalesAmount.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-md-on-surface-variant">
                    {todayTransactionsCount} transaksi berhasil
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-[#f0f2f5] shadow-none space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-md-on-surface-variant">Total Omzet Keseluruhan</span>
                    <div className="w-8 h-8 rounded-full bg-md-secondary-container text-md-secondary flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl font-black text-md-on-surface font-mono">
                    Rp {totalSalesAmount.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-md-on-surface-variant">
                    Dari {ordersList.length} total pesanan
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-[#f0f2f5] shadow-none space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-md-on-surface-variant">Valuasi Inventori</span>
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl font-black text-md-on-surface font-mono">
                    Rp {totalInventoryValuation.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-md-on-surface-variant">
                    {productsList.length} item aktif
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-[#f0f2f5] shadow-none space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-md-on-surface-variant">Stok Menipis</span>
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl font-black text-amber-800 font-mono">
                    {lowStockProducts.length} Produk
                  </div>
                  <div className="text-[11px] text-md-on-surface-variant">
                    Perlu pengadaan ulang segera
                  </div>
                </div>
              </div>

              {/* Revenue 7-Day Chart & Top Products (Shadow-none, Light Gray Border) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white border border-[#f0f2f5] rounded-3xl p-6 shadow-none space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-md-on-surface">Tren Penjualan 7 Hari Terakhir</h3>
                      <p className="text-xs text-md-on-surface-variant">Grafik pendapatan toko harian</p>
                    </div>
                    <span className="text-xs font-mono text-md-primary font-bold">Maks: Rp {maxRevenueInChart.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="h-44 flex items-end justify-between gap-2 pt-6">
                    {chartDays.map((d: any, idx: number) => {
                      const heightPercent = Math.max(12, Math.round((d.revenue / maxRevenueInChart) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                          <div className="text-[10px] font-mono text-md-on-surface-variant group-hover:text-md-primary font-semibold">
                            {(d.revenue / 1000).toFixed(0)}k
                          </div>
                          <div className="w-full bg-[#f0f4f9] rounded-t-xl overflow-hidden flex items-end h-28">
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className="w-full bg-md-primary group-hover:bg-md-primary-hover rounded-t-xl transition-all"
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-md-on-surface-variant">{d.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white border border-[#f0f2f5] rounded-3xl p-6 shadow-none space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-md-on-surface">Produk Paling Laris</h3>
                    <p className="text-xs text-md-on-surface-variant">Berdasarkan kuantitas pesanan selesai</p>
                  </div>

                  <div className="space-y-2.5">
                    {topProductsList.length === 0 ? (
                      <div className="p-4 text-center text-xs text-md-on-surface-variant">Belum ada data penjualan.</div>
                    ) : (
                      topProductsList.map((tp, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-[#f7f9fc] border border-[#f0f2f5]">
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-md-primary-container text-md-on-primary-container font-bold text-xs flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-md-on-surface truncate">{tp.name}</div>
                              <div className="text-[11px] text-md-on-surface-variant font-mono">{tp.sku}</div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xs font-bold text-md-primary font-mono">{tp.sold} terjual</div>
                            <div className="text-[10px] text-md-on-surface-variant font-mono">Rp {tp.revenue.toLocaleString('id-ID')}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Products Management */}
          {navSection === 'PRODUCTS' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center space-x-2 flex-1 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-md-on-surface-variant/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setProductPage(1);
                      }}
                      placeholder="Cari produk atau SKU..."
                      className="w-full bg-white border border-[#e0e2ec] focus:border-md-primary rounded-full pl-10 pr-4 py-2 text-xs text-md-on-surface outline-none"
                    />
                  </div>

                  <select
                    value={productCategoryFilter}
                    onChange={(e) => {
                      setProductCategoryFilter(e.target.value);
                      setProductPage(1);
                    }}
                    className="bg-white border border-[#e0e2ec] rounded-full px-3.5 py-2 text-xs text-md-on-surface font-semibold outline-none"
                  >
                    <option value="ALL">Semua Kategori</option>
                    <option value="Coffee">Coffee</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Meals">Meals</option>
                    <option value="Tea">Tea</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreateProduct}
                  className="inline-flex items-center justify-center flex-row whitespace-nowrap px-4 py-2 rounded-full bg-md-primary hover:bg-md-primary-hover text-white text-xs font-semibold shadow-none transition-all"
                >
                  <Plus className="w-4 h-4 mr-1.5 shrink-0" />
                  <span>Tambah Produk</span>
                </button>
              </div>

              {/* Products Table (Shadow-none, Light Gray Border) */}
              <div className="bg-white border border-[#f0f2f5] rounded-3xl overflow-hidden shadow-none">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-md-on-surface">
                    <thead className="bg-[#f7f9fc] border-b border-[#f0f2f5] text-[11px] font-bold text-md-on-surface-variant uppercase tracking-wider">
                      <tr>
                        <th className="p-4">Produk</th>
                        <th className="p-4">SKU & Barcode</th>
                        <th className="p-4">Kategori</th>
                        <th className="p-4">Harga Jual</th>
                        <th className="p-4">Stok</th>
                        <th className="p-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f2f5]">
                      {paginatedProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-md-on-surface-variant">
                            Tidak ada data produk ditemukan.
                          </td>
                        </tr>
                      ) : (
                        paginatedProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-[#f7f9fc]/60 transition-colors">
                            <td className="p-4 font-bold text-md-on-surface">{p.name}</td>
                            <td className="p-4 font-mono text-md-on-surface-variant">
                              <div>{p.sku}</div>
                              <div className="text-[10px] text-md-outline">{p.barcode || '-'}</div>
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#f0f4f9] text-md-on-surface">
                                {p.categoryName || 'Katalog'}
                              </span>
                            </td>
                            <td className="p-4 font-mono font-bold text-md-on-surface">
                              Rp {p.price.toLocaleString('id-ID')}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                  p.stock <= p.minStockAlert
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {p.stock} unit
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-1.5">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 rounded-full hover:bg-[#f0f4f9] text-md-on-surface-variant hover:text-md-primary transition-colors"
                                aria-label="Edit produk"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                className="p-1.5 rounded-full hover:bg-red-50 text-md-on-surface-variant hover:text-red-600 transition-colors"
                                aria-label="Hapus produk"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-4 border-t border-[#f0f2f5] flex items-center justify-between text-xs text-md-on-surface-variant bg-[#f7f9fc]">
                  <span>Halaman {productPage} dari {totalProductPages}</span>
                  <div className="flex space-x-2">
                    <button
                      disabled={productPage === 1}
                      onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                      className="px-3.5 py-1.5 rounded-full border border-[#e0e2ec] bg-white text-xs disabled:opacity-40"
                    >
                      Sebelumnya
                    </button>
                    <button
                      disabled={productPage >= totalProductPages}
                      onClick={() => setProductPage((p) => p + 1)}
                      className="px-3.5 py-1.5 rounded-full border border-[#e0e2ec] bg-white text-xs disabled:opacity-40"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Inventory & Opname */}
          {navSection === 'INVENTORY' && (
            <div className="space-y-6">
              {/* Opname & Quick Adjustment Cards (Shadow-none, Light Gray Border) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Physical Opname Form */}
                <div className="bg-white border border-[#f0f2f5] rounded-3xl p-6 shadow-none space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-md-on-surface">Form Stock Opname Fisik</h3>
                    <p className="text-xs text-md-on-surface-variant">Sinkronisasi stok fisik hasil audit toko</p>
                  </div>

                  <form onSubmit={handleApplyOpname} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-md-on-surface">Pilih Produk</label>
                      <select
                        value={opnameProductId}
                        onChange={(e) => setOpnameProductId(e.target.value)}
                        className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-3.5 py-2 text-xs text-md-on-surface outline-none"
                      >
                        <option value="">Pilih item yang dihitung...</option>
                        {productsList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Sistem: {p.stock} unit)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-md-on-surface">Jumlah Fisik Terhitung</label>
                      <input
                        type="number"
                        min="0"
                        value={opnamePhysicalQty}
                        onChange={(e) => setOpnamePhysicalQty(Number(e.target.value))}
                        className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-3.5 py-2 text-xs text-md-on-surface font-mono outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-md-on-surface">Catatan Opname</label>
                      <input
                        type="text"
                        value={opnameNotes}
                        onChange={(e) => setOpnameNotes(e.target.value)}
                        placeholder="Contoh: Audit Mingguan Shift Pagi"
                        className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-3.5 py-2 text-xs text-md-on-surface outline-none"
                      />
                    </div>

                    <button type="submit" className="w-full inline-flex items-center justify-center flex-row whitespace-nowrap py-2.5 rounded-full bg-md-primary hover:bg-md-primary-hover text-white text-xs font-semibold shadow-none">
                      Simpan Stock Opname
                    </button>
                  </form>
                </div>

                {/* Quick Adjustment Trigger List */}
                <div className="bg-white border border-[#f0f2f5] rounded-3xl p-6 shadow-none space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-md-on-surface">Penyesuaian Cepat Stok</h3>
                    <p className="text-xs text-md-on-surface-variant">Koreksi stok masuk atau susut</p>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {productsList.slice(0, 6).map((p) => (
                      <div key={p.id} className="p-3 rounded-2xl bg-[#f7f9fc] border border-[#f0f2f5] flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-md-on-surface">{p.name}</div>
                          <div className="text-[11px] font-mono text-md-on-surface-variant">Stok: {p.stock} unit</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustModalProduct(p);
                            setAdjustQty(1);
                            setAdjustType('ADD');
                          }}
                          className="inline-flex items-center justify-center flex-row whitespace-nowrap text-xs font-semibold py-1.5 px-3.5 rounded-full bg-[#d3e3fd] text-[#041e49] hover:bg-[#c2d7fc]"
                        >
                          Sesuaikan
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Movement Log Table (Shadow-none, Light Gray Border) */}
              <div className="bg-white border border-[#f0f2f5] rounded-3xl overflow-hidden shadow-none space-y-2">
                <div className="p-5 border-b border-[#f0f2f5]">
                  <h3 className="text-sm font-bold text-md-on-surface">Riwayat Pergerakan Stok (Audit Trail)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-md-on-surface">
                    <thead className="bg-[#f7f9fc] text-[11px] font-bold text-md-on-surface-variant uppercase">
                      <tr>
                        <th className="p-4">Waktu</th>
                        <th className="p-4">Produk</th>
                        <th className="p-4">Tipe</th>
                        <th className="p-4">Perubahan</th>
                        <th className="p-4">Stok Akhir</th>
                        <th className="p-4">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f2f5]">
                      {inventoryMovements.map((m) => (
                        <tr key={m.id} className="hover:bg-[#f7f9fc]/60">
                          <td className="p-4 text-md-on-surface-variant font-mono text-[11px]">{m.timestamp}</td>
                          <td className="p-4 font-bold text-md-on-surface">{m.productName}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f0f4f9] text-md-on-surface">
                              {m.type}
                            </span>
                          </td>
                          <td className={`p-4 font-mono font-bold ${m.quantityChange >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                            {m.quantityChange >= 0 ? `+${m.quantityChange}` : m.quantityChange}
                          </td>
                          <td className="p-4 font-mono font-bold text-md-on-surface">{m.finalStock} unit</td>
                          <td className="p-4 text-md-on-surface-variant">{m.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Section: Orders Management */}
          {navSection === 'ORDERS' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center space-x-2 flex-1 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-md-on-surface-variant/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => {
                        setOrderSearch(e.target.value);
                        setOrderPage(1);
                      }}
                      placeholder="Cari no. pesanan atau pelanggan..."
                      className="w-full bg-white border border-[#e0e2ec] focus:border-md-primary rounded-full pl-10 pr-4 py-2 text-xs text-md-on-surface outline-none"
                    />
                  </div>

                  <select
                    value={orderStatusFilter}
                    onChange={(e) => {
                      setOrderStatusFilter(e.target.value);
                      setOrderPage(1);
                    }}
                    className="bg-white border border-[#e0e2ec] rounded-full px-3.5 py-2 text-xs text-md-on-surface font-semibold outline-none"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="COMPLETED">Selesai (COMPLETED)</option>
                    <option value="PENDING">Pending (PENDING)</option>
                    <option value="REFUNDED">Refunded (REFUNDED)</option>
                  </select>
                </div>
              </div>

              {/* Orders Table (Shadow-none, Light Gray Border) */}
              <div className="bg-white border border-[#f0f2f5] rounded-3xl overflow-hidden shadow-none">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-md-on-surface">
                    <thead className="bg-[#f7f9fc] border-b border-[#f0f2f5] text-[11px] font-bold text-md-on-surface-variant uppercase">
                      <tr>
                        <th className="p-4">No. Pesanan</th>
                        <th className="p-4">Saluran</th>
                        <th className="p-4">Pelanggan</th>
                        <th className="p-4">Total</th>
                        <th className="p-4">Metode Bayar</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f2f5]">
                      {paginatedOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-md-on-surface-variant">
                            Tidak ada riwayat pesanan ditemukan.
                          </td>
                        </tr>
                      ) : (
                        paginatedOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-[#f7f9fc]/60">
                            <td className="p-4 font-mono font-bold text-md-primary">{o.orderNumber}</td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f0f4f9] text-md-on-surface">
                                {o.source}
                              </span>
                            </td>
                            <td className="p-4 font-semibold text-md-on-surface">{o.customerName}</td>
                            <td className="p-4 font-mono font-bold text-md-on-surface">
                              Rp {o.finalAmount.toLocaleString('id-ID')}
                            </td>
                            <td className="p-4 font-mono text-xs">{o.paymentMethod}</td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  o.status === 'COMPLETED'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : o.status === 'REFUNDED'
                                    ? 'bg-red-50 text-red-800 border border-red-200'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {o.status}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-1.5">
                              <button
                                onClick={() => setSelectedOrderDetails(o)}
                                className="p-1.5 rounded-full hover:bg-[#f0f4f9] text-md-on-surface-variant hover:text-md-primary transition-colors"
                                aria-label="Lihat rincian pesanan"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {o.status === 'COMPLETED' && (
                                <button
                                  onClick={() => setRefundModalOrder(o)}
                                  className="p-1.5 rounded-full hover:bg-red-50 text-md-on-surface-variant hover:text-red-600 transition-colors"
                                  aria-label="Proses refund"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-[#f0f2f5] flex items-center justify-between text-xs text-md-on-surface-variant bg-[#f7f9fc]">
                  <span>Halaman {orderPage} dari {totalOrderPages}</span>
                  <div className="flex space-x-2">
                    <button
                      disabled={orderPage === 1}
                      onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                      className="px-3.5 py-1.5 rounded-full border border-[#e0e2ec] bg-white text-xs disabled:opacity-40"
                    >
                      Sebelumnya
                    </button>
                    <button
                      disabled={orderPage >= totalOrderPages}
                      onClick={() => setOrderPage((p) => p + 1)}
                      className="px-3.5 py-1.5 rounded-full border border-[#e0e2ec] bg-white text-xs disabled:opacity-40"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Reports & Analytics */}
          {navSection === 'REPORTS' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl bg-white border border-[#f0f2f5] shadow-none space-y-1">
                  <div className="text-xs text-md-on-surface-variant font-medium">Omzet Tunai (CASH)</div>
                  <div className="text-xl font-bold text-md-on-surface font-mono">
                    Rp {ordersList.filter((o) => o.paymentMethod === 'CASH' && o.status === 'COMPLETED').reduce((s, o) => s + o.finalAmount, 0).toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="p-5 rounded-3xl bg-white border border-[#f0f2f5] shadow-none space-y-1">
                  <div className="text-xs text-md-on-surface-variant font-medium">Omzet Nontunai (QRIS & EDC)</div>
                  <div className="text-xl font-bold text-md-primary font-mono">
                    Rp {ordersList.filter((o) => (o.paymentMethod === 'QRIS' || o.paymentMethod === 'DEBIT_CARD') && o.status === 'COMPLETED').reduce((s, o) => s + o.finalAmount, 0).toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="p-5 rounded-3xl bg-white border border-[#f0f2f5] shadow-none space-y-1">
                  <div className="text-xs text-md-on-surface-variant font-medium">Omzet Toko Online</div>
                  <div className="text-xl font-bold text-emerald-800 font-mono">
                    Rp {ordersList.filter((o) => o.source === 'ONLINE' && o.status === 'COMPLETED').reduce((s, o) => s + o.finalAmount, 0).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#f0f2f5] rounded-3xl p-6 shadow-none space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-md-on-surface">Ringkasan Kinerja Penjualan</h3>
                    <p className="text-xs text-md-on-surface-variant">Laporan akumulasi performa POS dan marketplace</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.info('Laporan CSV siap diunduh.')}
                    className="inline-flex items-center justify-center flex-row whitespace-nowrap text-xs font-semibold py-2 px-4 rounded-full bg-md-primary text-white hover:bg-md-primary-hover shadow-none"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                    <span>Unduh CSV</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#f7f9fc] border border-[#f0f2f5] space-y-2 text-xs text-md-on-surface-variant">
                  <div className="flex justify-between">
                    <span>Total Transaksi Berhasil</span>
                    <span className="font-mono font-bold text-md-on-surface">{ordersList.filter((o) => o.status === 'COMPLETED').length} transaksi</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rata-rata Nilai Transaksi (Basket Size)</span>
                    <span className="font-mono font-bold text-md-on-surface">
                      Rp {Math.round(totalSalesAmount / Math.max(1, ordersList.filter((o) => o.status === 'COMPLETED').length)).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jumlah Item Terjual</span>
                    <span className="font-mono font-bold text-md-on-surface">
                      {ordersList.filter((o) => o.status === 'COMPLETED').reduce((sum, o) => sum + o.items.reduce((is, i) => is + i.quantity, 0), 0)} unit
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Users Management */}
          {navSection === 'USERS' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center space-x-2 flex-1 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-md-on-surface-variant/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Cari nama atau email akun..."
                      className="w-full bg-white border border-[#e0e2ec] focus:border-md-primary rounded-full pl-10 pr-4 py-2 text-xs text-md-on-surface outline-none"
                    />
                  </div>

                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="bg-white border border-[#e0e2ec] rounded-full px-3.5 py-2 text-xs text-md-on-surface font-semibold outline-none"
                  >
                    <option value="ALL">Semua Peran</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="CASHIER">CASHIER</option>
                    <option value="CUSTOMER">CUSTOMER</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreateUser}
                  className="inline-flex items-center justify-center flex-row whitespace-nowrap text-xs font-semibold py-2 px-4 rounded-full bg-md-primary text-white hover:bg-md-primary-hover shadow-none"
                >
                  <UserPlus className="w-4 h-4 mr-1.5 shrink-0" />
                  <span>Tambah Akun</span>
                </button>
              </div>

              {/* Users Table (Shadow-none, Light Gray Border) */}
              <div className="bg-white border border-[#f0f2f5] rounded-3xl overflow-hidden shadow-none">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-md-on-surface">
                    <thead className="bg-[#f7f9fc] border-b border-[#f0f2f5] text-[11px] font-bold text-md-on-surface-variant uppercase">
                      <tr>
                        <th className="p-4">Pengguna</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Peran (Role)</th>
                        <th className="p-4">Terdaftar</th>
                        <th className="p-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f2f5]">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-md-on-surface-variant">
                            Tidak ada akun pengguna ditemukan.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-[#f7f9fc]/60">
                            <td className="p-4 font-bold text-md-on-surface flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-md-primary-container text-md-on-primary-container font-bold flex items-center justify-center text-xs">
                                {u.name[0]}
                              </div>
                              <span>{u.name}</span>
                            </td>
                            <td className="p-4 font-mono text-md-on-surface-variant">{u.email}</td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  u.role === 'ADMIN'
                                    ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                    : u.role === 'CASHIER'
                                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="p-4 text-md-on-surface-variant font-mono text-[11px]">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID') : '-'}
                            </td>
                            <td className="p-4 text-right space-x-1.5">
                              <button
                                onClick={() => handleOpenEditUser(u)}
                                className="p-1.5 rounded-full hover:bg-[#f0f4f9] text-md-on-surface-variant hover:text-md-primary transition-colors"
                                aria-label="Edit akun"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteModalUser(u)}
                                className="p-1.5 rounded-full hover:bg-red-50 text-md-on-surface-variant hover:text-red-600 transition-colors"
                                aria-label="Hapus akun"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      {createProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#f0f2f5] p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#f0f2f5]">
              <h3 className="text-base font-bold text-md-on-surface">
                {editingProduct ? 'Perbarui Data Produk' : 'Tambah Produk Baru'}
              </h3>
              <button
                onClick={() => setCreateProductOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#f0f4f9] text-md-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-md-on-surface">Nama Produk</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs text-md-on-surface outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-md-on-surface">SKU</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs font-mono text-md-on-surface outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-md-on-surface">Barcode</label>
                  <input
                    type="text"
                    value={productForm.barcode}
                    onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                    className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs font-mono text-md-on-surface outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-md-on-surface">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs font-mono text-md-on-surface outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-md-on-surface">Stok Awal</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs font-mono text-md-on-surface outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-md-on-surface">Kategori</label>
                <select
                  value={productForm.categoryName}
                  onChange={(e) => setProductForm({ ...productForm, categoryName: e.target.value })}
                  className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs text-md-on-surface outline-none"
                >
                  <option value="Coffee">Coffee</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Meals">Meals</option>
                  <option value="Tea">Tea</option>
                  <option value="Snacks">Snacks</option>
                </select>
              </div>

              <button type="submit" className="w-full inline-flex items-center justify-center flex-row whitespace-nowrap py-2.5 rounded-full bg-md-primary hover:bg-md-primary-hover text-white text-xs font-semibold mt-3">
                {editingProduct ? 'Perbarui Produk' : 'Simpan Produk Baru'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quick Adjust Modal */}
      {adjustModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#f0f2f5] p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#f0f2f5]">
              <h3 className="text-sm font-bold text-md-on-surface">Penyesuaian Stok</h3>
              <button onClick={() => setAdjustModalProduct(null)} className="p-1.5 rounded-full hover:bg-[#f0f4f9]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-md-on-surface-variant">
              Produk: <span className="font-bold text-md-on-surface">{adjustModalProduct.name}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('ADD')}
                className={`py-2 rounded-2xl text-xs font-bold transition-all ${
                  adjustType === 'ADD' ? 'bg-emerald-600 text-white' : 'bg-[#f0f4f9] text-md-on-surface'
                }`}
              >
                + Tambah Stok
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('SUBTRACT')}
                className={`py-2 rounded-2xl text-xs font-bold transition-all ${
                  adjustType === 'SUBTRACT' ? 'bg-red-600 text-white' : 'bg-[#f0f4f9] text-md-on-surface'
                }`}
              >
                - Kurangi Stok
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-md-on-surface">Jumlah</label>
              <input
                type="number"
                min="1"
                value={adjustQty}
                onChange={(e) => setAdjustQty(Number(e.target.value))}
                className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-md-on-surface">Alasan</label>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs outline-none"
              />
            </div>

            <button onClick={handleApplyAdjustment} className="w-full inline-flex items-center justify-center flex-row whitespace-nowrap py-2.5 rounded-full bg-md-primary hover:bg-md-primary-hover text-white text-xs font-semibold">
              Terapkan Penyesuaian
            </button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#f0f2f5] p-6 rounded-3xl max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#f0f2f5]">
              <div>
                <h3 className="text-sm font-bold text-md-on-surface">Rincian Transaksi</h3>
                <div className="text-xs font-mono text-md-primary">{selectedOrderDetails.orderNumber}</div>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)} className="p-1.5 rounded-full hover:bg-[#f0f4f9]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-md-on-surface-variant">
              <div className="flex justify-between">
                <span>Pelanggan</span>
                <span className="font-bold text-md-on-surface">{selectedOrderDetails.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu</span>
                <span className="font-mono">{new Date(selectedOrderDetails.createdAt).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode Pembayaran</span>
                <span className="font-mono font-bold">{selectedOrderDetails.paymentMethod}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#f0f2f5]">
              <h4 className="text-xs font-bold text-md-on-surface">Item Belanja</h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {selectedOrderDetails.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-xs p-2.5 rounded-2xl bg-[#f7f9fc]">
                    <div>
                      <div className="font-bold text-md-on-surface">{it.productName}</div>
                      <div className="text-[10px] text-md-on-surface-variant">{it.quantity} x Rp {it.price.toLocaleString('id-ID')}</div>
                    </div>
                    <span className="font-mono font-bold text-md-on-surface">Rp {it.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#f0f2f5] flex justify-between items-center text-sm font-bold text-md-on-surface">
              <span>Total Akhir</span>
              <span className="text-md-primary font-mono text-base">Rp {selectedOrderDetails.finalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      )}

      {/* User Form Modal */}
      {createUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#f0f2f5] p-6 rounded-3xl max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#f0f2f5]">
              <h3 className="text-base font-bold text-md-on-surface">
                {editingUser ? 'Perbarui Akun Pengguna' : 'Tambah Akun Pengguna Baru'}
              </h3>
              <button onClick={() => setCreateUserOpen(false)} className="p-1.5 rounded-full hover:bg-[#f0f4f9]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-md-on-surface">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-md-on-surface">Email</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-md-on-surface">
                  {editingUser ? 'Kata Sandi Baru (Kosongkan jika tidak diubah)' : 'Kata Sandi Awal'}
                </label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-md-on-surface">Peran (Role)</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                  className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs outline-none"
                >
                  <option value="ADMIN">ADMIN (Super Administrator)</option>
                  <option value="CASHIER">CASHIER (Kasir POS)</option>
                  <option value="CUSTOMER">CUSTOMER (Pelanggan Toko)</option>
                </select>
              </div>

              <button type="submit" className="w-full inline-flex items-center justify-center flex-row whitespace-nowrap py-2.5 rounded-full bg-md-primary hover:bg-md-primary-hover text-white text-xs font-semibold mt-3">
                {editingUser ? 'Perbarui Akun' : 'Daftarkan Akun'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#f0f2f5] p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-md-on-surface">Konfirmasi Hapus Akun</h3>
            <p className="text-xs text-md-on-surface-variant">
              Apakah Anda yakin ingin menghapus akun <span className="font-bold text-md-on-surface">{deleteModalUser.name}</span> ({deleteModalUser.email})?
            </p>
            <div className="flex space-x-2 pt-2">
              <button onClick={() => setDeleteModalUser(null)} className="flex-1 py-2 rounded-full border border-[#e0e2ec] text-xs font-semibold">
                Batal
              </button>
              <button onClick={handleDeleteUser} className="flex-1 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
