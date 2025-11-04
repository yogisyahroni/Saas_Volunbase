'use client';

import { useState } from 'react';
import { supabase } from '@/lib/auth/supabaseClient';
import Captcha from '@/components/auth/Captcha';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    if (!captchaToken) return alert('Please complete CAPTCHA first');
    setLoading(true);
    await supabase.auth.signInWithOAuth({ provider: 'google' });
    setLoading(false);
  }

  return (
    <div className="container mx-auto px-4 py-24 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Sign In</h1>
      <p className="text-muted-foreground mb-8">
        Complete CAPTCHA, then continue with your preferred provider.
      </p>
      <div className="space-y-6">
        <Captcha onVerified={setCaptchaToken} />
        <div className="flex gap-4">
          <Button onClick={signInWithGoogle} disabled={loading || !captchaToken}>
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
