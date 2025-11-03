import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://volunbase.com'),
  title: 'Volunbase - Volunteer Management Made Simple',
  description: 'Eliminate 90% of volunteer management chaos. Streamline registrations, shift scheduling, and communications with our powerful SaaS tool for events, NPOs, and communities.',
  keywords: 'volunteer management, event management, shift scheduling, volunteer coordination, NPO tools, community events',
  openGraph: {
    title: 'Volunbase - Volunteer Management Made Simple',
    description: 'Eliminate 90% of volunteer management chaos with our powerful SaaS tool.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
