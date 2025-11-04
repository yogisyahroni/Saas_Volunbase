import { describe, it, expect } from 'vitest';
import { requireAdmin } from '@/lib/auth/jwt';

describe('requireAdmin dev fallback', () => {
  it('returns context when x-role: admin is present and no Authorization', async () => {
    const req = new Request('http://localhost/api', { headers: new Headers({ 'x-role': 'admin' }) });
    const ctx = await requireAdmin(req as any);
    expect(ctx).not.toBeNull();
    expect(ctx?.role).toBe('admin');
  });

  it('returns null when no headers', async () => {
    const req = new Request('http://localhost/api');
    const ctx = await requireAdmin(req as any);
    // In test env, without x-role header, should be null
    expect(ctx).toBeNull();
  });
});

