import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Razorpay webhook endpoint.
 * URL to register in Razorpay Dashboard → Settings → Webhooks:
 *   https://silveri.in/api/razorpay/webhook
 *
 * Events to subscribe: payment.captured, payment.failed, order.paid,
 * refund.created, refund.processed
 */
export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret || webhookSecret.includes("your_")) {
      console.warn("[webhook] RAZORPAY_WEBHOOK_SECRET not set — accepting without verification (dev only)");
    }

    const body = await req.text();

    // ── HMAC signature verification ──────────────────────────────────────
    if (webhookSecret && !webhookSecret.includes("your_")) {
      const signature = req.headers.get("x-razorpay-signature");
      if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
      }
      const expected = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");

      if (expected !== signature) {
        console.error("[webhook] Invalid signature — rejecting event");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(body);
    console.log("[webhook] Event received:", event.event);

    if (!adminDb) {
      console.warn("[webhook] adminDb not available — cannot update Firestore");
      return NextResponse.json({ received: true });
    }

    // ── Event handlers ───────────────────────────────────────────────────
    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload.payment.entity;
        const orderId = payment.order_id;
        if (!orderId) break;

        const orderRef = adminDb.collection("orders").doc(orderId);
        const orderSnap = await orderRef.get();
        if (!orderSnap.exists) break;

        const orderData = orderSnap.data()!;
        // Skip if already marked processing (verify endpoint handled it first)
        if (orderData.status === "processing" || orderData.status === "shipped" || orderData.status === "delivered") break;

        await orderRef.update({
          paymentId: payment.id,
          status: "processing",
          updatedAt: FieldValue.serverTimestamp(),
          events: FieldValue.arrayUnion({
            status: "Payment Confirmed",
            date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            note: `Payment captured by Razorpay. Amount: ₹${(payment.amount / 100).toLocaleString("en-IN")}`,
            customerNotified: false,
          }),
        });
        console.log("[webhook] payment.captured — order updated:", orderId);
        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity;
        const orderId = payment.order_id;
        if (!orderId) break;

        const orderRef = adminDb.collection("orders").doc(orderId);
        const orderSnap = await orderRef.get();
        if (!orderSnap.exists) break;

        await orderRef.update({
          status: "cancelled",
          updatedAt: FieldValue.serverTimestamp(),
          events: FieldValue.arrayUnion({
            status: "Payment Failed",
            date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            note: `Payment failed. Reason: ${payment.error_description || "Unknown error"}. Razorpay Error: ${payment.error_code || ""}`,
            customerNotified: false,
          }),
        });
        console.log("[webhook] payment.failed — order marked cancelled:", orderId);
        break;
      }

      case "refund.created":
      case "refund.processed": {
        const refund = event.payload.refund.entity;
        const orderId = refund.order_id;
        if (!orderId) break;

        const orderRef = adminDb.collection("orders").doc(orderId);
        const orderSnap = await orderRef.get();
        if (!orderSnap.exists) break;

        await orderRef.update({
          updatedAt: FieldValue.serverTimestamp(),
          events: FieldValue.arrayUnion({
            status: event.event === "refund.created" ? "Refund Initiated" : "Refund Processed",
            date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            note: `Refund of ₹${(refund.amount / 100).toLocaleString("en-IN")} ${event.event === "refund.processed" ? "credited to your account." : "initiated."}`,
            customerNotified: false,
          }),
        });
        console.log("[webhook]", event.event, "— order updated:", orderId);
        break;
      }

      default:
        console.log("[webhook] Unhandled event:", event.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
