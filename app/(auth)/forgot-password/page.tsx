'use client';

import { useState } from 'react';
import { supabase } from '@/lib/auth/supabaseClient';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function sendReset() {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/reset-password',
    });
    if (error) return alert(error.message);
    setSent(true);
  }

  return (
    <div className="container mx-auto px-4 py-24 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Forgot Password</h1>
      <p className="text-muted-foreground mb-8">
        Enter your email and we will send a reset link.
      </p>
      <div className="space-y-4">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-md border px-3 py-2"
        />
        <Button onClick={sendReset} className="w-full">Send Reset Link</Button>
        {sent && (
          <div className="text-sm text-green-600 dark:text-green-500">Reset email sent.</div>
        )}
      </div>
    </div>
  );
}

