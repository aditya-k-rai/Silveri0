import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { adminDb, verifyIdToken } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const schema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth guard ────────────────────────────────────────────────────
    const decoded = await verifyIdToken(req.headers.get("Authorization"));
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 2. Validate payload ──────────────────────────────────────────────
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    // ── 3. HMAC-SHA256 signature verification ────────────────────────────
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret || secret.includes("xxxx")) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 });
    }

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error("[verify] Signature mismatch — possible tampering attempt for order:", razorpay_order_id);
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // ── 4. Verify order belongs to this user ─────────────────────────────
    if (adminDb) {
      const orderRef = adminDb.collection("orders").doc(razorpay_order_id);
      const orderSnap = await orderRef.get();

      if (!orderSnap.exists) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const orderData = orderSnap.data()!;

      // Ensure the user who paid owns this order
      if (orderData.userId !== decoded.uid) {
        console.error("[verify] User mismatch — uid:", decoded.uid, "order owner:", orderData.userId);
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      // Prevent double-processing an already paid order
      if (orderData.status === "processing" || orderData.paymentId) {
        return NextResponse.json({ success: true, orderId: razorpay_order_id, alreadyProcessed: true });
      }

      // ── 5. Update order status + decrement promo usage ────────────────
      const batch = adminDb.batch();

      batch.update(orderRef, {
        paymentId: razorpay_payment_id,
        status: "processing",
        updatedAt: FieldValue.serverTimestamp(),
        events: FieldValue.arrayUnion({
          status: "Payment Confirmed",
          date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          note: `Payment of ₹${(orderData.total || 0).toLocaleString("en-IN")} received. Payment ID: ${razorpay_payment_id}`,
          customerNotified: false,
        }),
      });

      // Decrement promo usage safely
      if (orderData.promoId) {
        const promoRef = adminDb.collection("promos").doc(orderData.promoId);
        batch.update(promoRef, {
          usedCount: FieldValue.increment(1),
        });
      }

      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("Razorpay verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
