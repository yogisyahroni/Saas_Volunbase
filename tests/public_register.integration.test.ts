import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

vi.mock('@/lib/security/captcha', () => ({ verifyCaptcha: vi.fn(async () => true) }));

// Import the route handler after mocking
import { POST as registerPost } from '@/app/api/public/register/route';
import { NextRequest } from 'next/server';

describe('public register endpoint (integration-lite)', () => {
  const orig = process.env.DYNAMO_TABLE;
  beforeAll(() => {
    delete process.env.DYNAMO_TABLE; // force fallback (no DB)
  });
  afterAll(() => {
    process.env.DYNAMO_TABLE = orig;
  });

  it('returns ok when captcha passes and payload valid', async () => {
    const payload = {
      eventId: 'E1',
      shiftId: 'S1',
      volunteerName: 'Test User',
      volunteerEmail: 'test@example.com',
      captchaToken: 'token',
    };
    const req = new NextRequest('http://localhost/api/public/register', {
      method: 'POST',
      headers: new Headers({ 'content-type': 'application/json', 'x-tenant-id': 'public' }),
      body: JSON.stringify(payload),
    } as any);
    const res = await registerPost(req as any);
    const json: any = await res.json();
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.id).toBeTruthy();
  });
});

