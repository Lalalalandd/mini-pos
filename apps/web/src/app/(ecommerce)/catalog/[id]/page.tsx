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
  ChevronRight,
  CreditCard,
  Check,
  X,
  Share2,
  Heart,
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
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discountRate = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Coffee':
        return <Coffee className="w-12 h-12 text-md-primary" />;
      case 'Bakery':
      case 'Meals':
        return <UtensilsCrossed className="w-12 h-12 text-md-primary" />;
      case 'Tea':
        return <Coffee className="w-12 h-12 text-md-primary" />;
      default:
        return <Package className="w-12 h-12 text-md-primary" />;
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
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 text-md-on-surface">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-md-on-surface-variant">
        <Link href="/" className="hover:text-md-primary font-medium transition-colors">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-md-outline" />
        <Link href="/catalog" className="hover:text-md-primary font-medium transition-colors">
          Katalog Belanja
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-md-outline" />
        <span className="text-md-on-surface-variant font-medium">{product.category}</span>
        <ChevronRight className="w-3.5 h-3.5 text-md-outline" />
        <span className="text-md-on-surface font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main 3-Column PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Gallery & Location Card */}
        <div className="lg:col-span-4 space-y-4 sticky top-24">
          {/* Main Photo Card */}
          <div className="aspect-square bg-md-surface-container-lowest border border-md-outline-variant/60 rounded-3xl flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-m3-1">
            {product.tag && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-md-primary-container text-md-on-primary-container border border-md-primary/10">
                {product.tag}
              </span>
            )}

            <button
              onClick={() => {
                setIsWishlisted(!isWishlisted);
                toast.info(isWishlisted ? 'Dihapus dari wishlist' : 'Disimpan ke wishlist');
              }}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-md-surface-container hover:bg-md-surface-container-high transition-colors text-md-on-surface-variant"
              aria-label="Simpan ke wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </button>

            <div className="w-32 h-32 rounded-3xl bg-md-surface-container flex items-center justify-center shadow-inner mb-4 transition-transform duration-300 hover:scale-105">
              {getCategoryIcon(product.category)}
            </div>

            <div className="text-center space-y-1">
              <div className="text-sm font-semibold text-md-on-surface">
                {product.images[selectedImageIndex]?.label || product.name}
              </div>
              <div className="text-xs text-md-on-surface-variant">
                {product.images[selectedImageIndex]?.subLabel || 'Foto Resmi Produk'}
              </div>
            </div>
          </div>

          {/* Sub-Photos Thumbnails */}
          <div className="grid grid-cols-4 gap-2.5">
            {product.images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setSelectedImageIndex(idx)}
                className={`aspect-square rounded-2xl border-2 p-1.5 bg-md-surface-container-lowest flex flex-col items-center justify-center transition-all ${
                  selectedImageIndex === idx
                    ? 'border-md-primary bg-md-primary-container/20 shadow-m3-1'
                    : 'border-md-outline-variant/60 hover:border-md-outline'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-md-surface-container flex items-center justify-center text-md-primary">
                  {getCategoryIcon(product.category)}
                </div>
                <span className="text-[10px] font-medium text-md-on-surface-variant truncate w-full text-center mt-1">
                  Foto {idx + 1}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 bg-md-surface-container-low border border-md-outline-variant/60 rounded-2xl text-xs text-md-on-surface-variant space-y-1.5">
            <div className="flex items-center space-x-2 font-semibold text-md-on-surface">
              <MapPin className="w-4 h-4 text-md-primary shrink-0" />
              <span>Pengiriman dari {product.location}</span>
            </div>
            <p className="text-[11px] text-md-on-surface-variant pl-6">
              Dikirim langsung dari kitchen & gudang resmi AuraStore.
            </p>
          </div>
        </div>

        {/* Center Column: Product Info, Specs, & Reviews */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Info */}
          <div className="space-y-3 pb-5 border-b border-md-outline-variant/60">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-md-secondary-container text-md-on-secondary-container text-xs font-semibold">
              <span>Official Store</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-md-on-surface leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Ratings, Review Count & Sold */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-md-on-surface-variant">
              <div className="flex items-center space-x-1 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{product.rating}</span>
              </div>
              <span className="text-md-outline">&bull;</span>
              <span className="font-semibold text-md-on-surface">
                {product.reviews.length} Ulasan Pembeli
              </span>
              <span className="text-md-outline">&bull;</span>
              <span>{product.soldCount}+ Terjual</span>
            </div>

            {/* Price Highlight */}
            <div className="pt-2">
              <div className="flex items-center space-x-2 text-xs text-md-on-surface-variant">
                <span className="line-through">Rp {product.originalPrice.toLocaleString('id-ID')}</span>
                <span className="text-red-700 font-bold font-mono text-xs bg-red-50 px-1.5 py-0.5 rounded">
                  -{discountRate}%
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-md-on-surface font-mono tracking-tight mt-1">
                Rp {product.price.toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          {/* Specifications Table */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-md-on-surface-variant">
              Spesifikasi Produk
            </h2>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {product.specs.map((s, idx) => (
                <div key={idx} className="p-3 bg-md-surface-container-lowest border border-md-outline-variant/60 rounded-2xl">
                  <span className="block text-[11px] text-md-on-surface-variant">{s.label}</span>
                  <span className="font-semibold text-md-on-surface mt-0.5 block">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Full Description */}
          <div className="space-y-3 text-xs text-md-on-surface-variant leading-relaxed">
            <h2 className="text-xs font-bold uppercase tracking-wider text-md-on-surface-variant">
              Deskripsi Produk
            </h2>
            <div className="bg-md-surface-container-lowest border border-md-outline-variant/60 p-5 rounded-2xl text-md-on-surface leading-relaxed whitespace-pre-line text-sm">
              {product.description}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-md-outline-variant/60">
              <div>
                <h2 className="text-base font-bold text-md-on-surface">Ulasan & Review Pembeli</h2>
                <p className="text-xs text-md-on-surface-variant">Testimoni dari pelanggan terverifikasi</p>
              </div>
              <div className="flex items-center space-x-1.5 bg-md-surface-container-lowest border border-md-outline-variant/60 px-3.5 py-2 rounded-2xl shadow-m3-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-bold text-md-on-surface text-sm">{product.rating} / 5.0</span>
                <span className="text-[11px] text-md-on-surface-variant">({product.reviews.length})</span>
              </div>
            </div>

            {/* Review Cards */}
            <div className="space-y-3">
              {product.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-md-surface-container-lowest border border-md-outline-variant/60 space-y-2.5 text-xs shadow-m3-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-md-primary-container text-md-on-primary-container font-bold flex items-center justify-center text-xs font-mono">
                        {rev.userName[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-md-on-surface flex items-center space-x-2">
                          <span>{rev.userName}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Pembeli Terverifikasi
                          </span>
                        </div>
                        <div className="text-[10px] text-md-on-surface-variant">
                          {rev.userCity} &bull; {rev.date}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'text-amber-500 fill-amber-500' : 'text-md-surface-container-highest'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {rev.variant && (
                    <div className="text-[11px] text-md-on-surface-variant">
                      Varian: <span className="text-md-on-surface font-medium">{rev.variant}</span>
                    </div>
                  )}

                  <p className="text-md-on-surface leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Purchase Action Card */}
        <div className="lg:col-span-3 sticky top-24">
          <div className="bg-md-surface-container-lowest border border-md-outline-variant/60 rounded-3xl p-5 shadow-m3-1 space-y-4">
            <h3 className="text-sm font-bold text-md-on-surface pb-3 border-b border-md-outline-variant/60">
              Atur Jumlah & Beli
            </h3>

            {/* Qty Counter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-md-on-surface-variant font-medium">Jumlah Pesanan</span>
                <div className="flex items-center space-x-2 bg-md-surface-container rounded-full p-1 border border-md-outline-variant/40">
                  <button
                    onClick={() => setOrderQty((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-full bg-md-surface-container-lowest hover:bg-white text-md-on-surface flex items-center justify-center transition-colors shadow-sm"
                    aria-label="Kurangi jumlah"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-mono font-bold text-md-on-surface text-sm">
                    {orderQty}
                  </span>
                  <button
                    onClick={() => setOrderQty((q) => Math.min(product.stock, q + 1))}
                    className="w-7 h-7 rounded-full bg-md-surface-container-lowest hover:bg-white text-md-on-surface flex items-center justify-center transition-colors shadow-sm"
                    aria-label="Tambah jumlah"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-right text-[11px] text-md-on-surface-variant">
                Sisa stok:{' '}
                <span className="font-mono font-bold text-md-on-surface">{product.stock} unit</span>
              </div>
            </div>

            {/* Subtotal Calculation */}
            <div className="pt-2 border-t border-md-outline-variant/60 space-y-1 text-xs">
              <div className="flex justify-between items-center text-md-on-surface-variant">
                <span>Subtotal Harga</span>
                <span className="font-mono text-md-on-surface font-bold text-base">
                  Rp {(product.price * orderQty).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => addToCart(orderQty)}
                className="w-full m3-btn-tonal justify-center py-3 text-xs"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                <span>+ Keranjang</span>
              </button>

              <button
                onClick={() => buyNow(orderQty)}
                className="w-full m3-btn-filled justify-center py-3 text-xs"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                <span>Beli Langsung</span>
              </button>
            </div>

            <div className="pt-3 border-t border-md-outline-variant/60 text-[11px] text-md-on-surface-variant space-y-2.5">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-md-primary shrink-0" />
                <span>100% Produk Original & Bergaransi</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Truck className="w-4 h-4 text-md-primary shrink-0" />
                <span>Bebas Ongkir untuk pesanan minimal Rp 100.000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-Over Checkout Drawer */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="bg-md-surface-container-lowest w-full max-w-md h-full flex flex-col border-l border-md-outline-variant shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="p-5 border-b border-md-outline-variant flex items-center justify-between bg-md-surface-container-low">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-md-primary-container flex items-center justify-center text-md-primary">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-md-on-surface">Keranjang Belanja</h3>
                  <p className="text-xs text-md-on-surface-variant">{totalItemCount} Total Item</p>
                </div>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="text-md-on-surface-variant hover:text-md-on-surface p-2 rounded-full hover:bg-md-surface-container transition-colors"
                aria-label="Tutup keranjang"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-md-on-surface-variant space-y-3">
                  <div className="w-16 h-16 rounded-full bg-md-surface-container flex items-center justify-center text-md-outline">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div className="text-sm font-semibold text-md-on-surface">Keranjang masih kosong</div>
                  <p className="text-xs max-w-xs">Jelajahi katalog dan pilih produk favorit Anda</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3.5 rounded-2xl bg-md-surface-container-low border border-md-outline-variant/60 flex items-center justify-between gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-md-surface-container-lowest border border-md-outline-variant/60 flex items-center justify-center shrink-0">
                      {getCategoryIcon(item.product.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-md-on-surface truncate">
                        {item.product.name}
                      </div>
                      <div className="text-xs font-mono text-md-on-surface-variant">
                        Rp {item.product.price.toLocaleString('id-ID')}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 bg-md-surface-container-lowest rounded-full p-1 border border-md-outline-variant/60">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded-full hover:bg-md-surface-container text-md-on-surface flex items-center justify-center text-xs transition-colors"
                        aria-label="Kurangi jumlah"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-md-on-surface font-mono w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded-full hover:bg-md-surface-container text-md-on-surface flex items-center justify-center text-xs transition-colors"
                        aria-label="Tambah jumlah"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-5 border-t border-md-outline-variant bg-md-surface-container-low space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Kode Promo (coba AURAPOS)"
                  className="flex-1 bg-md-surface-container-lowest border border-md-outline-variant rounded-xl px-3.5 py-2 text-xs text-md-on-surface uppercase font-mono outline-none focus:border-md-primary"
                />
                <button
                  onClick={applyPromo}
                  className="m3-btn-filled px-4 py-2 text-xs"
                >
                  Terapkan
                </button>
              </div>

              <div className="space-y-2 text-xs text-md-on-surface-variant pt-2 border-t border-md-outline-variant/60">
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span className="font-mono text-md-on-surface">
                    Rp {rawSubtotal.toLocaleString('id-ID')}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-md-primary font-medium">
                    <span>Diskon Promo ({discountPercent}%)</span>
                    <span className="font-mono">- Rp {discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Ongkos Kirim Kurir</span>
                  <span className="font-mono text-md-on-surface">
                    {shippingFee === 0 && cart.length > 0 ? (
                      <span className="text-emerald-700 font-bold">GRATIS</span>
                    ) : (
                      `Rp ${shippingFee.toLocaleString('id-ID')}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-md-on-surface pt-2 border-t border-md-outline-variant/60">
                  <span>Total Pembayaran</span>
                  <span className="font-mono text-md-primary text-base">
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
                className="w-full m3-btn-filled justify-center py-3 text-xs disabled:opacity-50"
              >
                {checkoutSuccess ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    <span>Memproses Pesanan...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
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
