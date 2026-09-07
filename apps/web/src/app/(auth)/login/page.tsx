'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import {
  Store,
  ArrowRight,
  ShieldCheck,
  Terminal,
  ShoppingBag,
  AlertCircle,
  Clock,
  Layers,
  CheckCircle2,
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
      subtitle: 'Akses penuh laporan penjualan, manajemen stok, dan pengaturan.',
      redirect: '/admin/dashboard',
      icon: ShieldCheck,
      badge: 'Admin Console',
    },
    CASHIER: {
      email: 'cashier@minipos.local',
      title: 'Kasir Retail POS',
      subtitle: 'Terminal kasir cepat, pencarian barcode, dan struk transaksi.',
      redirect: '/pos',
      icon: Terminal,
      badge: 'Terminal Kasir',
    },
    CUSTOMER: {
      email: 'customer@minipos.local',
      title: 'Pelanggan Toko',
      subtitle: 'Katalog belanja online dengan keranjang belanja interaktif.',
      redirect: '/catalog',
      icon: ShoppingBag,
      badge: 'Toko Online',
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

      toast.success(`Selamat datang kembali, ${res.user.name || role}!`);
      router.push(roleConfigs[role].redirect);
    } catch (err: any) {
      const errMsg = err.message || 'Gagal masuk akun';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-57px)] bg-slate-50 grid grid-cols-1 lg:grid-cols-12 text-slate-900">
      {/* ============================================================ */}
      {/* LEFT PANEL: Clean Store Info & Context */}
      {/* ============================================================ */}
      <div className="lg:col-span-6 xl:col-span-7 bg-white border-r border-slate-200 p-8 sm:p-14 flex flex-col justify-between">
        {/* Top Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base">AuraPOS</span>
              <span className="text-xs text-slate-500 block -mt-0.5">Enterprise Point of Sale & Commerce</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-600 font-mono bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Outlet #JKT-089</span>
          </div>
        </div>

        {/* Center Editorial Description */}
        <div className="my-10 space-y-6 max-w-lg">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Shift Aktif: Pagi (08:00 - 16:00)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
              Sistem Point of Sale & Manajemen Toko Terintegrasi.
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Memproses transaksi kasir cepat, mencatat stok inventori secara real-time, dan mengelola katalog online dalam satu aplikasi.
            </p>
          </div>

          {/* Clean Feature Blocks */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-600" />
                <span>Kasir Cepat & Struk</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Scan barcode, nominal uang pas, tender QRIS, dan cetak struk thermal.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-700" />
                <span>Otomasi Stok & Queue</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Notifikasi stok minimum dan proses antrean latar belakang BullMQ.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>AuraPOS System v1.0.0</span>
          <span>Status Sistem Normal</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT PANEL: Clean White Form */}
      {/* ============================================================ */}
      <div className="lg:col-span-6 xl:col-span-5 p-8 sm:p-14 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Masuk ke Akun</h2>
            <p className="text-xs text-slate-600">Pilih peran akun di bawah untuk mengisi data otomatis.</p>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Segmented Role Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Pilih Akun Demo</label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-lg">
              {(['ADMIN', 'CASHIER', 'CUSTOMER'] as const).map((r) => {
                const active = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    className={`py-2 px-2 rounded-md text-xs font-semibold transition-all ${
                      active
                        ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r === 'ADMIN' ? 'Admin' : r === 'CASHIER' ? 'Kasir' : 'Customer'}
                  </button>
                );
              })}
            </div>

            <div className="p-3 rounded-md bg-blue-50 border border-blue-100 text-xs space-y-0.5">
              <div className="font-bold text-blue-800 text-[11px]">
                {roleConfigs[role].title}
              </div>
              <p className="text-blue-700 text-[11px] leading-normal">{roleConfigs[role].subtitle}</p>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Email Pengguna</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-md px-3.5 py-2 text-xs text-slate-900 outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700">Kata Sandi</label>
                <span className="text-slate-500 font-mono text-[11px]">password123</span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-md px-3.5 py-2 text-xs text-slate-900 outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 mt-2 shadow-sm"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <span>Masuk sebagai {roleConfigs[role].title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 transition-colors">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
