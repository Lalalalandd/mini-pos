'use client';

import { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  Check,
  Tag,
  ArrowRight,
  SlidersHorizontal,
  X,
  CreditCard,
  Truck,
  ShieldCheck,
} from 'lucide-react';

interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  stock: number;
  imageEmoji: string;
  tag?: string;
}

const CATALOG_DATA: CatalogProduct[] = [
  {
    id: 'c-1',
    name: 'Single Origin Ethiopian Yirgacheffe',
    category: 'Coffee',
    price: 32000,
    description: 'Biji kopi arabika pilihan dengan aroma floral melati, keasaman buah ceri, dan sentuhan madu hutan.',
    stock: 40,
    imageEmoji: '☕',
    tag: 'Bestseller',
  },
  {
    id: 'c-2',
    name: 'Iced Oat Vanilla Caramel Macchiato',
    category: 'Coffee',
    price: 38000,
    description: 'Susu oat creamy premium berpadu dengan espresso ganda dan saus karamel madagascar buatan sendiri.',
    stock: 85,
    imageEmoji: '🧋',
    tag: 'Favorite',
  },
  {
    id: 'c-3',
    name: 'Butter Croissant French AOP Butter',
    category: 'Bakery',
    price: 24000,
    description: '72 lapisan adonan mentega Prancis murni, dipanggang renyah di luar dan lembut berongga di dalam.',
    stock: 25,
    imageEmoji: '🥐',
    tag: 'Fresh Baked',
  },
  {
    id: 'c-4',
    name: 'Smoked Beef Brisket Brioche',
    category: 'Meals',
    price: 48000,
    description: 'Daging brisket asap kayu oak 12 jam, keju cheddar meleleh, daun arugula, dan saus mustard mayo.',
    stock: 18,
    imageEmoji: '🥪',
  },
  {
    id: 'c-5',
    name: 'Ceremonial Grade Uji Matcha Latte',
    category: 'Tea',
    price: 35000,
    description: 'Bubuk matcha murni dari Uji, Kyoto dengan microfoam susu lembut yang menenangkan.',
    stock: 50,
    imageEmoji: '🍵',
    tag: 'Signature',
  },
  {
    id: 'c-6',
    name: 'Pain au Chocolat Belgian Dark',
    category: 'Bakery',
    price: 28000,
    description: 'Pastry mentega renyah dengan isian dua batang cokelat dark Belgia 70% yang meleleh.',
    stock: 30,
    imageEmoji: '🥖',
  },
];

