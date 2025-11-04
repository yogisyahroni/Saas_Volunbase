import { createHash } from 'crypto';

export function computeMidtransSignature(order_id: string, status_code: string, gross_amount: string, serverKey: string) {
  // Midtrans expects exact concatenation and sha512
  return createHash('sha512').update(`${order_id}${status_code}${gross_amount}${serverKey}`).digest('hex');
}

export function parseMidtransOrderId(order_id: string) {
  // vb-<tenantId>-<userId>-<timestamp>
  const parts = String(order_id || '').split('-');
  if (parts.length >= 4 && parts[0] === 'vb') {
    return { tenantId: parts[1], userId: parts[2], timestamp: parts.slice(3).join('-') };
  }
  return null;
}

