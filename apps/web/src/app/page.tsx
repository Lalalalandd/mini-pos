import Link from 'next/link';
import {
  Terminal,
  ShoppingBag,
  ShieldCheck,
  Zap,
  Layers,
  Database,
  Cpu,
  ArrowRight,
  Sparkles,
  Barcode,
  CheckCircle2,
  Store,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-10">
      <div className="max-w-5xl w-full text-center space-y-8 my-auto">
        {/* Anti-slop pill banner */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-xs font-semibold text-blue-700 border border-blue-200">
          <Store className="w-3.5 h-3.5" />
          <span>Sistem Mini POS & E-Commerce Terpadu</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            Sistem Point of Sale & Katalog Toko Modern
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Aplikasi POS kasir berkecepatan tinggi dan etalase toko online. Ditenagai oleh Next.js 15 App Router, NestJS REST & GraphQL, PostgreSQL, Drizzle ORM, Redis, dan BullMQ.
          </p>
        </div>

        {/* Interactive Feature Portals - Clean Light Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 text-left">
          {/* Card 1: POS Terminal */}
          <Link
            href="/pos"
            className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between hover:border-blue-600 hover:shadow-md transition-all group"
          >
            <div>
              <div className="w-10 h-10 rounded-md bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Terminal className="w-5 h-5" />
              </div>
              <div className="flex items-center space-x-2 mb-1.5">
                <h2 className="text-base font-bold text-slate-900">Terminal Kasir POS</h2>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  KASIR
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scan barcode laser (F2), kalkulasi kembalian tunai, tender QRIS instan, dan preview cetak struk thermal.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-blue-600 mt-6 group-hover:translate-x-1 transition-transform">
              <span>Buka Terminal Kasir</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Card 2: E-Commerce Storefront */}
          <Link
            href="/catalog"
            className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between hover:border-blue-600 hover:shadow-md transition-all group"
          >
            <div>
              <div className="w-10 h-10 rounded-md bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex items-center space-x-2 mb-1.5">
                <h2 className="text-base font-bold text-slate-900">Katalog Online</h2>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  STORE
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Katalog produk dengan pencarian instan, drawer keranjang belanja, voucher diskon, dan kalkulasi ongkir.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-blue-600 mt-6 group-hover:translate-x-1 transition-transform">
              <span>Jelajahi Produk</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Card 3: Admin Operations */}
          <Link
            href="/admin/dashboard"
            className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between hover:border-blue-600 hover:shadow-md transition-all group"
          >
            <div>
              <div className="w-10 h-10 rounded-md bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex items-center space-x-2 mb-1.5">
                <h2 className="text-base font-bold text-slate-900">Admin Operations</h2>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ringkasan KPI omzet penjualan, manajemen inventaris stok minimum, log transaksi POS, dan worker BullMQ.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-blue-600 mt-6 group-hover:translate-x-1 transition-transform">
              <span>Masuk Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>
        </div>

        {/* Tech Stack Badges */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600">
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-white border border-slate-200">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Next.js 15 App Router</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-white border border-slate-200">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>NestJS REST & GraphQL</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-white border border-slate-200">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>PostgreSQL & Drizzle ORM</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-white border border-slate-200">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Redis Cache & BullMQ Queue</span>
          </span>
        </div>
      </div>
    </div>
  );
}
