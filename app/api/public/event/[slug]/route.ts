import { NextRequest, NextResponse } from 'next/server';
import { getTenantIdFromHeaders } from '@/lib/tenancy';
import { getEventBySlug } from '@/lib/db/dynamo';

export const dynamic = 'force-dynamic';
export function generateStaticParams() { return []; }

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const tenantId = getTenantIdFromHeaders(req.headers);
  const data = await getEventBySlug({ tenantId, slug: params.slug });
  if (!data || (data.status && data.status !== 'published')) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, ...data });
}
