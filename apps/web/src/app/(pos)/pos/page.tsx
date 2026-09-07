'use client';

import { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  Coffee,
  Croissant,
  Utensils,
  Cookie,
  Layers,
  Printer,
  Share2,
  Check,
  AlertCircle,
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
  categoryId?: string;
  icon?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
  notes?: string;
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'Single Origin Espresso',
    sku: 'BEV-ESP-001',
    barcode: '899100100001',
    price: 28000,
    stock: 120,
    categoryName: 'Drinks',
    icon: '☕',
  },
  {
    id: 'p-2',
    name: 'Iced Oat Caramel Macchiato',
    sku: 'BEV-MAC-002',
    barcode: '899100100002',
    price: 38000,
    stock: 85,
    categoryName: 'Drinks',
    icon: '🧋',
  },
  {
    id: 'p-3',
    name: 'Butter Croissant French AOP',
    sku: 'BAK-CRS-001',
    barcode: '899100100003',
    price: 24000,
    stock: 45,
    categoryName: 'Bakery',
    icon: '🥐',
  },
  {
    id: 'p-4',
    name: 'Smoked Beef Brioche Sandwich',
    sku: 'MEA-SND-001',
    barcode: '899100100004',
    price: 48000,
    stock: 30,
    categoryName: 'Meals',
    icon: '🥪',
  },
  {
    id: 'p-5',
    name: 'Ceremonial Uji Matcha Latte',
    sku: 'BEV-MTC-003',
    barcode: '899100100005',
    price: 35000,
    stock: 90,
    categoryName: 'Drinks',
    icon: '🍵',
  },
  {
    id: 'p-6',
    name: 'Chocochip Artisan Cookie',
    sku: 'SNK-CKI-001',
    barcode: '899100100006',
    price: 18000,
    stock: 55,
    categoryName: 'Snacks',
    icon: '🍪',
  },
];

