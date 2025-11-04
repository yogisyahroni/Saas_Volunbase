import { describe, it, expect } from 'vitest';
import { computeMidtransSignature, parseMidtransOrderId } from '@/lib/payments/midtrans';

describe('midtrans helpers', () => {
  it('computes signature correctly', () => {
    const sig = computeMidtransSignature('vb-tenant-user-123', '200', '15000', 'serverKey123');
    expect(sig).toBe('d0553c7569671889292d0605a8844b53ac2c413560d95cf872d0bb06ac4f100ae7272345d4b194a62d486b953ea95b6d8559bc7acc73fe5bad204614123784db');
  });

  it('parses order id format', () => {
    const parsed = parseMidtransOrderId('vb-tenantA-userB-1699999999999');
    expect(parsed?.tenantId).toBe('tenantA');
    expect(parsed?.userId).toBe('userB');
  });
});
