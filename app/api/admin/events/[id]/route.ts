import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/jwt';
import { getTenantIdFromHeaders } from '@/lib/tenancy';
import { deleteEventItem, updateEventItem } from '@/lib/db/dynamo';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req as any);
  if (!auth) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  const tenantId = getTenantIdFromHeaders(req.headers);
  const userId = auth.sub || (req.headers.get('x-user-id') || 'dev-user');
  const body = await req.json();
  try {
    await updateEventItem({ tenantId, userId, eventId: params.id, eventName: body?.eventName, status: body?.status, publicSlug: body?.publicSlug });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = (e && e.message) || '';
    if (msg.includes('ConditionalCheckFailed')) {
      return NextResponse.json({ error_code: 'SLUG_CONFLICT', message: 'Slug already in use' }, { status: 409 });
    }
    return NextResponse.json({ error_code: 'UPDATE_FAILED' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req as any);
  if (!auth) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  const tenantId = getTenantIdFromHeaders(req.headers);
  const userId = auth.sub || (req.headers.get('x-user-id') || 'dev-user');
  await deleteEventItem({ tenantId, userId, eventId: params.id });
  return NextResponse.json({ ok: true });
}
