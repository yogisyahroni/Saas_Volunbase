"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import { useUserLocation } from '@/hooks/use-location';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface EventItem {
  id: string;
  eventName: string;
  status?: string;
  publicSlug?: string;
}

export default function AdminDashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEventName, setNewEventName] = useState('');
  const siteUrl = useMemo(() => process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', []);
  const { isIndonesia } = useUserLocation();
  const [plan, setPlan] = useState<'Starter' | 'Pro' | 'Event Pass'>('Starter');
  const [upgrading, setUpgrading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [dryRun, setDryRun] = useState(true);
  const [reminding, setReminding] = useState(false);
  const searchParams = useSearchParams();
  const upgradeTriggered = useRef(false);
  const [tier, setTier] = useState<string>('free');
  const [checkoutMsg, setCheckoutMsg] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    async function load(reset = true) {
      setLoading(true);
      try {
        // Load profile tier
        const p = await fetch('/api/admin/profile', { headers: { 'x-role': 'admin', 'x-user-id': 'dev-user' } });
        const pjson = await p.json();
        const t = pjson.subscription_tier || 'free';
        setTier(t);
        try { if (typeof window !== 'undefined') localStorage.setItem('vb_tier', t); } catch {}
        // Set default plan based on tier
        setPlan((prev) => {
          if (t === 'free') return 'Starter';
          if (t === 'starter') return 'Pro';
          return prev;
        });

        const qs = new URLSearchParams();
        if (statusFilter) qs.set('status', statusFilter);
        if (!reset && nextCursor) qs.set('cursor', nextCursor);
        const res = await fetch(`/api/admin/events?${qs.toString()}`, { headers: { 'x-role': 'admin', 'x-user-id': 'dev-user' } });
        const data = await res.json();
        const list: EventItem[] = (data.events || []).map((e: any) => ({
          id: e.id,
          eventName: e.eventName,
          status: e.status,
          publicSlug: e.publicSlug,
        }));
        if (reset) setEvents(list); else setEvents((prev) => [...prev, ...list]);
        setNextCursor(data.nextCursor || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load(true);
  }, [statusFilter]);

  async function createEvent() {
    if (!newEventName.trim()) return;
    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-role': 'admin', 'x-user-id': 'dev-user' },
      body: JSON.stringify({ eventName: newEventName }),
    });
    const data = await res.json();
    const id = data.id || String(Date.now());
    setEvents((prev) => [
      { id, eventName: newEventName, status: 'draft' },
      ...prev,
    ]);
    setNewEventName('');
  }

  function removeEvent(id: string) {
    fetch(`/api/admin/events/${id}`, { method: 'DELETE', headers: { 'x-role': 'admin', 'x-user-id': 'dev-user' } })
      .then(() => {
        setEvents((prev) => prev.filter((e) => e.id !== id));
        toast({ title: 'Event deleted' });
      })
      .catch((e) => {
        console.error(e);
        toast({ title: 'Delete failed', description: 'Please try again.' });
      });
  }

  async function loadMore() {
    if (!nextCursor) return;
    // false to append
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (statusFilter) qs.set('status', statusFilter);
      if (nextCursor) qs.set('cursor', nextCursor);
      const res = await fetch(`/api/admin/events?${qs.toString()}`, { headers: { 'x-role': 'admin', 'x-user-id': 'dev-user' } });
      const data = await res.json();
      const list: EventItem[] = (data.events || []).map((e: any) => ({ id: e.id, eventName: e.eventName, status: e.status, publicSlug: e.publicSlug }));
      setEvents((prev) => [...prev, ...list]);
      setNextCursor(data.nextCursor || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function updateEvent(id: string, patch: Partial<EventItem>) {
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', 'x-role': 'admin', 'x-user-id': 'dev-user' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409 && data?.error_code === 'SLUG_CONFLICT') {
          toast({ title: 'Slug conflict', description: 'Slug sudah dipakai. Gunakan slug lain.' });
          return;
        }
        toast({ title: 'Update failed', description: 'Gagal memperbarui event.' });
        return;
      }
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
      toast({ title: 'Event updated' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Update failed', description: 'Unexpected error.' });
    }
  }

  async function handleUpgrade(overridePlan?: 'Starter' | 'Pro' | 'Event Pass', overrideCurrency?: 'USD' | 'IDR') {
    setUpgrading(true);
    try {
      const currency = overrideCurrency || (isIndonesia ? 'IDR' : 'USD');
      const usePlan = overridePlan || plan;
      const res = await fetch('/api/admin/payment/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': 'admin', 'x-user-id': 'dev-user' },
        body: JSON.stringify({ plan: usePlan, currency }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert('Failed to create checkout session');
        return;
      }
      const redirectUrl = data.url || data.redirect_url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        alert('Checkout URL not available');
      }
    } catch (e) {
      console.error(e);
      alert('Upgrade failed');
    } finally {
      setUpgrading(false);
    }
  }

  // Auto-upgrade when redirected from Pricing with plan/currency
  useEffect(() => {
    const up = searchParams.get('upgrade');
    if (upgradeTriggered.current || !up) return;
    const planFromUrl = decodeURIComponent(up);
    const curr = (searchParams.get('currency') || '').toUpperCase();
    const validPlans = ['Starter', 'Pro', 'Event Pass'] as const;
    const matched = validPlans.find((p) => p.toLowerCase() === planFromUrl.toLowerCase());
    if (matched) {
      setPlan(matched);
      upgradeTriggered.current = true;
      const c = curr === 'IDR' ? 'IDR' : curr === 'USD' ? 'USD' : undefined;
      handleUpgrade(matched, c);
    }
  }, [searchParams]);

  // Checkout status banner
  useEffect(() => {
    const status = searchParams.get('checkout');
    if (status === 'success') setCheckoutMsg('Payment successful. Your plan is now active.');
    else if (status === 'cancel') setCheckoutMsg('Checkout canceled. You can try again anytime.');
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link href="/" className="text-sm text-muted-foreground">Back to Landing</Link>
      </div>

      {checkoutMsg && (
        <div className="mb-4 rounded-md border border-green-600/30 bg-green-50 p-3 text-sm text-green-700">
          {checkoutMsg}
        </div>
      )}

      <div className="mb-4 text-sm text-muted-foreground">Current plan: <span className="font-medium uppercase">{tier}</span></div>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">Upgrade Plan</h2>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-3 items-end">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm">Choose Plan</label>
              <select
                className="w-full rounded-md border px-3 py-2"
                value={plan}
                onChange={(e) => setPlan(e.target.value as any)}
              >
                <option>Starter</option>
                <option>Pro</option>
                <option>Event Pass</option>
              </select>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Currency</div>
              <div className="font-medium">{isIndonesia ? 'IDR (Midtrans)' : 'USD (Stripe)'}</div>
            </div>
            <div>
              <Button onClick={handleUpgrade} disabled={upgrading || tier === 'pro'} className="w-full">
                {upgrading ? 'Redirecting...' : 'Upgrade'}
              </Button>
              {tier === 'pro' && (
                <div className="mt-1 text-xs text-muted-foreground">You are already on Pro plan.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">Create New Event</h2>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <input
              className="flex-1 rounded-md border px-3 py-2"
              placeholder="Event name"
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
            />
            <Button onClick={createEvent}>Create</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">Reminders</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
              Dry Run (do not send emails)
            </label>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  setReminding(true);
                  const res = await fetch('/api/admin/reminder/run', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json', 'x-role': 'admin', 'x-user-id': 'dev-user' },
                    body: JSON.stringify({ tenantId: 'public', dryRun }),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    toast({ title: 'Reminder executed', description: `Shifts=${data.shifts || 0}, Emails=${data.emails || 0}, DryRun=${data.dryRun}` });
                  } else {
                    toast({ title: 'Reminder failed' });
                  }
                } catch (e) {
                  toast({ title: 'Reminder failed' });
                } finally {
                  setReminding(false);
                }
              }}
              disabled={reminding}
            >
              {reminding ? 'Running...' : 'Run Reminder'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Events</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Filter status:</span>
              <select className="rounded-md border px-3 py-1 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            {nextCursor && (
              <Button variant="outline" size="sm" onClick={loadMore} disabled={loading}>
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            )}
          </div>
          {loading ? (
            <div className="text-muted-foreground">Loading events...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Public Link</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => {
                    const slug = ev.publicSlug || `event-${ev.id}`;
                    const publicUrl = `${siteUrl}/public/${slug}`;
                    return (
                      <tr key={ev.id} className="border-b">
                        <td className="p-2 font-medium">
                          <input
                            className="rounded-md border px-2 py-1 w-full"
                            defaultValue={ev.eventName}
                            onBlur={(e) => updateEvent(ev.id, { eventName: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          <select
                            className="rounded-md border px-2 py-1"
                            value={ev.status || 'draft'}
                            onChange={(e) => updateEvent(ev.id, { status: e.target.value as any })}
                          >
                            <option value="draft">draft</option>
                            <option value="published">published</option>
                            <option value="archived">archived</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <a href={publicUrl} className="text-green-600 hover:underline" target="_blank">
                            {publicUrl}
                          </a>
                          <div className="mt-1 text-xs text-muted-foreground">
                            <button
                              className="underline"
                              onClick={() => {
                                const s = prompt('Set public slug', ev.publicSlug || slug);
                                if (!s) return;
                                const cleaned = s.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
                                if (!cleaned) return;
                                fetch(`/api/admin/slug/check?slug=${encodeURIComponent(cleaned)}`, { headers: { 'x-role': 'admin', 'x-user-id': 'dev-user' } })
                                  .then(async (r) => {
                                    const j = await r.json();
                                    if (r.ok && j.available) updateEvent(ev.id, { publicSlug: cleaned });
                                    else toast({ title: 'Slug conflict', description: 'Slug sudah dipakai. Gunakan slug lain.' });
                                  })
                                  .catch(() => toast({ title: 'Slug check failed' }));
                              }}
                            >
                              Set slug
                            </button>
                            <span className="mx-2">·</span>
                            <button
                              className="underline"
                              onClick={() => navigator.clipboard.writeText(publicUrl).then(() => toast({ title: 'Copied link' }))}
                            >
                              Copy link
                            </button>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Link href={`/admin/events/${ev.id}`}>
                              <Button variant="outline" size="sm">Manage Shifts</Button>
                            </Link>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => updateEvent(ev.id, { status: ev.status === 'published' ? 'draft' : 'published' })}
                            >
                              {ev.status === 'published' ? 'Unpublish' : 'Publish'}
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => removeEvent(ev.id)}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
