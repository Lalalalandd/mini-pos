'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  Coffee,
  UtensilsCrossed,
  Package,
  Star,
  X,
  Plus,
  Minus,
  MapPin,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { MARKETPLACE_DATA, CatalogProduct } from '@/lib/marketplace-data';
import { useCart } from '@/context/CartContext';

function StoreCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';
  const { addToCart, openCart, totalItems, rawSubtotal } = useCart();

  const [productsList] = useState<CatalogProduct[]>(MARKETPLACE_DATA);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [search, setSearch] = useState(queryFromUrl);
  const [sortBy, setSortBy] = useState<'POPULAR' | 'PRICE_LOW' | 'PRICE_HIGH' | 'SOLD'>('POPULAR');

  // Modal State for Quick View / Quantity Selection
  const [modalProduct, setModalProduct] = useState<CatalogProduct | null>(null);
  const [modalQty, setModalQty] = useState<number>(1);

  useEffect(() => {
    if (queryFromUrl) {
      setSearch(queryFromUrl);
    }
  }, [queryFromUrl]);

  const categories = ['Semua', 'Coffee', 'Bakery', 'Meals', 'Tea', 'Snacks'];

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

  const getCategoryIcon = (category: string, size = 'w-8 h-8') => {
    switch (category) {
      case 'Coffee':
        return <Coffee className={`${size} text-[#0b57d0]`} />;
      case 'Bakery':
      case 'Meals':
        return <UtensilsCrossed className={`${size} text-[#0b57d0]`} />;
      case 'Tea':
        return <Coffee className={`${size} text-[#0b57d0]`} />;
      default:
        return <Package className={`${size} text-[#0b57d0]`} />;
    }
  };

  const handleOpenModal = (product: CatalogProduct, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setModalProduct(product);
    setModalQty(1);
  };

  const handleConfirmAddToCart = () => {
    if (modalProduct) {
      addToCart(modalProduct, modalQty);
      setModalProduct(null);
    }
  };

  const handleConfirmBuyNow = () => {
    if (modalProduct) {
      addToCart(modalProduct, modalQty);
      setModalProduct(null);
      openCart();
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 text-[#1f1f1f]">
      {/* Category Pills & Sort / Cart Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#f0f2f5]">
        {/* M3 Filter Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#0b57d0] text-white'
                    : 'bg-[#f0f4f9] text-[#444746] hover:bg-[#e9eef6]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Right Actions: Sort Dropdown & View Cart Button */}
        <div className="flex items-center space-x-3 self-end md:self-auto">
          <div className="flex items-center space-x-2 text-xs text-[#444746]">
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

          <button
            type="button"
            onClick={openCart}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#f0f2f5] hover:bg-[#f0f4f9] text-xs font-semibold text-[#1f1f1f] transition-all shadow-none"
            aria-label="Lihat Keranjang Belanja"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#0b57d0]" />
            <span>Lihat Keranjang</span>
            {totalItems > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#0b57d0] text-white text-[10px] font-bold font-mono">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-[#f0f2f5] rounded-3xl p-12 text-center space-y-3 shadow-none max-w-md mx-auto my-12">
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
                className="group bg-white border border-[#f0f2f5] hover:border-[#c4c7c5] rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-200 shadow-none cursor-pointer relative"
              >
                {/* Photo & Badge */}
                <div className="aspect-square bg-[#f7f9fc] flex flex-col items-center justify-center p-6 relative overflow-hidden group-hover:bg-[#f0f4f9] transition-colors">
                  {p.tag && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#d3e3fd] text-[#041e49]">
                      {p.tag}
                    </span>
                  )}

                  <div className="w-20 h-20 rounded-2xl bg-white border border-[#f0f2f5] flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
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
                    <div className="flex items-center justify-between text-[11px] text-[#444746] pt-1 border-t border-[#f0f2f5]">
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
                        onClick={(e) => handleOpenModal(p, e)}
                        className="col-span-2 py-2 rounded-full border border-[#0b57d0] text-[#0b57d0] hover:bg-[#d3e3fd]/40 font-semibold text-xs flex items-center justify-center transition-colors"
                        title="Atur Kuantitas & Tambah ke Keranjang"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 mr-1" />
                        <span className="text-[11px]">+</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleOpenModal(p, e)}
                        className="col-span-3 py-2 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white font-semibold text-xs flex items-center justify-center transition-all active:scale-95"
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
      {totalItems > 0 && (
        <div className="fixed bottom-6 right-6 z-40 md:hidden">
          <button
            onClick={openCart}
            className="flex items-center space-x-2 bg-[#0b57d0] text-white px-5 py-3 rounded-full font-semibold text-sm hover:bg-[#0842a0] transition-transform active:scale-95 shadow-none border border-[#0842a0]"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>{totalItems} Item</span>
            <span className="font-mono">&bull; Rp {rawSubtotal.toLocaleString('id-ID')}</span>
          </button>
        </div>
      )}

      {/* Product Detail & Quantity Selection Modal */}
      {modalProduct && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setModalProduct(null)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-lg bg-white border border-[#f0f2f5] rounded-3xl overflow-hidden z-10 animate-in zoom-in-95 fade-in duration-150 shadow-none flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#f0f2f5] flex items-center justify-between bg-[#f7f9fc]">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#d3e3fd] text-[#041e49]">
                  {modalProduct.category}
                </span>
                <span className="text-xs text-[#747775] font-mono">SKU: {modalProduct.sku}</span>
              </div>
              <button
                onClick={() => setModalProduct(null)}
                className="text-[#444746] hover:text-[#1f1f1f] p-1.5 rounded-full hover:bg-slate-200/60 transition-colors"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Product Info Row */}
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-2xl bg-[#f7f9fc] border border-[#f0f2f5] flex items-center justify-center shrink-0">
                  {getCategoryIcon(modalProduct.category, 'w-10 h-10')}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <h3 className="text-base font-bold text-[#1f1f1f] leading-snug">
                    {modalProduct.name}
                  </h3>

                  <div className="flex items-center space-x-3 text-xs text-[#444746]">
                    <div className="flex items-center space-x-1 font-semibold text-[#1f1f1f]">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{modalProduct.rating}</span>
                    </div>
                    <span>&bull;</span>
                    <span>{modalProduct.soldCount}+ terjual</span>
                    <span>&bull;</span>
                    <div className="flex items-center space-x-1 text-[#0b57d0]">
                      <MapPin className="w-3 h-3" />
                      <span>{modalProduct.location}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-baseline space-x-2">
                    <span className="text-lg font-bold font-mono text-[#1f1f1f]">
                      Rp {modalProduct.price.toLocaleString('id-ID')}
                    </span>
                    {modalProduct.originalPrice > modalProduct.price && (
                      <span className="text-xs line-through text-[#747775]">
                        Rp {modalProduct.originalPrice.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description Snippet */}
              <div className="p-3 bg-[#f7f9fc] border border-[#f0f2f5] rounded-2xl text-xs text-[#444746] leading-relaxed">
                {modalProduct.description}
              </div>

              {/* Specs Chips if available */}
              {modalProduct.specs && modalProduct.specs.length > 0 && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {modalProduct.specs.slice(0, 4).map((spec, idx) => (
                    <div key={idx} className="p-2.5 bg-white border border-[#f0f2f5] rounded-xl">
                      <span className="text-[10px] text-[#747775] block">{spec.label}</span>
                      <span className="font-semibold text-[#1f1f1f] truncate block">{spec.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Counter & Subtotal */}
              <div className="pt-3 border-t border-[#f0f2f5] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#1f1f1f] block">Atur Jumlah Pesanan</span>
                    <span className="text-[11px] text-[#747775]">
                      Sisa stok:{' '}
                      <span className="font-mono font-bold text-[#1f1f1f]">{modalProduct.stock} unit</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 bg-[#f7f9fc] rounded-full p-1 border border-[#f0f2f5]">
                    <button
                      type="button"
                      onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-[#1f1f1f] flex items-center justify-center transition-colors"
                      aria-label="Kurangi jumlah"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={modalProduct.stock}
                      value={modalQty}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          setModalQty(Math.max(1, Math.min(modalProduct.stock, val)));
                        }
                      }}
                      className="w-12 text-center font-mono font-bold text-sm bg-transparent outline-none text-[#1f1f1f]"
                    />
                    <button
                      type="button"
                      onClick={() => setModalQty((q) => Math.min(modalProduct.stock, q + 1))}
                      className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-[#1f1f1f] flex items-center justify-center transition-colors"
                      aria-label="Tambah jumlah"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#f0f2f5] text-xs">
                  <span className="text-[#444746]">Total Subtotal Produk:</span>
                  <span className="font-mono font-bold text-base text-[#0b57d0]">
                    Rp {(modalProduct.price * modalQty).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-[#f0f2f5] bg-[#f7f9fc] flex items-center gap-3">
              <button
                type="button"
                onClick={handleConfirmAddToCart}
                className="flex-1 py-2.5 rounded-full border border-[#0b57d0] text-[#0b57d0] hover:bg-[#d3e3fd]/40 font-semibold text-xs flex items-center justify-center transition-colors"
              >
                <ShoppingBag className="w-4 h-4 mr-1.5" />
                <span>+ Masukkan Keranjang</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmBuyNow}
                className="flex-1 py-2.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white font-semibold text-xs flex items-center justify-center transition-all active:scale-95"
              >
                <CreditCard className="w-4 h-4 mr-1.5" />
                <span>Beli Sekarang</span>
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
