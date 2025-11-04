import { NextRequest, NextResponse } from 'next/server';
import { getTenantIdFromHeaders } from '@/lib/tenancy';
import { getPaymentSecrets } from '@/lib/aws/secrets';
import Stripe from 'stripe';
import Midtrans from 'midtrans-client';
import { globalPricing, indonesiaPricing } from '@/lib/pricing';
import { requireAdmin } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req as any);
  if (!auth) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  const tenantId = getTenantIdFromHeaders(req.headers);
  const body = await req.json().catch(() => ({}));
  const planName: string = body?.plan || 'Starter';
  const currency: string = (body?.currency || 'auto').toUpperCase();

  const secrets = await getPaymentSecrets();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const success_url = `${siteUrl}/admin?checkout=success`;
  const cancel_url = `${siteUrl}/admin?checkout=cancel`;

  const isIDR = currency === 'IDR' || (currency === 'AUTO' && (req.headers.get('x-country') === 'ID'));

  function pickAmount() {
    const list = isIDR ? indonesiaPricing : globalPricing;
    const tier = list.find((t) => t.name.toLowerCase() === planName.toLowerCase()) || list.find((t) => t.name === 'Starter')!;
    return { amount: tier.price, currency: tier.currency };
  }

  const { amount, currency: realCurrency } = pickAmount();

  if (isIDR) {
    // Midtrans Snap redirect
    const snap = new (Midtrans as any).Snap({ isProduction: process.env.NODE_ENV === 'production', serverKey: secrets.MIDTRANS_SERVER_KEY });
    const userId = auth.sub || 'unknown';
    const order_id = `vb-${tenantId}-${userId}-${Date.now()}`;
    const transaction = await snap.createTransaction({
      transaction_details: { order_id, gross_amount: amount },
      item_details: [{ id: planName, price: amount, quantity: 1, name: `Volunbase ${planName}` }],
      customer_details: { email: auth.email || undefined },
      custom_field1: planName,
    });
    return NextResponse.json({ ok: true, provider: 'midtrans', redirect_url: transaction.redirect_url, token: transaction.token });
  }

  // Stripe one-time checkout (use Prices for subscription later)
  const stripe = new Stripe(secrets.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any });
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url,
    cancel_url,
    line_items: [
      {
        price_data: {
          currency: realCurrency.toLowerCase(),
          product_data: { name: `Volunbase ${planName}` },
          unit_amount: Math.round(amount * (realCurrency === 'USD' ? 100 : 1)),
        },
        quantity: 1,
      },
    ],
    metadata: { tenantId, planName, userId: auth.sub || '' },
  });

  return NextResponse.json({ ok: true, provider: 'stripe', url: session.url });
}
