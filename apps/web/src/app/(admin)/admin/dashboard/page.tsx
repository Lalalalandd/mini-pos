'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Store,
  FileText,
  Users,
  Settings,
  Download,
  BarChart3,
  Calendar,
  DollarSign,
  Receipt,
  ChevronRight,
} from 'lucide-react';
import { restFetch } from '@/lib/api-client';

export default function AdminDashboardPage() {
  const [navSection, setNavSection] = useState<'OVERVIEW' | 'INVENTORY' | 'ORDERS' | 'QUEUES'>('OVERVIEW');
  const [loading, setLoading] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [restockQty, setRestockQty] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');

  const [metrics, setMetrics] = useState({
    todaySales: 3480000,
    yesterdaySales: 2940000,
    todayTransactions: 58,
    avgTicketValue: 60000,
    lowStockCount: 2,
    orders: [
      {
        id: 'ord-101',
        orderNumber: 'POS-982144',
        finalAmount: 114000,
        paymentMethod: 'QRIS',
        status: 'PAID',
        source: 'POS',
        customerName: 'Meja 04 - Dine In',
        time: '19:12',
      },
      {
        id: 'ord-102',
        orderNumber: 'POS-982145',
        finalAmount: 62000,
        paymentMethod: 'CASH',
        status: 'PAID',
        source: 'POS',
        customerName: 'Ahmad M. (Walk-in)',
        time: '18:55',
      },
      {
        id: 'ord-103',
        orderNumber: 'WEB-982146',
        finalAmount: 185000,
        paymentMethod: 'DEBIT_CARD',
        status: 'PROCESSING',
        source: 'ONLINE',
        customerName: 'Sarah K. (Delivery)',
        time: '18:30',
      },
      {
        id: 'ord-104',
        orderNumber: 'POS-982147',
        finalAmount: 48000,
        paymentMethod: 'QRIS',
        status: 'PAID',
        source: 'POS',
        customerName: 'Budi Santoso',
        time: '18:14',
      },
      {
        id: 'ord-105',
        orderNumber: 'POS-982148',
        finalAmount: 76000,
        paymentMethod: 'CASH',
        status: 'PAID',
        source: 'POS',
        customerName: 'Takeaway Kasir',
        time: '17:48',
      },
    ],
    products: [
      { id: 'p-1', name: 'Single Origin Espresso', sku: 'BEV-ESP-001', stock: 120, minAlert: 15, price: 28000, category: 'Beverage' },
      { id: 'p-2', name: 'Iced Oat Caramel Macchiato', sku: 'BEV-MAC-002', stock: 85, minAlert: 10, price: 38000, category: 'Beverage' },
      { id: 'p-3', name: 'Butter Croissant Premium French', sku: 'BAK-CRS-001', stock: 5, minAlert: 8, price: 24000, category: 'Bakery' },
      { id: 'p-4', name: 'Smoked Beef Brioche Sandwich', sku: 'MEA-SND-001', stock: 3, minAlert: 5, price: 48000, category: 'Meals' },
      { id: 'p-5', name: 'Ceremonial Uji Matcha Latte', sku: 'BEV-MTC-003', stock: 90, minAlert: 10, price: 35000, category: 'Beverage' },
      { id: 'p-6', name: 'Chocochip Artisan Cookie', sku: 'SNK-CKI-001', stock: 45, minAlert: 10, price: 18000, category: 'Snacks' },
    ],
  });

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await restFetch<any>('/orders/dashboard/metrics');
      if (data) {
        setMetrics((prev) => ({
          ...prev,
          todaySales: data.todaySales || prev.todaySales,
          todayTransactions: data.todayTransactions || prev.todayTransactions,
        }));
      }
    } catch {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setMetrics((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === selectedProduct.id ? { ...p, stock: p.stock + Number(restockQty) } : p,
      ),
    }));

    alert(`Stok untuk "${selectedProduct.name}" berhasil ditambahkan sebanyak ${restockQty} unit.`);
    setRestockModalOpen(false);
  };

  const filteredProducts = metrics.products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col text-zinc-100">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="border-b border-zinc-800 bg-[#121215] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-zinc-400">
          <Store className="w-4 h-4 text-emerald-400" />
          <span>AuraPOS</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-200 font-semibold">Admin Operations</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-400 font-mono">Store #JKT-089</span>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={loadMetrics}
            disabled={loading}
            className="btn-secondary px-3 py-1.5 rounded-md text-xs flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Data</span>
          </button>
          <button
            onClick={() => alert('Exporting data CSV report...')}
            className="btn-secondary px-3 py-1.5 rounded-md text-xs flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout (Sidebar + Content) */}
      <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        {/* Left Navigation Column (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#121215] border border-zinc-800 rounded-lg p-3 space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Menu Navigasi
            </div>
            <button
              onClick={() => setNavSection('OVERVIEW')}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center space-x-2.5 transition-all ${
                navSection === 'OVERVIEW'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Ringkasan & Metrik</span>
            </button>
            <button
              onClick={() => setNavSection('INVENTORY')}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-all ${
                navSection === 'INVENTORY'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Package className="w-4 h-4 text-indigo-400" />
                <span>Inventori Produk</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                {metrics.products.length}
              </span>
            </button>
            <button
              onClick={() => setNavSection('ORDERS')}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center space-x-2.5 transition-all ${
                navSection === 'ORDERS'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>Daftar Transaksi</span>
            </button>
            <button
              onClick={() => setNavSection('QUEUES')}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center space-x-2.5 transition-all ${
                navSection === 'QUEUES'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Layers className="w-4 h-4 text-blue-400" />
              <span>BullMQ Queue Health</span>
            </button>
          </div>

          {/* Quick Terminal Launcher Card */}
          <div className="bg-[#121215] border border-zinc-800 rounded-lg p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Kasir Cepat</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                Ready
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Buka terminal kasir fisik untuk memproses transaksi POS langsung di kasir.
            </p>
            <Link
              href="/pos"
              className="btn-primary w-full py-2 rounded-md text-xs flex items-center justify-center space-x-1.5"
            >
              <span>Buka Terminal Kasir</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Content Area (9 Cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Top 4 KPI Metrics in Crisp SaaS Density */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-[#121215] border border-zinc-800 rounded-lg p-4 space-y-1">
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Omzet Hari Ini</span>
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white tabular-nums">
                Rp {metrics.todaySales.toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
                <span>+18.4% vs kemarin</span>
              </div>
            </div>

            <div className="bg-[#121215] border border-zinc-800 rounded-lg p-4 space-y-1">
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Total Transaksi</span>
                <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white tabular-nums">
                {metrics.todayTransactions}
              </div>
              <div className="text-[11px] text-zinc-400">
                Rata-rata: Rp {metrics.avgTicketValue.toLocaleString('id-ID')}
              </div>
            </div>

            <div className="bg-[#121215] border border-zinc-800 rounded-lg p-4 space-y-1">
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Stok Kritis</span>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
                {metrics.products.filter((p) => p.stock <= p.minAlert).length} Menu
              </div>
              <div className="text-[11px] text-amber-300">
                Perlu restock segera
              </div>
            </div>

            <div className="bg-[#121215] border border-zinc-800 rounded-lg p-4 space-y-1">
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>BullMQ Workers</span>
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-xl font-bold font-mono text-blue-400">
                Cluster Normal
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span>2 Queues Active</span>
              </div>
            </div>
          </div>

          {/* SECTION 1: OVERVIEW TAB */}
          {navSection === 'OVERVIEW' && (
            <div className="space-y-5">
              {/* Transactions Table */}
              <div className="bg-[#121215] border border-zinc-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <div className="text-xs font-bold text-white">Transaksi Kasir Terkini</div>
                  <span className="text-[11px] text-zinc-500 font-mono">Live Feed</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900/60 text-zinc-400 border-b border-zinc-800 font-medium">
                      <tr>
                        <th className="py-2.5 px-4">No. Transaksi</th>
                        <th className="py-2.5 px-4">Pelanggan / Meja</th>
                        <th className="py-2.5 px-4">Kanal</th>
                        <th className="py-2.5 px-4">Metode</th>
                        <th className="py-2.5 px-4 text-right">Nominal</th>
                        <th className="py-2.5 px-4 text-right">Waktu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/70 text-zinc-300">
                      {metrics.orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-zinc-900/40">
                          <td className="py-2.5 px-4 font-mono font-medium text-zinc-100">{ord.orderNumber}</td>
                          <td className="py-2.5 px-4">{ord.customerName}</td>
                          <td className="py-2.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                              {ord.source}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400">
                              {ord.paymentMethod}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-white">
                            Rp {ord.finalAmount.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-zinc-500 text-[11px]">{ord.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: INVENTORY TAB */}
          {navSection === 'INVENTORY' && (
            <div className="bg-[#121215] border border-zinc-800 rounded-lg overflow-hidden space-y-4 p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Katalog & Manajemen Stok</h3>
                  <p className="text-xs text-zinc-500">Kelola kuantitas stok produk fisik dan trigger restock.</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari SKU atau nama produk..."
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-600 rounded-md pl-8 pr-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-zinc-800 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/60 text-zinc-400 border-b border-zinc-800 font-medium">
                    <tr>
                      <th className="py-2.5 px-3.5">Nama Produk</th>
                      <th className="py-2.5 px-3.5">SKU</th>
                      <th className="py-2.5 px-3.5">Kategori</th>
                      <th className="py-2.5 px-3.5">Harga</th>
                      <th className="py-2.5 px-3.5 text-center">Status Stok</th>
                      <th className="py-2.5 px-3.5 text-right">Kuantitas</th>
                      <th className="py-2.5 px-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/70 text-zinc-300">
                    {filteredProducts.map((p) => {
                      const isLow = p.stock <= p.minAlert;
                      return (
                        <tr key={p.id} className="hover:bg-zinc-900/40">
                          <td className="py-2.5 px-3.5 font-medium text-white">{p.name}</td>
                          <td className="py-2.5 px-3.5 font-mono text-zinc-400">{p.sku}</td>
                          <td className="py-2.5 px-3.5 text-zinc-400">{p.category}</td>
                          <td className="py-2.5 px-3.5 font-mono">Rp {p.price.toLocaleString('id-ID')}</td>
                          <td className="py-2.5 px-3.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                isLow
                                  ? 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                                  : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                              }`}
                            >
                              {isLow ? 'Stok Kritis' : 'Normal'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-mono font-bold text-white">
                            {p.stock} pcs
                          </td>
                          <td className="py-2.5 px-3.5 text-right">
                            <button
                              onClick={() => {
                                setSelectedProduct(p);
                                setRestockModalOpen(true);
                              }}
                              className="btn-secondary px-2.5 py-1 rounded text-[11px] font-semibold"
                            >
                              + Restock
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

          {/* SECTION 3: ORDERS TAB */}
          {navSection === 'ORDERS' && (
            <div className="bg-[#121215] border border-zinc-800 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-xs font-bold text-white">Riwayat Seluruh Pesanan</div>
                <span className="text-xs text-zinc-400 font-mono">Total {metrics.orders.length} order tercatat</span>
              </div>

              <div className="space-y-2">
                {metrics.orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-white">{ord.orderNumber}</span>
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-mono">
                          {ord.paymentMethod}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500">{ord.customerName} • Pukul {ord.time}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-white text-sm">
                        Rp {ord.finalAmount.toLocaleString('id-ID')}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold">{ord.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: QUEUES TAB */}
          {navSection === 'QUEUES' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#121215] border border-zinc-800 rounded-lg p-5 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-white">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>receipt-queue (BullMQ)</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Worker untuk proses kompilasi invoice digital, PDF receipt, dan push notifikasi email.
                </p>
                <div className="p-3 rounded bg-zinc-900 border border-zinc-800 font-mono text-xs space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>Status:</span>
                    <span className="text-emerald-400 font-bold">READY / WAITING</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Broker:</span>
                    <span className="text-white">Redis 7 Alpine</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#121215] border border-zinc-800 rounded-lg p-5 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-white">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>stock-alert-queue (BullMQ)</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Worker audit otomatis untuk mendeteksi pengurangan stok dan memicu restock alert.
                </p>
                <div className="p-3 rounded bg-zinc-900 border border-zinc-800 font-mono text-xs space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>Status:</span>
                    <span className="text-emerald-400 font-bold">MONITORING</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Alerts Triggered:</span>
                    <span className="text-amber-400 font-bold">2 items</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RESTOCK MODAL */}
      {restockModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleRestock}
            className="bg-[#121215] border border-zinc-800 p-6 rounded-lg max-w-sm w-full space-y-4 shadow-xl"
          >
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <span className="text-xs font-bold text-white">Restock Produk</span>
              <button
                type="button"
                onClick={() => setRestockModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-semibold text-white">{selectedProduct.name}</div>
              <div className="text-[11px] font-mono text-zinc-400">SKU: {selectedProduct.sku}</div>
              <div className="text-xs font-mono text-emerald-400 pt-1">
                Stok Sekarang: {selectedProduct.stock} pcs
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Jumlah Penambahan Unit</label>
              <input
                type="number"
                min={1}
                value={restockQty}
                onChange={(e) => setRestockQty(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-600 rounded-md px-3 py-2 text-xs font-mono text-white outline-none"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-2.5 rounded-md text-xs font-bold"
            >
              Simpan & Perbarui Stok
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
