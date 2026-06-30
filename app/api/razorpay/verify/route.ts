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

/**
 * Update an order document in Firestore via the REST API.
 * Used as fallback when adminDb is not configured.
 */
async function updateOrderViaRestApi(
  orderId: string,
  paymentId: string,
  total: number,
  idToken: string,
): Promise<void> {
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  });

  // Build update mask fields
  const fields = {
    paymentId: { stringValue: paymentId },
    status: { stringValue: "processing" },
    updatedAt: { timestampValue: now.toISOString() },
  };

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${orderId}?updateMask.fieldPaths=paymentId&updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt`;

  try {
    await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ fields }),
    });
    console.log("[verify] Order updated via REST API:", orderId);
  } catch (err) {
    console.error("[verify] REST API update failed:", err);
  }

  // Also try to append the payment event via a separate array union call
  // (REST API doesn't support FieldValue.arrayUnion, so we fetch + update)
  try {
    const getUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${orderId}`;
    const getRes = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (getRes.ok) {
      const doc = await getRes.json();
      const existingEvents: unknown[] =
        doc?.fields?.events?.arrayValue?.values ?? [];
      const newEvent = {
        mapValue: {
          fields: {
            status: { stringValue: "Payment Confirmed" },
            date: { stringValue: dateStr },
            time: { stringValue: timeStr },
            note: {
              stringValue: `Payment of ₹${total.toLocaleString("en-IN")} received. Payment ID: ${paymentId}`,
            },
            customerNotified: { booleanValue: false },
          },
        },
      };
      const updatedFields = {
        events: { arrayValue: { values: [...existingEvents, newEvent] } },
      };
      await fetch(
        `${getUrl}?updateMask.fieldPaths=events`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ fields: updatedFields }),
        },
      );
    }
  } catch (err) {
    console.warn("[verify] Could not append payment event:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");

    // ── 1. Auth guard ────────────────────────────────────────────────────
    const decoded = await verifyIdToken(authHeader);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rawToken = authHeader!.slice(7);

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
    const secret = process.env.Live_key_Secret || process.env.RAZORPAY_KEY_SECRET;
    if (!secret || secret.includes("xxxx")) {
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 503 },
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error("[verify] Signature mismatch for order:", razorpay_order_id);
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // ── 4. Update Firestore ──────────────────────────────────────────────
    if (adminDb) {
      // ── Path A: Admin SDK ────────────────────────────────────────────
      const orderRef = adminDb.collection("orders").doc(razorpay_order_id);
      const orderSnap = await orderRef.get();

      if (!orderSnap.exists) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const orderData = orderSnap.data()!;

      if (orderData.userId !== decoded.uid) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      if (orderData.status === "processing" || orderData.paymentId) {
        return NextResponse.json({
          success: true,
          orderId: razorpay_order_id,
          alreadyProcessed: true,
        });
      }

      const now = new Date();
      const batch = adminDb.batch();
      batch.update(orderRef, {
        paymentId: razorpay_payment_id,
        status: "processing",
        updatedAt: FieldValue.serverTimestamp(),
        events: FieldValue.arrayUnion({
          status: "Payment Confirmed",
          date: now.toLocaleDateString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
          }),
          time: now.toLocaleTimeString("en-IN", {
            hour: "2-digit", minute: "2-digit",
          }),
          note: `Payment of ₹${(orderData.total || 0).toLocaleString("en-IN")} received. Payment ID: ${razorpay_payment_id}`,
          customerNotified: false,
        }),
      });

      if (orderData.promoId) {
        const promoRef = adminDb.collection("promos").doc(orderData.promoId);
        batch.update(promoRef, { usedCount: FieldValue.increment(1) });
      }

      await batch.commit();
    } else {
      // ── Path B: Firestore REST fallback (no Admin SDK) ────────────────
      await updateOrderViaRestApi(
        razorpay_order_id,
        razorpay_payment_id,
        0, // total unknown without adminDb — note in event omitted
        rawToken,
      );
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
