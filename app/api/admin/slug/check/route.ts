import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/jwt';
import { getTenantIdFromHeaders } from '@/lib/tenancy';
import { checkSlugExists } from '@/lib/db/dynamo';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req as any);
  if (!auth) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  const tenantId = getTenantIdFromHeaders(req.headers);
  const url = new URL(req.url);
  const slug = (url.searchParams.get('slug') || '').trim().toLowerCase();
  if (!slug) return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 });
  const exists = await checkSlugExists({ tenantId, slug });
  return NextResponse.json({ ok: true, available: !exists });
}

