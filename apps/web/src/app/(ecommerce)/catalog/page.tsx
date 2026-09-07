'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  Tag,
  ArrowRight,
  X,
  CreditCard,
  Truck,
  ShieldCheck,
  Coffee,
  UtensilsCrossed,
  Package,
  Layers,
  Star,
  MapPin,
  BadgePercent,
  Sparkles,
} from 'lucide-react';
import { MARKETPLACE_DATA, CatalogProduct } from '@/lib/marketplace-data';

export default function StoreCatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';

  const [productsList, setProductsList] = useState<CatalogProduct[]>(MARKETPLACE_DATA);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [search, setSearch] = useState(queryFromUrl);
  const [sortBy, setSortBy] = useState<'POPULAR' | 'PRICE_LOW' | 'PRICE_HIGH' | 'SOLD'>('POPULAR');
  const [cart, setCart] = useState<{ product: CatalogProduct; quantity: number }[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    if (queryFromUrl) {
      setSearch(queryFromUrl);
    }
  }, [queryFromUrl]);

  const categories = ['Semua', 'Coffee', 'Bakery', 'Meals', 'Tea', 'Snacks'];

  // Add to Cart
  const addToCart = (product: CatalogProduct, qty = 1, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i,
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    toast.success(`${qty}x "${product.name}" ditambahkan ke keranjang belanja.`);
  };

  // Buy Now
  const buyNow = (product: CatalogProduct, qty = 1, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToCart(product, qty);
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
      toast.success('Kupon diskon 15% berhasil diterapkan!');
    } else {
      toast.error('Kode promo tidak valid. Gunakan kode "AURAPOS"');
    }
  };

  const filtered = productsList.filter((item) => {
    const matchesCat = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'PRICE_LOW') return a.price - b.price;
    if (sortBy === 'PRICE_HIGH') return b.price - a.price;
    if (sortBy === 'SOLD') return b.soldCount - a.soldCount;
    return b.rating - a.rating;
  });

  const rawSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const shippingFee = cart.length > 0 ? (rawSubtotal >= 100000 ? 0 : 10000) : 0;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount + shippingFee);
  const totalItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Coffee':
        return <Coffee className="w-8 h-8 text-blue-600" />;
      case 'Bakery':
      case 'Meals':
        return <UtensilsCrossed className="w-8 h-8 text-blue-600" />;
      case 'Tea':
        return <Coffee className="w-8 h-8 text-blue-600" />;
      default:
        return <Package className="w-8 h-8 text-blue-600" />;
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 text-slate-900">
      {/* ============================================================ */}
      {/* 1. MARKETPLACE PROMO BANNER */}
      {/* ============================================================ */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
            <BadgePercent className="w-3.5 h-3.5" />
            <span>Official Store & Promo Bebas Ongkir</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            Pusat Kopi Artisan, Pastry Prancis & Camilan Segar
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Dapatkan diskon 15% dengan kode <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">AURAPOS</span> dan Gratis Ongkir untuk semua pesanan minimal Rp 100.000.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 shrink-0 w-full md:w-auto text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-2.5">
            <Truck className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">Kurir Cepat</div>
              <div className="text-[11px] text-slate-500">Same-Day / Instant</div>
            </div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">Kualitas Terjamin</div>
              <div className="text-[11px] text-slate-500">100% Produk Asli</div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. CATEGORY TABS & SEARCH / SORT TOOLBAR */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row gap-3.5 justify-between items-stretch md:items-center bg-white border border-slate-200 p-3.5 rounded-lg shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk di toko..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-md px-3 py-1.5 text-xs text-slate-700 font-medium outline-none shrink-0"
          >
            <option value="POPULAR">Urutkan: Terpopuler</option>
            <option value="SOLD">Paling Banyak Terjual</option>
            <option value="PRICE_LOW">Harga: Terendah</option>
            <option value="PRICE_HIGH">Harga: Tertinggi</option>
          </select>

          {/* Floating Cart Trigger */}
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-2 transition-colors shrink-0 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Keranjang</span>
            <span className="px-1.5 py-0.2 rounded bg-blue-800 text-[11px] font-mono">
              {totalItemCount}
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. PRODUCT GRID */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {filtered.map((item) => {
          const discountRate = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-lg flex flex-col justify-between overflow-hidden shadow-sm hover:border-slate-300 hover:shadow-md transition-all group"
            >
              {/* Direct Link to Dedicated Product Detail Page */}
              <Link
                href={`/catalog/${item.id}`}
                className="flex-1 flex flex-col"
              >
                {/* Product Image Area */}
                <div className="relative aspect-[4/3] bg-slate-50 border-b border-slate-100 flex items-center justify-center group-hover:bg-slate-100/80 transition-colors">
                  {item.tag && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {item.tag}
                    </span>
                  )}

                  <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    {getCategoryIcon(item.category)}
                  </div>

                  <div className="absolute bottom-2 right-2 flex items-center space-x-1 text-[10px] font-mono text-slate-500 bg-white/90 border border-slate-200 px-1.5 py-0.5 rounded">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{item.location}</span>
                  </div>
                </div>

                {/* Product Content Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-medium">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-slate-800">{item.rating}</span>
                      <span>&bull;</span>
                      <span>{item.soldCount}+ terjual</span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="pt-1">
                    <div className="flex items-center space-x-1 text-[10px] text-slate-400 line-through">
                      <span>Rp {item.originalPrice.toLocaleString('id-ID')}</span>
                      <span className="text-red-600 font-bold font-mono no-underline">-{discountRate}%</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 font-mono">
                      Rp {item.price.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              </Link>

              {/* Card Action Buttons: Button Beli + Icon Button Keranjang */}
              <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => addToCart(item, 1, e)}
                  title="Tambah ke Keranjang"
                  className="p-2 rounded-md border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-600 transition-colors flex items-center justify-center shrink-0"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={(e) => buyNow(item, 1, e)}
                  className="flex-1 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Beli Langsung</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* 4. SLIDE-OVER MARKETPLACE CART DRAWER */}
      {/* ============================================================ */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col border-l border-slate-200 shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Keranjang Belanja ({totalItemCount} Item)</h3>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <ShoppingBag className="w-12 h-12 stroke-1 text-slate-300" />
                  <div className="text-xs font-semibold text-slate-600">Keranjang masih kosong</div>
                  <p className="text-[11px] text-slate-500">Pilih produk favorit Anda dari katalog untuk memesan</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="w-9 h-9 rounded bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      {getCategoryIcon(item.product.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">{item.product.name}</div>
                      <div className="text-[11px] font-mono text-slate-600">
                        Rp {item.product.price.toLocaleString('id-ID')}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-900 font-mono w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Promo Code & Order Summary */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              {/* Promo input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Kode Promo (coba AURAPOS)"
                  className="flex-1 bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-900 uppercase font-mono outline-none focus:border-blue-600"
                />
                <button
                  onClick={applyPromo}
                  className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors"
                >
                  Terapkan
                </button>
              </div>

              {/* Price Details */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span className="font-mono text-slate-900">Rp {rawSubtotal.toLocaleString('id-ID')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-blue-600 font-medium">
                    <span>Diskon Promo ({discountPercent}%)</span>
                    <span className="font-mono">- Rp {discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Ongkos Kirim Kurir</span>
                  <span className="font-mono text-slate-900">
                    {shippingFee === 0 && cart.length > 0 ? (
                      <span className="text-emerald-600 font-bold">GRATIS</span>
                    ) : (
                      `Rp ${shippingFee.toLocaleString('id-ID')}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Pembayaran</span>
                  <span className="font-mono text-blue-600">Rp {finalTotal.toLocaleString('id-ID')}</span>
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
                    toast.success('Pesanan Anda berhasil dibuat dan diteruskan ke kasir toko!');
                  }, 1500);
                }}
                className="w-full py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-colors shadow-sm"
              >
                {checkoutSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Memproses Pesanan...</span>
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
