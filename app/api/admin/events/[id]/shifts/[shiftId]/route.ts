import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/jwt';
import { getTenantIdFromHeaders } from '@/lib/tenancy';
import { updateShift, deleteShift } from '@/lib/db/dynamo';

export async function PATCH(req: NextRequest, { params }: { params: { id: string; shiftId: string } }) {
  const auth = await requireAdmin(req as any);
  if (!auth) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  const tenantId = getTenantIdFromHeaders(req.headers);
  const body = await req.json();
  await updateShift({
    tenantId,
    eventId: params.id,
    shiftId: params.shiftId,
    shiftName: body?.shiftName,
    startTime: body?.startTime,
    endTime: body?.endTime,
    slotsNeeded: body?.slotsNeeded,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; shiftId: string } }) {
  const auth = await requireAdmin(req as any);
  if (!auth) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  const tenantId = getTenantIdFromHeaders(req.headers);
  await deleteShift({ tenantId, eventId: params.id, shiftId: params.shiftId });
  return NextResponse.json({ ok: true });
}

