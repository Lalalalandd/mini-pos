import Link from 'next/link';
import { Store, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
        <Store className="w-7 h-7" />
      </div>
      <h2 className="text-3xl font-extrabold text-white">404 - Halaman Tidak Ditemukan</h2>
      <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
        Halaman atau menu yang Anda tuju tidak tersedia atau telah dipindahkan.
      </p>
      <Link
        href="/"
        className="btn-tactile inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-glow mt-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Beranda</span>
      </Link>
    </div>
  );
}
