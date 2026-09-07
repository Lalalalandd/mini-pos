'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  ShoppingBag,
  Star,
  MapPin,
  Truck,
  ShieldCheck,
  Coffee,
  UtensilsCrossed,
  Package,
  Plus,
  Minus,
  ArrowLeft,
  ChevronRight,
  CreditCard,
  Check,
  X,
  BadgePercent,
  Share2,
  Heart,
  Store,
} from 'lucide-react';
import { MARKETPLACE_DATA, CatalogProduct } from '@/lib/marketplace-data';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const product =
    MARKETPLACE_DATA.find((p) => p.id === resolvedParams.id) || MARKETPLACE_DATA[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [orderQty, setOrderQty] = useState<number>(1);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cart, setCart] = useState<{ product: CatalogProduct; quantity: number }[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const discountRate = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Coffee':
        return <Coffee className="w-12 h-12 text-blue-600" />;
      case 'Bakery':
      case 'Meals':
        return <UtensilsCrossed className="w-12 h-12 text-blue-600" />;
      case 'Tea':
        return <Coffee className="w-12 h-12 text-blue-600" />;
      default:
        return <Package className="w-12 h-12 text-blue-600" />;
    }
  };

  const addToCart = (qty = 1) => {
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

  const buyNow = (qty = 1) => {
    addToCart(qty);
    setCartDrawerOpen(true);
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
      toast.success('Kupon diskon 15% berhasil diterapkan!');
    } else {
      toast.error('Kode promo tidak valid. Gunakan kode "AURAPOS"');
    }
  };

  const rawSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const shippingFee = cart.length > 0 ? (rawSubtotal >= 100000 ? 0 : 10000) : 0;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount + shippingFee);
  const totalItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 text-slate-900">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/catalog" className="hover:text-blue-600 transition-colors">
          Katalog Belanja
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-600 font-medium">{product.category}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-semibold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main 3-Column PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ============================================================ */}
        {/* LEFT COLUMN: Gallery with Main Photo & Sub-Thumbnails (4 Cols) */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 space-y-3 sticky top-20">
          {/* Main Photo (Besar) */}
          <div className="aspect-square bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 relative overflow-hidden shadow-sm">
            {product.tag && (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {product.tag}
              </span>
            )}

            <div className="w-28 h-28 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm mb-4">
              {getCategoryIcon(product.category)}
            </div>

            <div className="text-center space-y-1">
              <div className="text-sm font-bold text-slate-800">
                {product.images[selectedImageIndex]?.label || product.name}
              </div>
              <div className="text-xs text-slate-500">
                {product.images[selectedImageIndex]?.subLabel || 'Foto Resmi Produk'}
              </div>
            </div>
          </div>

          {/* Sub-Photos Thumbnails (Kecil-Kecil yang bisa diklik) */}
          <div className="grid grid-cols-4 gap-2.5">
            {product.images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setSelectedImageIndex(idx)}
                className={`aspect-square rounded-lg border-2 p-1.5 bg-white flex flex-col items-center justify-center transition-all ${
                  selectedImageIndex === idx
                    ? 'border-blue-600 bg-blue-50/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-7 h-7 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-blue-600">
                  {getCategoryIcon(product.category)}
                </div>
                <span className="text-[9px] font-semibold text-slate-600 truncate w-full text-center mt-1">
                  Foto {idx + 1}
                </span>
              </button>
            ))}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Pengiriman dari {product.location}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Dikirim langsung dari kitchen & gudang resmi AuraStore.
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CENTER COLUMN: Product Info, Specs, & Reviews (5 Cols) */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Info */}
          <div className="space-y-2.5 pb-4 border-b border-slate-200">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
              <span>Official Store</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {product.name}
            </h1>

            {/* Ratings, Review Count & Sold */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
              <div className="flex items-center space-x-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-500" />
                <span>{product.rating}</span>
              </div>
              <span>&bull;</span>
              <span className="font-semibold text-slate-800 underline">
                {product.reviews.length} Ulasan Pembeli
              </span>
              <span>&bull;</span>
              <span className="text-slate-500">{product.soldCount}+ Terjual</span>
            </div>

            {/* Price Highlight */}
            <div className="pt-2">
              <div className="flex items-center space-x-2 text-xs text-slate-400 line-through">
                <span>Rp {product.originalPrice.toLocaleString('id-ID')}</span>
                <span className="text-red-600 font-bold font-mono text-xs no-underline">
                  -{discountRate}%
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-900 font-mono">
                Rp {product.price.toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          {/* Specifications Table */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Spesifikasi Produk
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {product.specs.map((s, idx) => (
                <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <span className="block text-[10px] text-slate-400">{s.label}</span>
                  <span className="font-semibold text-slate-800">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Full Description */}
          <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Deskripsi Produk
            </h2>
            <p className="bg-white border border-slate-200 p-4 rounded-lg">
              {product.description}
            </p>
          </div>

          {/* Customer Reviews Section */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Ulasan & Review Pembeli</h2>
                <p className="text-xs text-slate-500">Testimoni dari pelanggan terverifikasi</p>
              </div>
              <div className="flex items-center space-x-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-bold text-slate-900 text-sm">{product.rating} / 5.0</span>
                <span className="text-[11px] text-slate-500">({product.reviews.length} Ulasan)</span>
              </div>
            </div>

            {/* Review Cards */}
            <div className="space-y-3">
              {product.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-lg bg-white border border-slate-200 space-y-2 text-xs shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs font-mono">
                        {rev.userName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                          <span>{rev.userName}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Pembeli Terverifikasi
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {rev.userCity} &bull; {rev.date}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {rev.variant && (
                    <div className="text-[11px] text-slate-500 font-mono">
                      Varian: <span className="text-slate-800 font-medium">{rev.variant}</span>
                    </div>
                  )}

                  <p className="text-slate-700 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Sticky Purchase Action Card (3 Cols) */}
        {/* ============================================================ */}
        <div className="lg:col-span-3 sticky top-20">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Atur Jumlah & Beli
            </h3>

            {/* Qty Counter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Jumlah Pembelian</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setOrderQty((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-xs text-slate-700"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-mono font-bold text-slate-900 text-sm">
                    {orderQty}
                  </span>
                  <button
                    onClick={() => setOrderQty((q) => Math.min(product.stock, q + 1))}
                    className="w-7 h-7 rounded border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-xs text-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-500">
                Sisa stok:{' '}
                <span className="font-mono font-bold text-slate-800">{product.stock} unit</span>
              </div>
            </div>

            {/* Subtotal Calculation */}
            <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Harga</span>
                <span className="font-mono text-slate-900 font-bold text-sm">
                  Rp {(product.price * orderQty).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Action Buttons: Button Beli & Icon Button Keranjang */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => addToCart(orderQty)}
                className="w-full py-2.5 rounded-lg border border-blue-600 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center space-x-2 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>+ Keranjang</span>
              </button>

              <button
                onClick={() => buyNow(orderQty)}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-colors shadow-sm"
              >
                <CreditCard className="w-4 h-4" />
                <span>Beli Langsung</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>100% Produk Original & Bergaransi</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Bebas Ongkir untuk pesanan &ge; Rp 100.000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-Over Checkout Drawer */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col border-l border-slate-200 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Keranjang Belanja ({totalItemCount} Item)
                </h3>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <ShoppingBag className="w-12 h-12 stroke-1 text-slate-300" />
                  <div className="text-xs font-semibold text-slate-600">Keranjang masih kosong</div>
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
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {item.product.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-600">
                        Rp {item.product.price.toLocaleString('id-ID')}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-900 font-mono w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
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

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span className="font-mono text-slate-900">
                    Rp {rawSubtotal.toLocaleString('id-ID')}
                  </span>
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
                  <span className="font-mono text-blue-600">
                    Rp {finalTotal.toLocaleString('id-ID')}
                  </span>
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
