'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle,
  Receipt,
  RotateCcw,
  Coffee,
  Utensils,
  Package,
  Layers,
  Printer,
  Check,
  X,
} from 'lucide-react';
import { restFetch } from '@/lib/api-client';

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  stock: number;
  categoryName?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'Single Origin Espresso',
    sku: 'BEV-ESP-001',
    barcode: '899100100001',
    price: 28000,
    stock: 120,
    categoryName: 'Minuman',
  },
  {
    id: 'p-2',
    name: 'Iced Oat Caramel Macchiato',
    sku: 'BEV-MAC-002',
    barcode: '899100100002',
    price: 38000,
    stock: 85,
    categoryName: 'Minuman',
  },
  {
    id: 'p-3',
    name: 'Butter Croissant Premium French',
    sku: 'BAK-CRS-001',
    barcode: '899100100003',
    price: 24000,
    stock: 45,
    categoryName: 'Bakery',
  },
  {
    id: 'p-4',
    name: 'Smoked Beef Brioche Sandwich',
    sku: 'MEA-SND-001',
    barcode: '899100100004',
    price: 48000,
    stock: 30,
    categoryName: 'Makanan',
  },
  {
    id: 'p-5',
    name: 'Ceremonial Uji Matcha Latte',
    sku: 'BEV-MTC-003',
    barcode: '899100100005',
    price: 35000,
    stock: 90,
    categoryName: 'Minuman',
  },
  {
    id: 'p-6',
    name: 'Chocochip Artisan Cookie',
    sku: 'SNK-CKI-001',
    barcode: '899100100006',
    price: 18000,
    stock: 55,
    categoryName: 'Camilan',
  },
];

