import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  // TODO: Verify Dodo Payments webhook signature
  // const signature = request.headers.get('webhook-id');

  const body = await request.json();
  console.log('[Dodo Payments Webhook]', body?.type);

  return NextResponse.json({ received: true }, { status: 200 });
}
