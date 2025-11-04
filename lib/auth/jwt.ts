import { jwtVerify, createRemoteJWKSet, JWTPayload } from 'jose';

let jwksCache: Record<string, ReturnType<typeof createRemoteJWKSet>> = {};

function getJwks(url: string) {
  if (!jwksCache[url]) {
    jwksCache[url] = createRemoteJWKSet(new URL(url));
  }
  return jwksCache[url];
}

export interface AuthContext {
  sub?: string;
  email?: string;
  role?: 'admin' | 'superadmin' | 'volunteer';
  provider?: 'cognito' | 'supabase' | 'dev';
  raw?: JWTPayload;
}

export async function verifyAuthFromRequest(req: Request): Promise<AuthContext | null> {
  const auth = req.headers.get('authorization');
  const fallbackRole = process.env.NODE_ENV !== 'production' ? req.headers.get('x-role') : null;
  const mode = (process.env.AUTH_MODE || 'supabase') as 'cognito' | 'supabase';

  if (!auth) {
    if (fallbackRole) {
      return { role: fallbackRole as any, provider: 'dev' };
    }
    return null;
  }
  const token = auth.split(' ')[1];
  if (!token) return null;

  try {
    const jwksUrl = mode === 'cognito' ? process.env.COGNITO_JWKS_URL : process.env.SUPABASE_JWKS_URL;
    if (!jwksUrl) throw new Error('JWKS URL not configured');
    const { payload } = await jwtVerify(token, getJwks(jwksUrl));

    const role = ((): AuthContext['role'] => {
      if (typeof payload['custom:role'] === 'string') return payload['custom:role'] as any;
      if (Array.isArray(payload['cognito:groups']) && (payload['cognito:groups'] as any).includes('admin')) return 'admin';
      if (typeof payload['role'] === 'string') return payload['role'] as any;
      const appMeta = payload['app_metadata'] as any;
      if (appMeta?.role) return appMeta.role;
      const userMeta = payload['user_metadata'] as any;
      if (userMeta?.role) return userMeta.role;
      return 'volunteer';
    })();

    return {
      sub: payload.sub,
      email: (payload['email'] as any) || undefined,
      role,
      provider: mode,
      raw: payload,
    };
  } catch (e) {
    if (fallbackRole) {
      return { role: fallbackRole as any, provider: 'dev' };
    }
    return null;
  }
}

export async function requireAdmin(req: Request) {
  const ctx = await verifyAuthFromRequest(req);
  if (!ctx || (ctx.role !== 'admin' && ctx.role !== 'superadmin')) {
    return null;
  }
  return ctx;
}