export default function StoreCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'POPULAR' | 'PRICE_LOW' | 'PRICE_HIGH'>('POPULAR');
  const [cart, setCart] = useState<{ product: CatalogProduct; quantity: number }[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const categories = ['All', 'Coffee', 'Bakery', 'Meals', 'Tea'];

  const addToCart = (product: CatalogProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCartDrawerOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: CatalogProduct; quantity: number }[],
    );
  };

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'AURAPOS') {
      setDiscountPercent(15);
      alert('Kupon diskon 15% berhasil diterapkan!');
    } else {
      alert('Kode promo tidak valid. Coba gunakan "AURAPOS"');
    }
  };

  const filtered = CATALOG_DATA.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'PRICE_LOW') return a.price - b.price;
    if (sortBy === 'PRICE_HIGH') return b.price - a.price;
    return 0;
  });

  const rawSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const shippingFee = cart.length > 0 ? 10000 : 0;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount + shippingFee);
  const totalItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 space-y-8">
      {/* ============================================================ */}
      {/* HERO PROMOTIONAL SHOWCASE */}
      {/* ============================================================ */}
      <div className="relative rounded-3xl p-6 sm:p-10 overflow-hidden glass-panel border-indigo-500/30">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Katalog Artisan Musim Ini</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Kelezatan Otentik, Dipanggang & Diseduh Setiap Hari.
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Dapatkan diskon 15% dengan kode promo <span className="text-indigo-400 font-mono font-bold">AURAPOS</span> untuk semua pesanan online hari ini.
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FILTERS & SEARCH BAR */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn-tactile px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-500 text-white shadow-glow-accent'
                  : 'glass-panel text-slate-400 hover:text-white hover:bg-pos-card'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center space-x-2.5">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kopi, pastry, makanan..."
              className="w-full bg-[#0B101D] border border-pos-border focus:border-indigo-500 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#0B101D] border border-pos-border focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-300 font-medium outline-none"
          >
            <option value="POPULAR">Terpopuler</option>
            <option value="PRICE_LOW">Harga: Rendah ke Tinggi</option>
            <option value="PRICE_HIGH">Harga: Tinggi ke Rendah</option>
          </select>

          {/* Cart Drawer Trigger Button */}
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="btn-tactile px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold flex items-center space-x-2 shadow-glow-accent"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Keranjang</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-950/40 text-[11px] font-mono">
              {totalItemCount}
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PRODUCT GRID */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="glass-card-interactive p-5 rounded-2xl flex flex-col justify-between space-y-4 border-pos-border relative"
          >
            {item.tag && (
              <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {item.tag}
              </span>
            )}

            <div>
              <div className="text-4xl mb-3">{item.imageEmoji}</div>
              <div className="text-xs font-mono text-indigo-400 mb-1">{item.category}</div>
              <h3 className="text-base font-extrabold text-white mb-1.5">{item.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{item.description}</p>
            </div>

            <div className="pt-3 border-t border-pos-border/60 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-500">Harga Satuan</div>
                <div className="text-base font-black text-white font-mono">
                  Rp {item.price.toLocaleString('id-ID')}
                </div>
              </div>

              <button
                onClick={() => addToCart(item)}
                className="btn-tactile px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* SLIDE-OVER FLOATING CART DRAWER */}
      {/* ============================================================ */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
          <div className="glass-panel w-full max-w-md h-full flex flex-col border-l border-pos-border shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-pos-border flex items-center justify-between bg-pos-surface">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Keranjang Pesanan ({totalItemCount})</h3>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                  <ShoppingBag className="w-12 h-12 stroke-1 text-slate-600" />
                  <div className="text-xs font-semibold text-slate-400">Keranjang Masih Kosong</div>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3.5 rounded-xl bg-pos-surface border border-pos-border flex items-center justify-between gap-3"
                  >
                    <span className="text-2xl">{item.product.imageEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{item.product.name}</div>
                      <div className="text-[11px] font-mono text-indigo-400">
                        Rp {item.product.price.toLocaleString('id-ID')}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded bg-pos-card text-slate-300 hover:bg-pos-border flex items-center justify-center text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-white font-mono w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded bg-pos-card text-slate-300 hover:bg-pos-border flex items-center justify-center text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Promo Code & Order Summary */}
            <div className="p-4 border-t border-pos-border bg-pos-surface/90 space-y-3">
              {/* Promo input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Kode Promo (coba AURAPOS)..."
                  className="flex-1 bg-[#0B101D] border border-pos-border rounded-xl px-3 py-2 text-xs text-white uppercase font-mono outline-none"
                />
                <button
                  onClick={applyPromo}
                  className="px-3 py-2 rounded-xl bg-pos-card border border-pos-border hover:bg-indigo-500 hover:text-white text-xs font-bold text-slate-300"
                >
                  Pakai
                </button>
              </div>

              {/* Price Details */}
              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-pos-border/60">
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span className="font-mono text-white">Rp {rawSubtotal.toLocaleString('id-ID')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-indigo-400">
                    <span>Diskon Promo ({discountPercent}%)</span>
                    <span className="font-mono">- Rp {discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Ongkos Kirim Kurir</span>
                  <span className="font-mono text-white">Rp {shippingFee.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-pos-border">
                  <span>Total Pembayaran</span>
                  <span className="font-mono text-indigo-400">Rp {finalTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={() => {
                  setCheckoutSuccess(true);
                  setTimeout(() => {
                    setCheckoutSuccess(false);
                    setCart([]);
                    setCartDrawerOpen(false);
                  }, 2000);
                }}
                className="btn-tactile w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-white font-black text-xs shadow-glow-accent flex items-center justify-center space-x-2"
              >
                {checkoutSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Pesanan Diterima! Mengarahkan...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Bayar Sekarang (Rp {finalTotal.toLocaleString('id-ID')})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
