import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'AuraPOS & E-Commerce Unified Platform',
  description: 'Ultra-fast retail Point of Sale & modern e-commerce storefront',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
