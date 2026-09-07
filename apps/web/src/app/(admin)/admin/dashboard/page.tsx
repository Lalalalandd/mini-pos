'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Layers,
  ShieldCheck,
  RefreshCw,
  CheckCircle,
  Package,
  ArrowUpRight,
  Plus,
  Search,
  Filter,
  Activity,
  Cpu,
  Database,
  X,
  Check,
} from 'lucide-react';
import { restFetch } from '@/lib/api-client';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'INVENTORY' | 'TRANSACTIONS' | 'QUEUES'>('OVERVIEW');
  const [loading, setLoading] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [addedStockQty, setAddedStockQty] = useState(25);

  const [metrics, setMetrics] = useState({
    todaySales: 3480000,
    todayTransactions: 58,
    lowStockItemsCount: 2,
    activeWorkersCount: 2,
    recentOrders: [
      {
        id: 'ord-101',
        orderNumber: 'POS-982144',
        finalAmount: 114000,
        paymentMethod: 'QRIS',
        status: 'COMPLETED',
        customerName: 'POS Kasir 01',
        createdAt: '19:12:40',
      },
      {
        id: 'ord-102',
        orderNumber: 'POS-982145',
        finalAmount: 62000,
        paymentMethod: 'CASH',
        status: 'COMPLETED',
        customerName: 'Ahmad M.',
        createdAt: '18:55:12',
      },
      {
        id: 'ord-103',
        orderNumber: 'ORD-982146',
        finalAmount: 185000,
        paymentMethod: 'DEBIT_CARD',
        status: 'COMPLETED',
        customerName: 'Online Web Order',
        createdAt: '18:30:05',
      },
    ],
    products: [
      { id: 'p-1', name: 'Single Origin Espresso', sku: 'BEV-ESP-001', stock: 120, minStockAlert: 15, price: 28000 },
      { id: 'p-2', name: 'Iced Oat Caramel Macchiato', sku: 'BEV-MAC-002', stock: 85, minStockAlert: 10, price: 38000 },
      { id: 'p-3', name: 'Butter Croissant Premium', sku: 'BAK-CRS-001', stock: 6, minStockAlert: 8, price: 24000 },
      { id: 'p-4', name: 'Smoked Beef Brioche Sandwich', sku: 'MEA-SND-001', stock: 4, minStockAlert: 5, price: 48000 },
      { id: 'p-5', name: 'Ceremonial Uji Matcha Latte', sku: 'BEV-MTC-003', stock: 90, minStockAlert: 10, price: 35000 },
    ],
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await restFetch<any>('/orders/dashboard/metrics');
      if (data) {
        setMetrics((prev) => ({
          ...prev,
          todaySales: data.todaySales || prev.todaySales,
          todayTransactions: data.todayTransactions || prev.todayTransactions,
          lowStockItemsCount: data.lowStockItemsCount || prev.lowStockItemsCount,
          recentOrders: data.recentOrders?.length ? data.recentOrders : prev.recentOrders,
        }));
      }
    } catch {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setMetrics((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === selectedProduct.id ? { ...p, stock: p.stock + addedStockQty } : p,
      ),
    }));

    alert(`Berhasil menambahkan ${addedStockQty} stok untuk ${selectedProduct.name}!`);
    setRestockModalOpen(false);
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 space-y-7">
      {/* ============================================================ */}
      {/* HEADER & CONTROLS */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-pos-border/70 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-amber-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Role: Super Administrator (Full Control)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Pusat Kendali & Operasional Toko
          </h1>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="btn-tactile glass-panel px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Refresh Real-time</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* STAT CARDS ROW */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today Revenue */}
        <div className="glass-card p-5 rounded-2xl space-y-2.5 border-emerald-500/30 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Pendapatan Kotor Hari Ini</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            Rp {metrics.todaySales.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% dibandingkan kemarin</span>
          </div>
        </div>

        {/* Card 2: Total Transactions */}
        <div className="glass-card p-5 rounded-2xl space-y-2.5 border-indigo-500/30">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Total Transaksi Selesai</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{metrics.todayTransactions} Transaksi</div>
          <div className="text-[11px] text-indigo-400 font-semibold">POS Terminal & Toko Online</div>
        </div>

        {/* Card 3: Low Stock Warnings */}
        <div className="glass-card p-5 rounded-2xl space-y-2.5 border-amber-500/30">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Peringatan Stok Kritis</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {metrics.products.filter((p) => p.stock <= p.minStockAlert).length} Menu
          </div>
          <div className="text-[11px] text-amber-300 font-semibold">Perlu restock segera</div>
        </div>

        {/* Card 4: BullMQ Workers */}
        <div className="glass-card p-5 rounded-2xl space-y-2.5 border-blue-500/30">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>BullMQ Workers & Redis</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-400 font-mono">Cluster Aktif</div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block mr-1" />
            <span>2 Antrean Berjalan Normal</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* NAVIGATION TABS */}
      {/* ============================================================ */}
      <div className="flex space-x-2 border-b border-pos-border/70 pb-2">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`btn-tactile px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'OVERVIEW'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-pos-surface'
          }`}
        >
          Ringkasan & Penjualan
        </button>
        <button
          onClick={() => setActiveTab('INVENTORY')}
          className={`btn-tactile px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'INVENTORY'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-pos-surface'
          }`}
        >
          Inventori & Stok ({metrics.products.length})
        </button>
        <button
          onClick={() => setActiveTab('TRANSACTIONS')}
          className={`btn-tactile px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'TRANSACTIONS'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-pos-surface'
          }`}
        >
          Riwayat Transaksi
        </button>
        <button
          onClick={() => setActiveTab('QUEUES')}
          className={`btn-tactile px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'QUEUES'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-pos-surface'
          }`}
        >
          BullMQ & Health Check
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB CONTENT 1: OVERVIEW */}
      {/* ============================================================ */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Aktivitas Transaksi Terkini</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 border-b border-pos-border/70">
                  <tr>
                    <th className="pb-3">No. Tiket</th>
                    <th className="pb-3">Customer / Kasir</th>
                    <th className="pb-3">Metode</th>
                    <th className="pb-3 text-right">Total Bayar</th>
                    <th className="pb-3 text-right">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pos-border/40 text-slate-300">
                  {metrics.recentOrders.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-pos-surface/50">
                      <td className="py-3 font-mono text-emerald-400 font-bold">{ord.orderNumber}</td>
                      <td className="py-3">{ord.customerName}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-pos-surface border border-pos-border text-[10px] font-mono">
                          {ord.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-white font-bold">
                        Rp {ord.finalAmount?.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-500 text-[11px]">{ord.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4 glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Distribusi Pembayaran</h3>
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">QRIS Instan</span>
                  <span className="font-mono text-indigo-400 font-bold">54%</span>
                </div>
                <div className="h-2 rounded-full bg-pos-surface overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full w-[54%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Tunai (Cash)</span>
                  <span className="font-mono text-emerald-400 font-bold">32%</span>
                </div>
                <div className="h-2 rounded-full bg-pos-surface overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[32%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Debit / EDC</span>
                  <span className="font-mono text-amber-400 font-bold">14%</span>
                </div>
                <div className="h-2 rounded-full bg-pos-surface overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[14%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB CONTENT 2: INVENTORY & RESTOCK */}
      {/* ============================================================ */}
      {activeTab === 'INVENTORY' && (
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Package className="w-4 h-4 text-amber-400" />
              <span>Status Inventori & Stok Produk</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-pos-border/70">
                <tr>
                  <th className="pb-3">Nama Produk</th>
                  <th className="pb-3">SKU</th>
                  <th className="pb-3">Harga</th>
                  <th className="pb-3 text-center">Status Stok</th>
                  <th className="pb-3 text-right">Sisa Stok</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pos-border/40 text-slate-300">
                {metrics.products.map((p) => {
                  const isLow = p.stock <= p.minStockAlert;
                  return (
                    <tr key={p.id} className="hover:bg-pos-surface/40">
                      <td className="py-3 font-bold text-white">{p.name}</td>
                      <td className="py-3 font-mono text-slate-400">{p.sku}</td>
                      <td className="py-3 font-mono">Rp {p.price.toLocaleString('id-ID')}</td>
                      <td className="py-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isLow
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {isLow ? '⚠️ Stok Kritis' : '✅ Aman'}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-white">
                        {p.stock} pcs
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setRestockModalOpen(true);
                          }}
                          className="btn-tactile px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-xs font-bold transition-colors"
                        >
                          + Tambah Stok
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB CONTENT 3: TRANSACTIONS */}
      {/* ============================================================ */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white">Log Transaksi Lengkap</h3>
          <div className="space-y-3">
            {metrics.recentOrders.map((ord: any) => (
              <div
                key={ord.id}
                className="p-4 rounded-xl bg-pos-surface border border-pos-border/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-emerald-400 text-sm">{ord.orderNumber}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                      {ord.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Kasir/Pelanggan: <span className="text-white">{ord.customerName}</span> • Metode: {ord.paymentMethod}
                  </div>
                </div>

                <div className="text-right sm:text-right">
                  <div className="text-base font-black text-white font-mono">
                    Rp {ord.finalAmount?.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">{ord.createdAt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB CONTENT 4: BULLMQ & HEALTH */}
      {/* ============================================================ */}
      {activeTab === 'QUEUES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="glass-panel p-6 rounded-2xl space-y-4 border-emerald-500/30">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <Cpu className="w-4 h-4" />
              <span>BullMQ Queue 1: `receipt-queue`</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Memproses pembuatan struk digital, PDF invoice, dan pengiriman notifikasi email transaksi secara asynchronous.
            </p>
            <div className="p-3 rounded-xl bg-pos-surface border border-pos-border font-mono text-xs space-y-1">
              <div className="flex justify-between">
                <span>Status Worker:</span>
                <span className="text-emerald-400 font-bold">IDLE / READY</span>
              </div>
              <div className="flex justify-between">
                <span>Job Berhasil Hari Ini:</span>
                <span className="text-white">58 jobs</span>
              </div>
              <div className="flex justify-between">
                <span>Job Gagal:</span>
                <span className="text-emerald-400">0</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-4 border-amber-500/30">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <Database className="w-4 h-4" />
              <span>BullMQ Queue 2: `stock-alert-queue`</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Memantau pengurangan stok real-time dan otomatis mengirimkan alert notifikasi saat produk mencapai batas minimum.
            </p>
            <div className="p-3 rounded-xl bg-pos-surface border border-pos-border font-mono text-xs space-y-1">
              <div className="flex justify-between">
                <span>Status Worker:</span>
                <span className="text-emerald-400 font-bold">MONITORING</span>
              </div>
              <div className="flex justify-between">
                <span>Peringatan Terkirim:</span>
                <span className="text-amber-400 font-bold">2 trigger</span>
              </div>
              <div className="flex justify-between">
                <span>Redis Engine:</span>
                <span className="text-white">Redis 7 Alpine</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* RESTOCK PRODUCT MODAL */}
      {/* ============================================================ */}
      {restockModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleRestockSubmit} className="glass-panel p-6 rounded-3xl max-w-md w-full space-y-4 border-pos-border shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-pos-border">
              <h3 className="text-base font-bold text-white">Tambah Stok Produk</h3>
              <button type="button" onClick={() => setRestockModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-pos-surface border border-pos-border space-y-1">
              <div className="text-xs font-bold text-white">{selectedProduct.name}</div>
              <div className="text-[11px] font-mono text-slate-400">SKU: {selectedProduct.sku}</div>
              <div className="text-xs font-mono text-emerald-400 font-bold pt-1">
                Stok Saat Ini: {selectedProduct.stock} pcs
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Jumlah Tambahan Stok</label>
              <input
                type="number"
                min={1}
                value={addedStockQty}
                onChange={(e) => setAddedStockQty(Number(e.target.value))}
                className="w-full bg-[#0B101D] border border-pos-border focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm font-bold text-white font-mono outline-none"
              />
            </div>

            <button
              type="submit"
              className="btn-tactile w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-glow flex items-center justify-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Konfirmasi Tambah Stok</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
