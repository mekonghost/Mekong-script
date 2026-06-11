
import { NextResponse } from 'next/server';

/**
 * API route to proxy the creation of an ABA PayWay KHQR code.
 * Proxies to the remote PayWay endpoint defined in environment variables.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount } = body;

    const PAYWAY_API_URL = process.env.PAYWAY_API_URL || 'https://2008.site/payway/api';
    const ABA_PAYWAY_URL = process.env.ABA_PAYWAY_URL || 'https://link.payway.com.kh/ABAPAYnQ437660L';

    // Ensure amount is formatted as a string with 2 decimal places as per KHQR standards
    const formattedAmount = parseFloat(amount).toFixed(2);

    const response = await fetch(`${PAYWAY_API_URL}/create-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: ABA_PAYWAY_URL,
        amount: formattedAmount,
      }),
    });

    if (!response.ok) {
      throw new Error(`Remote API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('PayWay Create QR Error:', error);
    return NextResponse.json({ 
      status: { code: "01", message: error.message || "Failed to connect to payment gateway" } 
    }, { status: 500 });
  }
}
