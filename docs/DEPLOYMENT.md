# Deployment Manual

## Environments
- Staging: mirrors production stack; used for integration testing.
- Production: CloudFront + S3 (frontend), API Gateway + Lambda (backend), DynamoDB, Cognito, SES.

## Blue-Green Strategy
- Maintain two S3 buckets and two Lambda versions.
- Switch CloudFront origin and API Gateway stage pointer to the new (green) version after health checks.
- Rollback by switching pointer back to blue.

## Steps
1. Build frontend: `npm run build` → export to S3 staging bucket.
2. Deploy backend Lambdas via IaC (CDK/CloudFormation).
3. Run integration tests on staging.
4. Flip CloudFront and API Gateway to green.
5. Monitor metrics and logs (WAF, CloudWatch).

## Secrets Management
- Store payment keys in AWS Secrets Manager path: `volunbase/prod/payment`.
- Grant IAM permissions to backend functions: `secretsmanager:GetSecretValue` and `secretsmanager:UpdateSecret`.

## Scheduler (EventBridge) – Reminder H-1
- Buat EventBridge Rule (cron harian) mis. `cron(0 8 * * ? *)` untuk jam 08:00 UTC.
- Target: Lambda internal yang memanggil endpoint API `POST /api/scheduled/reminder`.
- Sertakan header `x-cron-secret: <CRON_SECRET>` dalam request (konfigurasi di Lambda env dan Next.js backend).
- Payload contoh:
```
{ "tenantId": "public", "dryRun": false }
```
- Lambda pseudo-code:
```
fetch("https://<api-domain>/api/scheduled/reminder", {
  method: "POST",
  headers: { "content-type":"application/json", "x-cron-secret": process.env.CRON_SECRET },
  body: JSON.stringify({ tenantId: "public", dryRun: false })
})
```
- Hasil: backend akan memindai shift di H-1 dan mengirim email reminder via SES.
