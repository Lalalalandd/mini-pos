import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${plusJakartaSans.className} min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased`}>
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <ToastProvider />
      </body>
    </html>
  );
}


