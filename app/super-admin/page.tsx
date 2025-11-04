'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function SuperAdminPage() {
  const [stripeKey, setStripeKey] = useState('');
  const [stripeWebhook, setStripeWebhook] = useState('');
  const [midtransKey, setMidtransKey] = useState('');
  const [saving, setSaving] = useState(false);

  async function saveKeys() {
    setSaving(true);
    const res = await fetch('/api/super-admin/config/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        STRIPE_SECRET_KEY: stripeKey,
        STRIPE_WEBHOOK_SECRET: stripeWebhook,
        MIDTRANS_SERVER_KEY: midtransKey,
      }),
    });
    setSaving(false);
    if (!res.ok) return alert('Failed to save');
    alert('Saved');
  }

  return (
    <div className="container mx-auto px-4 py-24 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Super Admin – Payment Gateway</h1>
      <p className="text-muted-foreground mb-8">
        Configure Stripe and Midtrans secrets. Keys are stored securely (stub).
      </p>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm">Stripe Secret Key</label>
          <input
            value={stripeKey}
            onChange={(e) => setStripeKey(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm">Stripe Webhook Secret</label>
          <input
            value={stripeWebhook}
            onChange={(e) => setStripeWebhook(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm">Midtrans Server Key</label>
          <input
            value={midtransKey}
            onChange={(e) => setMidtransKey(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
        <Button onClick={saveKeys} disabled={saving} className="w-full">
          {saving ? 'Saving...' : 'Save' }
        </Button>
      </div>
    </div>
  );
}