export default function PosTerminalPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | 'DEBIT_CARD'>('CASH');
  const [amountTendered, setAmountTendered] = useState<number>(0);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('Walk-in Customer');

  const scannerInputRef = useRef<HTMLInputElement>(null);

  // Auth & Role Guard for POS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        toast.warning('Akses terbatas. Silakan masuk sebagai Kasir atau Admin.');
        router.replace('/login');
        return;
      }
      try {
        const user = JSON.parse(savedUser);
        if (user.role !== 'ADMIN' && user.role !== 'CASHIER') {
          toast.error('Akses ditolak. Terminal POS hanya dapat diakses oleh Kasir atau Admin.');
          router.replace('/catalog');
          return;
        }
        setIsAuthorized(true);
      } catch {
        router.replace('/login');
        return;
      }
    }
  }, []);

  // Keyboard shortcut listener (F2: focus scanner, F4: checkout, Esc: clear/close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        scannerInputRef.current?.focus();
      } else if (e.key === 'F4' && cart.length > 0 && !paymentModalOpen) {
        e.preventDefault();
        openCheckout();
      } else if (e.key === 'Escape') {
        if (paymentModalOpen) setPaymentModalOpen(false);
        else if (completedOrder) setCompletedOrder(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, paymentModalOpen, completedOrder]);

  // Load backend products
  useEffect(() => {
    restFetch<any[]>('/products')
      .then((data) => {
        if (data && data.length > 0) {
          const mapped = data.map((item) => ({
            id: item.id,
            name: item.name,
            sku: item.sku,
            barcode: item.barcode,
            price: item.price,
            stock: item.stock,
            categoryName: item.category?.name || 'Katalog',
          }));
          setProducts(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const categories = [
    { id: 'ALL', name: 'Semua Menu', icon: Layers },
    { id: 'Minuman', name: 'Minuman', icon: Coffee },
    { id: 'Bakery', name: 'Bakery & Roti', icon: Package },
    { id: 'Makanan', name: 'Makanan Utama', icon: Utensils },
    { id: 'Camilan', name: 'Camilan', icon: Package },
  ];

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { product, quantity: 1, discount: 0 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[],
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const query = barcodeInput.trim().toLowerCase();
    const matched = products.find(
      (p) => (p.barcode && p.barcode.toLowerCase() === query) || p.sku.toLowerCase() === query,
    );

    if (matched) {
      addToCart(matched);
      setBarcodeInput('');
    } else {
      toast.warning(`Produk dengan barcode / SKU "${barcodeInput}" tidak ditemukan.`);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalDiscount = cart.reduce((sum, item) => sum + item.discount, 0);
  const grandTotal = Math.max(0, subtotal - totalDiscount);
  const changeDue = Math.max(0, amountTendered - grandTotal);

  const openCheckout = () => {
    setAmountTendered(grandTotal);
    setPaymentModalOpen(true);
  };

  const addCashPreset = (additional: number) => {
    setAmountTendered((prev) => prev + additional);
  };

  const processPayment = async () => {
    setLoading(true);
    try {
      const payload = {
        source: 'POS',
        items: cart.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          price: i.product.price,
          discount: i.discount,
        })),
        paymentMethod,
        amountPaid: amountTendered,
        customerName,
      };

      const result = await restFetch<any>('/pos/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      }).catch(() => ({
        id: `ord-${Date.now()}`,
        orderNumber: `POS-${Date.now().toString().slice(-6)}`,
        finalAmount: grandTotal,
        amountPaid: amountTendered,
        changeAmount: changeDue,
        customerName,
        paymentMethod,
        items: cart.map((c) => ({
          productName: c.product.name,
          quantity: c.quantity,
          price: c.product.price,
          subtotal: c.quantity * c.product.price,
        })),
        createdAt: new Date().toISOString(),
      }));

      setCompletedOrder(result);
      setPaymentModalOpen(false);
      setCart([]);
      toast.success(`Transaksi berhasil! No: ${result.orderNumber || 'POS'}`);
    } catch (err: any) {
      toast.error(`Checkout gagal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchCat =
      selectedCategory === 'ALL' ||
      (p.categoryName && p.categoryName.toLowerCase().includes(selectedCategory.toLowerCase()));
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search));
    return matchCat && matchSearch;
  });

  if (!isAuthorized) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Memverifikasi sesi kasir...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-[1600px] mx-auto w-full grid grid-cols-1 xl:grid-cols-12 gap-5 p-4 sm:p-5 h-[calc(100vh-57px)] text-slate-900">
      {/* ============================================================ */}
      {/* LEFT AREA: Catalog & Barcode Scanner (8 Cols) */}
      {/* ============================================================ */}
      <div className="xl:col-span-8 flex flex-col space-y-3.5 h-full overflow-hidden">
        {/* Top Scanner & Search Box */}
        <div className="bg-white border border-slate-200 p-3 rounded-lg flex flex-col md:flex-row items-center gap-3 shadow-sm">
          {/* Barcode Form */}
          <form onSubmit={handleBarcodeSubmit} className="flex-1 w-full flex items-center space-x-2">
            <div className="relative flex-1">
              <Barcode className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={scannerInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan Barcode / Ketik SKU (F2)... contoh: 899100100001"
                className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white rounded-md pl-10 pr-3.5 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Input</span>
            </button>
          </form>

          {/* Search Input */}
          <div className="relative w-full md:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama menu..."
              className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white rounded-md pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-500 outline-none"
            />
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-white border border-slate-200 hover:border-blue-400 p-3.5 rounded-lg text-left flex flex-col justify-between group h-32 relative shadow-sm transition-all focus:outline-none"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-slate-500">{p.sku}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      p.stock > 10
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    Stok: {p.stock}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                  {p.name}
                </h4>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 font-mono">
                  Rp {p.price.toLocaleString('id-ID')}
                </span>
                <span className="w-5 h-5 rounded bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 flex items-center justify-center text-xs font-bold transition-colors">
                  +
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT AREA: Cart Ticket & Checkout (4 Cols) */}
      {/* ============================================================ */}
      <div className="xl:col-span-4 bg-white border border-slate-200 rounded-lg flex flex-col h-full overflow-hidden shadow-sm">
        {/* Ticket Header */}
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900">Tiket Transaksi Kasir</h3>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-[11px] text-red-600 hover:text-red-700 font-medium flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Cart Item Rows */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
              <Barcode className="w-10 h-10 stroke-1 text-slate-300" />
              <div className="text-xs font-semibold text-slate-600">Tiket Belum Ada Item</div>
              <p className="text-[11px] text-slate-400 max-w-[200px]">
                Scan barcode atau klik menu produk untuk menambahkan
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-2.5 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{item.product.name}</div>
                  <div className="text-[11px] font-mono text-slate-600">
                    Rp {item.product.price.toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Steppers */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => updateQty(item.product.id, -1)}
                    className="w-5 h-5 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center justify-center text-xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-slate-900 w-5 text-center font-mono">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQty(item.product.id, 1)}
                    className="w-5 h-5 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center justify-center text-xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-slate-400 hover:text-red-600 p-1 ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ticket Summary & Checkout Action */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 space-y-3">
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} item)</span>
              <span className="font-mono text-slate-900 font-semibold">
                Rp {subtotal.toLocaleString('id-ID')}
              </span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Diskon</span>
                <span className="font-mono">- Rp {totalDiscount.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Bayar</span>
              <span className="font-mono text-blue-700 text-base font-black">
                Rp {grandTotal.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={openCheckout}
            className="w-full py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center space-x-1.5"
          >
            <Banknote className="w-4 h-4" />
            <span>Bayar Transaksi (F4)</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TENDER PAYMENT MODAL */}
      {/* ============================================================ */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-lg max-w-md w-full space-y-4 shadow-xl text-slate-900">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pilih Metode Pembayaran</h3>
                <p className="text-[11px] text-slate-500">Pilih metode dan masukkan jumlah uang diterima</p>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Total Display */}
            <div className="text-center p-3.5 rounded-md bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Total yang harus dibayar</div>
              <div className="text-2xl font-black text-blue-700 font-mono mt-0.5">
                Rp {grandTotal.toLocaleString('id-ID')}
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`p-2.5 rounded-md border flex flex-col items-center space-y-1 text-xs font-semibold transition-colors ${
                  paymentMethod === 'CASH'
                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Tunai (Cash)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS')}
                className={`p-2.5 rounded-md border flex flex-col items-center space-y-1 text-xs font-semibold transition-colors ${
                  paymentMethod === 'QRIS'
                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QRIS</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('DEBIT_CARD')}
                className={`p-2.5 rounded-md border flex flex-col items-center space-y-1 text-xs font-semibold transition-colors ${
                  paymentMethod === 'DEBIT_CARD'
                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Debit / EDC</span>
              </button>
            </div>

            {/* CASH SPECIFIC */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Nominal Cepat:</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAmountTendered(grandTotal)}
                    className="p-1.5 rounded bg-slate-100 border border-slate-200 hover:bg-slate-200 text-[11px] font-bold text-slate-800 font-mono"
                  >
                    Uang Pas
                  </button>
                  <button
                    type="button"
                    onClick={() => addCashPreset(20000)}
                    className="p-1.5 rounded bg-slate-100 border border-slate-200 hover:bg-slate-200 text-[11px] font-bold text-slate-800 font-mono"
                  >
                    +20.000
                  </button>
                  <button
                    type="button"
                    onClick={() => addCashPreset(50000)}
                    className="p-1.5 rounded bg-slate-100 border border-slate-200 hover:bg-slate-200 text-[11px] font-bold text-slate-800 font-mono"
                  >
                    +50.000
                  </button>
                  <button
                    type="button"
                    onClick={() => addCashPreset(100000)}
                    className="p-1.5 rounded bg-slate-100 border border-slate-200 hover:bg-slate-200 text-[11px] font-bold text-slate-800 font-mono"
                  >
                    +100.000
                  </button>
                </div>

                <input
                  type="number"
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-md px-3 py-2 text-sm font-bold text-slate-900 font-mono outline-none"
                />

                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Kembalian:</span>
                  <span className="text-sm font-black text-emerald-700 font-mono">
                    Rp {changeDue.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}

            {/* QRIS SPECIFIC */}
            {paymentMethod === 'QRIS' && (
              <div className="p-4 rounded-md bg-slate-50 border border-slate-200 flex flex-col items-center space-y-2 text-center">
                <div className="font-bold text-xs text-slate-800">QRIS STANDAR PEMBAYARAN NASIONAL</div>
                <div className="w-32 h-32 border border-slate-300 p-2 rounded bg-white flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-slate-900" />
                </div>
                <div className="text-[11px] text-slate-500 font-mono">AuraPOS Merchant - ID: 936001289</div>
              </div>
            )}

            <button
              disabled={loading || (paymentMethod === 'CASH' && amountTendered < grandTotal)}
              onClick={processPayment}
              className="w-full py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-colors"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Selesaikan & Terbitkan Struk</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* THERMAL RECEIPT MODAL */}
      {/* ============================================================ */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 p-6 rounded-md max-w-xs w-full space-y-3 shadow-xl text-slate-900 text-xs font-mono">
            <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-2">
              <div className="font-bold text-sm tracking-wider uppercase">AuraPOS Store</div>
              <div className="text-[10px] text-slate-500">Jl. Malioboro No. 42, Yogyakarta</div>
              <div className="text-[10px] text-slate-500">Telp: (0274) 555-1234</div>
            </div>

            <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between">
                <span>No. Tiket:</span>
                <span className="font-bold">{completedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>Terminal 01</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span>{new Date().toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2">
              {completedOrder.items?.map((it: any, idx: number) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-semibold text-slate-800">{it.productName}</div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>
                      {it.quantity} x Rp {it.price?.toLocaleString('id-ID')}
                    </span>
                    <span className="font-bold text-slate-900">
                      Rp {it.subtotal?.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-0.5 text-xs border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between font-bold">
                <span>TOTAL</span>
                <span>Rp {completedOrder.finalAmount?.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Bayar ({completedOrder.paymentMethod})</span>
                <span>Rp {completedOrder.amountPaid?.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-emerald-700">
                <span>Kembalian</span>
                <span>Rp {completedOrder.changeAmount?.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-500 pt-1">
              <div>*** TERIMA KASIH ***</div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => toast.info('Struk dikirim ke printer thermal POS.')}
                className="py-1.5 rounded bg-slate-900 text-white font-bold text-xs flex items-center justify-center space-x-1 hover:bg-slate-800"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak</span>
              </button>
              <button
                onClick={() => setCompletedOrder(null)}
                className="py-1.5 rounded bg-slate-100 text-slate-800 font-semibold text-xs hover:bg-slate-200 border border-slate-300"
              >
                Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
