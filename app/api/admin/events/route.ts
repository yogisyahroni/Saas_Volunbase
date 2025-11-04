import { NextRequest, NextResponse } from 'next/server';
import { getTenantIdFromHeaders } from '@/lib/tenancy';
import { requireAdmin } from '@/lib/auth/jwt';
import { createEventItem, listEventsByUser } from '@/lib/db/dynamo';

// NOTE: This is a stub implementation.
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req as any);
  if (!auth) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  const tenantId = getTenantIdFromHeaders(req.headers);
  const userId = auth.sub || (req.headers.get('x-user-id') || 'dev-user');
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get('limit') || 20);
  const status = url.searchParams.get('status') || undefined;
  const cursorParam = url.searchParams.get('cursor');
  let cursor: any = undefined;
  if (cursorParam) {
    try { cursor = JSON.parse(Buffer.from(cursorParam, 'base64').toString('utf8')); } catch {}
  }
  const { items, cursor: nextKey } = await listEventsByUser({ tenantId, userId, limit, status, cursor });
  const events = items.map((i: any) => ({ id: i.eventId, eventName: i.eventName, status: i.status, publicSlug: i.publicSlug }));
  const nextCursor = nextKey ? Buffer.from(JSON.stringify(nextKey), 'utf8').toString('base64') : null;
  return NextResponse.json({ ok: true, tenantId, events, nextCursor });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req as any);
  if (!auth) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  const tenantId = getTenantIdFromHeaders(req.headers);
  const userId = auth.sub || (req.headers.get('x-user-id') || 'dev-user');
  const body = await req.json();
  const eventId = `${Date.now()}`;
  await createEventItem({ tenantId, userId, eventId, eventName: body?.eventName || 'New Event' });
  return NextResponse.json({ ok: true, id: eventId, tenantId });
}
