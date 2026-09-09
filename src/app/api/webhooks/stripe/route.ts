import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  // TODO: Connect Stripe webhook secret from env
  // const signature = request.headers.get('stripe-signature');
  // const body = await request.text();
  // const event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!);

  const body = await request.json();
  console.log('[Stripe Webhook]', body?.type);

  return NextResponse.json({ received: true }, { status: 200 });
}