export default function CashierPosPage() {
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
  const [scanLaserActive, setScanLaserActive] = useState(false);
  const [customerName, setCustomerName] = useState('Walk-in Customer');

  const scannerInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener
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

  // Load backend products if available
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
            categoryName: item.category?.name || 'Catalog',
            icon: item.name.toLowerCase().includes('coffee') || item.name.toLowerCase().includes('latte') ? '☕' : '🥐',
          }));
          setProducts(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const categories = [
    { id: 'ALL', name: 'Semua Produk', icon: Layers },
    { id: 'Drinks', name: 'Minuman', icon: Coffee },
    { id: 'Bakery', name: 'Bakery & Pastry', icon: Croissant },
    { id: 'Meals', name: 'Makanan Utama', icon: Utensils },
    { id: 'Snacks', name: 'Camilan', icon: Cookie },
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

    setScanLaserActive(true);
    setTimeout(() => setScanLaserActive(false), 800);

    const query = barcodeInput.trim().toLowerCase();
    const matched = products.find(
      (p) => (p.barcode && p.barcode.toLowerCase() === query) || p.sku.toLowerCase() === query,
    );

    if (matched) {
      addToCart(matched);
      setBarcodeInput('');
    } else {
      alert(`Produk barcode / SKU "${barcodeInput}" tidak ditemukan.`);
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
    } catch (err: any) {
      alert(`Checkout gagal: ${err.message}`);
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

  return (
    <div className="flex-1 max-w-[1600px] mx-auto w-full grid grid-cols-1 xl:grid-cols-12 gap-5 p-3 sm:p-5 h-[calc(100vh-60px)]">
      {/* ============================================================ */}
      {/* LEFT SECTION: Catalog & Barcode Scanner Area (8 Cols) */}
      {/* ============================================================ */}
      <div className="xl:col-span-8 flex flex-col space-y-3.5 h-full overflow-hidden">
        {/* Top Controls: Barcode Scanner & Search */}
        <div className="glass-panel p-3.5 rounded-2xl flex flex-col md:flex-row items-center gap-3">
          {/* Simulated Laser Barcode Bar */}
          <form onSubmit={handleBarcodeSubmit} className="flex-1 w-full flex items-center space-x-2">
            <div className="relative flex-1">
              <Barcode className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={scannerInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan Barcode / Ketik SKU (F2)... contoh: 899100100001"
                className="w-full bg-[#0B101D] border border-pos-border focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder:text-slate-500 transition-all outline-none"
              />
              {scanLaserActive && (
                <div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-scan-laser pointer-events-none rounded" />
              )}
            </div>
            <button
              type="submit"
              className="btn-tactile px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scan Item</span>
            </button>
          </form>

          {/* Search Filter */}
          <div className="relative w-full md:w-60">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama menu..."
              className="w-full bg-[#0B101D] border border-pos-border focus:border-emerald-500 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none"
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
                className={`btn-tactile flex-shrink-0 flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-glow font-bold'
                    : 'glass-panel text-slate-400 hover:text-white hover:bg-pos-card'
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
              className="glass-card-interactive p-3.5 rounded-2xl text-left flex flex-col justify-between group h-36 relative overflow-hidden focus:outline-none"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">{p.icon || '🛍️'}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      p.stock > 10
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    Stok: {p.stock}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
                  {p.name}
                </h4>
              </div>

              <div className="pt-2 border-t border-pos-border/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-slate-400">{p.sku}</div>
                  <div className="text-xs font-extrabold text-emerald-400 font-mono">
                    Rp {p.price.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 flex items-center justify-center text-xs font-bold transition-colors">
                  +
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT SECTION: Cart Ticket & Rapid Checkout (4 Cols) */}
      {/* ============================================================ */}
      <div className="xl:col-span-4 glass-panel rounded-2xl flex flex-col h-full overflow-hidden border-pos-border shadow-xl">
        {/* Ticket Header */}
        <div className="p-4 border-b border-pos-border/70 flex items-center justify-between bg-pos-surface/60">
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Tiket Transaksi Kasir</h3>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-[11px] text-red-400 hover:text-red-300 flex items-center space-x-1"
              title="Kosongkan Keranjang (Esc)"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Cart Item Rows */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
              <Barcode className="w-12 h-12 stroke-1 text-slate-600 animate-pulse" />
              <div className="text-xs font-semibold text-slate-400">Keranjang Masih Kosong</div>
              <p className="text-[11px] text-slate-600 max-w-[200px]">
                Scan barcode atau klik menu produk untuk memasukkan ke tiket
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-3 rounded-xl bg-pos-surface border border-pos-border/70 flex items-center justify-between gap-2.5"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{item.product.name}</div>
                  <div className="text-[11px] font-mono text-emerald-400">
                    Rp {item.product.price.toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Quantity Adjustment Buttons */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => updateQty(item.product.id, -1)}
                    className="btn-tactile w-6 h-6 rounded-lg bg-pos-card hover:bg-pos-border text-slate-300 flex items-center justify-center text-xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-white w-6 text-center font-mono">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQty(item.product.id, 1)}
                    className="btn-tactile w-6 h-6 rounded-lg bg-pos-card hover:bg-pos-border text-slate-300 flex items-center justify-center text-xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-slate-500 hover:text-red-400 p-1 ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ticket Summary & Payment Button */}
        <div className="p-4 border-t border-pos-border/70 bg-pos-surface/80 space-y-3">
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} item)</span>
              <span className="font-mono text-white">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Diskon</span>
                <span className="font-mono">- Rp {totalDiscount.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-pos-border">
              <span>Total Tagihan</span>
              <span className="font-mono text-emerald-400 text-lg">
                Rp {grandTotal.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={openCheckout}
            className="btn-tactile w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-slate-950 font-black text-sm transition-all shadow-glow flex items-center justify-center space-x-2"
          >
            <Banknote className="w-4 h-4" />
            <span>Bayar / Checkout (F4)</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TENDER PAYMENT MODAL */}
      {/* ============================================================ */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl max-w-lg w-full space-y-5 border-emerald-500/40 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-pos-border">
              <div>
                <h3 className="text-lg font-black text-white">Pilih Pembayaran</h3>
                <p className="text-xs text-slate-400">Pilih metode dan masukkan jumlah uang diterima</p>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-pos-surface"
              >
                Tutup (Esc)
              </button>
            </div>

            {/* Big Total Due Display */}
            <div className="text-center p-4 rounded-2xl bg-[#090E1A] border border-pos-border">
              <div className="text-xs text-slate-400">Total yang harus dibayar</div>
              <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                Rp {grandTotal.toLocaleString('id-ID')}
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`btn-tactile p-3 rounded-xl border flex flex-col items-center space-y-1 text-xs font-bold transition-all ${
                  paymentMethod === 'CASH'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-glow'
                    : 'bg-pos-surface border-pos-border text-slate-400'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span>💵 Tunai (Cash)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS')}
                className={`btn-tactile p-3 rounded-xl border flex flex-col items-center space-y-1 text-xs font-bold transition-all ${
                  paymentMethod === 'QRIS'
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-glow-accent'
                    : 'bg-pos-surface border-pos-border text-slate-400'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span>📱 QRIS Instan</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('DEBIT_CARD')}
                className={`btn-tactile p-3 rounded-xl border flex flex-col items-center space-y-1 text-xs font-bold transition-all ${
                  paymentMethod === 'DEBIT_CARD'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-pos-surface border-pos-border text-slate-400'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>💳 Debit / EDC</span>
              </button>
            </div>

            {/* CASH SPECIFIC: Quick Amount Shortcuts */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Uang Diterima:</span>
                  <span className="text-slate-400 text-[11px]">Klik nominal cepat di bawah:</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setAmountTendered(grandTotal)}
                    className="btn-tactile p-2 rounded-lg bg-pos-surface border border-pos-border hover:border-emerald-500 text-[11px] font-bold text-white font-mono"
                  >
                    Uang Pas
                  </button>
                  <button
                    type="button"
                    onClick={() => addCashPreset(20000)}
                    className="btn-tactile p-2 rounded-lg bg-pos-surface border border-pos-border hover:border-emerald-500 text-[11px] font-bold text-white font-mono"
                  >
                    +20.000
                  </button>
                  <button
                    type="button"
                    onClick={() => addCashPreset(50000)}
                    className="btn-tactile p-2 rounded-lg bg-pos-surface border border-pos-border hover:border-emerald-500 text-[11px] font-bold text-white font-mono"
                  >
                    +50.000
                  </button>
                  <button
                    type="button"
                    onClick={() => addCashPreset(100000)}
                    className="btn-tactile p-2 rounded-lg bg-pos-surface border border-pos-border hover:border-emerald-500 text-[11px] font-bold text-white font-mono"
                  >
                    +100.000
                  </button>
                </div>

                <input
                  type="number"
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(Number(e.target.value))}
                  className="w-full bg-[#0B101D] border border-pos-border focus:border-emerald-500 rounded-xl px-4 py-2.5 text-base font-bold text-white font-mono outline-none"
                />

                <div className="p-3 rounded-xl bg-pos-surface border border-pos-border flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Kembalian:</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    Rp {changeDue.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}

            {/* QRIS SPECIFIC: Simulated QR View */}
            {paymentMethod === 'QRIS' && (
              <div className="p-4 rounded-2xl bg-white text-slate-950 flex flex-col items-center space-y-2 text-center">
                <div className="font-extrabold text-xs tracking-wider text-slate-800">QRIS STANDAR PEMBAYARAN NASIONAL</div>
                <div className="w-36 h-36 border-2 border-slate-950 p-2 rounded-lg flex items-center justify-center bg-slate-50">
                  <QrCode className="w-28 h-28 text-slate-900" />
                </div>
                <div className="text-[11px] text-slate-600 font-mono">AuraPOS Merchant - ID: 936001289</div>
              </div>
            )}

            <button
              disabled={loading || (paymentMethod === 'CASH' && amountTendered < grandTotal)}
              onClick={processPayment}
              className="btn-tactile w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-sm shadow-glow flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Memproses Transaksi...</span>
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
      {/* REALISTIC THERMAL RECEIPT MODAL */}
      {/* ============================================================ */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="thermal-receipt p-6 rounded-xl max-w-sm w-full space-y-4 shadow-2xl border border-slate-300 text-slate-900 text-xs">
            {/* Receipt Header */}
            <div className="text-center space-y-1 border-b border-dashed border-slate-400 pb-3">
              <div className="text-base font-black tracking-wider uppercase">AuraPOS Store</div>
              <div className="text-[11px] text-slate-600">Jl. Malioboro No. 42, Yogyakarta</div>
              <div className="text-[10px] text-slate-500 font-mono">Telp: (0274) 555-1234</div>
            </div>

            {/* Meta info */}
            <div className="text-[10px] font-mono space-y-0.5 border-b border-dashed border-slate-400 pb-2">
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

            {/* Itemized Table */}
            <div className="space-y-1.5 font-mono text-[11px] border-b border-dashed border-slate-400 pb-3">
              {completedOrder.items?.map((it: any, idx: number) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-bold">{it.productName}</div>
                  <div className="flex justify-between text-[10px] text-slate-600">
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

            {/* Totals & Tender */}
            <div className="space-y-1 font-mono text-xs border-b border-dashed border-slate-400 pb-3">
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL</span>
                <span>Rp {completedOrder.finalAmount?.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Bayar ({completedOrder.paymentMethod})</span>
                <span>Rp {completedOrder.amountPaid?.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold">
                <span>Kembalian</span>
                <span>Rp {completedOrder.changeAmount?.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Receipt Footer */}
            <div className="text-center text-[10px] text-slate-600 space-y-1 pt-1">
              <div>*** TERIMA KASIH ATAS KUNJUNGAN ANDA ***</div>
              <div className="text-[9px] text-slate-500">Barang yang sudah dibeli tidak dapat ditukar</div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => alert('Simulasi cetak struk thermal dikirim ke printer POS!')}
                className="py-2 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center space-x-1 hover:bg-slate-800"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Struk</span>
              </button>
              <button
                onClick={() => setCompletedOrder(null)}
                className="py-2 rounded-lg bg-slate-200 text-slate-900 font-bold text-xs hover:bg-slate-300"
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
