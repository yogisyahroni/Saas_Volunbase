'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface ShiftItem {
  id: string;
  shiftName: string;
  startTime: string;
  endTime?: string;
  slotsNeeded: number;
  slotsFilled: number;
}

export default function ManageShiftsPage({ params }: { params: { id: string } }) {
  const eventId = params.id;
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [form, setForm] = useState({ shiftName: '', startTime: '', endTime: '', slotsNeeded: 10 });
  const [meta, setMeta] = useState<{ eventName?: string; status?: string; publicSlug?: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const m = await fetch(`/api/admin/events/${eventId}/meta`, { headers: { 'x-role': 'admin', 'x-user-id': 'dev-user' } });
        const mj = await m.json();
        if (m.ok) setMeta({ eventName: mj.eventName, status: mj.status, publicSlug: mj.publicSlug });
      } catch {}
      try {
        const res = await fetch(`/api/admin/events/${eventId}/shifts`, { headers: { 'x-role': 'admin', 'x-user-id': 'dev-user' } });
        const data = await res.json();
        const list = (data.shifts || []).map((s: any) => ({
          id: s.shiftId,
          shiftName: s.shiftName,
          startTime: s.startTime,
          endTime: s.endTime,
          slotsNeeded: s.slotsNeeded,
          slotsFilled: s.slotsFilled,
        }));
        setShifts(list);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [eventId]);

  function addShift() {
    if (!form.shiftName || !form.startTime) return;
    const id = String(Date.now());
    fetch(`/api/admin/events/${eventId}/shifts`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-role': 'admin', 'x-user-id': 'dev-user' },
      body: JSON.stringify({ shiftId: id, ...form })
    })
      .then(() => {
        setShifts((prev) => [
          { id, shiftName: form.shiftName, startTime: form.startTime, endTime: form.endTime, slotsNeeded: form.slotsNeeded, slotsFilled: 0 },
          ...prev,
        ]);
        setForm({ shiftName: '', startTime: '', endTime: '', slotsNeeded: 10 });
        toast({ title: 'Shift added' });
      })
      .catch((e) => {
        console.error(e);
        toast({ title: 'Add shift failed', description: 'Check plan limits or input.' });
      });
  }

  function removeShift(id: string) {
    fetch(`/api/admin/events/${eventId}/shifts/${id}`, {
      method: 'DELETE',
      headers: { 'x-role': 'admin', 'x-user-id': 'dev-user' },
    })
      .then(() => {
        setShifts((prev) => prev.filter((s) => s.id !== id));
        toast({ title: 'Shift deleted' });
      })
      .catch((e) => {
        console.error(e);
        toast({ title: 'Delete failed' });
      });
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Shifts – Event {eventId}</h1>
          {meta && (
            <div className="text-sm text-muted-foreground">{meta.eventName} · Status: {meta.status}</div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {meta && (
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                try {
                  const newStatus = meta.status === 'published' ? 'draft' : 'published';
                  const r = await fetch(`/api/admin/events/${eventId}`, {
                    method: 'PATCH', headers: { 'content-type': 'application/json', 'x-role': 'admin', 'x-user-id': 'dev-user' }, body: JSON.stringify({ status: newStatus })
                  });
                  if (r.ok) {
                    setMeta({ ...meta, status: newStatus });
                    toast({ title: newStatus === 'published' ? 'Published' : 'Unpublished' });
                  } else {
                    toast({ title: 'Update failed' });
                  }
                } catch {
                  toast({ title: 'Update failed' });
                }
              }}
            >
              {meta.status === 'published' ? 'Unpublish' : 'Publish'}
            </Button>
          )}
          <Link href="/admin" className="text-sm text-muted-foreground">Back to Events</Link>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">Add Shift</h2>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-3">
            <input
              className="rounded-md border px-3 py-2"
              placeholder="Shift name"
              value={form.shiftName}
              onChange={(e) => setForm({ ...form, shiftName: e.target.value })}
            />
            <input
              className="rounded-md border px-3 py-2"
              placeholder="Start time (e.g., 2025-12-31 10:00)"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
            <input
              className="rounded-md border px-3 py-2"
              placeholder="End time (optional)"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
            <input
              className="rounded-md border px-3 py-2"
              type="number"
              min={1}
              placeholder="Slots needed"
              value={form.slotsNeeded}
              onChange={(e) => setForm({ ...form, slotsNeeded: Number(e.target.value) })}
            />
            <Button onClick={addShift}>Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Shifts</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Start</th>
                  <th className="text-left p-2">End</th>
                  <th className="text-left p-2">Needed</th>
                  <th className="text-left p-2">Filled</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="p-2 font-medium">{s.shiftName}</td>
                    <td className="p-2">{s.startTime}</td>
                    <td className="p-2">{s.endTime || '-'}</td>
                    <td className="p-2">{s.slotsNeeded}</td>
                    <td className="p-2">{s.slotsFilled}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button variant="destructive" size="sm" onClick={() => removeShift(s.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {shifts.length === 0 && (
                  <tr>
                    <td className="p-4 text-muted-foreground" colSpan={6}>No shifts yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Required for `output: export` config on dynamic routes
export const dynamic = 'force-dynamic';
export function generateStaticParams() {
  return [];
}
