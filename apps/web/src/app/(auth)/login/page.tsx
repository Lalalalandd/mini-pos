'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldAlert, CheckCircle2, User, KeyRound } from 'lucide-react';
import { restFetch } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@minipos.local');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await restFetch<{ accessToken: string; refreshToken: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('access_token', res.accessToken);
      localStorage.setItem('refresh_token', res.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.user));

      setSuccess(`Signed in successfully as ${res.user.role}! Redirecting...`);

      setTimeout(() => {
        if (res.user.role === 'ADMIN') router.push('/admin/dashboard');
        else if (res.user.role === 'CASHIER') router.push('/pos');
        else router.push('/catalog');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setPreset = (presetEmail: string, roleName: string) => {
    setEmail(presetEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 items-center justify-center mb-1">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to AuraPOS</h2>
          <p className="text-xs text-slate-400">Enter your credentials or choose a quick test account</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Quick Role Fillers */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Quick Test Accounts</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPreset('admin@minipos.local', 'ADMIN')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                email === 'admin@minipos.local'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-pos-surface border-pos-border text-slate-400 hover:text-white'
              }`}
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => setPreset('cashier@minipos.local', 'CASHIER')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                email === 'cashier@minipos.local'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-pos-surface border-pos-border text-slate-400 hover:text-white'
              }`}
            >
              💳 Cashier
            </button>
            <button
              type="button"
              onClick={() => setPreset('customer@minipos.local', 'CUSTOMER')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                email === 'customer@minipos.local'
                  ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                  : 'bg-pos-surface border-pos-border text-slate-400 hover:text-white'
              }`}
            >
              🛍️ Customer
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-pos-surface border border-pos-border rounded-lg pl-9 pr-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-pos-surface border border-pos-border rounded-lg pl-9 pr-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all shadow-glow hover:shadow-lg"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
