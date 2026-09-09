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
  Store,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-10 bg-[#f7f9fc]">
      <div className="max-w-5xl w-full text-center space-y-8 my-auto">
        {/* Tonal Section Chip */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#d3e3fd] text-xs font-semibold text-[#041e49]">
          <Store className="w-4 h-4 text-[#0b57d0]" />
          <span>AuraPOS & E-Commerce Platform</span>
        </div>

        {/* Hero Title & Description */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1f1f1f] leading-tight">
            Sistem Kasir POS dan Katalog Toko Terintegrasi
          </h1>

          <p className="text-sm sm:text-base text-[#444746] max-w-2xl mx-auto leading-relaxed">
            Platform operasional toko lengkap untuk transaksi kasir fisik dan pesanan toko online dengan sinkronisasi inventori otomatis.
          </p>
        </div>

        {/* Material 3 Interactive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-left">
          {/* Card 1: POS Terminal */}
          <Link
            href="/pos"
            className="m3-card-elevated p-6 flex flex-col justify-between group border border-[#e0e2ec] hover:border-[#0b57d0] transition-all"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#d3e3fd] text-[#0b57d0] flex items-center justify-center mb-5 group-hover:bg-[#0b57d0] group-hover:text-white transition-colors shadow-sm">
                <Terminal className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-[#1f1f1f]">Terminal Kasir POS</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e8f0fe] text-[#0b57d0]">
                  KASIR
                </span>
              </div>
              <p className="text-xs text-[#444746] leading-relaxed">
                Pencarian produk cepat, kalkulasi kembalian tunai, tender QRIS dinamis, dan cetak invoice struk.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-[#0b57d0] mt-6 group-hover:translate-x-1 transition-transform">
              <span>Buka Terminal Kasir</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Card 2: E-Commerce Storefront */}
          <Link
            href="/catalog"
            className="m3-card-elevated p-6 flex flex-col justify-between group border border-[#e0e2ec] hover:border-[#0b57d0] transition-all"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#d3e3fd] text-[#0b57d0] flex items-center justify-center mb-5 group-hover:bg-[#0b57d0] group-hover:text-white transition-colors shadow-sm">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-[#1f1f1f]">Katalog Belanja</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e8f0fe] text-[#0b57d0]">
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-[#444746] leading-relaxed">
                Katalog produk dengan filter kategori, drawer keranjang belanja, rincian produk, dan checkout mandiri.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-[#0b57d0] mt-6 group-hover:translate-x-1 transition-transform">
              <span>Jelajahi Produk</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Card 3: Admin Operations */}
          <Link
            href="/admin/dashboard"
            className="m3-card-elevated p-6 flex flex-col justify-between group border border-[#e0e2ec] hover:border-[#0b57d0] transition-all"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#d3e3fd] text-[#0b57d0] flex items-center justify-center mb-5 group-hover:bg-[#0b57d0] group-hover:text-white transition-colors shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-[#1f1f1f]">Admin Workspace</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e8f0fe] text-[#0b57d0]">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-[#444746] leading-relaxed">
                Metrik penjualan, manajemen produk dan stok opname, proses refund pesanan, dan manajemen akun pengguna.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-[#0b57d0] mt-6 group-hover:translate-x-1 transition-transform">
              <span>Masuk Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>
        </div>

        {/* Material 3 Assist Chips */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-2.5 text-xs text-[#444746]">
          <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e0e2ec] shadow-sm">
            <Zap className="w-3.5 h-3.5 text-[#0b57d0]" />
            <span>Next.js 15 App Router</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e0e2ec] shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-[#0b57d0]" />
            <span>NestJS REST & GraphQL</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e0e2ec] shadow-sm">
            <Database className="w-3.5 h-3.5 text-[#0b57d0]" />
            <span>PostgreSQL & Drizzle ORM</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e0e2ec] shadow-sm">
            <Layers className="w-3.5 h-3.5 text-[#0b57d0]" />
            <span>Redis & BullMQ Engine</span>
          </span>
        </div>
      </div>
    </div>
  );
}

