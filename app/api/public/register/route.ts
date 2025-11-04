import { NextRequest, NextResponse } from 'next/server';
import { getTenantIdFromHeaders, prefixKey } from '@/lib/tenancy';
import { verifyCaptcha } from '@/lib/security/captcha';
import { registerVolunteerAtomic } from '@/lib/db/dynamo';
import { getEventMeta, getShift } from '@/lib/db/dynamo';
import { sendReminderEmail } from '@/lib/email/ses';

interface RegisterPayload {
  eventId: string;
  shiftId: string;
  volunteerName: string;
  volunteerEmail: string;
  captchaToken: string;
}

// Stub: simulate CAPTCHA verification and atomic slot check
export async function POST(req: NextRequest) {
  const tenantId = getTenantIdFromHeaders(req.headers);
  const body = (await req.json()) as RegisterPayload;

  if (!body?.captchaToken) {
    return NextResponse.json(
      { error_code: 'CAPTCHA_FAILED', message: 'captchaToken required' },
      { status: 403 }
    );
  }

  const remoteIp = req.headers.get('x-forwarded-for') || undefined;
  const ok = await verifyCaptcha(body.captchaToken, remoteIp);
  if (!ok) {
    return NextResponse.json(
      { error_code: 'CAPTCHA_FAILED', message: 'captcha verification failed' },
      { status: 403 }
    );
  }

  // TODO: perform conditional write (slotsFilled < slotsNeeded) via backend
  if (process.env.DYNAMO_TABLE) {
    const res = await registerVolunteerAtomic({
      tenantId,
      eventId: body.eventId,
      shiftId: body.shiftId,
      volunteerName: body.volunteerName,
      volunteerEmail: body.volunteerEmail,
    });
    if (!res.ok) {
      if (res.reason === 'FULL') {
        return NextResponse.json({ error_code: 'SHIFT_FULL' }, { status: 409 });
      }
      return NextResponse.json({ error_code: 'INTERNAL_ERROR', message: res.message }, { status: 500 });
    }
    // Try to send confirmation email (best-effort)
    try {
      const meta = await getEventMeta({ tenantId, eventId: body.eventId });
      const shift = await getShift({ tenantId, eventId: body.eventId, shiftId: body.shiftId });
      const start = shift?.startTime ? new Date(shift.startTime).toUTCString() : '';
      const subject = `Volunbase – Registration confirmed for ${meta?.eventName || 'your event'}`;
      const html = `
        <p>Hi ${body.volunteerName},</p>
        <p>Thank you for registering as a volunteer.</p>
        <p><b>Event:</b> ${meta?.eventName || '-'}<br/>
        <b>Shift:</b> ${shift?.shiftName || '-'}<br/>
        <b>Starts:</b> ${start}</p>
        <p>We will send you a reminder one day before the shift.</p>
        <p>— Volunbase</p>
      `;
      if (body.volunteerEmail) {
        await sendReminderEmail(body.volunteerEmail, subject, html);
      }
    } catch (e) {
      console.error('send confirmation error', e);
    }
    return NextResponse.json({ ok: true, id: res.registrationId });
  }

  // Fallback stub if DB not configured
  const registrationId = `${Date.now()}`;
  const key = prefixKey(tenantId, `REGISTRATION#${registrationId}`);
  return NextResponse.json({ ok: true, id: registrationId, key });
}
