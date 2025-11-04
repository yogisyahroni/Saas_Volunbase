import { NextRequest, NextResponse } from 'next/server';
import { putSecret } from '@/lib/aws/secrets';

export async function POST(req: NextRequest) {
  const body = await req.json();
  // In production: validate role=superadmin via auth
  const ok = await putSecret('volunbase/prod/payment', body);
  if (!ok) return NextResponse.json({ error: 'FAILED' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

