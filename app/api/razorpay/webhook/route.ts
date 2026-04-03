import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
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
        // TODO: Mark order as paid in database
        break;
      }
      case "payment.failed": {
        const payment = event.payload.payment.entity;
        console.log("Payment failed:", payment.id);
        // TODO: Mark order as failed in database
        break;
      }
      case "refund.created": {
        const refund = event.payload.refund.entity;
        console.log("Refund created:", refund.id);
        // TODO: Process refund in database
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
