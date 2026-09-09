'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Check,
  X,
  CreditCard,
  Truck,
  ShieldCheck,
  Coffee,
  UtensilsCrossed,
  Package,
  Star,
  MapPin,
  BadgePercent,
  ChevronRight,
} from 'lucide-react';
import { MARKETPLACE_DATA, CatalogProduct } from '@/lib/marketplace-data';

function StoreCatalogContent() {
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

  const updateCartQuantity = (productId: string, delta: number) => {
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
      toast.success('Kupon diskon 15% berhasil diterapkan.');
    } else {
      toast.error('Kode promo tidak valid. Gunakan kode "AURAPOS"');
    }
  };

  const rawSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const shippingFee = cart.length > 0 ? (rawSubtotal >= 100000 ? 0 : 10000) : 0;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount + shippingFee);
  const totalItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const filteredProducts = productsList
    .filter((p) => {
      const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'PRICE_LOW') return a.price - b.price;
      if (sortBy === 'PRICE_HIGH') return b.price - a.price;
      if (sortBy === 'SOLD') return b.soldCount - a.soldCount;
      return b.rating - a.rating;
    });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Coffee':
        return <Coffee className="w-8 h-8 text-[#0b57d0]" />;
      case 'Bakery':
      case 'Meals':
        return <UtensilsCrossed className="w-8 h-8 text-[#0b57d0]" />;
      case 'Tea':
        return <Coffee className="w-8 h-8 text-[#0b57d0]" />;
      default:
        return <Package className="w-8 h-8 text-[#0b57d0]" />;
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 text-[#1f1f1f]">
      {/* Category Pills & Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#e0e2ec]">
        {/* M3 Filter Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${isSelected ? 'bg-[#0b57d0] text-white shadow-sm' : 'bg-[#f0f4f9] text-[#444746] hover:bg-[#e9eef6]'}`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2 text-xs text-[#444746] self-end md:self-auto">
          <span>Urutkan:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#f7f9fc] border border-[#c4c7c5] focus:border-[#0b57d0] rounded-full px-3 py-1.5 text-xs text-[#1f1f1f] font-semibold outline-none cursor-pointer"
          >
            <option value="POPULAR">Paling Populer</option>
            <option value="SOLD">Penjualan Terbanyak</option>
            <option value="PRICE_LOW">Harga Terendah</option>
            <option value="PRICE_HIGH">Harga Tertinggi</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-[#e0e2ec] rounded-3xl p-12 text-center space-y-3 shadow-sm max-w-md mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-[#f0f4f9] flex items-center justify-center mx-auto text-[#747775]">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#1f1f1f]">Produk Tidak Ditemukan</h3>
          <p className="text-xs text-[#444746]">
            Tidak ada produk yang cocok dengan pencarian &quot;{search}&quot;. Coba gunakan kata kunci lain atau pilih kategori Semua.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('Semua');
            }}
            className="px-4 py-2 rounded-full bg-[#f0f4f9] hover:bg-[#e9eef6] text-xs font-semibold text-[#0b57d0]"
          >
            Reset Filter & Pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((p) => {
            const discountRate = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);

            return (
              <div
                key={p.id}
                onClick={() => router.push(`/catalog/${p.id}`)}
                className="group bg-white border border-[#e0e2ec] hover:border-[#c4c7c5] rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer relative"
              >
                {/* Photo & Badge */}
                <div className="aspect-square bg-[#f7f9fc] flex flex-col items-center justify-center p-6 relative overflow-hidden group-hover:bg-[#f0f4f9] transition-colors">
                  {p.tag && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#d3e3fd] text-[#041e49]">
                      {p.tag}
                    </span>
                  )}

                  <div className="w-20 h-20 rounded-2xl bg-white border border-[#e0e2ec] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                    {getCategoryIcon(p.category)}
                  </div>
                </div>

                {/* Info Container */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1 text-xs text-[#444746]">
                      <span className="text-[10px] uppercase font-semibold text-[#0b57d0] tracking-wider">
                        {p.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-[#1f1f1f] group-hover:text-[#0b57d0] transition-colors line-clamp-2 leading-snug">
                      {p.name}
                    </h3>
                  </div>

                  <div className="space-y-2 pt-2">
                    {/* Price & Discount */}
                    <div>
                      {discountRate > 0 && (
                        <div className="flex items-center space-x-1.5 text-[11px] text-[#747775]">
                          <span className="line-through">Rp {p.originalPrice.toLocaleString('id-ID')}</span>
                          <span className="text-red-700 font-bold font-mono">-{discountRate}%</span>
                        </div>
                      )}
                      <div className="text-base font-bold text-[#1f1f1f] font-mono">
                        Rp {p.price.toLocaleString('id-ID')}
                      </div>
                    </div>

                    {/* Metadata & Rating */}
                    <div className="flex items-center justify-between text-[11px] text-[#444746] pt-1 border-t border-[#f0f4f9]">
                      <div className="flex items-center space-x-1 font-semibold text-[#1f1f1f]">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{p.rating}</span>
                      </div>
                      <div className="text-[#747775]">{p.soldCount}+ terjual</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-5 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={(e) => addToCart(p, 1, e)}
                        className="col-span-2 py-2 rounded-full border border-[#0b57d0] text-[#0b57d0] hover:bg-[#d3e3fd]/40 font-semibold text-xs flex items-center justify-center transition-colors"
                        title="Tambah ke Keranjang"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p, 1);
                          setCartDrawerOpen(true);
                        }}
                        className="col-span-3 py-2 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white font-semibold text-xs flex items-center justify-center transition-all shadow-sm active:scale-95"
                      >
                        Beli
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Cart Button (Mobile Only) */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 md:hidden">
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="flex items-center space-x-2 bg-[#0b57d0] text-white px-5 py-3 rounded-full shadow-lg font-semibold text-sm hover:bg-[#0842a0] transition-transform active:scale-95"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>{totalItemCount} Item</span>
            <span className="font-mono">&bull; Rp {rawSubtotal.toLocaleString('id-ID')}</span>
          </button>
        </div>
      )}

      {/* Slide-Over Checkout Drawer */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col border-l border-[#e0e2ec] shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#e0e2ec] flex items-center justify-between bg-[#f7f9fc]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-[#d3e3fd] flex items-center justify-center text-[#0b57d0]">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1f1f1f]">Keranjang Belanja</h3>
                  <p className="text-xs text-[#444746]">{totalItemCount} Total Item Dipilih</p>
                </div>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="text-[#444746] hover:text-[#1f1f1f] p-2 rounded-full hover:bg-[#e0e2ec] transition-colors"
                aria-label="Tutup keranjang"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Item List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#747775] space-y-3">
                  <div className="w-16 h-16 rounded-full bg-[#f0f4f9] flex items-center justify-center text-[#c4c7c5]">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div className="text-sm font-semibold text-[#1f1f1f]">Keranjang Belanja Kosong</div>
                  <p className="text-xs max-w-xs text-[#444746]">Jelajahi menu dan pilih produk favorit Anda</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3.5 rounded-2xl bg-[#f7f9fc] border border-[#e0e2ec] flex items-center justify-between gap-3"
                  >
                    <div className="w-11 h-11 rounded-xl bg-white border border-[#e0e2ec] flex items-center justify-center shrink-0">
                      {getCategoryIcon(item.product.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#1f1f1f] truncate">
                        {item.product.name}
                      </div>
                      <div className="text-xs font-mono text-[#444746]">
                        Rp {item.product.price.toLocaleString('id-ID')}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 bg-white rounded-full p-1 border border-[#e0e2ec]">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded-full hover:bg-[#f0f4f9] text-[#1f1f1f] flex items-center justify-center text-xs transition-colors"
                        aria-label="Kurangi kuantitas"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-[#1f1f1f] font-mono w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded-full hover:bg-[#f0f4f9] text-[#1f1f1f] flex items-center justify-center text-xs transition-colors"
                        aria-label="Tambah kuantitas"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-5 border-t border-[#e0e2ec] bg-[#f7f9fc] space-y-3.5">
              {/* Promo input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Kode Promo"
                  className="flex-1 bg-white border border-[#e0e2ec] rounded-full px-4 py-2 text-xs text-[#1f1f1f] uppercase font-mono outline-none"
                />
                <button
                  onClick={applyPromo}
                  className="px-4 py-2 rounded-full bg-[#e0e2ec] hover:bg-[#c4c7c5] text-xs font-semibold text-[#1f1f1f] transition-colors"
                >
                  Terapkan
                </button>
              </div>

              {/* Price Details */}
              <div className="space-y-1.5 text-xs text-[#444746]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-[#1f1f1f]">Rp {rawSubtotal.toLocaleString('id-ID')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#0b57d0] font-semibold">
                    <span>Diskon ({discountPercent}%)</span>
                    <span className="font-mono">- Rp {discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Ongkos Kirim</span>
                  <span className="font-mono font-semibold text-[#1f1f1f]">
                    {shippingFee === 0 && cart.length > 0 ? (
                      <span className="text-emerald-600">GRATIS</span>
                    ) : (
                      `Rp ${shippingFee.toLocaleString('id-ID')}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#1f1f1f] pt-2 border-t border-[#e0e2ec]">
                  <span>Total</span>
                  <span className="font-mono text-[#0b57d0]">Rp {finalTotal.toLocaleString('id-ID')}</span>
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
                    toast.success('Pesanan berhasil dibuat!');
                  }, 1500);
                }}
                className="w-full py-3 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm active:scale-95"
              >
                {checkoutSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Bayar Sekarang</span>
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

export default function StoreCatalogPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Memuat katalog...</div>}>
      <StoreCatalogContent />
    </Suspense>
  );
}
