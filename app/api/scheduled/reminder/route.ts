import { NextRequest, NextResponse } from 'next/server';
import { runReminderJob } from '@/lib/scheduler/reminder';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const tenantId = body?.tenantId || 'public';
  const dryRun = Boolean(body?.dryRun);

  const res = await runReminderJob(tenantId, dryRun);
  if (!res.ok) return NextResponse.json(res, { status: 500 });
  return NextResponse.json(res);
}

