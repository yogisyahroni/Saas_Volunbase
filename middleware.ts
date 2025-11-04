import { NextRequest, NextResponse } from 'next/server';

// Multi-tenant middleware: infer tenant from subdomain and attach header
export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const host = req.headers.get('host') || '';

  // Example: tenantA.volunbase.com -> tenantA
  const parts = host.split('.');
  const tenantId = parts.length > 2 ? parts[0] : 'public';

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-tenant-id', tenantId);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

