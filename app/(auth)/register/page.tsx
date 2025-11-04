'use client';

import { useState } from 'react';
import Captcha from '@/components/auth/Captcha';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!captchaToken) return alert('Please complete CAPTCHA first');
    setSubmitting(true);
    // Stub: typically call backend to create admin account
    alert(`Registered: ${name} / ${email}`);
    setSubmitting(false);
  }

  return (
    <div className="container mx-auto px-4 py-24 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Create Admin Account</h1>
      <p className="text-muted-foreground mb-8">
        Complete the form and CAPTCHA to create your organizer account.
      </p>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm">Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="Your name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="you@example.com"
          />
        </div>
        <Captcha onVerified={setCaptchaToken} />
        <Button onClick={handleSubmit} disabled={submitting || !captchaToken} className="w-full">
          {submitting ? 'Submitting...' : 'Create Account'}
        </Button>
      </div>
    </div>
  );
}
