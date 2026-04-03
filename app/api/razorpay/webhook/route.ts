import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret || webhookSecret.includes('your_')) {
      return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
    }

    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload.payment.entity;
        console.log("Payment captured:", payment.id, "Amount:", payment.amount);
        break;
      }
      case "payment.failed": {
        const payment = event.payload.payment.entity;
        console.log("Payment failed:", payment.id);
        break;
      }
      default:
        console.log("Unhandled Razorpay event:", event.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
