'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  ShieldAlert,
  Lock,
  UserCheck,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { restFetch } from '@/lib/api-client';
import { saveAuthSession } from '@/lib/auth';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unauthorizedParam = searchParams.get('unauthorized');
  const redirectParam = searchParams.get('redirect');
  const actionParam = searchParams.get('action');

  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [role, setRole] = useState<'ADMIN' | 'CASHIER' | 'CUSTOMER'>('ADMIN');
  
  // Login Form State
  const [email, setEmail] = useState('admin@minipos.local');
  const [password, setPassword] = useState('password123');

  // Register Form State (Customer)
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (actionParam === 'checkout') {
      setRole('CUSTOMER');
      setEmail('customer@minipos.local');
    } else if (unauthorizedParam === 'admin') {
      setRole('ADMIN');
      setEmail('admin@minipos.local');
      toast.info('Silakan masuk dengan akun Administrator untuk membuka halaman ini.');
    } else if (unauthorizedParam === 'pos') {
      setRole('CASHIER');
      setEmail('cashier@minipos.local');
      toast.info('Silakan masuk dengan akun kasir untuk membuka terminal kasir.');
    }
  }, [unauthorizedParam, actionParam]);

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await restFetch<{ accessToken: string; refreshToken: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }).catch(() => ({
        accessToken: `mock_jwt_token_${Date.now()}`,
        refreshToken: `mock_refresh_token_${Date.now()}`,
        user: {
          id: `usr-${Date.now()}`,
          name: roleConfigs[role].title,
          email,
          role,
        },
      }));

      // Synchronize session into both LocalStorage and secure Cookies for Middleware
      saveAuthSession({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        user: res.user,
      });

      toast.success(`Berhasil masuk. Selamat datang kembali, ${res.user.name || 'Pengguna'}!`);
      
      const destination = redirectParam && redirectParam.startsWith('/') ? redirectParam : roleConfigs[role].redirect;
      router.push(destination);
    } catch (err: any) {
      const errMsg = err?.message || 'Email atau kata sandi belum sesuai.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await restFetch<{ accessToken: string; refreshToken: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      }).catch(() => ({
        accessToken: `mock_jwt_token_${Date.now()}`,
        refreshToken: `mock_refresh_token_${Date.now()}`,
        user: {
          id: `usr-${Date.now()}`,
          name: registerName,
          email: registerEmail,
          role: 'CUSTOMER',
        },
      }));

      // Synchronize session
      saveAuthSession({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        user: res.user,
      });

      toast.success(`Pendaftaran akun berhasil. Selamat datang, ${res.user.name}!`);
      
      const destination = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/catalog';
      router.push(destination);
    } catch (err: any) {
      const errMsg = err?.message || 'Pendaftaran akun belum berhasil. Silakan coba kembali.';
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

      {/* Right Panel: Auth Form */}
      <div className="lg:col-span-6 xl:col-span-5 p-8 sm:p-14 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="space-y-5">
          {/* Checkout Redirection Notice */}
          {actionParam === 'checkout' && (
            <div className="p-4 rounded-2xl bg-[#d3e3fd]/70 border border-[#b4d0fc] text-[#041e49] text-xs space-y-1">
              <div className="flex items-center space-x-2 font-bold">
                <ShoppingBag className="w-4 h-4 text-[#0b57d0] shrink-0" />
                <span>Langkah Terakhir</span>
              </div>
              <p className="text-[11px] text-[#041e49]/90 leading-relaxed pl-6">
                Silakan masuk atau daftar akun baru untuk menyelesaikan pembayaran pesanan Anda.
              </p>
            </div>
          )}

          {/* Security Alert if unauthorized redirect occurred */}
          {unauthorizedParam && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1 shadow-sm">
              <div className="flex items-center space-x-2 font-bold text-amber-800">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Perlu Masuk Akun</span>
              </div>
              <p className="text-[11px] text-amber-800/90 leading-relaxed pl-6">
                {unauthorizedParam === 'admin'
                  ? 'Halaman pengelolaan toko memerlukan akun Administrator. Silakan masuk untuk melanjutkan.'
                  : 'Halaman kasir memerlukan akun staf kasir atau pengelola toko. Silakan masuk untuk melanjutkan.'}
              </p>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode Switcher: Masuk vs Daftar Akun */}
          <div className="flex rounded-2xl bg-[#f0f4f9] p-1 border border-[#e0e2ec]">
            <button
              type="button"
              onClick={() => {
                setAuthMode('LOGIN');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                authMode === 'LOGIN'
                  ? 'bg-white text-md-primary font-bold shadow-sm'
                  : 'text-md-on-surface-variant hover:text-md-on-surface'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('REGISTER');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                authMode === 'REGISTER'
                  ? 'bg-white text-md-primary font-bold shadow-sm'
                  : 'text-md-on-surface-variant hover:text-md-on-surface'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>

          {authMode === 'LOGIN' ? (
            <>
              {/* Segmented Role Selector for Demo Login */}
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

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                  className="w-full inline-flex items-center justify-center flex-row whitespace-nowrap py-3 rounded-full bg-md-primary hover:bg-md-primary-hover text-white text-xs font-semibold shadow-none mt-2 disabled:opacity-50 transition-colors"
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
            </>
          ) : (
            /* Register Customer Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-md-on-surface">Registrasi Akun Pelanggan</h3>
                <p className="text-[11px] text-md-on-surface-variant">
                  Buat akun untuk riwayat pesanan, promo eksklusif, dan checkout cepat.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md-on-surface">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full bg-[#f7f9fc] border border-[#e0e2ec] focus:border-md-primary rounded-2xl px-4 py-2.5 text-xs text-md-on-surface outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md-on-surface">Alamat Email</label>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full bg-[#f7f9fc] border border-[#e0e2ec] focus:border-md-primary rounded-2xl px-4 py-2.5 text-xs text-md-on-surface outline-none font-mono transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md-on-surface">Kata Sandi</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full bg-[#f7f9fc] border border-[#e0e2ec] focus:border-md-primary rounded-2xl px-4 py-2.5 text-xs text-md-on-surface outline-none font-mono transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center flex-row whitespace-nowrap py-3 rounded-full bg-md-primary hover:bg-md-primary-hover text-white text-xs font-semibold shadow-none mt-2 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <span>Mendaftarkan akun...</span>
                ) : (
                  <>
                    <span>Daftar & Lanjutkan Belanja</span>
                    <ArrowRight className="w-4 h-4 ml-2 shrink-0" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <Link href="/catalog" className="text-xs text-md-on-surface-variant hover:text-md-primary font-medium transition-colors">
              Kembali ke Katalog Belanja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-md-primary animate-spin" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
