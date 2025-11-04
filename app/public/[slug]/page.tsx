"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Captcha from '@/components/auth/Captcha';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface Shift {
  shiftId: string;
  shiftName: string;
  startTime: string;
  endTime?: string;
  slotsNeeded: number;
  slotsFilled: number;
}

export const dynamic = 'force-dynamic';
export function generateStaticParams() { return []; }

export default function PublicEventPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [eventName, setEventName] = useState('');
  const [eventId, setEventId] = useState<string>('');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedShift, setSelectedShift] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/public/event/${slug}`);
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error('Not found');
        setEventName(data.eventName);
        setEventId(data.eventId);
        setShifts((data.shifts || []).map((s: any) => ({
          shiftId: s.shiftId,
          shiftName: s.shiftName,
          startTime: s.startTime,
          endTime: s.endTime,
          slotsNeeded: s.slotsNeeded,
          slotsFilled: s.slotsFilled,
        })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug]);

  async function register(shiftId: string) {
    if (!captchaToken) {
      toast({ title: 'CAPTCHA required', description: 'Please complete CAPTCHA first.' });
      return;
    }
    if (!name.trim() || !email.trim()) {
      toast({ title: 'Missing info', description: 'Name and Email are required.' });
      return;
    }
    setSelectedShift(shiftId);
    setSubmitting(true);
    try {
      const res = await fetch('/api/public/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ eventId, shiftId, volunteerName: name, volunteerEmail: email, captchaToken }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (data?.error_code === 'SHIFT_FULL') {
          toast({ title: 'Shift full', description: 'This shift has no remaining slots.' });
          return;
        }
        toast({ title: 'Registration failed' });
        return;
      }
      setSelectedShift(null);
      const qs = new URLSearchParams({
        event: eventName || '',
        shift: (shifts.find((x) => x.shiftId === shiftId)?.shiftName) || '',
      });
      router.push(`/public/thanks?${qs.toString()}`);
    } catch (e) {
      console.error(e);
      toast({ title: 'Registration failed', description: 'Unexpected error.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-24">
      {loading ? (
        <div className="text-muted-foreground">Loading event...</div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-6">{eventName || 'Event'}</h1>

          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-xl font-semibold">Register</h2>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-3 items-end">
                <div className="space-y-2">
                  <label className="text-sm">Full Name</label>
                  <input className="w-full rounded-md border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Email</label>
                  <input className="w-full rounded-md border px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Captcha onVerified={setCaptchaToken} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Available Shifts</h2>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {shifts.map((s) => {
                  const available = Math.max(0, (Number(s.slotsNeeded || 0) - Number(s.slotsFilled || 0)));
                  const isFull = available <= 0;
                  return (
                    <div key={s.shiftId} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{s.shiftName}</div>
                        <div className={`text-sm ${isFull ? 'text-red-600' : 'text-green-600'}`}>{isFull ? 'Penuh' : `${available} sisa`}</div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        {new Date(s.startTime).toLocaleString()} {s.endTime ? `- ${new Date(s.endTime).toLocaleTimeString()}` : ''}
                      </div>
                      <Button disabled={isFull || submitting} onClick={() => register(s.shiftId)}>
                        {isFull ? 'Penuh' : submitting && selectedShift === s.shiftId ? 'Mendaftar...' : 'Ambil Shift Ini'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
