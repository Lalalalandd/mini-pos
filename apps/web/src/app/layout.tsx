import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Store, ShoppingBag, ShieldCheck, Terminal } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AuraPOS & E-Commerce Platform',
  description: 'Next-generation unified Point of Sale and E-commerce catalog platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-pos-bg text-pos-text flex flex-col font-sans antialiased">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-50 glass-panel border-b border-pos-border px-6 py-3.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-glow group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                  AuraPOS
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-mono px-2 py-0.5 rounded bg-pos-card border border-pos-border text-emerald-400">
                  v1.0.0
                </span>
              </div>
            </Link>

            <nav className="flex items-center space-x-1 sm:space-x-3">
              <Link
                href="/pos"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-emerald-400 hover:bg-pos-surface border border-transparent hover:border-pos-border transition-all"
              >
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Cashier POS</span>
              </Link>
              <Link
                href="/catalog"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-indigo-400 hover:bg-pos-surface border border-transparent hover:border-pos-border transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Online Store</span>
              </Link>
              <Link
                href="/admin/dashboard"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-amber-400 hover:bg-pos-surface border border-transparent hover:border-pos-border transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors shadow-sm ml-2"
              >
                Sign In
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Global Footer */}
        <footer className="border-t border-pos-border py-4 px-6 text-center text-xs text-pos-muted">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>Powered by Next.js 15, NestJS, Drizzle ORM & BullMQ</span>
            <div className="flex items-center space-x-4">
              <a href="http://localhost:4000/api/docs" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
                Swagger API Docs
              </a>
              <a href="http://localhost:4000/graphql" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors">
                GraphQL Playground
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
