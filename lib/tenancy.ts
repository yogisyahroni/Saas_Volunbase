export function getTenantIdFromHeaders(headers: Headers): string {
  return headers.get('x-tenant-id') || 'public';
}

export function prefixKey(tenantId: string, key: string): string {
  return `${tenantId}::${key}`;
}

export type Role = 'admin' | 'volunteer' | 'superadmin';

export function canAccess(role: Role, resource: 'admin' | 'public' | 'superadmin') {
  if (resource === 'public') return true;
  if (resource === 'admin') return role === 'admin' || role === 'superadmin';
  if (resource === 'superadmin') return role === 'superadmin';
  return false;
}

