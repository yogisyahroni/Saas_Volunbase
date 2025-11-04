import { SecretsManagerClient, GetSecretValueCommand, PutSecretValueCommand } from '@aws-sdk/client-secrets-manager';

function getSmClient() {
  const region = process.env.AWS_REGION || 'us-east-1';
  return new SecretsManagerClient({ region });
}

export async function putSecret(name: string, value: Record<string, string>) {
  try {
    const client = getSmClient();
    await client.send(
      new PutSecretValueCommand({ SecretId: name, SecretString: JSON.stringify(value) })
    );
    return true;
  } catch (e) {
    console.error('putSecret error', e);
    return false;
  }
}

export async function getSecret(name: string): Promise<Record<string, string> | null> {
  try {
    const client = getSmClient();
    const res = await client.send(new GetSecretValueCommand({ SecretId: name }));
    if (res.SecretString) return JSON.parse(res.SecretString);
    return null;
  } catch (e) {
    console.error('getSecret error', e);
    return null;
  }
}

export async function getPaymentSecrets() {
  if (process.env.USE_SECRETS_MANAGER === 'true') {
    const data = await getSecret(process.env.PAYMENT_SECRET_PATH || 'volunbase/prod/payment');
    if (data) return data as any;
  }
  return {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
    MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY || '',
  };
}
