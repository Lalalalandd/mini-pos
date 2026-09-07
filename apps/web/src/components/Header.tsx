'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Store,
  Terminal,
  ShoppingBag,
  ShieldCheck,
  Clock,
  Wifi,
  Keyboard,
  X,
  Sparkles,
} from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const [time, setTime] = useState<string>('');
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user');
      if (saved) {
        try {
          setCurrentUser(JSON.parse(saved));
        } catch {}
      }
    }
  }, [pathname]);

  const navLinks = [
    {
      href: '/pos',
      label: 'Cashier POS',
      icon: Terminal,
      color: 'emerald',
      activeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      href: '/catalog',
      label: 'Online Store',
      icon: ShoppingBag,
      color: 'indigo',
      activeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    },
    {
      href: '/admin/dashboard',
      label: 'Admin Ops',
      icon: ShieldCheck,
      color: 'amber',
      activeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 glass-panel border-b border-pos-border/70 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Logo & Live Store Status */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center text-slate-950 font-bold shadow-glow group-hover:scale-105 transition-transform">
                <Store className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                    AuraPOS
                  </span>
                  <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    ONLINE
                  </span>
                </div>
              </div>
            </Link>

            {/* Store Clock & Network Health */}
            <div className="hidden lg:flex items-center space-x-2 pl-3 border-l border-pos-border/60 text-xs text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{time || '00:00:00'}</span>
              <span className="flex items-center text-emerald-400 text-[11px] space-x-1 pl-2">
                <Wifi className="w-3 h-3 animate-pulse" />
                <span className="text-[10px]">Cloud Sync</span>
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`btn-tactile flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    isActive
                      ? link.activeColor
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-pos-surface'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}

            {/* Keyboard Shortcuts Trigger Button */}
            <button
              onClick={() => setShortcutsOpen(true)}
              title="Keyboard Shortcuts Guide"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-pos-surface border border-transparent hover:border-pos-border transition-colors hidden md:block"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* User Session Badge / Sign In */}
            {currentUser ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-pos-border/60">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">
                  {currentUser.role?.[0] || 'U'}
                </div>
                <div className="hidden xl:block text-left text-[11px] leading-tight">
                  <div className="font-semibold text-white truncate max-w-[90px]">{currentUser.name || 'User'}</div>
                  <div className="text-[9px] font-mono text-emerald-400">{currentUser.role}</div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="btn-tactile px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-glow ml-1"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* KEYBOARD SHORTCUTS MODAL */}
      {shortcutsOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-sm w-full space-y-4 border-pos-border">
            <div className="flex justify-between items-center pb-2 border-b border-pos-border">
              <div className="flex items-center space-x-2 text-white font-bold text-sm">
                <Keyboard className="w-4 h-4 text-emerald-400" />
                <span>Cashier Keyboard Shortcuts</span>
              </div>
              <button
                onClick={() => setShortcutsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-pos-surface border border-pos-border">
                <span className="text-slate-300">Focus Barcode / SKU Scanner</span>
                <kbd className="px-2 py-0.5 rounded bg-pos-card border border-pos-border font-mono text-[10px] text-emerald-400">
                  F2
                </kbd>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-pos-surface border border-pos-border">
                <span className="text-slate-300">Open Payment Tender Modal</span>
                <kbd className="px-2 py-0.5 rounded bg-pos-card border border-pos-border font-mono text-[10px] text-emerald-400">
                  F4
                </kbd>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-pos-surface border border-pos-border">
                <span className="text-slate-300">Clear Current Ticket Cart</span>
                <kbd className="px-2 py-0.5 rounded bg-pos-card border border-pos-border font-mono text-[10px] text-red-400">
                  Esc
                </kbd>
              </div>
            </div>

            <button
              onClick={() => setShortcutsOpen(false)}
              className="w-full py-2 rounded-xl bg-pos-surface border border-pos-border hover:bg-pos-card text-white text-xs font-semibold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
