import { NextRequest, NextResponse } from 'next/server';
import { getPaymentSecrets } from '@/lib/aws/secrets';
import Stripe from 'stripe';
import { setAdminTier } from '@/lib/db/dynamo';
import { computeMidtransSignature, parseMidtransOrderId } from '@/lib/payments/midtrans';

export async function POST(req: NextRequest) {
  const secrets = await getPaymentSecrets();
  const stripeSig = req.headers.get('stripe-signature');
  const midtransSig = req.headers.get('x-midtrans-signature') || req.headers.get('x-callback-token');

  // Stripe webhook verification
  if (stripeSig) {
    try {
      const rawBody = await req.text();
      const stripe = new Stripe(secrets.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any });
      const evt = stripe.webhooks.constructEvent(rawBody, stripeSig, secrets.STRIPE_WEBHOOK_SECRET);
      if (evt.type === 'checkout.session.completed') {
        const session: any = evt.data?.object || {};
        const tenantId = session.metadata?.tenantId || 'public';
        const planName = session.metadata?.planName || 'Starter';
        const userId = session.metadata?.userId || '';
        const tier = planName.toLowerCase().includes('pro') ? 'pro' : (planName.toLowerCase().includes('starter') ? 'starter' : 'starter');
        if (tenantId && userId) {
          await setAdminTier({ tenantId, userId, tier });
        }
      }
      return NextResponse.json({ ok: true, provider: 'stripe', type: evt.type });
    } catch (e) {
      return NextResponse.json({ error: 'INVALID_STRIPE_SIGNATURE' }, { status: 400 });
    }
  }

  // Midtrans simple validation (production: validate signature_key)
  if (midtransSig) {
    // Read JSON body
    const bodyText = await req.text();
    let payload: any = {};
    try { payload = JSON.parse(bodyText); } catch {}

    // Midtrans signature_key validation: sha512(order_id + status_code + gross_amount + server_key)
    const order_id = payload.order_id || '';
    const status_code = payload.status_code || '';
    const gross_amount = (payload.gross_amount || '').replace(/\.?0+$/, '');
    const serverKey = secrets.MIDTRANS_SERVER_KEY || '';
    const expected = computeMidtransSignature(order_id, status_code, gross_amount, serverKey);
    const received = (payload.signature_key || '').toLowerCase();
    if (!received || expected !== received) {
      return NextResponse.json({ error: 'INVALID_MIDTRANS_SIGNATURE' }, { status: 400 });
    }

    // Success statuses: 'capture' or 'settlement'
    const status = payload.transaction_status;
    if (status === 'capture' || status === 'settlement') {
      // Extract tenantId and userId from order_id: vb-<tenantId>-<userId>-<ts>
      const parsed = parseMidtransOrderId(order_id);
      if (parsed) {
        const tenantId = parsed.tenantId;
        const userId = parsed.userId;
        const planName: string = payload.custom_field1 || 'Starter';
        const tier = planName.toLowerCase().includes('pro') ? 'pro' : (planName.toLowerCase().includes('starter') ? 'starter' : 'starter');
        if (tenantId && userId) {
          await setAdminTier({ tenantId, userId, tier });
        }
      }
    }

    return NextResponse.json({ ok: true, provider: 'midtrans', status });
  }

  return NextResponse.json({ error: 'NO_SIGNATURE' }, { status: 400 });
}
