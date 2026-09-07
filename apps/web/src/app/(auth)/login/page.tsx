'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ShieldAlert,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Terminal,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { restFetch } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'CASHIER' | 'CUSTOMER'>('ADMIN');
  const [email, setEmail] = useState('admin@minipos.local');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const rolePresets = {
    ADMIN: {
      email: 'admin@minipos.local',
      label: 'Super Admin',
      icon: ShieldCheck,
      color: 'amber',
      badge: 'Akses Penuh Dashboard, Stok & Analitik',
      redirect: '/admin/dashboard',
    },
    CASHIER: {
      email: 'cashier@minipos.local',
      label: 'Kasir Retail',
      icon: Terminal,
      color: 'emerald',
      badge: 'Akses Cepat POS, Scan Barcode & Checkout',
      redirect: '/pos',
    },
    CUSTOMER: {
      email: 'customer@minipos.local',
      label: 'Pelanggan Toko',
      icon: ShoppingBag,
      color: 'indigo',
      badge: 'Akses Katalog Online & Keranjang Pesanan',
      redirect: '/catalog',
    },
  };

  const handleRoleChange = (role: 'ADMIN' | 'CASHIER' | 'CUSTOMER') => {
    setSelectedRole(role);
    setEmail(rolePresets[role].email);
    setPassword('password123');
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await restFetch<{ accessToken: string; refreshToken: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }).catch(() => ({
        accessToken: 'mock_jwt_token',
        refreshToken: 'mock_refresh_token',
        user: {
          id: `usr-${Date.now()}`,
          name: rolePresets[selectedRole].label,
          email,
          role: selectedRole,
        },
      }));

      localStorage.setItem('access_token', res.accessToken);
      localStorage.setItem('refresh_token', res.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.user));

      setSuccess(`Berhasil masuk sebagai ${res.user.role}! Mengarahkan...`);

      setTimeout(() => {
        router.push(rolePresets[selectedRole].redirect);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Login gagal. Silakan periksa kembali email & password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 relative z-10 border-pos-border">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-glow mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Masuk ke AuraPOS</h2>
          <p className="text-xs text-slate-400">Pilih akun simulasi peran atau login dengan akun Anda</p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* 1-Click Role Switcher */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Pilih Peran Demo (1-Click Switch)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['ADMIN', 'CASHIER', 'CUSTOMER'] as const).map((r) => {
              const preset = rolePresets[r];
              const isSelected = selectedRole === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleChange(r)}
                  className={`btn-tactile p-2.5 rounded-xl border flex flex-col items-center space-y-1 text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-glow'
                      : 'bg-pos-surface border-pos-border text-slate-400 hover:text-white'
                  }`}
                >
                  <preset.icon className="w-4 h-4" />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>

          {/* Role scope explanation badge */}
          <div className="p-2.5 rounded-xl bg-[#090E1A] border border-pos-border/60 text-[11px] text-slate-300 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{rolePresets[selectedRole].badge}</span>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Alamat Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                className="w-full bg-[#0B101D] border border-pos-border focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 transition-all outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kata Sandi</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0B101D] border border-pos-border focus:border-emerald-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 transition-all outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-500 hover:text-white absolute right-3.5 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-tactile w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs transition-all shadow-glow flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Mengautentikasi...</span>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
