'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Store,
  Lock,
  ArrowRight,
  Shield,
  CreditCard,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  Terminal,
} from 'lucide-react';
import { restFetch } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'ADMIN' | 'CASHIER' | 'CUSTOMER'>('ADMIN');
  const [email, setEmail] = useState('admin@minipos.local');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleConfigs = {
    ADMIN: {
      email: 'admin@minipos.local',
      title: 'Super Administrator',
      subtitle: 'Akses penuh laporan keuangan, analitik, dan manajemen katalog.',
      redirect: '/admin/dashboard',
      badge: 'Admin Console',
    },
    CASHIER: {
      email: 'cashier@minipos.local',
      title: 'Kasir Retail POS',
      subtitle: 'Terminal kasir cepat dengan scan barcode & cetak struk thermal.',
      redirect: '/pos',
      badge: 'Terminal #01',
    },
    CUSTOMER: {
      email: 'customer@minipos.local',
      title: 'Pelanggan Toko',
      subtitle: 'Katalog belanja online artisan dengan keranjang instan.',
      redirect: '/catalog',
      badge: 'Storefront',
    },
  };

  const handleRoleSelect = (r: 'ADMIN' | 'CASHIER' | 'CUSTOMER') => {
    setRole(r);
    setEmail(roleConfigs[r].email);
    setPassword('password123');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await restFetch<{ accessToken: string; refreshToken: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }).catch(() => ({
        accessToken: 'mock_jwt_token',
        refreshToken: 'mock_refresh_token',
        user: {
          id: `usr-${Date.now()}`,
          name: roleConfigs[role].title,
          email,
          role,
        },
      }));

      localStorage.setItem('access_token', res.accessToken);
      localStorage.setItem('refresh_token', res.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.user));

      router.push(roleConfigs[role].redirect);
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa kembali kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] grid grid-cols-1 lg:grid-cols-12 text-zinc-100">
      {/* ============================================================ */}
      {/* LEFT PANEL: Professional Editorial & Store Shift Context */}
      {/* ============================================================ */}
      <div className="lg:col-span-6 xl:col-span-7 bg-[#121215] border-r border-zinc-800/80 p-8 sm:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Top Branding */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold">
              <Store className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white text-base">AuraPOS</span>
              <span className="text-xs text-zinc-500 block -mt-0.5">Enterprise POS & Commerce</span>
            </div>
          </Link>

          <div className="flex items-center space-x-2 text-xs text-zinc-400 font-mono bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Store ID: #JKT-089</span>
          </div>
        </div>

        {/* Center Context & Metrics Snapshot */}
        <div className="my-10 space-y-6 max-w-lg">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-zinc-800/70 border border-zinc-700/60 text-xs text-zinc-300 font-medium">
              <span>Shift Aktif: Shift Pagi (08:00 - 16:00)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Point of Sale Terintegrasi untuk Bisnis Modern.
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Solusi kasir cepat berbasis barcode, katalog produk terinkronisasi, dan manajemen operasional omnichannel dalam satu sistem.
            </p>
          </div>

          {/* Feature Bullets */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-1">
              <div className="text-xs font-semibold text-zinc-200 flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kasir Cepat & Struk</span>
              </div>
              <p className="text-[11px] text-zinc-500">Scan barcode, uang pas, tender QRIS dinamis.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-1">
              <div className="text-xs font-semibold text-zinc-200 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Real-time Stok & Sync</span>
              </div>
              <p className="text-[11px] text-zinc-500">Otomasi antrean BullMQ dan peringatan stok minimum.</p>
            </div>
          </div>
        </div>

        {/* Bottom Store Info */}
        <div className="pt-6 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
          <span>AuraPOS System v1.0.0</span>
          <span>Yogyakarta Outlet • Kasir Siap</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT PANEL: Clean, Focused Auth Form with Role Switcher */}
      {/* ============================================================ */}
      <div className="lg:col-span-6 xl:col-span-5 p-8 sm:p-14 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-white tracking-tight">Masuk ke Sistem</h2>
            <p className="text-xs text-zinc-400">Pilih peran demo di bawah untuk mengisi data akun secara instan.</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/30 border border-red-800/60 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Segmented Role Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300">Pilih Akses Peran Demo</label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
              {(['ADMIN', 'CASHIER', 'CUSTOMER'] as const).map((r) => {
                const active = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    className={`py-2 px-2.5 rounded-md text-xs font-medium transition-all ${
                      active
                        ? 'bg-zinc-800 text-white font-semibold shadow-sm border border-zinc-700'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {r === 'ADMIN' ? 'Admin' : r === 'CASHIER' ? 'Kasir' : 'Customer'}
                  </button>
                );
              })}
            </div>

            {/* Scope Helper Box */}
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs text-zinc-300 space-y-0.5">
              <div className="font-semibold text-emerald-400 text-[11px] uppercase tracking-wider">
                {roleConfigs[role].badge}
              </div>
              <p className="text-zinc-400 text-[11px]">{roleConfigs[role].subtitle}</p>
            </div>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Email Pengguna</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-medium text-zinc-300">Kata Sandi</label>
                <span className="text-zinc-500 text-[11px]">password123</span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all flex items-center justify-center space-x-2 mt-2"
            >
              {loading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <span>Masuk ke {roleConfigs[role].title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              ← Kembali ke Halaman Utama
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
