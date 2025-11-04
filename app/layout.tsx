import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://volunbase.com'),
  title: 'Volunbase – Manajemen Relawan Jadi Sederhana',
  description:
    'Eliminasi 90% kekacauan administrasi relawan. Pendaftaran cepat, penjadwalan shift, dan komunikasi otomatis dalam satu platform SaaS.',
  keywords:
    'volunbase, manajemen relawan, event management, shift scheduling, volunteer coordination, NPO, komunitas',
  openGraph: {
    title: 'Volunbase – Manajemen Relawan Jadi Sederhana',
    description:
      'Eliminasi 90% kekacauan administrasi relawan dengan Volunbase.',
    type: 'website',
    images: ['/volunbase-wordmark-1024.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Volunbase – Manajemen Relawan Jadi Sederhana',
    description:
      'Eliminasi 90% kekacauan administrasi relawan dengan Volunbase.',
    images: ['/volunbase-wordmark-1024.webp'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://volunbase.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Analytics (optional): loads if env provided) */}
        {process.env.NEXT_PUBLIC_ANALYTICS_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_ANALYTICS_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);} 
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_ANALYTICS_ID}', { anonymize_ip: true });
            `}
            </Script>
          </>
        )}
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
