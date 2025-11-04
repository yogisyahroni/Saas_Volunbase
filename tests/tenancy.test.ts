import { describe, it, expect } from 'vitest';
import { getTenantIdFromHeaders, prefixKey, canAccess } from '@/lib/tenancy';

describe('tenancy utils', () => {
  it('prefixKey should prefix with tenant id', () => {
    expect(prefixKey('t-1', 'EVENT#123')).toBe('t-1::EVENT#123');
  });

  it('getTenantIdFromHeaders should read x-tenant-id', () => {
    const h = new Headers({ 'x-tenant-id': 'tenantX' });
    expect(getTenantIdFromHeaders(h as any)).toBe('tenantX');
  });

  it('canAccess should allow admin and superadmin for admin resource', () => {
    expect(canAccess('admin', 'admin')).toBe(true);
    expect(canAccess('superadmin', 'admin')).toBe(true);
    expect(canAccess('volunteer', 'admin')).toBe(false);
  });
});

