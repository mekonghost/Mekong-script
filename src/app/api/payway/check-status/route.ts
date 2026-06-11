
import { NextResponse } from 'next/server';

/**
 * API route to verify the payment status of an ABA PayWay transaction.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tran_id, client_id, orderId } = body;

    const PAYWAY_API_URL = process.env.PAYWAY_API_URL || 'https://2008.site/payway/api';
    const DISCORD_WEBHOOK = process.env.MESSAGING_DISCORD_HOOK;

    const response = await fetch(`${PAYWAY_API_URL}/check-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tran_id, client_id }),
    });

    const data = await response.json();

    // Trigger Discord webhook on success if configured and payment is approved
    if (data.status?.code === '00' && data.meta?.payment_approved && DISCORD_WEBHOOK && orderId) {
      await fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🚀 **New Payment Verified!**\nOrder ID: \`${orderId}\`\nRemote Tran ID: \`${tran_id}\`\nStatus: Paid`,
        }),
      }).catch(err => console.error('Discord Webhook Failed:', err));
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ status: { code: "01" }, error: error.message }, { status: 500 });
  }
}
