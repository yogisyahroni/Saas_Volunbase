import { scanShiftsBetween, listRegistrationsForShift } from '@/lib/db/dynamo';
import { sendReminderEmail } from '@/lib/email/ses';

function isoRangeForTomorrow() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 2, 0, 0, 0));
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

export async function runReminderJob(tenantId: string, dryRun = false) {
  if (!process.env.DYNAMO_TABLE) {
    return { ok: false, reason: 'NO_DB' } as const;
  }
  const { startIso, endIso } = isoRangeForTomorrow();
  const shifts = await scanShiftsBetween({ tenantId, startIso, endIso });
  let total = 0;
  for (const s of shifts) {
    const regs = await listRegistrationsForShift({ tenantId, eventId: s.eventId, shiftId: s.shiftId });
    for (const r of regs) {
      total += 1;
      if (!dryRun) {
        await sendReminderEmail(
          r.volunteerEmail,
          'Reminder: Your volunteer shift is tomorrow',
          `<p>Hi ${r.volunteerName || 'Volunteer'},</p><p>This is a reminder for your shift on ${new Date(s.startTime).toUTCString()}.</p><p>Thank you,<br/>Volunbase</p>`
        );
      }
    }
  }
  return { ok: true, shifts: shifts.length, emails: total, dryRun } as const;
}

