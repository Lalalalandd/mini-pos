'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Check,
  Coffee,
  UtensilsCrossed,
  Package,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { CatalogProduct } from '@/lib/marketplace-data';
import {
  validateAndApplyPromo,
  getStoredTaxSettings,
  TaxSettings,
} from '@/lib/promo-tax-store';

export interface CartItem {
  product: CatalogProduct;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CatalogProduct, qty?: number) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  rawSubtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxAmount: number;
  serviceAmount: number;
  shippingFee: number;
  finalTotal: number;
  promoCode: string;
  setPromoCode: (code: string) => void;
  applyPromo: () => void;
  taxSettings: TaxSettings;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountFixedAmount, setDiscountFixedAmount] = useState(0);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [taxSettings, setTaxSettings] = useState<TaxSettings>(getStoredTaxSettings());

  // Load from localStorage on mount & on drawer open
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aurastore_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
      setTaxSettings(getStoredTaxSettings());
    } catch {}
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isCartOpen) {
      setTaxSettings(getStoredTaxSettings());
    }
  }, [isCartOpen]);

  // Save to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('aurastore_cart', JSON.stringify(cart));
      } catch {}
    }
  }, [cart, isHydrated]);

  const addToCart = (product: CatalogProduct, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i,
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    toast.success(`${qty}x "${product.name}" ditambahkan ke keranjang.`);
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
        .filter(Boolean) as CartItem[],
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
    toast.info('Item dihapus dari keranjang.');
  };

  const clearCart = () => {
    setCart([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const rawSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const applyPromo = () => {
    const res = validateAndApplyPromo(promoCode, rawSubtotal);
    if (res.valid) {
      setDiscountFixedAmount(res.discountAmount);
      setDiscountPercent(res.discountPercent);
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  // Recalculate discount based on subtotal
  const discountAmount = discountFixedAmount > 0 ? Math.min(rawSubtotal, discountFixedAmount) : (rawSubtotal * discountPercent) / 100;
  const taxableBase = Math.max(0, rawSubtotal - discountAmount);
  
  const taxAmount = taxSettings.ppnEnabled && taxSettings.ppnType === 'EXCLUSIVE'
    ? Math.round((taxableBase * taxSettings.ppnRate) / 100)
    : 0;

  const serviceAmount = taxSettings.serviceChargeEnabled
    ? Math.round((taxableBase * taxSettings.serviceChargeRate) / 100)
    : 0;

  const shippingFee = cart.length > 0
    ? (rawSubtotal >= taxSettings.freeShippingMin ? 0 : taxSettings.flatShippingFee)
    : 0;

  const finalTotal = Math.max(0, taxableBase + taxAmount + serviceAmount + shippingFee);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Coffee':
        return <Coffee className="w-6 h-6 text-[#0b57d0]" />;
      case 'Bakery':
      case 'Meals':
        return <UtensilsCrossed className="w-6 h-6 text-[#0b57d0]" />;
      case 'Tea':
        return <Coffee className="w-6 h-6 text-[#0b57d0]" />;
      default:
        return <Package className="w-6 h-6 text-[#0b57d0]" />;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        totalItems,
        rawSubtotal,
        discountPercent,
        discountAmount,
        taxAmount,
        serviceAmount,
        shippingFee,
        finalTotal,
        promoCode,
        setPromoCode,
        applyPromo,
        taxSettings,
      }}
    >
      {children}

      {/* Global Slide-Over Shopping Cart Drawer */}
      {isCartOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
          }}
        >
          {/* Transparent Black Backdrop (No Blur) */}
          <div
            onClick={closeCart}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 99999,
            }}
          />

          {/* Drawer Panel Hard-Locked on the Right Side */}
          <aside
            style={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              right: 0,
              left: 'auto',
              width: '100%',
              maxWidth: '28rem',
              backgroundColor: '#ffffff',
              borderLeft: '1px solid #f0f2f5',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 100000,
            }}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#f0f2f5] flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#d3e3fd] text-[#0b57d0] flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1f1f1f] leading-tight">Keranjang Belanja</h2>
                  <p className="text-xs text-[#444746] mt-0.5">
                    {totalItems > 0 ? `${totalItems} total item dipilih` : 'Belum ada produk dipilih'}
                  </p>
                </div>
              </div>

              <button
                onClick={closeCart}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#444746] hover:text-[#1f1f1f] hover:bg-[#f0f4f9] border border-[#f0f2f5] transition-colors"
                aria-label="Tutup keranjang"
                title="Tutup Keranjang"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f7f9fc]">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#747775] space-y-4 my-auto">
                  <div className="w-16 h-16 rounded-full bg-white border border-[#f0f2f5] flex items-center justify-center text-[#c4c7c5]">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#1f1f1f]">Keranjang Belanja Masih Kosong</h3>
                    <p className="text-xs max-w-xs text-[#444746]">
                      Jelajahi berbagai menu dan produk pilihan di katalog toko kami.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      closeCart();
                      router.push('/catalog');
                    }}
                    className="px-5 py-2.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors"
                  >
                    <span>Jelajahi Katalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#f0f2f5] hover:border-slate-300 transition-colors space-y-3 shadow-none"
                  >
                    {/* Top Row: Thumbnail + Product Details */}
                    <div className="flex gap-3 items-start">
                      <div className="w-12 h-12 rounded-xl bg-[#f7f9fc] border border-[#f0f2f5] flex items-center justify-center shrink-0">
                        {getCategoryIcon(item.product.category)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-semibold text-[#0b57d0] uppercase tracking-wider block">
                          {item.product.category}
                        </span>
                        <h4 className="text-xs font-bold text-[#1f1f1f] truncate leading-snug">
                          {item.product.name}
                        </h4>
                        <div className="text-[11px] font-mono text-[#747775] mt-0.5">
                          @ Rp {item.product.price.toLocaleString('id-ID')}
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-[#747775] hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                        title="Hapus produk dari keranjang"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Bottom Row: Stepper & Subtotal */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#f0f2f5]">
                      <div className="flex items-center space-x-2 bg-[#f7f9fc] rounded-full p-1 border border-[#f0f2f5]">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded-full bg-white hover:bg-slate-100 text-[#1f1f1f] flex items-center justify-center transition-colors shadow-none"
                          aria-label="Kurangi kuantitas"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-[#1f1f1f] font-mono w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, 1)}
                          className="w-6 h-6 rounded-full bg-white hover:bg-slate-100 text-[#1f1f1f] flex items-center justify-center transition-colors shadow-none"
                          aria-label="Tambah kuantitas"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-[#747775] block">Subtotal</span>
                        <span className="text-xs font-bold font-mono text-[#0b57d0]">
                          Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Actions & Price Breakdown */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-[#f0f2f5] bg-white space-y-3.5 shrink-0 shadow-none">
                {/* Promo Code Input without overlapping icon */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Kode promo (AURAPOS)"
                    className="flex-1 bg-[#f7f9fc] border border-[#f0f2f5] focus:border-[#0b57d0] rounded-full px-4 py-2.5 text-xs text-[#1f1f1f] placeholder:text-slate-400 uppercase font-mono outline-none transition-colors"
                  />
                  <button
                    onClick={applyPromo}
                    className="px-5 py-2.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-semibold whitespace-nowrap transition-colors shadow-none"
                  >
                    Terapkan
                  </button>
                </div>

                {/* Price Details */}
                <div className="space-y-1.5 text-xs text-[#444746] pt-1">
                  <div className="flex justify-between">
                    <span>Subtotal Produk ({totalItems} item)</span>
                    <span className="font-mono font-semibold text-[#1f1f1f]">
                      Rp {rawSubtotal.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Diskon Promo ({discountPercent}%)</span>
                      <span className="font-mono">- Rp {discountAmount.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  {taxSettings.ppnEnabled && (
                    <div className="flex justify-between text-xs text-[#444746]">
                      <span>
                        PPN ({taxSettings.ppnRate}%)
                        {taxSettings.ppnType === 'INCLUSIVE' ? ' (Termasuk)' : ''}
                      </span>
                      <span className="font-mono font-semibold text-[#1f1f1f]">
                        {taxSettings.ppnType === 'INCLUSIVE'
                          ? 'Termasuk'
                          : `Rp ${taxAmount.toLocaleString('id-ID')}`}
                      </span>
                    </div>
                  )}

                  {taxSettings.serviceChargeEnabled && serviceAmount > 0 && (
                    <div className="flex justify-between text-xs text-[#444746]">
                      <span>Biaya Layanan ({taxSettings.serviceChargeRate}%)</span>
                      <span className="font-mono font-semibold text-[#1f1f1f]">
                        Rp {serviceAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Ongkos Kirim</span>
                    <span className="font-mono font-semibold text-[#1f1f1f]">
                      {shippingFee === 0 ? (
                        <span className="text-emerald-600 font-bold">GRATIS (Promo Toko)</span>
                      ) : (
                        `Rp ${shippingFee.toLocaleString('id-ID')}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-bold text-[#1f1f1f] pt-2.5 border-t border-[#f0f2f5]">
                    <span>Total Pembayaran</span>
                    <span className="font-mono text-base text-[#0b57d0]">
                      Rp {finalTotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => {
                    setCheckoutSuccess(true);
                    setTimeout(() => {
                      setCheckoutSuccess(false);
                      clearCart();
                      closeCart();
                      toast.success('Pesanan Anda berhasil dibuat dan diteruskan ke kasir toko!');
                    }, 1500);
                  }}
                  className="w-full py-3.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-none"
                >
                  {checkoutSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Memproses Pembayaran...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Bayar Sekarang (Rp {finalTotal.toLocaleString('id-ID')})</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center space-x-2 text-[11px] text-[#747775] pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Transaksi Aman & Terverifikasi AuraPOS</span>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
