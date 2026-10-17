import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScopeLock - Müşteri Revizyon ve Onay Sistemi',
  description: 'Ajanslar ve freelancerlar için tek tıkla şifresiz müşteri onay ve imza sistemi.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
