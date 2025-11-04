import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/jwt';
import { runReminderJob } from '@/lib/scheduler/reminder';

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req as any);
  if (!auth) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const tenantId = body?.tenantId || 'public';
  const dryRun = body?.dryRun !== false; // default dryRun true to avoid sending mails by accident

  const res = await runReminderJob(tenantId, dryRun);
  if (!res.ok) return NextResponse.json(res, { status: 500 });
  return NextResponse.json(res);
}

