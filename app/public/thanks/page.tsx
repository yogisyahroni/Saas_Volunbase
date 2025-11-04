"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
export function generateStaticParams() { return []; }

export default function ThanksPage() {
  const sp = useSearchParams();
  const eventName = sp.get('event') || 'your event';
  const shiftName = sp.get('shift') || '';
  return (
    <div className="container mx-auto px-4 py-24">
      <h1 className="text-3xl font-bold mb-4">Terima kasih!</h1>
      <p className="mb-2">Pendaftaran Anda telah diterima.</p>
      <p className="mb-6">
        Event: <span className="font-medium">{eventName}</span>
        {shiftName ? (
          <>
            {' '}· Shift: <span className="font-medium">{shiftName}</span>
          </>
        ) : null}
      </p>
      <p className="mb-6 text-muted-foreground">Kami juga mengirimkan email konfirmasi. Anda akan menerima pengingat H-1.</p>
      <Link href="/">
        <span className="underline">Kembali ke halaman utama</span>
      </Link>
    </div>
  );
}

