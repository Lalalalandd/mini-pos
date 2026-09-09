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
  Tag,
  Percent,
  Settings,
  Check,
  Sparkles,
  Calendar,
  Filter,
  FileText,
  Printer,
  ShoppingCart,
  FolderPlus,
  Folder,
} from 'lucide-react';
import { restFetch } from '@/lib/api-client';
import {
  PromoCode,
  TaxSettings,
  getStoredPromos,
  saveStoredPromos,
  getStoredTaxSettings,
  saveStoredTaxSettings,
  DEFAULT_TAX_SETTINGS,
} from '@/lib/promo-tax-store';
import { getStoredOrders, saveStoredOrders, Order } from '@/lib/orders-store';
import {
  CategoryItem,
  getStoredCategories,
  saveStoredCategories,
  addStoredCategory,
  updateStoredCategory,
  deleteStoredCategory,
  DEFAULT_CATEGORIES,
} from '@/lib/categories-store';
import {
  StoredProduct,
  getStoredProducts,
  saveStoredProducts,
  addStoredProduct,
  updateStoredProduct,
  deleteStoredProduct,
  DEFAULT_PRODUCTS,
} from '@/lib/products-store';

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStockAlert: number;
  categoryId?: string;
  categoryName?: string;
  category?: { id: string; name: string; slug: string };
  imageUrl?: string;
  status?: string;
  description?: string;
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
  const [navSection, setNavSection] = useState<'OVERVIEW' | 'PRODUCTS' | 'INVENTORY' | 'ORDERS' | 'REPORTS' | 'USERS' | 'PROMOS_TAX'>('OVERVIEW');
  const [loading, setLoading] = useState(false);

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [reportsData, setReportsData] = useState<any>(null);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
  const [usersList, setUsersList] = useState<UserAccount[]>([]);

  // Sub-tab for Products section: Products vs Categories
  const [productSubTab, setProductSubTab] = useState<'PRODUCTS' | 'CATEGORIES'>('PRODUCTS');

  // Categories Management State
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [deleteCategoryModal, setDeleteCategoryModal] = useState<CategoryItem | null>(null);
  const [categoryForm, setCategoryForm] = useState<{
    name: string;
    slug: string;
    description: string;
    color: string;
  }>({
    name: '',
    slug: '',
    description: '',
    color: 'amber',
  });

  // Promos & Tax State
  const [promosList, setPromosList] = useState<PromoCode[]>([]);
  const [taxSettings, setTaxSettings] = useState<TaxSettings>(DEFAULT_TAX_SETTINGS);
  const [promoSubTab, setPromoSubTab] = useState<'PROMOS' | 'TAX'>('PROMOS');
  const [promoSearch, setPromoSearch] = useState('');
  const [promoStatusFilter, setPromoStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [deletePromoModal, setDeletePromoModal] = useState<PromoCode | null>(null);
  const [promoForm, setPromoForm] = useState<{
    code: string;
    description: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minPurchase: number;
    maxDiscount: number | '';
    validUntil: string;
    isActive: boolean;
  }>({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minPurchase: 0,
    maxDiscount: '',
    validUntil: '',
    isActive: true,
  });

  // Reports Filter & View State
  const [reportPeriod, setReportPeriod] = useState<'ALL' | 'TODAY' | '7DAYS' | '30DAYS' | 'THIS_MONTH' | 'CUSTOM'>('ALL');
  const [reportSourceFilter, setReportSourceFilter] = useState<string>('ALL');
  const [reportPaymentFilter, setReportPaymentFilter] = useState<string>('ALL');
  const [reportStartDate, setReportStartDate] = useState<string>('');
  const [reportEndDate, setReportEndDate] = useState<string>('');
  const [reportSubTab, setReportSubTab] = useState<'OVERVIEW' | 'PRODUCTS' | 'PAYMENTS' | 'DAILY'>('OVERVIEW');

  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');
  const [productPage, setProductPage] = useState(1);
  const [productPerPage] = useState(6);

  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductModal, setDeleteProductModal] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    price: 0,
    costPrice: 0,
    stock: 0,
    minStockAlert: 5,
    categoryName: 'Kopi & Minuman',
    imageUrl: '',
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
      const [fetchedProducts, fetchedOrders, fetchedReports, fetchedUsers, fetchedCategories] = await Promise.allSettled([
        restFetch<Product[]>('/products'),
        restFetch<Order[]>('/orders'),
        restFetch<any>('/orders/reports'),
        restFetch<UserAccount[]>('/users'),
        restFetch<CategoryItem[]>('/categories'),
      ]);

      // Handle Categories
      const storedCategories = getStoredCategories();
      if (fetchedCategories.status === 'fulfilled' && Array.isArray(fetchedCategories.value) && fetchedCategories.value.length > 0) {
        const catMap = new Map<string, CategoryItem>();
        storedCategories.forEach((c) => catMap.set(c.name.toLowerCase(), c));
        fetchedCategories.value.forEach((c) => {
          catMap.set(c.name.toLowerCase(), {
            id: c.id,
            name: c.name,
            slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: c.description || '',
            color: c.color || 'amber',
            createdAt: c.createdAt || new Date().toISOString(),
          });
        });
        const mergedCategories = Array.from(catMap.values());
        setCategoriesList(mergedCategories);
        saveStoredCategories(mergedCategories);
      } else {
        setCategoriesList(storedCategories);
      }

      // Handle Products
      const storedProducts = getStoredProducts();
      if (fetchedProducts.status === 'fulfilled' && Array.isArray(fetchedProducts.value) && fetchedProducts.value.length > 0) {
        const prodMap = new Map<string, Product>();
        storedProducts.forEach((p) => prodMap.set(p.sku, p as Product));
        fetchedProducts.value.forEach((p) => {
          prodMap.set(p.sku, {
            ...p,
            categoryName: p.categoryName || p.category?.name || 'Kopi & Minuman',
          });
        });
        const mergedProducts = Array.from(prodMap.values());
        setProductsList(mergedProducts);
        saveStoredProducts(mergedProducts as StoredProduct[]);
      } else {
        setProductsList(storedProducts as Product[]);
      }

      // Handle Orders
      const storedOrders = getStoredOrders();
      if (fetchedOrders.status === 'fulfilled' && Array.isArray(fetchedOrders.value) && fetchedOrders.value.length > 0) {
        const orderMap = new Map<string, Order>();
        storedOrders.forEach((o) => orderMap.set(o.id, o));
        fetchedOrders.value.forEach((o) => orderMap.set(o.id, o));
        const merged = Array.from(orderMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrdersList(merged);
        saveStoredOrders(merged);
      } else {
        setOrdersList(storedOrders);
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
      setCategoriesList(getStoredCategories());
      setProductsList(getStoredProducts() as Product[]);
      setOrdersList(getStoredOrders());
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
    if (typeof window !== 'undefined') {
      setPromosList(getStoredPromos());
      setTaxSettings(getStoredTaxSettings());
    }
  }, []);

  const totalSalesAmount = ordersList.filter((o) => o.status === 'COMPLETED').reduce((sum, o) => sum + o.finalAmount, 0);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = ordersList.filter((o) => o.createdAt && o.createdAt.slice(0, 10) === todayStr && o.status === 'COMPLETED');
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

  // Dynamic 7-Day Revenue Trend Calculation from Real Orders
  const now = new Date();
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const chartDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 86400000);
    const dateStr = d.toISOString().slice(0, 10);
    const dayOrders = ordersList.filter(
      (o) => o.status === 'COMPLETED' && o.createdAt && o.createdAt.slice(0, 10) === dateStr
    );
    const revenue = dayOrders.reduce((sum, o) => sum + o.finalAmount, 0);
    const transactions = dayOrders.length;
    return {
      day: dayNames[d.getDay()],
      date: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
      revenue,
      transactions,
    };
  });
  const maxRevenueInChart = Math.max(...chartDays.map((d) => d.revenue), 100000);

  // Category badge styling helper
  const getCategoryBadgeClass = (categoryName?: string) => {
    const name = (categoryName || '').toLowerCase();
    if (name.includes('kopi') || name.includes('coffee') || name.includes('bev')) {
      return 'bg-amber-50 text-amber-900 border border-amber-200';
    }
    if (name.includes('pastry') || name.includes('bakery') || name.includes('roti') || name.includes('cake')) {
      return 'bg-orange-50 text-orange-900 border border-orange-200';
    }
    if (name.includes('makan') || name.includes('meal') || name.includes('food') || name.includes('berat')) {
      return 'bg-rose-50 text-rose-900 border border-rose-200';
    }
    if (name.includes('teh') || name.includes('tea') || name.includes('artisan') || name.includes('matcha')) {
      return 'bg-emerald-50 text-emerald-900 border border-emerald-200';
    }
    if (name.includes('snack') || name.includes('camilan') || name.includes('kue')) {
      return 'bg-blue-50 text-blue-900 border border-blue-200';
    }
    return 'bg-slate-100 text-slate-800 border border-slate-200';
  };

  const handleOpenCreateProduct = () => {
    setProductForm({
      name: '',
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      barcode: `899${Math.floor(10000000 + Math.random() * 90000000)}`,
      price: 25000,
      costPrice: 10000,
      stock: 20,
      minStockAlert: 5,
      categoryName: categoriesList[0]?.name || 'Kopi & Minuman',
      imageUrl: '',
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
      categoryName: prod.categoryName || categoriesList[0]?.name || 'Kopi & Minuman',
      imageUrl: prod.imageUrl || '',
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

    const matchedCat = categoriesList.find((c) => c.name === productForm.categoryName);

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        ...productForm,
        categoryId: matchedCat?.id || editingProduct.categoryId,
      };
      setProductsList((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
      updateStoredProduct(editingProduct.id, updated as StoredProduct);
      toast.success(`Produk "${productForm.name}" berhasil diperbarui.`);
    } else {
      const newProd: Product = {
        id: `p-${Date.now()}`,
        ...productForm,
        categoryId: matchedCat?.id,
        status: 'ACTIVE',
      };
      setProductsList((prev) => [newProd, ...prev]);
      addStoredProduct(newProd as StoredProduct);
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
      deleteStoredProduct(prodId);
      toast.success(`Produk "${prodName}" berhasil dihapus.`);
    }
  };

  // Category Management Handlers
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      color: 'amber',
    });
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      color: cat.color || 'amber',
    });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.error('Nama kategori wajib diisi.');
      return;
    }
    const slug =
      categoryForm.slug.trim() ||
      categoryForm.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    if (editingCategory) {
      const oldName = editingCategory.name;
      const updatedList = updateStoredCategory(editingCategory.id, {
        name: categoryForm.name.trim(),
        slug,
        description: categoryForm.description.trim(),
        color: categoryForm.color,
      });
      setCategoriesList(updatedList);

      if (oldName !== categoryForm.name.trim()) {
        const newName = categoryForm.name.trim();
        setProductsList((prev) =>
          prev.map((p) => (p.categoryName === oldName ? { ...p, categoryName: newName } : p))
        );
        const stored = getStoredProducts().map((p) =>
          p.categoryName === oldName ? { ...p, categoryName: newName } : p
        );
        saveStoredProducts(stored);
      }

      toast.success(`Kategori "${categoryForm.name}" berhasil diperbarui.`);
    } else {
      addStoredCategory({
        name: categoryForm.name.trim(),
        slug,
        description: categoryForm.description.trim(),
        color: categoryForm.color,
      });
      setCategoriesList(getStoredCategories());
      toast.success(`Kategori "${categoryForm.name}" berhasil ditambahkan.`);
    }
    setCategoryModalOpen(false);
  };

  const handleDeleteCategory = (cat: CategoryItem) => {
    const linkedCount = productsList.filter(
      (p) => p.categoryId === cat.id || p.categoryName === cat.name
    ).length;

    if (linkedCount > 0) {
      if (
        !confirm(
          `Terdapat ${linkedCount} produk yang terhubung dengan kategori "${cat.name}". Kategori produk-produk ini akan dialihkan ke "Umum". Lanjutkan hapus kategori?`
        )
      ) {
        return;
      }
      setProductsList((prev) =>
        prev.map((p) =>
          p.categoryId === cat.id || p.categoryName === cat.name
            ? { ...p, categoryName: 'Umum' }
            : p
        )
      );
      const stored = getStoredProducts().map((p) =>
        p.categoryId === cat.id || p.categoryName === cat.name
          ? { ...p, categoryName: 'Umum' }
          : p
      );
      saveStoredProducts(stored);
    }

    const updated = deleteStoredCategory(cat.id);
    setCategoriesList(updated);
    setDeleteCategoryModal(null);
    toast.success(`Kategori "${cat.name}" berhasil dihapus.`);
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

  const handleTogglePromoStatus = (promoId: string) => {
    const updated = promosList.map((p) => (p.id === promoId ? { ...p, isActive: !p.isActive } : p));
    setPromosList(updated);
    saveStoredPromos(updated);
    toast.success('Status keaktifan promo diperbarui');
  };

  const handleOpenCreatePromo = () => {
    setEditingPromo(null);
    setPromoForm({
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minPurchase: 0,
      maxDiscount: '',
      validUntil: '2026-12-31',
      isActive: true,
    });
    setPromoModalOpen(true);
  };

  const handleOpenEditPromo = (p: PromoCode) => {
    setEditingPromo(p);
    setPromoForm({
      code: p.code,
      description: p.description || '',
      discountType: p.discountType,
      discountValue: p.discountValue,
      minPurchase: p.minPurchase,
      maxDiscount: p.maxDiscount ?? '',
      validUntil: p.validUntil ? p.validUntil.substring(0, 10) : '',
      isActive: p.isActive,
    });
    setPromoModalOpen(true);
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = promoForm.code.trim().toUpperCase();
    if (!cleanCode) {
      toast.error('Kode promo tidak boleh kosong');
      return;
    }

    if (editingPromo) {
      const collision = promosList.find((p) => p.code === cleanCode && p.id !== editingPromo.id);
      if (collision) {
        toast.error('Kode promo tersebut sudah digunakan');
        return;
      }
      const updated = promosList.map((p) => {
        if (p.id === editingPromo.id) {
          return {
            ...p,
            code: cleanCode,
            description: promoForm.description,
            discountType: promoForm.discountType,
            discountValue: Number(promoForm.discountValue) || 0,
            minPurchase: Number(promoForm.minPurchase) || 0,
            maxDiscount: promoForm.maxDiscount !== '' ? Number(promoForm.maxDiscount) : undefined,
            validUntil: promoForm.validUntil || '2026-12-31',
            isActive: promoForm.isActive,
          };
        }
        return p;
      });
      setPromosList(updated);
      saveStoredPromos(updated);
      toast.success(`Promo ${cleanCode} berhasil diperbarui`);
    } else {
      if (promosList.some((p) => p.code === cleanCode)) {
        toast.error('Kode promo tersebut sudah ada');
        return;
      }
      const newPromo: PromoCode = {
        id: `prm-${Date.now()}`,
        code: cleanCode,
        description: promoForm.description || `Diskon ${promoForm.discountValue}${promoForm.discountType === 'PERCENTAGE' ? '%' : ' Rupiah'}`,
        discountType: promoForm.discountType,
        discountValue: Number(promoForm.discountValue) || 0,
        minPurchase: Number(promoForm.minPurchase) || 0,
        maxDiscount: promoForm.maxDiscount !== '' ? Number(promoForm.maxDiscount) : undefined,
        usageCount: 0,
        validUntil: promoForm.validUntil || '2026-12-31',
        isActive: promoForm.isActive,
      };
      const updated = [newPromo, ...promosList];
      setPromosList(updated);
      saveStoredPromos(updated);
      toast.success(`Promo ${cleanCode} berhasil dibuat`);
    }
    setPromoModalOpen(false);
  };

  const handleDeletePromo = () => {
    if (!deletePromoModal) return;
    const updated = promosList.filter((p) => p.id !== deletePromoModal.id);
    setPromosList(updated);
    saveStoredPromos(updated);
    toast.success(`Promo ${deletePromoModal.code} berhasil dihapus`);
    setDeletePromoModal(null);
  };

  const handleSaveTaxSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredTaxSettings(taxSettings);
    toast.success('Pengaturan pajak & biaya operasional berhasil disimpan!');
  };

  const filteredPromos = promosList.filter((p) => {
    const matchStatus =
      promoStatusFilter === 'ALL' ||
      (promoStatusFilter === 'ACTIVE' && p.isActive) ||
      (promoStatusFilter === 'INACTIVE' && !p.isActive);
    const matchSearch =
      p.code.toLowerCase().includes(promoSearch.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(promoSearch.toLowerCase()));
    return matchStatus && matchSearch;
  });

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

  const filteredCategories = categoriesList.filter((c) => {
    const q = categorySearch.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

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

  // Filtered Orders for Reports & Analytics
  const filteredReportOrders = ordersList.filter((o) => {
    if (o.status !== 'COMPLETED') return false;

    // Filter by Source
    if (reportSourceFilter !== 'ALL' && o.source !== reportSourceFilter) {
      return false;
    }

    // Filter by Payment Method
    if (reportPaymentFilter !== 'ALL' && o.paymentMethod !== reportPaymentFilter) {
      return false;
    }

    // Filter by Date / Period
    const orderDate = new Date(o.createdAt);
    const now = new Date();

    if (reportPeriod === 'TODAY') {
      const todayStr = now.toISOString().slice(0, 10);
      return o.createdAt.slice(0, 10) === todayStr;
    }
    if (reportPeriod === '7DAYS') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
      return orderDate >= sevenDaysAgo;
    }
    if (reportPeriod === '30DAYS') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
      return orderDate >= thirtyDaysAgo;
    }
    if (reportPeriod === 'THIS_MONTH') {
      return orderDate.getFullYear() === now.getFullYear() && orderDate.getMonth() === now.getMonth();
    }
    if (reportPeriod === 'CUSTOM') {
      if (reportStartDate && o.createdAt.slice(0, 10) < reportStartDate) {
        return false;
      }
      if (reportEndDate && o.createdAt.slice(0, 10) > reportEndDate) {
        return false;
      }
    }

    return true;
  });

  // Report Metrics
  const reportGrossSales = filteredReportOrders.reduce((sum, o) => sum + (o.totalAmount || o.finalAmount), 0);
  const reportTotalDiscount = filteredReportOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
  const reportNetSales = filteredReportOrders.reduce((sum, o) => sum + o.finalAmount, 0);
  const reportTotalOrders = filteredReportOrders.length;
  const reportTotalItemsSold = filteredReportOrders.reduce(
    (sum, o) => sum + (o.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0),
    0
  );
  const reportAOV = reportTotalOrders > 0 ? Math.round(reportNetSales / reportTotalOrders) : 0;

  // Channel breakdown
  const posOrders = filteredReportOrders.filter((o) => o.source === 'POS');
  const onlineOrders = filteredReportOrders.filter((o) => o.source === 'ONLINE');
  const posRevenue = posOrders.reduce((sum, o) => sum + o.finalAmount, 0);
  const onlineRevenue = onlineOrders.reduce((sum, o) => sum + o.finalAmount, 0);

  // Payment breakdown
  const paymentBreakdownMap = new Map<string, { count: number; total: number }>();
  filteredReportOrders.forEach((o) => {
    const method = o.paymentMethod || 'CASH';
    const curr = paymentBreakdownMap.get(method) || { count: 0, total: 0 };
    curr.count += 1;
    curr.total += o.finalAmount;
    paymentBreakdownMap.set(method, curr);
  });
  const paymentBreakdownList = Array.from(paymentBreakdownMap.entries()).map(([method, data]) => ({
    method,
    count: data.count,
    total: data.total,
    percent: reportNetSales > 0 ? Math.round((data.total / reportNetSales) * 100) : 0,
  }));

  // Top products in filtered report
  const reportTopProductsMap = new Map<string, { name: string; sku: string; sold: number; revenue: number }>();
  filteredReportOrders.forEach((o) => {
    (o.items || []).forEach((item) => {
      const curr = reportTopProductsMap.get(item.productName) || {
        name: item.productName,
        sku: item.productSku || 'SKU-PROD',
        sold: 0,
        revenue: 0,
      };
      curr.sold += item.quantity || 1;
      curr.revenue += item.subtotal || (item.price * (item.quantity || 1));
      reportTopProductsMap.set(item.productName, curr);
    });
  });
  const reportTopProductsList = Array.from(reportTopProductsMap.values())
    .sort((a, b) => b.sold - a.sold);

  // Daily grouping
  const dailyReportMap = new Map<string, { date: string; ordersCount: number; itemsCount: number; gross: number; discount: number; net: number }>();
  filteredReportOrders.forEach((o) => {
    const dateKey = o.createdAt ? o.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10);
    const curr = dailyReportMap.get(dateKey) || {
      date: dateKey,
      ordersCount: 0,
      itemsCount: 0,
      gross: 0,
      discount: 0,
      net: 0,
    };
    curr.ordersCount += 1;
    curr.itemsCount += (o.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0);
    curr.gross += (o.totalAmount || o.finalAmount);
    curr.discount += (o.discountAmount || 0);
    curr.net += o.finalAmount;
    dailyReportMap.set(dateKey, curr);
  });
  const dailyReportList = Array.from(dailyReportMap.values())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Real CSV Export
  const handleExportReportCSV = () => {
    if (filteredReportOrders.length === 0) {
      toast.warning('Tidak ada data penjualan pada periode yang dipilih untuk diekspor.');
      return;
    }

    const headers = [
      'No. Pesanan',
      'Tanggal & Waktu',
      'Saluran Penjualan',
      'Nama Pelanggan',
      'Metode Pembayaran',
      'Status Pembayaran',
      'Subtotal (Rp)',
      'Potongan Diskon (Rp)',
      'Total Akhir (Rp)',
      'Daftar Produk',
    ];

    const rows = filteredReportOrders.map((o) => {
      const itemsDetail = (o.items || [])
        .map((i) => `${i.productName} (${i.quantity}x @ Rp ${i.price.toLocaleString('id-ID')})`)
        .join('; ');
      return [
        `"${o.orderNumber}"`,
        `"${new Date(o.createdAt).toLocaleString('id-ID')}"`,
        `"${o.source}"`,
        `"${o.customerName || '-'}"`,
        `"${o.paymentMethod}"`,
        `"${o.paymentStatus}"`,
        o.totalAmount || o.finalAmount,
        o.discountAmount || 0,
        o.finalAmount,
        `"${itemsDetail.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Penjualan_AuraPOS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Berhasil mengunduh ${filteredReportOrders.length} baris data laporan penjualan (CSV).`);
  };

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
            {navSection === 'PROMOS_TAX' && 'Promo & Pengaturan Pajak'}
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
            onClick={handleExportReportCSV}
            className="inline-flex items-center justify-center flex-row whitespace-nowrap px-4 py-2 rounded-full border border-[#e0e2ec] hover:border-[#c4c7c5] bg-white hover:bg-[#f0f4f9] text-xs font-medium text-[#1f1f1f] transition-all shadow-none"
          >
            <Download className="w-3.5 h-3.5 mr-2 shrink-0 text-[#444746]" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-8 items-start">
        {/* Left Sidebar Navigation (Fixed / Sticky) */}
        <div className="lg:col-span-3 sticky top-24 z-20">
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

            <button
              onClick={() => setNavSection('PROMOS_TAX')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-colors ${
                navSection === 'PROMOS_TAX'
                  ? 'bg-md-primary-container text-md-on-primary-container font-bold'
                  : 'text-md-on-surface-variant hover:text-md-on-surface hover:bg-[#f0f4f9]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Tag className="w-4 h-4 text-md-primary shrink-0" />
                <span>Promo & Pajak</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f0f4f9] text-md-on-surface font-semibold">
                {promosList.length}
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
        <div className="lg:col-span-9 space-y-6 min-w-0">
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
                      <p className="text-xs text-md-on-surface-variant">Grafik pendapatan toko harian dari pesanan selesai</p>
                    </div>
                    <span className="text-xs font-mono text-md-primary font-bold">Maks: Rp {maxRevenueInChart.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="h-44 flex items-end justify-between gap-2 pt-6">
                    {chartDays.map((d: any, idx: number) => {
                      const heightPercent = d.revenue > 0 ? Math.max(16, Math.min(100, Math.round((d.revenue / maxRevenueInChart) * 100))) : 8;
                      const formattedLabel =
                        d.revenue >= 1000000
                          ? `${(d.revenue / 1000000).toFixed(1)}jt`
                          : d.revenue > 0
                          ? `${Math.round(d.revenue / 1000)}k`
                          : '0k';
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                          <div className="text-[10px] font-mono text-md-on-surface-variant group-hover:text-md-primary font-semibold transition-colors">
                            {formattedLabel}
                          </div>
                          <div className="w-full bg-[#f0f4f9] rounded-t-xl overflow-hidden flex items-end h-28 p-0.5">
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className={`w-full rounded-t-lg transition-all duration-500 ${
                                d.revenue > 0 ? 'bg-md-primary group-hover:bg-md-primary-hover shadow-xs' : 'bg-slate-300'
                              }`}
                            />
                          </div>
                          <div className="text-center">
                            <div className="text-[11px] font-semibold text-md-on-surface-variant">{d.day}</div>
                            <div className="text-[9px] text-md-outline font-mono">{d.date}</div>
                          </div>
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

          {/* Section: Products & Categories Management (2 Subtabs) */}
          {navSection === 'PRODUCTS' && (
            <div className="space-y-4">
              {/* Subtab Switcher Header */}
              <div className="flex items-center gap-2 border-b border-[#f0f2f5] pb-3">
                <button
                  type="button"
                  onClick={() => setProductSubTab('PRODUCTS')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    productSubTab === 'PRODUCTS'
                      ? 'bg-md-primary text-white shadow-xs'
                      : 'bg-white text-md-on-surface-variant hover:bg-md-surface-variant/40 border border-[#f0f2f5]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Package className="w-3.5 h-3.5" />
                    <span>Daftar Produk</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      productSubTab === 'PRODUCTS' ? 'bg-white/20 text-white' : 'bg-md-surface-variant/60 text-md-on-surface'
                    }`}>
                      {productsList.length}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setProductSubTab('CATEGORIES')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    productSubTab === 'CATEGORIES'
                      ? 'bg-md-primary text-white shadow-xs'
                      : 'bg-white text-md-on-surface-variant hover:bg-md-surface-variant/40 border border-[#f0f2f5]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Folder className="w-3.5 h-3.5" />
                    <span>Manajemen Kategori</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      productSubTab === 'CATEGORIES' ? 'bg-white/20 text-white' : 'bg-md-surface-variant/60 text-md-on-surface'
                    }`}>
                      {categoriesList.length}
                    </span>
                  </div>
                </button>
              </div>

              {/* Subtab 1: PRODUCTS LIST */}
              {productSubTab === 'PRODUCTS' && (
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
                        {categoriesList.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
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

                  {/* Products Table */}
                  <div className="bg-white border border-[#f0f2f5] rounded-3xl overflow-hidden shadow-none">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-md-on-surface">
                        <thead className="bg-[#f7f9fc] border-b border-[#f0f2f5] text-[11px] font-bold text-md-on-surface-variant uppercase tracking-wider">
                          <tr>
                            <th className="py-3.5 px-4 min-w-[200px]">Produk</th>
                            <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">SKU & Barcode</th>
                            <th className="py-3.5 px-4 min-w-[150px] whitespace-nowrap">Kategori</th>
                            <th className="py-3.5 px-4 min-w-[110px] whitespace-nowrap">Harga Jual</th>
                            <th className="py-3.5 px-4 min-w-[100px] whitespace-nowrap">Stok</th>
                            <th className="py-3.5 px-4 min-w-[90px] text-right whitespace-nowrap">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f0f2f5]">
                          {paginatedProducts.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 px-4 text-center text-md-on-surface-variant">
                                Tidak ada data produk ditemukan.
                              </td>
                            </tr>
                          ) : (
                            paginatedProducts.map((p) => (
                              <tr key={p.id} className="hover:bg-[#f7f9fc]/60 transition-colors">
                                <td className="py-3.5 px-4 font-bold text-md-on-surface align-middle">
                                  <div className="font-semibold text-xs text-md-on-surface">{p.name}</div>
                                  {p.description && (
                                    <div className="text-[11px] text-md-on-surface-variant font-normal truncate max-w-xs sm:max-w-sm mt-0.5">
                                      {p.description}
                                    </div>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 font-mono text-md-on-surface-variant align-middle whitespace-nowrap">
                                  <div className="font-semibold text-xs text-md-on-surface tracking-tight">{p.sku}</div>
                                  <div className="text-[10px] text-md-outline tracking-normal">{p.barcode || '-'}</div>
                                </td>
                                <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${getCategoryBadgeClass(p.categoryName)}`}>
                                    {p.categoryName || 'Umum'}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-mono font-bold text-md-on-surface align-middle whitespace-nowrap">
                                  Rp {p.price.toLocaleString('id-ID')}
                                </td>
                                <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold whitespace-nowrap ${
                                      p.stock <= p.minStockAlert
                                        ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                        : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                                    }`}
                                  >
                                    {p.stock <= p.minStockAlert && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                                    <span>{p.stock} unit</span>
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap align-middle">
                                  <button
                                    onClick={() => {
                                      setAdjustModalProduct(p);
                                      setAdjustQty(0);
                                      setAdjustType('ADD');
                                      setAdjustReason('Koreksi Stok');
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-[#f0f4f9] text-md-on-surface-variant hover:text-emerald-700 transition-colors inline-flex items-center justify-center"
                                    title="Sesuaikan Stok"
                                  >
                                    <Layers className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenEditProduct(p)}
                                    className="p-1.5 rounded-lg hover:bg-[#f0f4f9] text-md-on-surface-variant hover:text-md-primary transition-colors inline-flex items-center justify-center"
                                    title="Edit Produk"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p.id, p.name)}
                                    className="p-1.5 rounded-lg hover:bg-red-50 text-md-on-surface-variant hover:text-red-600 transition-colors inline-flex items-center justify-center"
                                    title="Hapus Produk"
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

              {/* Subtab 2: CATEGORIES MANAGEMENT */}
              {productSubTab === 'CATEGORIES' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="relative flex-1 w-full sm:w-64">
                      <Search className="w-4 h-4 text-md-on-surface-variant/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="Cari kategori atau slug..."
                        className="w-full bg-white border border-[#e0e2ec] focus:border-md-primary rounded-full pl-10 pr-4 py-2 text-xs text-md-on-surface outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenCreateCategory}
                      className="inline-flex items-center justify-center flex-row whitespace-nowrap px-4 py-2 rounded-full bg-md-primary hover:bg-md-primary-hover text-white text-xs font-semibold shadow-none transition-all"
                    >
                      <FolderPlus className="w-4 h-4 mr-1.5 shrink-0" />
                      <span>Tambah Kategori</span>
                    </button>
                  </div>

                  {/* Categories Table */}
                  <div className="bg-white border border-[#f0f2f5] rounded-3xl overflow-hidden shadow-none">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-md-on-surface">
                        <thead className="bg-[#f7f9fc] border-b border-[#f0f2f5] text-[11px] font-bold text-md-on-surface-variant uppercase tracking-wider">
                          <tr>
                            <th className="py-3.5 px-4 w-12 text-center whitespace-nowrap">No</th>
                            <th className="py-3.5 px-4 min-w-[150px] whitespace-nowrap">Nama Kategori</th>
                            <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">Slug URL</th>
                            <th className="py-3.5 px-4 min-w-[200px]">Deskripsi</th>
                            <th className="py-3.5 px-4 min-w-[110px] text-center whitespace-nowrap">Jumlah Produk</th>
                            <th className="py-3.5 px-4 min-w-[80px] text-right whitespace-nowrap">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f0f2f5]">
                          {filteredCategories.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 px-4 text-center text-md-on-surface-variant">
                                Tidak ada data kategori ditemukan.
                              </td>
                            </tr>
                          ) : (
                            filteredCategories.map((cat, idx) => {
                              const linkedCount = productsList.filter(
                                (p) => p.categoryId === cat.id || p.categoryName === cat.name
                              ).length;
                              return (
                                <tr key={cat.id} className="hover:bg-[#f7f9fc]/60 transition-colors">
                                  <td className="py-3.5 px-4 text-center font-mono text-md-on-surface-variant align-middle">{idx + 1}</td>
                                  <td className="py-3.5 px-4 font-bold text-md-on-surface align-middle whitespace-nowrap">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${getCategoryBadgeClass(cat.name)}`}>
                                      {cat.name}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 font-mono text-xs text-md-on-surface-variant align-middle whitespace-nowrap">
                                    <span className="px-2.5 py-1 rounded-lg bg-[#f0f4f9] text-md-on-surface font-semibold">
                                      {cat.slug}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-md-on-surface-variant align-middle max-w-sm">
                                    {cat.description || '-'}
                                  </td>
                                  <td className="py-3.5 px-4 text-center font-mono font-bold text-md-on-surface align-middle whitespace-nowrap">
                                    <span className="px-3 py-1 rounded-full bg-[#f0f4f9] text-xs font-semibold">
                                      {linkedCount} produk
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap align-middle">
                                    <button
                                      onClick={() => handleOpenEditCategory(cat)}
                                      className="p-1.5 rounded-lg hover:bg-[#f0f4f9] text-md-on-surface-variant hover:text-md-primary transition-colors inline-flex items-center justify-center"
                                      title="Edit Kategori"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setDeleteCategoryModal(cat)}
                                      className="p-1.5 rounded-lg hover:bg-red-50 text-md-on-surface-variant hover:text-red-600 transition-colors inline-flex items-center justify-center"
                                      title="Hapus Kategori"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
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
              {/* Report Header & Action Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#f0f2f5]">
                <div>
                  <h3 className="text-base font-bold text-md-on-surface">Laporan & Analitik Penjualan</h3>
                  <p className="text-xs text-md-on-surface-variant">
                    Analisis performa omzet, efektivitas saluran, produk terlaris, dan rincian metode pembayaran.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center justify-center text-xs font-semibold py-2.5 px-4 rounded-full border border-md-outline/20 text-md-on-surface hover:bg-md-surface-variant/40 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                    <span>Cetak Laporan</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportReportCSV}
                    className="inline-flex items-center justify-center text-xs font-semibold py-2.5 px-4 rounded-full bg-md-primary text-white hover:bg-md-primary-hover shadow-none transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                    <span>Ekspor CSV ({filteredReportOrders.length})</span>
                  </button>
                </div>
              </div>

              {/* Filters & Period Selector */}
              <div className="bg-white p-5 rounded-3xl border border-[#f0f2f5] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f2f5] pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-md-on-surface">
                    <Filter className="w-4 h-4 text-md-primary" />
                    <span>Filter & Parameter Laporan</span>
                  </div>
                  {(reportPeriod !== 'ALL' || reportSourceFilter !== 'ALL' || reportPaymentFilter !== 'ALL' || reportStartDate || reportEndDate) && (
                    <button
                      type="button"
                      onClick={() => {
                        setReportPeriod('ALL');
                        setReportSourceFilter('ALL');
                        setReportPaymentFilter('ALL');
                        setReportStartDate('');
                        setReportEndDate('');
                      }}
                      className="text-xs text-md-primary font-medium hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset Filter
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-md-on-surface-variant mb-1">
                      Rentang Waktu
                    </label>
                    <select
                      value={reportPeriod}
                      onChange={(e) => setReportPeriod(e.target.value as any)}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-md-outline/20 bg-md-surface-variant/20 focus:outline-none focus:border-md-primary font-medium"
                    >
                      <option value="ALL">Semua Waktu</option>
                      <option value="TODAY">Hari Ini</option>
                      <option value="7DAYS">7 Hari Terakhir</option>
                      <option value="30DAYS">30 Hari Terakhir</option>
                      <option value="THIS_MONTH">Bulan Ini</option>
                      <option value="CUSTOM">Kustom Tanggal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-md-on-surface-variant mb-1">
                      Saluran Penjualan
                    </label>
                    <select
                      value={reportSourceFilter}
                      onChange={(e) => setReportSourceFilter(e.target.value as any)}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-md-outline/20 bg-md-surface-variant/20 focus:outline-none focus:border-md-primary font-medium"
                    >
                      <option value="ALL">Semua Saluran (POS & Online)</option>
                      <option value="POS">Hanya Kasir (POS Offline)</option>
                      <option value="ONLINE">Hanya Toko Online (Web)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-md-on-surface-variant mb-1">
                      Metode Pembayaran
                    </label>
                    <select
                      value={reportPaymentFilter}
                      onChange={(e) => setReportPaymentFilter(e.target.value as any)}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-md-outline/20 bg-md-surface-variant/20 focus:outline-none focus:border-md-primary font-medium"
                    >
                      <option value="ALL">Semua Metode</option>
                      <option value="CASH">Tunai (CASH)</option>
                      <option value="QRIS">QRIS Statis/Dinamis</option>
                      <option value="DEBIT_CARD">Kartu Debit / EDC</option>
                      <option value="ONLINE_VA">Online VA / E-Payment</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <div className="w-full py-2 px-3 rounded-xl bg-md-surface-variant/30 text-xs text-md-on-surface-variant font-medium flex items-center justify-between">
                      <span>Data Cocok:</span>
                      <span className="font-bold text-md-on-surface">{filteredReportOrders.length} Pesanan</span>
                    </div>
                  </div>
                </div>

                {reportPeriod === 'CUSTOM' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#f0f2f5]">
                    <div>
                      <label className="block text-[11px] font-semibold text-md-on-surface-variant mb-1">
                        Tanggal Mulai
                      </label>
                      <input
                        type="date"
                        value={reportStartDate}
                        onChange={(e) => setReportStartDate(e.target.value)}
                        className="w-full text-xs py-2 px-3 rounded-xl border border-md-outline/20 bg-white focus:outline-none focus:border-md-primary font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-md-on-surface-variant mb-1">
                        Tanggal Selesai
                      </label>
                      <input
                        type="date"
                        value={reportEndDate}
                        onChange={(e) => setReportEndDate(e.target.value)}
                        className="w-full text-xs py-2 px-3 rounded-xl border border-md-outline/20 bg-white focus:outline-none focus:border-md-primary font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white border border-[#f0f2f5] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-md-on-surface-variant font-medium">Total Omzet Bersih</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-md-on-surface font-mono">
                    Rp {reportNetSales.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-md-on-surface-variant flex items-center justify-between pt-1">
                    <span>Omzet Kotor:</span>
                    <span className="font-mono font-medium">Rp {reportGrossSales.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-[#f0f2f5] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-md-on-surface-variant font-medium">Transaksi Berhasil</span>
                    <Receipt className="w-4 h-4 text-md-primary" />
                  </div>
                  <div className="text-2xl font-bold text-md-on-surface font-mono">
                    {reportTotalOrders} <span className="text-sm font-normal text-md-on-surface-variant">transaksi</span>
                  </div>
                  <div className="text-[11px] text-md-on-surface-variant flex items-center justify-between pt-1">
                    <span>Kasir: {posOrders.length}</span>
                    <span>Online: {onlineOrders.length}</span>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-[#f0f2f5] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-md-on-surface-variant font-medium">Rata-rata Nilai Order (AOV)</span>
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-md-on-surface font-mono">
                    Rp {reportAOV.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-md-on-surface-variant pt-1">
                    Basket size per transaksi belanja
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-[#f0f2f5] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-md-on-surface-variant font-medium">Total Produk & Diskon</span>
                    <Tag className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-md-on-surface font-mono">
                    {reportTotalItemsSold} <span className="text-sm font-normal text-md-on-surface-variant">unit terjual</span>
                  </div>
                  <div className="text-[11px] text-md-on-surface-variant flex items-center justify-between pt-1">
                    <span>Diskon Diberikan:</span>
                    <span className="font-mono font-medium text-rose-600">-Rp {reportTotalDiscount.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Sub-tab Navigation */}
              <div className="flex items-center gap-2 border-b border-[#f0f2f5] pb-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setReportSubTab('OVERVIEW')}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    reportSubTab === 'OVERVIEW'
                      ? 'bg-md-primary text-white'
                      : 'bg-white text-md-on-surface-variant hover:bg-md-surface-variant/40 border border-[#f0f2f5]'
                  }`}
                >
                  Ringkasan & Saluran
                </button>
                <button
                  type="button"
                  onClick={() => setReportSubTab('PRODUCTS')}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    reportSubTab === 'PRODUCTS'
                      ? 'bg-md-primary text-white'
                      : 'bg-white text-md-on-surface-variant hover:bg-md-surface-variant/40 border border-[#f0f2f5]'
                  }`}
                >
                  Produk Terlaris ({reportTopProductsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReportSubTab('PAYMENTS')}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    reportSubTab === 'PAYMENTS'
                      ? 'bg-md-primary text-white'
                      : 'bg-white text-md-on-surface-variant hover:bg-md-surface-variant/40 border border-[#f0f2f5]'
                  }`}
                >
                  Metode Pembayaran ({paymentBreakdownList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReportSubTab('DAILY')}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    reportSubTab === 'DAILY'
                      ? 'bg-md-primary text-white'
                      : 'bg-white text-md-on-surface-variant hover:bg-md-surface-variant/40 border border-[#f0f2f5]'
                  }`}
                >
                  Rekap Harian ({dailyReportList.length})
                </button>
              </div>

              {/* Sub-tab Content: OVERVIEW */}
              {reportSubTab === 'OVERVIEW' && (
                <div className="space-y-6">
                  {/* Channel Breakdown Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-[#f0f2f5] space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Store className="w-5 h-5 text-md-primary" />
                          <h4 className="text-sm font-bold text-md-on-surface">Kasir POS Offline</h4>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-md-primary/10 text-md-primary">
                          {reportNetSales > 0 ? Math.round((posRevenue / reportNetSales) * 100) : 0}% Omzet
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-md-on-surface-variant">
                          <span>Total Omzet</span>
                          <span className="font-mono font-bold text-md-on-surface">Rp {posRevenue.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-xs text-md-on-surface-variant">
                          <span>Jumlah Transaksi</span>
                          <span className="font-mono font-bold text-md-on-surface">{posOrders.length} transaksi</span>
                        </div>
                        <div className="w-full bg-[#f0f2f5] h-2 rounded-full overflow-hidden mt-3">
                          <div
                            className="bg-md-primary h-full rounded-full transition-all duration-500"
                            style={{ width: `${reportNetSales > 0 ? (posRevenue / reportNetSales) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-[#f0f2f5] space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5 text-emerald-600" />
                          <h4 className="text-sm font-bold text-md-on-surface">Toko Online (E-Commerce Web)</h4>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                          {reportNetSales > 0 ? Math.round((onlineRevenue / reportNetSales) * 100) : 0}% Omzet
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-md-on-surface-variant">
                          <span>Total Omzet</span>
                          <span className="font-mono font-bold text-md-on-surface">Rp {onlineRevenue.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-xs text-md-on-surface-variant">
                          <span>Jumlah Transaksi</span>
                          <span className="font-mono font-bold text-md-on-surface">{onlineOrders.length} pesanan</span>
                        </div>
                        <div className="w-full bg-[#f0f2f5] h-2 rounded-full overflow-hidden mt-3">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${reportNetSales > 0 ? (onlineRevenue / reportNetSales) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Breakdown Table */}
                  <div className="bg-white p-6 rounded-3xl border border-[#f0f2f5] space-y-4">
                    <h4 className="text-sm font-bold text-md-on-surface">Rincian Finansial Periode Terpilih</h4>
                    <div className="divide-y divide-[#f0f2f5] text-xs">
                      <div className="py-3 flex justify-between items-center text-md-on-surface-variant">
                        <span>Penjualan Kotor (Gross Sales)</span>
                        <span className="font-mono font-semibold text-md-on-surface">Rp {reportGrossSales.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="py-3 flex justify-between items-center text-md-on-surface-variant">
                        <span>Total Potongan Promo & Diskon</span>
                        <span className="font-mono font-semibold text-rose-600">- Rp {reportTotalDiscount.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="py-3 flex justify-between items-center font-bold text-md-on-surface text-sm bg-[#f7f9fc] px-3 rounded-xl mt-1">
                        <span>Penjualan Bersih (Net Revenue)</span>
                        <span className="font-mono text-emerald-700">Rp {reportNetSales.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab Content: PRODUCTS */}
              {reportSubTab === 'PRODUCTS' && (
                <div className="bg-white rounded-3xl border border-[#f0f2f5] overflow-hidden">
                  <div className="p-6 border-b border-[#f0f2f5] flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-md-on-surface">Peringkat Produk Terlaris</h4>
                      <p className="text-xs text-md-on-surface-variant">Daftar produk dengan volume dan nilai penjualan tertinggi</p>
                    </div>
                  </div>
                  {reportTopProductsList.length === 0 ? (
                    <div className="p-12 text-center text-xs text-md-on-surface-variant">
                      Tidak ada data penjualan produk pada kriteria filter ini.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#f0f2f5] bg-md-surface-variant/20 font-semibold text-md-on-surface-variant">
                            <th className="py-3 px-4 w-12 text-center">No</th>
                            <th className="py-3 px-4">Nama Produk</th>
                            <th className="py-3 px-4">SKU</th>
                            <th className="py-3 px-4 text-center">Unit Terjual</th>
                            <th className="py-3 px-4 text-right">Total Pendapatan</th>
                            <th className="py-3 px-4 text-right">Kontribusi Omzet</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f0f2f5]">
                          {reportTopProductsList.map((prod, idx) => {
                            const contribution = reportNetSales > 0 ? Math.round((prod.revenue / reportNetSales) * 100) : 0;
                            return (
                              <tr key={prod.name} className="hover:bg-md-surface-variant/10">
                                <td className="py-3 px-4 text-center font-bold text-md-on-surface-variant">
                                  {idx === 0 ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">1</span>
                                  ) : idx === 1 ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold">2</span>
                                  ) : idx === 2 ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold">3</span>
                                  ) : (
                                    idx + 1
                                  )}
                                </td>
                                <td className="py-3 px-4 font-semibold text-md-on-surface">{prod.name}</td>
                                <td className="py-3 px-4 font-mono text-md-on-surface-variant">{prod.sku}</td>
                                <td className="py-3 px-4 text-center font-mono font-bold text-md-on-surface">{prod.sold} pcs</td>
                                <td className="py-3 px-4 text-right font-mono font-bold text-md-on-surface">
                                  Rp {prod.revenue.toLocaleString('id-ID')}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <div className="w-16 bg-[#f0f2f5] h-1.5 rounded-full overflow-hidden hidden sm:block">
                                      <div
                                        className="bg-md-primary h-full rounded-full"
                                        style={{ width: `${Math.min(100, contribution)}%` }}
                                      />
                                    </div>
                                    <span className="font-mono text-xs font-semibold text-md-on-surface-variant">{contribution}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab Content: PAYMENTS */}
              {reportSubTab === 'PAYMENTS' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-[#f0f2f5] space-y-4">
                    <h4 className="text-sm font-bold text-md-on-surface">Porsi Transaksi Berdasarkan Metode</h4>
                    <p className="text-xs text-md-on-surface-variant">Rincian perolehan dana dari masing-masing kanal pembayaran</p>
                    
                    <div className="space-y-4 pt-2">
                      {paymentBreakdownList.length === 0 ? (
                        <div className="text-center py-8 text-xs text-md-on-surface-variant">
                          Tidak ada data pembayaran.
                        </div>
                      ) : (
                        paymentBreakdownList.map((item) => (
                          <div key={item.method} className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="font-semibold text-md-on-surface">
                                {item.method === 'CASH' && 'Tunai (CASH)'}
                                {item.method === 'QRIS' && 'QRIS Statis/Dinamis'}
                                {item.method === 'DEBIT_CARD' && 'Kartu Debit / EDC'}
                                {item.method === 'ONLINE_VA' && 'Virtual Account / Online'}
                                {!['CASH', 'QRIS', 'DEBIT_CARD', 'ONLINE_VA'].includes(item.method) && item.method}
                              </span>
                              <span className="font-mono font-bold text-md-on-surface">
                                Rp {item.total.toLocaleString('id-ID')} ({item.percent}%)
                              </span>
                            </div>
                            <div className="w-full bg-[#f0f2f5] h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-md-primary h-full rounded-full transition-all duration-500"
                                style={{ width: `${item.percent}%` }}
                              />
                            </div>
                            <div className="text-[11px] text-md-on-surface-variant text-right">
                              {item.count} transaksi berhasil
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-[#f0f2f5] space-y-4">
                    <h4 className="text-sm font-bold text-md-on-surface">Tabel Metode Pembayaran</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#f0f2f5] bg-md-surface-variant/20 font-semibold text-md-on-surface-variant">
                            <th className="py-2.5 px-3">Metode</th>
                            <th className="py-2.5 px-3 text-center">Transaksi</th>
                            <th className="py-2.5 px-3 text-right">Total Dana</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f0f2f5]">
                          {paymentBreakdownList.map((item) => (
                            <tr key={item.method} className="hover:bg-md-surface-variant/10">
                              <td className="py-2.5 px-3 font-semibold text-md-on-surface">
                                {item.method === 'CASH' && 'Tunai (CASH)'}
                                {item.method === 'QRIS' && 'QRIS'}
                                {item.method === 'DEBIT_CARD' && 'Kartu Debit'}
                                {item.method === 'ONLINE_VA' && 'Virtual Account'}
                                {!['CASH', 'QRIS', 'DEBIT_CARD', 'ONLINE_VA'].includes(item.method) && item.method}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono">{item.count}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-md-on-surface">
                                Rp {item.total.toLocaleString('id-ID')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab Content: DAILY */}
              {reportSubTab === 'DAILY' && (
                <div className="bg-white rounded-3xl border border-[#f0f2f5] overflow-hidden">
                  <div className="p-6 border-b border-[#f0f2f5] flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-md-on-surface">Rekapitulasi Penjualan Harian</h4>
                      <p className="text-xs text-md-on-surface-variant">Akumulasi transaksi dan omzet dikelompokkan per tanggal</p>
                    </div>
                  </div>
                  {dailyReportList.length === 0 ? (
                    <div className="p-12 text-center text-xs text-md-on-surface-variant">
                      Tidak ada data penjualan pada periode ini.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#f0f2f5] bg-md-surface-variant/20 font-semibold text-md-on-surface-variant">
                            <th className="py-3 px-4">Tanggal</th>
                            <th className="py-3 px-4 text-center">Jumlah Pesanan</th>
                            <th className="py-3 px-4 text-center">Unit Terjual</th>
                            <th className="py-3 px-4 text-right">Penjualan Kotor</th>
                            <th className="py-3 px-4 text-right">Potongan Diskon</th>
                            <th className="py-3 px-4 text-right font-bold text-md-on-surface">Penjualan Bersih</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f0f2f5]">
                          {dailyReportList.map((day) => (
                            <tr key={day.date} className="hover:bg-md-surface-variant/10">
                              <td className="py-3 px-4 font-semibold text-md-on-surface font-mono">
                                {new Date(day.date).toLocaleDateString('id-ID', {
                                  weekday: 'short',
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </td>
                              <td className="py-3 px-4 text-center font-mono">{day.ordersCount}</td>
                              <td className="py-3 px-4 text-center font-mono">{day.itemsCount}</td>
                              <td className="py-3 px-4 text-right font-mono">Rp {day.gross.toLocaleString('id-ID')}</td>
                              <td className="py-3 px-4 text-right font-mono text-rose-600">
                                {day.discount > 0 ? `-Rp ${day.discount.toLocaleString('id-ID')}` : '-'}
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                                Rp {day.net.toLocaleString('id-ID')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-[#f7f9fc] font-bold text-md-on-surface border-t-2 border-[#f0f2f5]">
                            <td className="py-3 px-4">Total ({dailyReportList.length} Hari)</td>
                            <td className="py-3 px-4 text-center font-mono">{reportTotalOrders}</td>
                            <td className="py-3 px-4 text-center font-mono">{reportTotalItemsSold}</td>
                            <td className="py-3 px-4 text-right font-mono">Rp {reportGrossSales.toLocaleString('id-ID')}</td>
                            <td className="py-3 px-4 text-right font-mono text-rose-600">
                              -Rp {reportTotalDiscount.toLocaleString('id-ID')}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-emerald-700">
                              Rp {reportNetSales.toLocaleString('id-ID')}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              )}
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

          {/* Section: Promo Codes & Tax Settings */}
          {navSection === 'PROMOS_TAX' && (
            <div className="space-y-6">
              {/* Header Title & Subtabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-md-on-surface">Promo & Pengaturan Operasional</h2>
                  <p className="text-xs text-md-on-surface-variant mt-0.5">
                    Kelola diskon promosi toko dan konfigurasi tarif pajak PPN serta biaya layanan kasir / online.
                  </p>
                </div>

                {/* Sub-tab Switcher */}
                <div className="inline-flex p-1 bg-[#eceef4] rounded-2xl border border-[#e0e2ec]">
                  <button
                    type="button"
                    onClick={() => setPromoSubTab('PROMOS')}
                    className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      promoSubTab === 'PROMOS'
                        ? 'bg-white text-md-primary shadow-xs'
                        : 'text-md-on-surface-variant hover:text-md-on-surface'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                    <span>Kode Promo ({promosList.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromoSubTab('TAX')}
                    className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      promoSubTab === 'TAX'
                        ? 'bg-white text-md-primary shadow-xs'
                        : 'text-md-on-surface-variant hover:text-md-on-surface'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                    <span>Pajak & Biaya Layanan</span>
                  </button>
                </div>
              </div>

              {/* Subtab 1: PROMO CODE MANAGEMENT */}
              {promoSubTab === 'PROMOS' && (
                <div className="space-y-5">
                  {/* KPI Cards for Promos */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-3xl bg-white border border-[#f0f2f5] shadow-none space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-md-on-surface-variant font-medium">Total Promo Terdaftar</span>
                        <Tag className="w-4 h-4 text-md-primary" />
                      </div>
                      <div className="text-2xl font-black text-md-on-surface">{promosList.length}</div>
                      <p className="text-[11px] text-md-on-surface-variant">Voucher promosi tersimpan</p>
                    </div>

                    <div className="p-4 rounded-3xl bg-white border border-[#f0f2f5] shadow-none space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-md-on-surface-variant font-medium">Promo Aktif Saat Ini</span>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <div className="text-2xl font-black text-emerald-600">
                        {promosList.filter((p) => p.isActive).length}
                      </div>
                      <p className="text-[11px] text-md-on-surface-variant">Dapat langsung digunakan checkout</p>
                    </div>

                    <div className="p-4 rounded-3xl bg-white border border-[#f0f2f5] shadow-none space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-md-on-surface-variant font-medium">Total Klaim / Penggunaan</span>
                        <Sparkles className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="text-2xl font-black text-md-on-surface">
                        {promosList.reduce((sum, p) => sum + (p.usageCount || 0), 0)}x
                      </div>
                      <p className="text-[11px] text-md-on-surface-variant">Transaksi memanfaatkan promo</p>
                    </div>
                  </div>

                  {/* Filter & Action Toolbar */}
                  <div className="bg-white border border-[#f0f2f5] p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 shadow-none">
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                      <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="w-4 h-4 text-md-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Cari kode promo atau deskripsi..."
                          value={promoSearch}
                          onChange={(e) => setPromoSearch(e.target.value)}
                          className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-full pl-9 pr-4 py-2 text-xs outline-none focus:border-md-primary transition-colors"
                        />
                      </div>

                      <select
                        value={promoStatusFilter}
                        onChange={(e) => setPromoStatusFilter(e.target.value as any)}
                        className="bg-[#f7f9fc] border border-[#e0e2ec] rounded-full px-3.5 py-2 text-xs outline-none font-semibold text-md-on-surface"
                      >
                        <option value="ALL">Semua Status</option>
                        <option value="ACTIVE">Hanya Aktif</option>
                        <option value="INACTIVE">Non-Aktif</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenCreatePromo}
                      className="inline-flex items-center justify-center flex-row whitespace-nowrap text-xs font-semibold py-2 px-4 rounded-full bg-md-primary text-white hover:bg-md-primary-hover shadow-none transition-all"
                    >
                      <Plus className="w-4 h-4 mr-1.5 shrink-0" />
                      <span>Tambah Kode Promo</span>
                    </button>
                  </div>

                  {/* Promo Table */}
                  <div className="bg-white border border-[#f0f2f5] rounded-3xl overflow-hidden shadow-none">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-md-on-surface">
                        <thead className="bg-[#f7f9fc] border-b border-[#f0f2f5] text-[11px] font-bold text-md-on-surface-variant uppercase">
                          <tr>
                            <th className="p-4">Kode Promo</th>
                            <th className="p-4">Besaran Diskon</th>
                            <th className="p-4">Syarat & Batas</th>
                            <th className="p-4">Pemakaian</th>
                            <th className="p-4">Masa Berlaku</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f0f2f5]">
                          {filteredPromos.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-md-on-surface-variant">
                                Tidak ada kode promo yang cocok dengan pencarian atau filter.
                              </td>
                            </tr>
                          ) : (
                            filteredPromos.map((p) => (
                              <tr key={p.id} className="hover:bg-[#f7f9fc]/60 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-mono font-bold text-xs px-2.5 py-1 bg-md-primary/10 text-md-primary rounded-lg border border-md-primary/20 tracking-wider">
                                      {p.code}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard?.writeText(p.code);
                                        toast.info(`Kode ${p.code} disalin ke papan klip!`);
                                      }}
                                      title="Salin kode promo"
                                      className="p-1 rounded-md text-md-on-surface-variant hover:bg-[#f0f4f9] hover:text-md-primary transition-colors"
                                    >
                                      <Tag className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <p className="font-semibold text-xs text-md-on-surface mt-1">{p.description}</p>
                                </td>

                                <td className="p-4">
                                  {p.discountType === 'PERCENTAGE' ? (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                      Diskon {p.discountValue}%
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                      Potongan Rp {p.discountValue.toLocaleString('id-ID')}
                                    </span>
                                  )}
                                </td>

                                <td className="p-4 space-y-0.5 text-[11px]">
                                  <div className="text-md-on-surface">
                                    Min. Belanja: <span className="font-semibold">{p.minPurchase > 0 ? `Rp ${p.minPurchase.toLocaleString('id-ID')}` : 'Rp 0'}</span>
                                  </div>
                                  {p.discountType === 'PERCENTAGE' && p.maxDiscount && (
                                    <div className="text-md-on-surface-variant">
                                      Maks. Diskon: <span className="font-semibold">Rp {p.maxDiscount.toLocaleString('id-ID')}</span>
                                    </div>
                                  )}
                                </td>

                                <td className="p-4 text-[11px]">
                                  <span className="font-semibold text-md-on-surface">{p.usageCount || 0}x</span>
                                  <span className="text-md-on-surface-variant"> klaim</span>
                                </td>

                                <td className="p-4 text-[11px] font-mono text-md-on-surface-variant">
                                  {p.validUntil ? (
                                    <span>
                                      s/d {new Date(p.validUntil).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      })}
                                    </span>
                                  ) : (
                                    <span className="text-emerald-700 font-medium">Selamanya</span>
                                  )}
                                </td>

                                <td className="p-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePromoStatus(p.id)}
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                                      p.isActive
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                        : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                                    }`}
                                  >
                                    {p.isActive ? '● Aktif' : '○ Non-Aktif'}
                                  </button>
                                </td>

                                <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                                  <button
                                    onClick={() => handleOpenEditPromo(p)}
                                    className="p-1.5 rounded-full hover:bg-[#f0f4f9] text-md-on-surface-variant hover:text-md-primary transition-colors"
                                    aria-label="Edit promo"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeletePromoModal(p)}
                                    className="p-1.5 rounded-full hover:bg-red-50 text-md-on-surface-variant hover:text-red-600 transition-colors"
                                    aria-label="Hapus promo"
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

              {/* Subtab 2: TAX & SERVICE CHARGE SETTINGS */}
              {promoSubTab === 'TAX' && (
                <form onSubmit={handleSaveTaxSettings} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Settings Column */}
                    <div className="lg:col-span-8 space-y-5">
                      {/* Card 1: PPN / Tax Settings */}
                      <div className="bg-white border border-[#f0f2f5] p-6 rounded-3xl space-y-4 shadow-none">
                        <div className="flex items-start justify-between pb-3 border-b border-[#f0f2f5]">
                          <div>
                            <h3 className="text-sm font-bold text-md-on-surface flex items-center">
                              <Percent className="w-4 h-4 mr-2 text-md-primary" />
                              Pajak Pertambahan Nilai (PPN / Sales Tax)
                            </h3>
                            <p className="text-xs text-md-on-surface-variant mt-0.5">
                              Atur pembebanan pajak negara untuk semua pesanan transaksi POS dan Web.
                            </p>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={taxSettings.ppnEnabled}
                              onChange={(e) => setTaxSettings({ ...taxSettings, ppnEnabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-md-primary"></div>
                          </label>
                        </div>

                        {taxSettings.ppnEnabled ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-md-on-surface">Tarif Pajak PPN (%)</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  required
                                  value={taxSettings.ppnRate}
                                  onChange={(e) => setTaxSettings({ ...taxSettings, ppnRate: Number(e.target.value) || 0 })}
                                  className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs font-bold outline-none focus:border-md-primary"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-md-on-surface-variant font-bold">%</span>
                              </div>
                              <p className="text-[10px] text-md-on-surface-variant">Standar perpajakan umum: 11% atau 12%</p>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-md-on-surface">Mode Perhitungan Pajak</label>
                              <select
                                value={taxSettings.ppnType}
                                onChange={(e) => setTaxSettings({ ...taxSettings, ppnType: e.target.value as any })}
                                className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs font-semibold outline-none focus:border-md-primary"
                              >
                                <option value="EXCLUSIVE">Exclusive (Ditambahkan di luar harga produk)</option>
                                <option value="INCLUSIVE">Inclusive (Harga produk sudah termasuk pajak)</option>
                              </select>
                              <p className="text-[10px] text-md-on-surface-variant">Umumnya POS menggunakan mode Exclusive</p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/60 text-xs text-amber-800">
                            Pajak PPN saat ini dinonaktifkan. Transaksi tidak akan mengenakan pajak tambahan.
                          </div>
                        )}
                      </div>

                      {/* Card 2: Service Charge Settings */}
                      <div className="bg-white border border-[#f0f2f5] p-6 rounded-3xl space-y-4 shadow-none">
                        <div className="flex items-start justify-between pb-3 border-b border-[#f0f2f5]">
                          <div>
                            <h3 className="text-sm font-bold text-md-on-surface flex items-center">
                              <DollarSign className="w-4 h-4 mr-2 text-md-primary" />
                              Biaya Layanan (Service Charge)
                            </h3>
                            <p className="text-xs text-md-on-surface-variant mt-0.5">
                              Biaya operasional tambahan atau service fee untuk pesanan.
                            </p>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={taxSettings.serviceChargeEnabled}
                              onChange={(e) => setTaxSettings({ ...taxSettings, serviceChargeEnabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-md-primary"></div>
                          </label>
                        </div>

                        {taxSettings.serviceChargeEnabled ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-md-on-surface">Tarif Biaya Layanan (%)</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.5"
                                  required
                                  value={taxSettings.serviceChargeRate}
                                  onChange={(e) => setTaxSettings({ ...taxSettings, serviceChargeRate: Number(e.target.value) || 0 })}
                                  className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs font-bold outline-none focus:border-md-primary"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-md-on-surface-variant font-bold">%</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
                            Biaya layanan dinonaktifkan.
                          </div>
                        )}
                      </div>

                      {/* Card 3: Online Flat Shipping Settings */}
                      <div className="bg-white border border-[#f0f2f5] p-6 rounded-3xl space-y-4 shadow-none">
                        <div className="pb-3 border-b border-[#f0f2f5]">
                          <h3 className="text-sm font-bold text-md-on-surface flex items-center">
                            <Store className="w-4 h-4 mr-2 text-md-primary" />
                            Pengiriman Toko Online (Shipping)
                          </h3>
                          <p className="text-xs text-md-on-surface-variant mt-0.5">
                            Konfigurasi tarif pengiriman flat dan syarat minimum belanja gratis ongkir pada web store.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-md-on-surface">Ongkos Kirim Standar (Rp)</label>
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              value={taxSettings.flatShippingFee}
                              onChange={(e) => setTaxSettings({ ...taxSettings, flatShippingFee: Number(e.target.value) || 0 })}
                              className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs font-semibold outline-none focus:border-md-primary"
                            />
                            <p className="text-[10px] text-md-on-surface-variant">Contoh: Rp 10.000 per pengiriman</p>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-md-on-surface">Min. Belanja Gratis Ongkir (Rp)</label>
                            <input
                              type="number"
                              min="0"
                              step="5000"
                              value={taxSettings.freeShippingMin}
                              onChange={(e) => setTaxSettings({ ...taxSettings, freeShippingMin: Number(e.target.value) || 0 })}
                              className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs font-semibold outline-none focus:border-md-primary"
                            />
                            <p className="text-[10px] text-md-on-surface-variant">Isi 0 jika tidak ada promo gratis ongkir</p>
                          </div>
                        </div>
                      </div>

                      {/* Save Button */}
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center flex-row whitespace-nowrap text-xs font-semibold py-3 px-6 rounded-full bg-md-primary text-white hover:bg-md-primary-hover shadow-none transition-all"
                      >
                        <Check className="w-4 h-4 mr-2 shrink-0" />
                        <span>Simpan Pengaturan Pajak & Biaya</span>
                      </button>
                    </div>

                    {/* Right Live Simulation Preview */}
                    <div className="lg:col-span-4 space-y-4">
                      <div className="bg-[#f0f4f9] border border-[#e0e2ec] p-5 rounded-3xl space-y-4 shadow-none sticky top-6">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-md-primary shrink-0" />
                          <h4 className="text-xs font-bold text-md-on-surface uppercase tracking-wider">
                            Simulasi Transaksi Real-Time
                          </h4>
                        </div>
                        <p className="text-[11px] text-md-on-surface-variant leading-relaxed">
                          Contoh kalkulasi struk otomatis berdasarkan pengaturan pajak dan biaya yang Anda atur:
                        </p>

                        {/* Sample breakdown */}
                        <div className="bg-white rounded-2xl p-4 border border-[#e0e2ec] space-y-2 text-xs">
                          <div className="flex justify-between text-md-on-surface-variant">
                            <span>Subtotal Contoh Produk</span>
                            <span className="font-mono font-semibold text-md-on-surface">Rp 100.000</span>
                          </div>

                          {taxSettings.ppnEnabled && (
                            <div className="flex justify-between text-md-on-surface-variant">
                              <span>
                                PPN ({taxSettings.ppnRate}%)
                                {taxSettings.ppnType === 'INCLUSIVE' && ' (Incl.)'}
                              </span>
                              <span className="font-mono text-md-on-surface font-semibold">
                                {taxSettings.ppnType === 'EXCLUSIVE'
                                  ? `+ Rp ${(100000 * (taxSettings.ppnRate / 100)).toLocaleString('id-ID')}`
                                  : `Termasuk Rp ${Math.round(100000 - 100000 / (1 + taxSettings.ppnRate / 100)).toLocaleString('id-ID')}`}
                              </span>
                            </div>
                          )}

                          {taxSettings.serviceChargeEnabled && (
                            <div className="flex justify-between text-md-on-surface-variant">
                              <span>Biaya Layanan ({taxSettings.serviceChargeRate}%)</span>
                              <span className="font-mono text-md-on-surface font-semibold">
                                + Rp {(100000 * (taxSettings.serviceChargeRate / 100)).toLocaleString('id-ID')}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between text-md-on-surface-variant">
                            <span>Ongkos Kirim Web (Pesanan Rp 100rb)</span>
                            <span className="font-mono text-md-on-surface font-semibold">
                              {100000 >= taxSettings.freeShippingMin && taxSettings.freeShippingMin > 0 ? (
                                <span className="text-emerald-600 font-bold">GRATIS</span>
                              ) : (
                                `+ Rp ${taxSettings.flatShippingFee.toLocaleString('id-ID')}`
                              )}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-[#f0f2f5] flex justify-between font-bold text-sm text-md-primary">
                            <span>Estimasi Total Pembayaran</span>
                            <span className="font-mono">
                              Rp{' '}
                              {(
                                100000 +
                                (taxSettings.ppnEnabled && taxSettings.ppnType === 'EXCLUSIVE'
                                  ? 100000 * (taxSettings.ppnRate / 100)
                                  : 0) +
                                (taxSettings.serviceChargeEnabled
                                  ? 100000 * (taxSettings.serviceChargeRate / 100)
                                  : 0) +
                                (100000 >= taxSettings.freeShippingMin && taxSettings.freeShippingMin > 0
                                  ? 0
                                  : taxSettings.flatShippingFee)
                              ).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>

                        <div className="text-[10px] text-md-on-surface-variant/80 bg-white/70 p-3 rounded-xl border border-dashed border-[#e0e2ec]">
                          💡 Pengaturan ini langsung tersinkronisasi dengan mesin kasir POS dan keranjang belanja toko online.
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              )}
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
                  placeholder="Contoh: Single Origin Espresso"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs text-md-on-surface outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-md-on-surface">Kategori</label>
                  <select
                    value={productForm.categoryName}
                    onChange={(e) => setProductForm({ ...productForm, categoryName: e.target.value })}
                    className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs text-md-on-surface outline-none font-medium"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-md-on-surface">SKU Produk</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
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
                  <label className="text-xs font-semibold text-md-on-surface">Harga Pokok / Modal (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: Number(e.target.value) })}
                    className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs font-mono text-md-on-surface outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-md-on-surface">Batas Peringatan Stok Kritis</label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.minStockAlert}
                    onChange={(e) => setProductForm({ ...productForm, minStockAlert: Number(e.target.value) })}
                    className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs font-mono text-md-on-surface outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-md-on-surface">Barcode / EAN (Opsional)</label>
                <input
                  type="text"
                  value={productForm.barcode}
                  onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                  placeholder="899..."
                  className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs font-mono text-md-on-surface outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-md-on-surface">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Karakter rasa, bahan baku, atau catatan sajian..."
                  className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs text-md-on-surface outline-none resize-none"
                />
              </div>

              <button type="submit" className="w-full inline-flex items-center justify-center flex-row whitespace-nowrap py-2.5 rounded-full bg-md-primary hover:bg-md-primary-hover text-white text-xs font-semibold mt-3">
                {editingProduct ? 'Perbarui Produk' : 'Simpan Produk Baru'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#f0f2f5] p-6 rounded-3xl max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#f0f2f5]">
              <h3 className="text-base font-bold text-md-on-surface">
                {editingCategory ? 'Perbarui Kategori' : 'Tambah Kategori Baru'}
              </h3>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#f0f4f9] text-md-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-md-on-surface">Nama Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kopi & Minuman"
                  value={categoryForm.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setCategoryForm({
                      ...categoryForm,
                      name: val,
                      slug: editingCategory ? categoryForm.slug : autoSlug,
                    });
                  }}
                  className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs text-md-on-surface outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-md-on-surface">Slug URL</label>
                <input
                  type="text"
                  required
                  placeholder="kopi-minuman"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs font-mono text-md-on-surface outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-md-on-surface">Tema Warna Badge</label>
                <select
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs text-md-on-surface outline-none"
                >
                  <option value="amber">Amber (Kopi / Minuman Hangat)</option>
                  <option value="orange">Orange (Pastry / Bakery)</option>
                  <option value="rose">Rose (Makanan Berat / Utama)</option>
                  <option value="emerald">Emerald (Teh / Herbal)</option>
                  <option value="blue">Blue (Snack / Camilan)</option>
                  <option value="purple">Purple (Spesial / Seasonal)</option>
                  <option value="slate">Slate (Netral / Umum)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-md-on-surface">Deskripsi Kategori</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Keterangan kategori menu..."
                  className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs text-md-on-surface outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center flex-row whitespace-nowrap py-2.5 rounded-full bg-md-primary hover:bg-md-primary-hover text-white text-xs font-semibold mt-3"
              >
                {editingCategory ? 'Perbarui Kategori' : 'Simpan Kategori Baru'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {deleteCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#f0f2f5] p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center space-x-3 text-red-600 pb-2 border-b border-[#f0f2f5]">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-md-on-surface">Hapus Kategori</h3>
            </div>
            <p className="text-xs text-md-on-surface-variant">
              Apakah Anda yakin ingin menghapus kategori <span className="font-bold text-md-on-surface">&quot;{deleteCategoryModal.name}&quot;</span>?
            </p>
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCategoryModal(null)}
                className="flex-1 py-2.5 rounded-full border border-[#e0e2ec] text-xs font-semibold text-md-on-surface hover:bg-[#f0f4f9]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCategory(deleteCategoryModal)}
                className="flex-1 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                Hapus Kategori
              </button>
            </div>
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

      {/* Promo Code Create / Edit Modal */}
      {promoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#f0f2f5] p-6 rounded-3xl max-w-md w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#f0f2f5]">
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-md-primary" />
                <h3 className="text-base font-bold text-md-on-surface">
                  {editingPromo ? 'Edit Kode Promo' : 'Buat Kode Promo Baru'}
                </h3>
              </div>
              <button onClick={() => setPromoModalOpen(false)} className="p-1.5 rounded-full hover:bg-[#f0f4f9]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-md-on-surface">Kode Promo (Kupon)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: DISKON25, MERDEKA"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                  className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs font-mono font-bold tracking-wider outline-none focus:border-md-primary uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-md-on-surface">Deskripsi / Judul Promo</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Diskon 25% Spesial Pelanggan Setia"
                  value={promoForm.description}
                  onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                  className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs font-semibold outline-none focus:border-md-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-md-on-surface">Tipe Diskon</label>
                  <select
                    value={promoForm.discountType}
                    onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value as any })}
                    className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-md-primary"
                  >
                    <option value="PERCENTAGE">Persentase (%)</option>
                    <option value="FIXED">Nominal Tetap (Rp)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-md-on-surface">
                    Nilai Diskon {promoForm.discountType === 'PERCENTAGE' ? '(%)' : '(Rp)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={promoForm.discountType === 'PERCENTAGE' ? 100 : undefined}
                    value={promoForm.discountValue}
                    onChange={(e) => setPromoForm({ ...promoForm, discountValue: Number(e.target.value) || 0 })}
                    className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs font-bold outline-none focus:border-md-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-md-on-surface">Min. Belanja (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="0 = Tanpa minimal"
                    value={promoForm.minPurchase}
                    onChange={(e) => setPromoForm({ ...promoForm, minPurchase: Number(e.target.value) || 0 })}
                    className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs font-semibold outline-none focus:border-md-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-md-on-surface">Maks. Potongan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    disabled={promoForm.discountType === 'FIXED'}
                    placeholder="Kosongkan jika unlimited"
                    value={promoForm.maxDiscount}
                    onChange={(e) => setPromoForm({ ...promoForm, maxDiscount: e.target.value ? Number(e.target.value) : '' })}
                    className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs font-semibold outline-none focus:border-md-primary disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-md-on-surface">Masa Berlaku Kupon (s/d Tanggal)</label>
                <input
                  type="date"
                  value={promoForm.validUntil}
                  onChange={(e) => setPromoForm({ ...promoForm, validUntil: e.target.value })}
                  className="w-full bg-[#f7f9fc] border border-[#e0e2ec] rounded-2xl px-4 py-2 text-xs outline-none focus:border-md-primary font-mono"
                />
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promoForm.isActive}
                    onChange={(e) => setPromoForm({ ...promoForm, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-md-primary"></div>
                </label>
                <span className="text-xs font-semibold text-md-on-surface">
                  {promoForm.isActive ? 'Promo Langsung Aktif' : 'Simpan sebagai Non-Aktif (Draf)'}
                </span>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center flex-row whitespace-nowrap py-2.5 rounded-full bg-md-primary hover:bg-md-primary-hover text-white text-xs font-semibold shadow-none transition-all"
                >
                  <Check className="w-4 h-4 mr-1.5 shrink-0" />
                  <span>{editingPromo ? 'Simpan Perubahan Promo' : 'Buat Kode Promo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Promo Modal */}
      {deletePromoModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#f0f2f5] p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-md-on-surface">Hapus Kode Promo</h3>
            </div>
            <p className="text-xs text-md-on-surface-variant">
              Apakah Anda yakin ingin menghapus promo <span className="font-bold text-md-on-surface font-mono">[{deletePromoModal.code}]</span> ({deletePromoModal.description})? Kode promo ini tidak akan bisa digunakan lagi oleh pelanggan.
            </p>
            <div className="flex space-x-2 pt-2">
              <button onClick={() => setDeletePromoModal(null)} className="flex-1 py-2 rounded-full border border-[#e0e2ec] text-xs font-semibold">
                Batal
              </button>
              <button onClick={handleDeletePromo} className="flex-1 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors">
                Hapus Promo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
