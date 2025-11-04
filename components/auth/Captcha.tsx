'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

interface CaptchaProps {
  onVerified: (token: string) => void;
}

const provider = process.env.NEXT_PUBLIC_CAPTCHA_PROVIDER || 'hcaptcha';
const siteKey = process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY || '';

export default function Captcha({ onVerified }: CaptchaProps) {
  const [verifying, setVerifying] = useState(false);
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 300); // allow script to load
    return () => clearTimeout(id);
  }, []);

  async function handleVerify() {
    setVerifying(true);

    if (provider === 'recaptcha') {
      const g = (window as any).grecaptcha;
      if (!g || !siteKey) {
        alert('reCAPTCHA not ready');
        setVerifying(false);
        return;
      }
      g.ready(async () => {
        try {
          const token = await g.execute(siteKey, { action: 'submit' });
          onVerified(token);
        } finally {
          setVerifying(false);
        }
      });
      return;
    }

    // hCaptcha
    const h = (window as any).hcaptcha;
    if (!h || !siteKey) {
      alert('hCaptcha not ready');
      setVerifying(false);
      return;
    }
    try {
      let widgetId = (widgetRef.current as any)?.dataset?.widgetId;
      if (!widgetId && widgetRef.current) {
        widgetId = h.render(widgetRef.current, {
          sitekey: siteKey,
          callback: (token: string) => onVerified(token),
        });
        (widgetRef.current as any).dataset.widgetId = widgetId;
      }
      await h.execute(widgetId);
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground">
        CAPTCHA verification is required to proceed.
      </div>
      {provider === 'recaptcha' ? (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
          strategy="afterInteractive"
        />
      ) : (
        <>
          <Script src="https://js.hcaptcha.com/1/api.js" strategy="afterInteractive" />
          <div ref={widgetRef} className="h-captcha" />
        </>
      )}
      <button
        type="button"
        onClick={handleVerify}
        className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
        disabled={verifying || !ready}
      >
        {verifying ? 'Verifying...' : 'I am human'}
      </button>
    </div>
  );
}
