import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";
import { adminDb, verifyIdToken } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  image: z.string().default(""),
});

const addressSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
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
  shipping: z.number().min(0).default(0),
  promoId: z.string().optional(),
  promoCode: z.string().optional(),
  promoDiscount: z.number().min(0).default(0),
  currency: z.string().default("INR"),
});

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || keyId.includes("xxxx")) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth guard ────────────────────────────────────────────────────
    const decoded = await verifyIdToken(req.headers.get("Authorization"));
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized — please sign in to continue" }, { status: 401 });
    }
    const userId = decoded.uid;

    // ── 2. Validate payload ──────────────────────────────────────────────
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { items, address, shipping, promoId, promoCode, promoDiscount, currency } = parsed.data;

    // ── 3. Server-side amount recalculation (never trust client) ─────────
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const discount = Math.max(0, Math.min(promoDiscount, subtotal)); // cap discount at subtotal
    const total = subtotal - discount + shipping;

    if (total <= 0) {
      return NextResponse.json({ error: "Invalid order total" }, { status: 400 });
    }

    // ── 4. Validate promo against Firestore (double-check) ───────────────
    if (promoId && adminDb) {
      const promoSnap = await adminDb.collection("promos").doc(promoId).get();
      if (!promoSnap.exists || !promoSnap.data()?.isActive) {
        return NextResponse.json({ error: "Promo code is no longer valid" }, { status: 400 });
      }
      const promoData = promoSnap.data()!;
      const expiryDate: Date = promoData.expiryDate?.toDate?.() ?? new Date(promoData.expiryDate);
      if (expiryDate < new Date() || promoData.usedCount >= promoData.maxUses) {
        return NextResponse.json({ error: "Promo code is expired or limit reached" }, { status: 400 });
      }
    }

    // ── 5. Create Razorpay order ─────────────────────────────────────────
    const razorpay = getRazorpay();
    if (!razorpay) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 });
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

    // ── 6. Save pending order to Firestore (idempotency key = rzp order id) ─
    if (adminDb) {
      const orderRef = adminDb.collection("orders").doc(rzpOrder.id);
      await orderRef.set({
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
            date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            note: "Your order has been received and is awaiting payment.",
            customerNotified: false,
          },
        ],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      receipt,
    });
  } catch (error) {
    console.error("Razorpay create-order error:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
