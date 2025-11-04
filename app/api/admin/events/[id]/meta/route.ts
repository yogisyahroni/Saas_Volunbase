import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/jwt';
import { getTenantIdFromHeaders } from '@/lib/tenancy';
import { getEventMeta } from '@/lib/db/dynamo';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req as any);
  if (!auth) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  const tenantId = getTenantIdFromHeaders(req.headers);
  const meta = await getEventMeta({ tenantId, eventId: params.id });
  if (!meta) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  return NextResponse.json({ ok: true, eventId: params.id, eventName: meta.eventName, status: meta.status, publicSlug: meta.publicSlug });
}

