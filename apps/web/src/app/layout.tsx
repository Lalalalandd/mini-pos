import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { Header } from '@/components/Header';
import { ToastProvider } from '@/components/ToastProvider';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AuraPOS - Sistem Kasir & Toko Online',
  description: 'Aplikasi Point of Sale dan Toko Online Terintegrasi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <body className={`${plusJakartaSans.className} min-h-screen bg-[#f7f9fc] text-[#1f1f1f] flex flex-col font-sans antialiased`}>
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <ToastProvider />
      </body>
    </html>
  );
}
