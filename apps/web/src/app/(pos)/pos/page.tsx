'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { restFetch } from '@/lib/api-client';

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  stock: number;
  category?: { name: string };
}

interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

export default function PosTerminalPage() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 'p-1',
      name: 'Single Origin Espresso',
      sku: 'BEV-ESP-001',
      barcode: '899100100001',
      price: 28000,
      stock: 120,
      category: { name: 'Beverages' },
    },
    {
      id: 'p-2',
      name: 'Iced Oat Caramel Macchiato',
      sku: 'BEV-MAC-002',
      barcode: '899100100002',
      price: 38000,
      stock: 85,
      category: { name: 'Beverages' },
    },
    {
      id: 'p-3',
      name: 'Butter Croissant Premium',
      sku: 'BAK-CRS-001',
      barcode: '899100100003',
      price: 24000,
      stock: 45,
      category: { name: 'Bakery' },
    },
    {
      id: 'p-4',
      name: 'Smoked Beef Brioche Sandwich',
      sku: 'MEA-SND-001',
      barcode: '899100100004',
      price: 48000,
      stock: 30,
      category: { name: 'Meals' },
    },
    {
      id: 'p-5',
      name: 'Matcha Green Tea Latte',
      sku: 'BEV-MTC-003',
      barcode: '899100100005',
      price: 35000,
      stock: 90,
      category: { name: 'Beverages' },
    },
  ]);

  const [search, setSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | 'DEBIT_CARD'>('CASH');
  const [amountTendered, setAmountTendered] = useState<number>(0);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch live products from backend if running
  useEffect(() => {
    restFetch<Product[]>('/products')
      .then((data) => {
        if (data && data.length > 0) setProducts(data);
      })
      .catch(() => {
        // Fallback to initial seed products for seamless local preview
      });
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { product, quantity: 1, discount: 0 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[],
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matched = products.find(
      (p) => p.barcode === barcodeInput.trim() || p.sku.toLowerCase() === barcodeInput.trim().toLowerCase(),
    );

    if (matched) {
      addToCart(matched);
      setBarcodeInput('');
    } else {
      alert(`No product found for barcode / SKU: ${barcodeInput}`);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountTotal = cart.reduce((sum, item) => sum + item.discount, 0);
  const grandTotal = Math.max(0, subtotal - discountTotal);
  const changeDue = Math.max(0, amountTendered - grandTotal);

  const openCheckout = () => {
    setAmountTendered(grandTotal);
    setPaymentModalOpen(true);
  };

  const processSale = async () => {
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
        customerName: 'POS Counter Sale',
      };

      const result = await restFetch<any>('/pos/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      }).catch(() => ({
        id: `mock-order-${Date.now()}`,
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        finalAmount: grandTotal,
        amountPaid: amountTendered,
        changeAmount: changeDue,
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
      alert(`Checkout failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search)),
  );

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* LEFT COLUMN: Catalog & Scanner Grid (7 cols) */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        {/* Scanner & Search Controls */}
        <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-3">
          {/* Barcode scanner simulator */}
          <form onSubmit={handleBarcodeSubmit} className="flex-1 flex space-x-2">
            <div className="relative flex-1">
              <Barcode className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan Barcode / SKU (e.g. 899100100001)..."
                className="w-full bg-pos-surface border border-pos-border rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-500 hover:text-slate-950 transition-all"
            >
              Scan
            </button>
          </form>

          {/* Search by name */}
          <div className="relative sm:w-56">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-pos-surface border border-pos-border rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 overflow-y-auto max-h-[calc(100vh-250px)] pr-1">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="glass-panel-interactive p-4 rounded-xl text-left flex flex-col justify-between h-36 group focus:outline-none"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="font-mono">{product.sku}</span>
                  <span className="px-1.5 py-0.5 rounded bg-pos-surface border border-pos-border text-[10px] text-emerald-400">
                    Stock: {product.stock}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                  {product.name}
                </h4>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-pos-border/50">
                <span className="text-xs font-extrabold text-emerald-400 font-mono">
                  Rp {product.price.toLocaleString('id-ID')}
                </span>
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-slate-950 text-emerald-400 flex items-center justify-center transition-colors text-xs font-bold">
                  +
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: Order Cart & Rapid Tender (5 cols) */}
      <div className="lg:col-span-5 glass-panel rounded-2xl flex flex-col h-full min-h-[500px]">
        {/* Cart Header */}
        <div className="p-4 border-b border-pos-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Current POS Ticket</h3>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-xs text-red-400 hover:text-red-300 flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
              <Barcode className="w-10 h-10 stroke-1 text-slate-600" />
              <p className="text-xs">Ticket is empty</p>
              <p className="text-[11px] text-slate-600">Scan barcode or click items from catalog to start</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-3 rounded-lg bg-pos-surface border border-pos-border flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{item.product.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Rp {item.product.price.toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="w-6 h-6 rounded bg-pos-card hover:bg-pos-border text-slate-300 flex items-center justify-center text-xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-white w-5 text-center font-mono">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="w-6 h-6 rounded bg-pos-card hover:bg-pos-border text-slate-300 flex items-center justify-center text-xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary & Checkout Action */}
        <div className="p-4 border-t border-pos-border bg-pos-surface/50 space-y-3">
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono text-white">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span className="font-mono text-emerald-400">- Rp {discountTotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-pos-border">
              <span>Grand Total</span>
              <span className="font-mono text-emerald-400">Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={openCheckout}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-extrabold text-sm transition-all shadow-glow flex items-center justify-center space-x-2"
          >
            <Banknote className="w-4 h-4" />
            <span>Pay / Settle Ticket</span>
          </button>
        </div>
      </div>

      {/* TENDER PAYMENT MODAL */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full space-y-5 border-emerald-500/40">
            <div className="flex justify-between items-center pb-3 border-b border-pos-border">
              <h3 className="text-base font-bold text-white">Select Payment Tender</h3>
              <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-white text-xs">
                Cancel
              </button>
            </div>

            {/* Total Display */}
            <div className="text-center p-4 rounded-xl bg-pos-surface border border-pos-border">
              <div className="text-xs text-slate-400">Amount Due</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                Rp {grandTotal.toLocaleString('id-ID')}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`p-3 rounded-xl border flex flex-col items-center space-y-1.5 text-xs font-semibold ${
                  paymentMethod === 'CASH'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-pos-surface border-pos-border text-slate-400'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span>Cash</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS')}
                className={`p-3 rounded-xl border flex flex-col items-center space-y-1.5 text-xs font-semibold ${
                  paymentMethod === 'QRIS'
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                    : 'bg-pos-surface border-pos-border text-slate-400'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span>QRIS</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('DEBIT_CARD')}
                className={`p-3 rounded-xl border flex flex-col items-center space-y-1.5 text-xs font-semibold ${
                  paymentMethod === 'DEBIT_CARD'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-pos-surface border-pos-border text-slate-400'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Debit / EDC</span>
              </button>
            </div>

            {/* Amount Tendered Input */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Amount Tendered</label>
                <input
                  type="number"
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(Number(e.target.value))}
                  className="w-full bg-pos-surface border border-pos-border rounded-lg px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <div className="flex justify-between text-xs font-semibold pt-1">
                  <span className="text-slate-400">Change Due:</span>
                  <span className="text-emerald-400 font-mono">Rp {changeDue.toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}

            <button
              disabled={loading || (paymentMethod === 'CASH' && amountTendered < grandTotal)}
              onClick={processSale}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-bold text-sm shadow-glow"
            >
              {loading ? 'Processing Transaction...' : 'Confirm & Complete Transaction'}
            </button>
          </div>
        </div>
      )}

      {/* ORDER RECEIPT POPUP */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-sm w-full space-y-4 border-emerald-500/50">
            <div className="text-center space-y-1">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Payment Successful!</h3>
              <p className="text-xs font-mono text-slate-400">{completedOrder.orderNumber}</p>
            </div>

            <div className="p-3 bg-pos-surface rounded-xl border border-pos-border font-mono text-xs space-y-2">
              <div className="border-b border-pos-border pb-2 text-[11px] text-slate-400">
                AuraPOS Terminal #01
              </div>
              {completedOrder.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.productName || item.name} x{item.quantity}</span>
                  <span>Rp {item.subtotal?.toLocaleString('id-ID')}</span>
                </div>
              ))}
              <div className="border-t border-pos-border pt-2 flex justify-between font-bold text-emerald-400">
                <span>TOTAL</span>
                <span>Rp {completedOrder.finalAmount?.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button
              onClick={() => setCompletedOrder(null)}
              className="w-full py-2.5 rounded-xl bg-pos-surface border border-pos-border hover:bg-pos-card text-white text-xs font-semibold"
            >
              Close / New Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
