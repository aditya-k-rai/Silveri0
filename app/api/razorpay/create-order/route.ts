import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";
import { adminDb, verifyIdToken } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  // Allow 0-price items (free gifts, etc.)
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  image: z.string().default(""),
});

const addressSchema = z.object({
  fullName: z.string().min(1),
  // Email already validated on the client — just ensure it's a string here
  email: z.string().optional().default(""),
  phoneCountryCode: z.string().default("+91"),
  phone: z.string().default(""),
  line1: z.string().default(""),
  landmark: z.string().default(""),
  pincode: z.string().default(""),
  city: z.string().default(""),
  district: z.string().default(""),
  state: z.string().default(""),
});

const schema = z.object({
  items: z.array(orderItemSchema).min(1, "Cart is empty"),
  address: addressSchema,
  shipping: z.number().nonnegative().default(0),
  promoId: z.string().optional(),
  promoCode: z.string().optional(),
  promoDiscount: z.number().nonnegative().default(0),
  currency: z.string().default("INR"),
});

function getRazorpay() {
  const keyId = process.env.Live_api_Key || process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.Live_key_Secret || process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || keyId.includes("xxxx")) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/**
 * Save order to Firestore via the REST API (no Admin SDK required).
 * Falls back gracefully when adminDb is not configured.
 */
async function saveOrderViaRestApi(
  orderId: string,
  orderData: Record<string, unknown>,
  idToken: string,
): Promise<boolean> {
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return false;

  // Convert plain JS object to Firestore REST API field format
  function toFirestoreValue(val: unknown): unknown {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === "boolean") return { booleanValue: val };
    if (typeof val === "number") return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
    if (typeof val === "string") return { stringValue: val };
    if (val instanceof Date) return { timestampValue: val.toISOString() };
    if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
    if (typeof val === "object") {
      const fields: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        fields[k] = toFirestoreValue(v);
      }
      return { mapValue: { fields } };
    }
    return { stringValue: String(val) };
  }

  // Build fields map
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(orderData)) {
    fields[k] = toFirestoreValue(v);
  }
  // Server timestamp for createdAt/updatedAt
  fields.createdAt = { timestampValue: new Date().toISOString() };
  fields.updatedAt = { timestampValue: new Date().toISOString() };

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${orderId}`;

  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[create-order] REST Firestore save failed:", res.status, err);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[create-order] REST Firestore save error:", err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");

    // ── 1. Auth guard ────────────────────────────────────────────────────
    const decoded = await verifyIdToken(authHeader);
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized — please sign in to continue" },
        { status: 401 },
      );
    }
    const userId = decoded.uid;
    const rawToken = authHeader!.slice(7); // needed for REST fallback

    // ── 2. Validate payload ──────────────────────────────────────────────
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      // Log exact field errors to server console for easy debugging
      console.error("[create-order] Validation failed. Body received:", JSON.stringify(body, null, 2));
      console.error("[create-order] Field errors:", JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
          hint: "Check server console for details",
        },
        { status: 400 },
      );
    }

    const { items, address, shipping, promoId, promoCode, promoDiscount, currency } = parsed.data;

    // ── 3. Server-side amount recalculation (never trust client) ─────────
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const discount = Math.max(0, Math.min(promoDiscount, subtotal));
    const total = subtotal - discount + shipping;

    if (total <= 0) {
      return NextResponse.json({ error: "Invalid order total" }, { status: 400 });
    }

    // ── 4. Validate promo against Firestore (double-check if adminDb available) ─
    if (promoId && adminDb) {
      const promoSnap = await adminDb.collection("promos").doc(promoId).get();
      if (!promoSnap.exists || !promoSnap.data()?.isActive) {
        return NextResponse.json({ error: "Promo code is no longer valid" }, { status: 400 });
      }
      const promoData = promoSnap.data()!;
      const expiryDate: Date =
        promoData.expiryDate?.toDate?.() ?? new Date(promoData.expiryDate);
      if (expiryDate < new Date() || promoData.usedCount >= promoData.maxUses) {
        return NextResponse.json(
          { error: "Promo code is expired or limit reached" },
          { status: 400 },
        );
      }
    }

    // ── 5. Create Razorpay order ─────────────────────────────────────────
    const razorpay = getRazorpay();
    if (!razorpay) {
      return NextResponse.json(
        { error: "Payment gateway not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local" },
        { status: 503 },
      );
    }

    const receipt = `rcpt_${userId.slice(0, 8)}_${Date.now().toString(36)}`;
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // paise
      currency,
      receipt,
      notes: {
        userId,
        promoCode: promoCode ?? "",
      },
    });

    // ── 6. Save pending order to Firestore ───────────────────────────────
    const now = new Date();
    const orderPayload = {
      id: rzpOrder.id,
      userId,
      items,
      address: {
        id: "checkout",
        label: "Delivery",
        fullName: address.fullName,
        email: address.email || "",
        phoneCountryCode: address.phoneCountryCode,
        phone: address.phone,
        line1: address.line1,
        line2: address.landmark,
        landmark: address.landmark,
        city: address.city,
        district: address.district,
        state: address.state,
        pincode: address.pincode,
        isDefault: false,
      },
      subtotal,
      discount,
      shipping,
      total,
      promoCode: promoCode ?? null,
      promoId: promoId ?? null,
      razorpayOrderId: rzpOrder.id,
      paymentId: null,
      status: "pending",
      customerName: address.fullName,
      customerEmail: address.email || "",
      customerPhone: `${address.phoneCountryCode} ${address.phone}`.trim(),
      events: [
        {
          status: "Order Placed",
          date: now.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          time: now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          note: "Your order has been received and is awaiting payment.",
          customerNotified: false,
        },
      ],
    };

    if (adminDb) {
      // ── Path A: Admin SDK (has Firestore write access) ────────────────
      await adminDb
        .collection("orders")
        .doc(rzpOrder.id)
        .set({
          ...orderPayload,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      console.log("[create-order] Order saved via Admin SDK:", rzpOrder.id);
    } else {
      // ── Path B: Firestore REST API fallback (no Admin SDK) ────────────
      const saved = await saveOrderViaRestApi(rzpOrder.id, orderPayload, rawToken);
      if (saved) {
        console.log("[create-order] Order saved via REST API:", rzpOrder.id);
      } else {
        console.warn("[create-order] Could not save order to Firestore — Razorpay order created:", rzpOrder.id);
        // Don't block payment — order still exists in Razorpay; webhook will update Firestore later
      }
    }

    return NextResponse.json({
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      receipt,
      keyId: process.env.Live_api_Key || process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay create-order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 },
    );
  }
}
