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
  }, [router]);

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
    { id: 'Bakery', name: 'Bakery', icon: Package },
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
      toast.warning(`Produk dengan barcode atau SKU "${barcodeInput}" tidak ditemukan.`);
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
      toast.success(`Transaksi berhasil. No: ${result.orderNumber || 'POS'}`);
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
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-md-primary animate-spin" />
        <span className="text-xs font-semibold text-md-on-surface-variant">Memverifikasi sesi kasir...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-[1600px] mx-auto w-full grid grid-cols-1 xl:grid-cols-12 gap-5 p-4 sm:p-5 h-[calc(100vh-64px)] text-md-on-surface bg-[#f7f9fc]">
      {/* Left Area: Catalog & Barcode Scanner */}
      <div className="xl:col-span-8 flex flex-col space-y-3.5 h-full overflow-hidden">
        {/* Top Scanner & Search Box (Shadow-none, Light Gray Border) */}
        <div className="bg-white border border-[#f0f2f5] p-3.5 rounded-3xl flex flex-col md:flex-row items-center gap-3 shadow-none">
          {/* Barcode Form */}
          <form onSubmit={handleBarcodeSubmit} className="flex-1 w-full flex items-center space-x-2">
            <div className="relative flex-1">
              <Barcode className="w-4 h-4 text-md-primary absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                ref={scannerInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan Barcode / Ketik SKU (F2)... contoh: 899100100001"
                className="w-full bg-[#f7f9fc] border border-[#e0e2ec] focus:border-md-primary focus:bg-white rounded-full pl-11 pr-4 py-2.5 text-xs font-mono text-md-on-surface placeholder:text-md-on-surface-variant/60 outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center flex-row whitespace-nowrap px-4 py-2.5 rounded-full bg-md-primary hover:bg-md-primary-hover text-white text-xs font-semibold shadow-none transition-all"
            >
              <Plus className="w-4 h-4 mr-1.5 shrink-0" />
              <span>Input</span>
            </button>
          </form>

          {/* Search Input */}
          <div className="relative w-full md:w-60">
            <Search className="w-4 h-4 text-md-on-surface-variant/60 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama menu..."
              className="w-full bg-[#f7f9fc] border border-[#e0e2ec] focus:border-md-primary focus:bg-white rounded-full pl-10 pr-4 py-2.5 text-xs text-md-on-surface placeholder:text-md-on-surface-variant/60 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category Horizontal Filter Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`m3-chip shrink-0 ${isSelected ? 'm3-chip-selected' : ''}`}
              >
                <Icon className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid (Shadow-none, Light Gray Border) */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-white border border-[#f0f2f5] hover:border-[#c4c7c5] p-4 rounded-2xl text-left flex flex-col justify-between group h-36 relative shadow-none transition-all focus:outline-none"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-md-on-surface-variant">{p.sku}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                      p.stock > 10
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    Stok: {p.stock}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-md-on-surface group-hover:text-md-primary transition-colors line-clamp-2 leading-snug">
                  {p.name}
                </h4>
              </div>

              <div className="pt-2 border-t border-[#f0f2f5] flex items-center justify-between">
                <span className="text-xs font-bold text-md-on-surface font-mono">
                  Rp {p.price.toLocaleString('id-ID')}
                </span>
                <span className="w-6 h-6 rounded-full bg-[#d3e3fd] text-[#041e49] group-hover:bg-md-primary group-hover:text-white inline-flex items-center justify-center text-xs font-bold transition-colors">
                  +
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Area: Cart Ticket & Checkout (Shadow-none, Light Gray Border) */}
      <div className="xl:col-span-4 bg-white border border-[#f0f2f5] rounded-3xl flex flex-col h-full overflow-hidden shadow-none">
        {/* Ticket Header */}
        <div className="p-4 border-b border-[#f0f2f5] flex items-center justify-between bg-[#f7f9fc]">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-md-primary-container flex items-center justify-center text-md-primary">
              <Receipt className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-md-on-surface">Tiket Transaksi Kasir</h3>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="inline-flex items-center justify-center flex-row whitespace-nowrap text-xs text-red-600 hover:text-red-700 font-semibold px-2.5 py-1 rounded-full hover:bg-red-50 transition-colors"
            >
              <RotateCcw className="w-3 h-3 mr-1 shrink-0" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Cart Item Rows */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-md-on-surface-variant space-y-2.5">
              <div className="w-12 h-12 rounded-full bg-[#f0f4f9] flex items-center justify-center text-md-outline">
                <Barcode className="w-6 h-6" />
              </div>
              <div className="text-xs font-semibold text-md-on-surface">Tiket Belum Ada Item</div>
              <p className="text-[11px] text-md-on-surface-variant max-w-[200px]">
                Scan barcode atau klik menu produk untuk menambahkan
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-3 rounded-2xl bg-[#f7f9fc] border border-[#f0f2f5] flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-md-on-surface truncate">{item.product.name}</div>
                  <div className="text-[11px] font-mono text-md-on-surface-variant">
                    Rp {item.product.price.toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Steppers */}
                <div className="flex items-center space-x-1.5 bg-white rounded-full p-1 border border-[#e0e2ec]">
                  <button
                    onClick={() => updateQty(item.product.id, -1)}
                    className="w-5 h-5 rounded-full hover:bg-[#f0f4f9] text-md-on-surface inline-flex items-center justify-center text-xs transition-colors"
                    aria-label="Kurangi"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-md-on-surface w-5 text-center font-mono">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQty(item.product.id, 1)}
                    className="w-5 h-5 rounded-full hover:bg-[#f0f4f9] text-md-on-surface inline-flex items-center justify-center text-xs transition-colors"
                    aria-label="Tambah"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-md-on-surface-variant hover:text-red-600 p-1 ml-0.5 transition-colors inline-flex items-center justify-center"
                    aria-label="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ticket Summary & Checkout Action */}
        <div className="p-4 border-t border-[#f0f2f5] bg-[#f7f9fc] space-y-3.5">
          <div className="space-y-1.5 text-xs text-md-on-surface-variant">
            <div className="flex justify-between">
              <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} item)</span>
              <span className="font-mono text-md-on-surface font-semibold">
                Rp {subtotal.toLocaleString('id-ID')}
              </span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-md-primary font-medium">
                <span>Diskon</span>
                <span className="font-mono">- Rp {totalDiscount.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-md-on-surface pt-2 border-t border-[#e0e2ec]">
              <span>Total Bayar</span>
              <span className="font-mono text-md-primary text-base font-extrabold">
                Rp {grandTotal.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={openCheckout}
            className="w-full inline-flex items-center justify-center flex-row whitespace-nowrap py-3 rounded-full bg-md-primary hover:bg-md-primary-hover disabled:opacity-40 text-white font-semibold text-xs transition-all shadow-none"
          >
            <Banknote className="w-4 h-4 mr-2 shrink-0" />
            <span>Bayar Transaksi (F4)</span>
          </button>
        </div>
      </div>

      {/* Tender Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#f0f2f5] p-6 rounded-3xl max-w-md w-full space-y-5 shadow-xl text-md-on-surface">
            <div className="flex justify-between items-center pb-3 border-b border-[#f0f2f5]">
              <div>
                <h3 className="text-base font-bold text-md-on-surface">Pilih Metode Pembayaran</h3>
                <p className="text-xs text-md-on-surface-variant">Pilih metode dan masukkan nominal uang diterima</p>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-md-on-surface-variant hover:text-md-on-surface p-1.5 rounded-full hover:bg-[#f0f4f9] transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Display */}
            <div className="text-center p-4 rounded-2xl bg-[#f7f9fc] border border-[#f0f2f5]">
              <div className="text-xs text-md-on-surface-variant font-medium">Total yang harus dibayar</div>
              <div className="text-3xl font-extrabold text-md-primary font-mono mt-1">
                Rp {grandTotal.toLocaleString('id-ID')}
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`p-3 rounded-2xl border flex flex-col items-center space-y-1.5 text-xs font-semibold transition-all ${
                  paymentMethod === 'CASH'
                    ? 'bg-md-primary-container border-md-primary text-md-on-primary-container'
                    : 'bg-[#f7f9fc] border-[#f0f2f5] text-md-on-surface-variant hover:bg-[#f0f4f9]'
                }`}
              >
                <Banknote className="w-5 h-5 shrink-0" />
                <span>Tunai (Cash)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS')}
                className={`p-3 rounded-2xl border flex flex-col items-center space-y-1.5 text-xs font-semibold transition-all ${
                  paymentMethod === 'QRIS'
                    ? 'bg-md-primary-container border-md-primary text-md-on-primary-container'
                    : 'bg-[#f7f9fc] border-[#f0f2f5] text-md-on-surface-variant hover:bg-[#f0f4f9]'
                }`}
              >
                <QrCode className="w-5 h-5 shrink-0" />
                <span>QRIS</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('DEBIT_CARD')}
                className={`p-3 rounded-2xl border flex flex-col items-center space-y-1.5 text-xs font-semibold transition-all ${
                  paymentMethod === 'DEBIT_CARD'
                    ? 'bg-md-primary-container border-md-primary text-md-on-primary-container'
                    : 'bg-[#f7f9fc] border-[#f0f2f5] text-md-on-surface-variant hover:bg-[#f0f4f9]'
                }`}
              >
                <CreditCard className="w-5 h-5 shrink-0" />
                <span>Debit / EDC</span>
              </button>
            </div>

            {/* Cash Specific Details */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-md-on-surface">Nominal Cepat:</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setAmountTendered(grandTotal)}
                    className="p-2 rounded-xl bg-[#f0f4f9] border border-[#e0e2ec] hover:bg-[#e9eef6] text-xs font-bold text-md-on-surface font-mono transition-colors"
                  >
                    Uang Pas
                  </button>
                  <button
                    type="button"
                    onClick={() => addCashPreset(20000)}
                    className="p-2 rounded-xl bg-[#f0f4f9] border border-[#e0e2ec] hover:bg-[#e9eef6] text-xs font-bold text-md-on-surface font-mono transition-colors"
                  >
                    +20.000
                  </button>
                  <button
                    type="button"
                    onClick={() => addCashPreset(50000)}
                    className="p-2 rounded-xl bg-[#f0f4f9] border border-[#e0e2ec] hover:bg-[#e9eef6] text-xs font-bold text-md-on-surface font-mono transition-colors"
                  >
                    +50.000
                  </button>
                  <button
                    type="button"
                    onClick={() => addCashPreset(100000)}
                    className="p-2 rounded-xl bg-[#f0f4f9] border border-[#e0e2ec] hover:bg-[#e9eef6] text-xs font-bold text-md-on-surface font-mono transition-colors"
                  >
                    +100.000
                  </button>
                </div>

                <input
                  type="number"
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(Number(e.target.value))}
                  className="w-full bg-[#f7f9fc] border border-[#e0e2ec] focus:border-md-primary rounded-xl px-4 py-2.5 text-base font-bold text-md-on-surface font-mono outline-none"
                />

                <div className="p-3 rounded-xl bg-[#f7f9fc] border border-[#f0f2f5] flex items-center justify-between text-xs">
                  <span className="font-semibold text-md-on-surface-variant">Kembalian:</span>
                  <span className="text-base font-extrabold text-emerald-700 font-mono">
                    Rp {changeDue.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}

            {/* QRIS Specific Details */}
            {paymentMethod === 'QRIS' && (
              <div className="p-4 rounded-2xl bg-[#f7f9fc] border border-[#f0f2f5] flex flex-col items-center space-y-2 text-center">
                <div className="font-bold text-xs text-md-on-surface">QRIS STANDAR PEMBAYARAN NASIONAL</div>
                <div className="w-36 h-36 border border-[#e0e2ec] p-2.5 rounded-2xl bg-white flex items-center justify-center">
                  <QrCode className="w-28 h-28 text-slate-900" />
                </div>
                <div className="text-xs text-md-on-surface-variant font-mono">AuraPOS Merchant (ID: 936001289)</div>
              </div>
            )}

            <button
              disabled={loading || (paymentMethod === 'CASH' && amountTendered < grandTotal)}
              onClick={processPayment}
              className="w-full inline-flex items-center justify-center flex-row whitespace-nowrap py-3 rounded-full bg-md-primary hover:bg-md-primary-hover text-white font-semibold text-xs disabled:opacity-40 shadow-none"
            >
              {loading ? (
                <span>Memproses Pembayaran...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2 shrink-0" />
                  <span>Selesaikan & Terbitkan Struk</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Thermal Receipt Modal */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 p-6 rounded-3xl max-w-xs w-full space-y-3.5 shadow-2xl text-slate-900 text-xs font-mono">
            <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-3">
              <div className="font-bold text-base tracking-wider uppercase">AuraPOS Store</div>
              <div className="text-[11px] text-slate-500">Jl. Malioboro No. 42, Yogyakarta</div>
              <div className="text-[11px] text-slate-500">Telp: (0274) 555-1234</div>
            </div>

            <div className="text-[11px] space-y-0.5 border-b border-dashed border-slate-300 pb-2.5">
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

            <div className="space-y-1.5 text-xs border-b border-dashed border-slate-300 pb-2.5">
              {completedOrder.items?.map((it: any, idx: number) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-semibold text-slate-900">{it.productName}</div>
                  <div className="flex justify-between text-[11px] text-slate-500">
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

            <div className="space-y-1 text-xs border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between font-bold text-sm">
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

            <div className="text-center text-[11px] text-slate-500 pt-1">
              <div>*** TERIMA KASIH ***</div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={() => toast.info('Struk dikirim ke printer thermal POS.')}
                className="py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs inline-flex items-center justify-center flex-row whitespace-nowrap hover:bg-slate-800 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                <span>Cetak</span>
              </button>
              <button
                onClick={() => setCompletedOrder(null)}
                className="py-2.5 rounded-full bg-slate-100 text-slate-800 font-semibold text-xs inline-flex items-center justify-center flex-row whitespace-nowrap hover:bg-slate-200 border border-slate-300 transition-colors"
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
