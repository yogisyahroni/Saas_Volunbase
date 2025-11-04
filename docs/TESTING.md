# Testing Plan

## Automated Checks
- Unit tests: tenancy utils (prefix, access control).
- Integration tests: public register endpoint (CAPTCHA required), admin events RBAC.

## Security Tests
- Webhook signature validation (mock provider headers).
- CAPTCHA failure path returns 403 with `error_code: CAPTCHA_FAILED`.

## Performance
- Lazy loading images on landing page validated via Lighthouse.

