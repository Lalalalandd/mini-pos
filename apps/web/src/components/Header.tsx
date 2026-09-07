'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  Store,
  Terminal,
  ShoppingBag,
  ShieldCheck,
  Search,
  User,
  LogOut,
} from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [headerSearch, setHeaderSearch] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user');
      if (saved) {
        try {
          setCurrentUser(JSON.parse(saved));
        } catch {}
      } else {
        setCurrentUser(null);
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
    setCurrentUser(null);
    toast.success('Berhasil keluar dari akun.');
    router.push('/login');
  };

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      router.push(`/catalog?q=${encodeURIComponent(headerSearch.trim())}`);
    } else {
      router.push('/catalog');
    }
  };

  const isCashier = currentUser?.role === 'CASHIER';
  const isAdmin = currentUser?.role === 'ADMIN';
  const isCustomerOrPublic = !currentUser || currentUser?.role === 'CUSTOMER';

  const logoHref = isAdmin ? '/admin/dashboard' : isCashier ? '/pos' : '/catalog';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-8 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-6">
        {/* Store Logo */}
        <Link href={logoHref} className="flex items-center space-x-2.5 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Store className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900 tracking-tight leading-none">AuraStore</span>
            <span className="text-[10px] text-blue-600 font-semibold tracking-wide uppercase mt-0.5">
              {isAdmin ? 'Admin Console' : isCashier ? 'Terminal POS Kasir' : 'Marketplace Online'}
            </span>
          </div>
        </Link>

        {/* Marketplace Search Bar (Only shown for Customers / Public / Admin) */}
        {!isCashier && (
          <form onSubmit={handleHeaderSearchSubmit} className="hidden md:flex flex-1 max-w-xl relative">
            <div className="relative w-full flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Cari kopi artisan, pastry hangat, paket bundling..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-lg pl-10 pr-20 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors"
              >
                Cari
              </button>
            </div>
          </form>
        )}

        {/* Cashier Specific Title Banner */}
        {isCashier && (
          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-600">
            <span className="px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
              Mode Terminal Kasir Aktif
            </span>
          </div>
        )}

        {/* Right Navigation & User Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Admin Navigation */}
          {isAdmin && (
            <>
              <Link
                href="/admin/dashboard"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                  pathname === '/admin/dashboard'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden lg:inline">Admin Dashboard</span>
              </Link>
              <Link
                href="/pos"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                  pathname === '/pos'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden lg:inline">Terminal POS</span>
              </Link>
              <Link
                href="/catalog"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                  pathname.startsWith('/catalog')
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Lihat Toko</span>
              </Link>
            </>
          )}

          {/* Cashier Navigation: ONLY Terminal POS */}
          {isCashier && (
            <Link
              href="/pos"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-blue-600" />
              <span>Terminal POS</span>
            </Link>
          )}

          {/* Customer & Public Navigation: ONLY Toko Online */}
          {isCustomerOrPublic && (
            <Link
              href="/catalog"
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                pathname.startsWith('/catalog')
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
              <span>Katalog Belanja</span>
            </Link>
          )}

          {/* User Profile & Logout */}
          {currentUser ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-800 flex items-center justify-center text-xs font-bold font-mono">
                  {currentUser.role?.[0] || 'U'}
                </div>
                <div className="hidden xl:block text-left text-xs leading-tight">
                  <div className="font-semibold text-slate-800 truncate max-w-[110px]">
                    {currentUser.name || 'Pengguna'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{currentUser.role}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Keluar dari akun"
                className="p-2 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 border border-slate-200 transition-colors flex items-center space-x-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs font-medium">Keluar</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
              >
                Masuk
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
