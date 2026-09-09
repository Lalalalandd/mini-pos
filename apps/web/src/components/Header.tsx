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
  LogOut,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { openCart, totalItems } = useCart();
  const [currentUser, setCurrentUser] = useState<any>(null);

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
    toast.success('Sesi berhasil diakhiri.');
    router.push('/login');
  };

  const isCashier = currentUser?.role === 'CASHIER';
  const isAdmin = currentUser?.role === 'ADMIN';
  const isCustomerOrPublic = !currentUser || currentUser?.role === 'CUSTOMER';

  if (pathname === '/login') {
    return null;
  }

  const logoHref = isAdmin ? '/admin/dashboard' : isCashier ? '/pos' : '/catalog';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#f0f2f5] px-4 sm:px-8 py-2.5 shadow-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand App Bar */}
        <Link href={logoHref} className="flex items-center space-x-3 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b57d0] rounded-xl p-1">
          <div className="w-10 h-10 rounded-2xl bg-[#0b57d0] text-white flex items-center justify-center font-bold shadow-none transition-transform active:scale-95">
            <Store className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-[#1f1f1f] tracking-tight leading-tight">AuraStore</span>
            <span className="text-[11px] text-[#0b57d0] font-semibold tracking-wide">
              {isAdmin ? 'Admin Console' : isCashier ? 'Terminal POS Kasir' : 'Katalog Belanja'}
            </span>
          </div>
        </Link>

        {/* Center Mode Indicator for Cashier */}
        {isCashier && (
          <div className="hidden sm:flex items-center space-x-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-[#d3e3fd] text-[#041e49] font-semibold">
              Mode Terminal Kasir Aktif
            </span>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex items-center space-x-2">
          {isAdmin && (
            <div className="hidden sm:flex items-center space-x-1.5 bg-[#f0f4f9] p-1 rounded-full">
              <Link
                href="/admin/dashboard"
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  pathname === '/admin/dashboard'
                    ? 'bg-white text-[#0b57d0] shadow-none font-bold'
                    : 'text-[#444746] hover:text-[#1f1f1f]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden lg:inline">Dashboard</span>
              </Link>
              <Link
                href="/pos"
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  pathname === '/pos'
                    ? 'bg-white text-[#0b57d0] shadow-none font-bold'
                    : 'text-[#444746] hover:text-[#1f1f1f]'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden lg:inline">Terminal POS</span>
              </Link>
              <Link
                href="/catalog"
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  pathname.startsWith('/catalog')
                    ? 'bg-white text-[#0b57d0] shadow-none font-bold'
                    : 'text-[#444746] hover:text-[#1f1f1f]'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Katalog</span>
              </Link>
            </div>
          )}

          {isCashier && (
            <Link
              href="/pos"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#d3e3fd] text-[#041e49] transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 shrink-0" />
              <span>Terminal POS</span>
            </Link>
          )}

          {isCustomerOrPublic && (
            <div className="flex items-center space-x-2">
              <Link
                href="/catalog"
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  pathname.startsWith('/catalog')
                    ? 'bg-[#d3e3fd] text-[#041e49]'
                    : 'bg-white text-[#444746] border border-[#f0f2f5] hover:bg-[#f0f4f9]'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span>Katalog Belanja</span>
              </Link>

              <button
                type="button"
                onClick={openCart}
                className="relative flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#f0f2f5] text-[#1f1f1f] hover:bg-[#f0f4f9] transition-all"
                title="Lihat Keranjang Belanja"
                aria-label="Lihat Keranjang Belanja"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#0b57d0] shrink-0" />
                <span>Keranjang</span>
                {totalItems > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#0b57d0] text-white text-[10px] font-bold font-mono">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Profile Chip & Auth */}
          {currentUser ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-[#f0f2f5]">
              <div className="flex items-center space-x-2 bg-[#f0f4f9] px-2.5 py-1 rounded-full border border-[#f0f2f5]">
                <div className="w-6 h-6 rounded-full bg-[#0b57d0] text-white flex items-center justify-center text-[11px] font-bold">
                  {currentUser.role?.[0] || 'U'}
                </div>
                <div className="hidden md:block text-left text-xs leading-tight">
                  <div className="font-semibold text-[#1f1f1f] truncate max-w-[120px]">
                    {currentUser.name || 'Pengguna'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Keluar dari akun"
                className="p-2 rounded-full text-[#444746] hover:text-red-700 hover:bg-red-50 transition-colors"
                aria-label="Keluar dari akun"
              >
                <LogOut className="w-4 h-4 shrink-0" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 pl-2 border-l border-[#f0f2f5]">
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#0b57d0] hover:bg-[#0842a0] text-white transition-all shadow-none"
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
