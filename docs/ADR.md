# Architecture Decision Record (ADR)

## ADR-001: Tech Stack & Hosting
- Frontend: Next.js App Router, TailwindCSS, shadcn/ui.
- Backend: Serverless REST (API Gateway + Lambda) with DynamoDB (NoSQL).
- Auth: OAuth 2.0; local dev via Supabase, production via AWS Cognito.
- Email: Amazon SES.
- CDN & Static: CloudFront + S3 static export.

Rationale: Minimize OPEX with serverless-first architecture while satisfying security-by-default and scalability requirements.

## ADR-002: Multi-Tenant Strategy
- Tenancy derived from subdomain (tenantA.volunbase.com → tenantA).
- All keys/data are prefixed with `tenantId::` to guarantee isolation in shared tables.
- Middleware injects `x-tenant-id` header for downstream handlers.

## ADR-003: Payments & Secrets Management
- Keys are not stored in DB. Use AWS Secrets Manager.
- Backend fetches secrets at runtime; never bake into env or source.

## ADR-004: Anti-Bot & Security
- CAPTCHA on: Admin signup, Admin login (on threshold), Public registration.
- WAF in front of API Gateway.
- Webhook validation with provider signatures.

