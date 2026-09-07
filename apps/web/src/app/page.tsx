import Link from 'next/link';
import {
  Terminal,
  ShoppingBag,
  ShieldCheck,
  Zap,
  Layers,
  Database,
  Cpu,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      {/* Ambient background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full text-center space-y-6 relative z-10 my-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-panel text-xs font-semibold text-emerald-400 mb-2 border border-emerald-500/30">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Anti-Slop Unified Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
          Ultra-Fast <span className="bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">Point of Sale</span> & Storefront
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Engineered with modern full-stack performance: Next.js Server Components, NestJS REST + GraphQL, PostgreSQL via Drizzle ORM, and BullMQ background queues.
        </p>

        {/* Action Portal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-8 text-left">
          {/* Card 1: POS Terminal */}
          <Link
            href="/pos"
            className="glass-panel-interactive p-6 rounded-2xl flex flex-col justify-between group border-emerald-500/30 hover:border-emerald-400"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Terminal className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Cashier POS</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rapid barcode scanner simulator, live tender calculation, and high-frequency order processing.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-emerald-400 mt-6 group-hover:translate-x-1 transition-transform">
              Launch Terminal <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Card 2: E-Commerce Storefront */}
          <Link
            href="/catalog"
            className="glass-panel-interactive p-6 rounded-2xl flex flex-col justify-between group border-indigo-500/30 hover:border-indigo-400"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Online Store</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                GraphQL read-heavy catalog queries, lightning-fast Redis caching, and real-time category filtering.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-indigo-400 mt-6 group-hover:translate-x-1 transition-transform">
              Browse Catalog <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Card 3: Admin Metrics */}
          <Link
            href="/admin/dashboard"
            className="glass-panel-interactive p-6 rounded-2xl flex flex-col justify-between group border-amber-500/30 hover:border-amber-400"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Admin Dashboard</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Role-based access metrics, low-stock threshold triggers, and BullMQ queue activity monitors.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-amber-400 mt-6 group-hover:translate-x-1 transition-transform">
              Open Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>
        </div>

        {/* Tech Stack Badges */}
        <div className="pt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-pos-surface border border-pos-border">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>Next.js 15 App Router</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-pos-surface border border-pos-border">
            <Cpu className="w-3.5 h-3.5 text-red-400" />
            <span>NestJS + REST & GraphQL</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-pos-surface border border-pos-border">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>PostgreSQL & Drizzle ORM</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-pos-surface border border-pos-border">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Redis Cache & BullMQ</span>
          </span>
        </div>
      </div>
    </div>
  );
}
