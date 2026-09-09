'use client';

import { useState, use } from 'react';
import Link from 'next/link';
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
  Heart,
} from 'lucide-react';
import { MARKETPLACE_DATA } from '@/lib/marketplace-data';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { addToCart, openCart } = useCart();

  const product =
    MARKETPLACE_DATA.find((p) => p.id === resolvedParams.id) || MARKETPLACE_DATA[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [orderQty, setOrderQty] = useState<number>(1);
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

  const handleBuyNow = (qty = 1) => {
    addToCart(product, qty);
    openCart();
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 text-md-on-surface">
      {/* Breadcrumb Navigation & View Cart Shortcut */}
      <div className="flex items-center justify-between gap-4">
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

        <button
          type="button"
          onClick={openCart}
          className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#f0f2f5] hover:bg-[#f0f4f9] text-xs font-semibold text-[#1f1f1f] transition-all shadow-none"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-[#0b57d0]" />
          <span>Lihat Keranjang</span>
        </button>
      </div>

      {/* Main 3-Column PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Gallery & Location Card */}
        <div className="lg:col-span-4 space-y-4 sticky top-24">
          {/* Main Photo Card */}
          <div className="aspect-square bg-white border border-[#f0f2f5] rounded-3xl flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-none">
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

            <div className="w-32 h-32 rounded-3xl bg-md-surface-container flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-105">
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
                className={`aspect-square rounded-2xl border p-1.5 bg-white flex flex-col items-center justify-center transition-all ${
                  selectedImageIndex === idx
                    ? 'border-md-primary bg-md-primary-container/20'
                    : 'border-[#f0f2f5] hover:border-md-outline'
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

          <div className="p-4 bg-white border border-[#f0f2f5] rounded-2xl text-xs text-md-on-surface-variant space-y-1.5">
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
                <div key={idx} className="p-3 bg-white border border-[#f0f2f5] rounded-2xl">
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
            <div className="bg-white border border-[#f0f2f5] p-5 rounded-2xl text-md-on-surface leading-relaxed whitespace-pre-line text-sm">
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
              <div className="flex items-center space-x-1.5 bg-white border border-[#f0f2f5] px-3.5 py-2 rounded-2xl shadow-none">
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
                  className="p-4 rounded-2xl bg-white border border-[#f0f2f5] space-y-2.5 text-xs shadow-none"
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
          <div className="bg-white border border-[#f0f2f5] rounded-3xl p-5 shadow-none space-y-4">
            <h3 className="text-sm font-bold text-md-on-surface pb-3 border-b border-[#f0f2f5]">
              Atur Jumlah & Beli
            </h3>

            {/* Qty Counter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-md-on-surface-variant font-medium">Jumlah Pesanan</span>
                <div className="flex items-center space-x-2 bg-md-surface-container rounded-full p-1 border border-md-outline-variant/40">
                  <button
                    onClick={() => setOrderQty((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 text-md-on-surface flex items-center justify-center transition-colors shadow-none"
                    aria-label="Kurangi jumlah"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-mono font-bold text-md-on-surface text-sm">
                    {orderQty}
                  </span>
                  <button
                    onClick={() => setOrderQty((q) => Math.min(product.stock, q + 1))}
                    className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 text-md-on-surface flex items-center justify-center transition-colors shadow-none"
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
            <div className="pt-2 border-t border-[#f0f2f5] space-y-1 text-xs">
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
                onClick={() => addToCart(product, orderQty)}
                className="w-full m3-btn-tonal justify-center py-3 text-xs"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                <span>+ Keranjang</span>
              </button>

              <button
                onClick={() => handleBuyNow(orderQty)}
                className="w-full m3-btn-filled justify-center py-3 text-xs"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                <span>Beli Langsung</span>
              </button>
            </div>

            <div className="pt-3 border-t border-[#f0f2f5] text-[11px] text-md-on-surface-variant space-y-2.5">
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
    </div>
  );
}
