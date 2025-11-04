import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/jwt';
import { getTenantIdFromHeaders } from '@/lib/tenancy';
import { listShifts, createShift, getAdminProfile, scanShiftsBetween } from '@/lib/db/dynamo';
import { isStarterEventDayLimitViolated } from '@/lib/utils';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req as any);
  if (!auth) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  const tenantId = getTenantIdFromHeaders(req.headers);
  const items = await listShifts({ tenantId, eventId: params.id });
  return NextResponse.json({ ok: true, shifts: items });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req as any);
  if (!auth) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  const tenantId = getTenantIdFromHeaders(req.headers);
  const body = await req.json();
  const shiftId = body?.shiftId || `${Date.now()}`;
  // Anti-cheat: Starter plan max 1 event/day (based on shift startTime)
  const userId = auth.sub || (req.headers.get('x-user-id') || '');
  const profile = userId ? await getAdminProfile({ tenantId, userId }) : null;
  const tier = (profile?.subscription_tier as string) || 'free';
  if (tier === 'starter' && body?.startTime) {
    const start = new Date(body.startTime);
    const dayStart = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), 0, 0, 0));
    const dayEnd = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 1, 0, 0, 0));
    const found = await scanShiftsBetween({ tenantId, startIso: dayStart.toISOString(), endIso: dayEnd.toISOString() });
    const otherEventFound = isStarterEventDayLimitViolated(found, params.id);
    if (otherEventFound) {
      return NextResponse.json({ error_code: 'LIMIT_EVENT_PER_DAY', message: 'Starter plan allows one event per day' }, { status: 409 });
    }
  }
  await createShift({
    tenantId,
    eventId: params.id,
    shiftId,
    shiftName: body?.shiftName,
    startTime: body?.startTime,
    endTime: body?.endTime,
    slotsNeeded: Number(body?.slotsNeeded || 1),
  });
  return NextResponse.json({ ok: true, shiftId });
}
