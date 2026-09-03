import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bagikan Lokasi Aman | Consent-Based Location Sharing',
  description: 'Aplikasi berbagi lokasi secara aman dan transparan berbasis izin peramban.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
