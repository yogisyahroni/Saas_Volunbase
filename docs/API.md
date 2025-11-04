# API Documentation (Overview)

OpenAPI spec is provided in `docs/openapi.yaml`.

Key Endpoints:
- `POST /api/public/register` – Public volunteer registration (requires `captchaToken`).
- `GET /api/admin/events` – List events for authenticated admin.
- `POST /api/admin/events` – Create event (RBAC: admin or superadmin).
- `POST /api/admin/payment/create-session` – Create checkout session (Stripe/Midtrans).
- `POST /api/webhook/payment` – Payment webhook (signature required).
- `POST /api/super-admin/config/payment` – Save payment secrets (superadmin only).

Notes:
- All admin endpoints require auth and tenant scoping via `x-tenant-id` header.
- Payment secrets are retrieved from AWS Secrets Manager at runtime.

