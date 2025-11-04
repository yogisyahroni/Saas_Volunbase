import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/jwt';
import { getTenantIdFromHeaders } from '@/lib/tenancy';
import { getAdminProfile } from '@/lib/db/dynamo';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req as any);
  if (!auth) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  const tenantId = getTenantIdFromHeaders(req.headers);
  const userId = auth.sub || (req.headers.get('x-user-id') || 'dev-user');
  const profile = await getAdminProfile({ tenantId, userId });
  return NextResponse.json({ ok: true, subscription_tier: profile?.subscription_tier || 'free' });
}

