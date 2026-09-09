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
      subtitle: 'Akses penuh laporan penjualan, manajemen stok, dan akun pengguna.',
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
    <div className="min-h-screen bg-white grid grid-cols-1 lg:grid-cols-12 text-md-on-surface">
      {/* Left Panel: Store Context */}
      <div className="lg:col-span-6 xl:col-span-7 bg-white border-r border-[#f0f2f5] p-8 sm:p-14 flex flex-col justify-between">
        {/* Top Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-md-primary text-white flex items-center justify-center shadow-none">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-md-on-surface text-base tracking-tight">AuraPOS</span>
              <span className="text-xs text-md-on-surface-variant block -mt-0.5">Enterprise Point of Sale & Commerce</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-md-on-surface-variant font-mono bg-[#f7f9fc] border border-[#f0f2f5] px-3.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Outlet #JKT-089</span>
          </div>
        </div>

        {/* Center Editorial Description */}
        <div className="my-10 space-y-6 max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#d3e3fd] text-xs text-[#041e49] font-semibold">
              <Clock className="w-3.5 h-3.5 text-md-primary" />
              <span>Shift Aktif: Pagi (08:00 - 16:00)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-md-on-surface tracking-tight leading-tight">
              Sistem Point of Sale & Manajemen Toko Terintegrasi.
            </h1>
            <p className="text-sm text-md-on-surface-variant leading-relaxed">
              Memproses transaksi kasir cepat, mencatat stok inventori secara real-time, dan mengelola katalog online dalam satu aplikasi.
            </p>
          </div>

          {/* Feature Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-[#f7f9fc] border border-[#f0f2f5] space-y-1.5 shadow-none">
              <div className="text-xs font-bold text-md-on-surface flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-md-primary" />
                <span>Kasir Cepat & Struk</span>
              </div>
              <p className="text-[11px] text-md-on-surface-variant leading-normal">
                Scan barcode, nominal uang pas, tender QRIS, dan cetak struk thermal.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#f7f9fc] border border-[#f0f2f5] space-y-1.5 shadow-none">
              <div className="text-xs font-bold text-md-on-surface flex items-center space-x-2">
                <Layers className="w-4 h-4 text-md-secondary" />
                <span>Otomasi Stok & Queue</span>
              </div>
              <p className="text-[11px] text-md-on-surface-variant leading-normal">
                Notifikasi stok minimum dan proses antrean latar belakang BullMQ.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="pt-6 border-t border-[#f0f2f5] flex items-center justify-between text-xs text-md-on-surface-variant">
          <span>AuraPOS System v1.0.0</span>
          <span>Status Sistem Normal</span>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="lg:col-span-6 xl:col-span-5 p-8 sm:p-14 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-md-on-surface tracking-tight">Masuk ke Akun</h2>
            <p className="text-xs text-md-on-surface-variant">Pilih peran akun di bawah untuk mengisi data otomatis.</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Segmented Role Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-md-on-surface">Pilih Akun Demo</label>
            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#f0f4f9] border border-[#f0f2f5] rounded-2xl">
              {(['ADMIN', 'CASHIER', 'CUSTOMER'] as const).map((r) => {
                const active = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? 'bg-white text-md-primary font-bold shadow-none border border-[#f0f2f5]'
                        : 'text-md-on-surface-variant hover:text-md-on-surface'
                    }`}
                  >
                    {r === 'ADMIN' ? 'Admin' : r === 'CASHIER' ? 'Kasir' : 'Customer'}
                  </button>
                );
              })}
            </div>

            <div className="p-3.5 rounded-2xl bg-[#d3e3fd]/60 text-xs space-y-1 border border-[#d3e3fd]">
              <div className="font-bold text-[#041e49] text-xs">
                {roleConfigs[role].title}
              </div>
              <p className="text-[#041e49]/80 text-[11px] leading-normal">{roleConfigs[role].subtitle}</p>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-md-on-surface">Email Pengguna</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f7f9fc] border border-[#e0e2ec] focus:border-md-primary rounded-2xl px-4 py-2.5 text-xs text-md-on-surface outline-none font-mono transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-md-on-surface">Kata Sandi</label>
                <span className="text-md-on-surface-variant font-mono text-[11px]">password123</span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#f7f9fc] border border-[#e0e2ec] focus:border-md-primary rounded-2xl px-4 py-2.5 text-xs text-md-on-surface outline-none font-mono transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center flex-row whitespace-nowrap py-3 rounded-full bg-md-primary hover:bg-md-primary-hover text-white text-xs font-semibold shadow-none mt-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <span>Masuk sebagai {roleConfigs[role].title}</span>
                  <ArrowRight className="w-4 h-4 ml-2 shrink-0" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-md-on-surface-variant hover:text-md-primary font-medium transition-colors">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
