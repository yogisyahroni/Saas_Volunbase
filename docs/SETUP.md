# Volunbase – Setup Guide

## Prerequisites
- Node.js 18+
- npm
- AWS account (for production)
- Supabase project (for local OAuth)

## Environment Variables
Create `.env.local` with:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ANALYTICS_ID=G-XXXXXXX (optional)
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_CAPTCHA_PROVIDER=hcaptcha # or recaptcha
NEXT_PUBLIC_CAPTCHA_SITE_KEY=your-site-key

# Server-side (do not expose publicly)
CAPTCHA_PROVIDER=hcaptcha # or recaptcha
CAPTCHA_SECRET=your-secret-key
AUTH_MODE=supabase # or cognito
SUPABASE_JWKS_URL=https://<project>.supabase.co/auth/v1/keys
COGNITO_JWKS_URL=https://cognito-idp.<region>.amazonaws.com/<userPoolId>/.well-known/jwks.json

# Payment Secrets (fallback if Secrets Manager disabled)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
MIDTRANS_SERVER_KEY=your-server-key

# AWS & Data
USE_SECRETS_MANAGER=false
PAYMENT_SECRET_PATH=volunbase/prod/payment
AWS_REGION=us-east-1
DYNAMO_TABLE=VolunbaseTable
SES_FROM_EMAIL=no-reply@volunbase.com
CRON_SECRET=super-secret-string
```

## Install & Run
```
npm install
npm run dev
```

## Local Auth
- Login: `/(auth)/login`
- Register Admin: `/(auth)/register`
- Forgot Password: `/(auth)/forgot-password`

## Notes
- CAPTCHA: set provider + keys above. Public pages will request token; backend verifies via provider API.
- Payment secrets form is stubbed; backend should integrate AWS Secrets Manager.
