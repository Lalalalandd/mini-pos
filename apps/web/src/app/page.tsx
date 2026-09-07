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
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-10 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl w-full text-center space-y-7 relative z-10 my-auto">
        {/* Anti-slop pill banner */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full glass-panel text-xs font-semibold text-emerald-400 border border-emerald-500/30 shadow-glow">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Arsitektur Anti-Slop & High-Performance POS</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Sistem <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">Point of Sale & Toko Online</span> Terpadu
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Dirancang untuk kecepatan operasional kasir retail dan fleksibilitas katalog online. Ditenagai Next.js 15, NestJS REST + GraphQL, Drizzle ORM, dan BullMQ worker.
        </p>

        {/* Interactive Feature Portals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 text-left">
          {/* Card 1: POS Terminal */}
          <Link
            href="/pos"
            className="glass-card-interactive p-6 rounded-3xl flex flex-col justify-between group border-emerald-500/30 hover:border-emerald-400"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Terminal className="w-6 h-6" />
              </div>
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-lg font-bold text-white">Terminal Kasir POS</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold">
                  FAST
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scan barcode laser, kalkulasi kembalian tunai, tender QRIS instan, dan preview struk thermal.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-emerald-400 mt-6 group-hover:translate-x-1.5 transition-transform">
              <span>Buka Terminal Kasir</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </div>
          </Link>

          {/* Card 2: E-Commerce Storefront */}
          <Link
            href="/catalog"
            className="glass-card-interactive p-6 rounded-3xl flex flex-col justify-between group border-indigo-500/30 hover:border-indigo-400"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-lg font-bold text-white">Katalog Online</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 font-bold">
                  STORE
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Katalog produk artisan dengan cache Redis, drawer keranjang dinamis, dan kode voucher promo.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-indigo-400 mt-6 group-hover:translate-x-1.5 transition-transform">
              <span>Jelajahi Produk</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </div>
          </Link>

          {/* Card 3: Admin Operations */}
          <Link
            href="/admin/dashboard"
            className="glass-card-interactive p-6 rounded-3xl flex flex-col justify-between group border-amber-500/30 hover:border-amber-400"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-lg font-bold text-white">Admin Operations</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 font-bold">
                  METRICS
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Analitik omzet real-time, manajemen stok kritis, modal restock cepat, dan status antrean BullMQ.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-amber-400 mt-6 group-hover:translate-x-1.5 transition-transform">
              <span>Masuk Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </div>
          </Link>
        </div>

        {/* Tech Stack Chips */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-400">
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full glass-panel border-pos-border">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Next.js 15 App Router</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full glass-panel border-pos-border">
            <Cpu className="w-3.5 h-3.5 text-red-400" />
            <span>NestJS REST & GraphQL</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full glass-panel border-pos-border">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>PostgreSQL & Drizzle ORM</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full glass-panel border-pos-border">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Redis & BullMQ Queues</span>
          </span>
        </div>
      </div>
    </div>
  );
}
