import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";

const schema = z.object({
  code: z.string().min(1, "Promo code is required").transform((v) => v.toUpperCase().trim()),
  cartTotal: z.number().positive("Cart total must be positive"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { valid: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { code, cartTotal } = parsed.data;

    // ── Firestore lookup ─────────────────────────────────────────────────
    if (!adminDb) {
      return NextResponse.json(
        { valid: false, error: "Service temporarily unavailable" },
        { status: 503 },
      );
    }

    // Query by code field (case-insensitive match via stored uppercase)
    const promoQuery = await adminDb
      .collection("promos")
      .where("code", "==", code)
      .limit(1)
      .get();

    if (promoQuery.empty) {
      return NextResponse.json({ valid: false, error: "Invalid promo code" }, { status: 404 });
    }

    const promoDoc = promoQuery.docs[0];
    const promo = promoDoc.data();

    // Active check
    if (!promo.isActive) {
      return NextResponse.json({ valid: false, error: "This promo code is no longer active" }, { status: 400 });
    }

    // Expiry check
    const expiryDate: Date = promo.expiryDate?.toDate?.() ?? new Date(promo.expiryDate);
    if (expiryDate < new Date()) {
      return NextResponse.json({ valid: false, error: "This promo code has expired" }, { status: 400 });
    }

    // Usage limit check
    if (promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ valid: false, error: "Promo code usage limit has been reached" }, { status: 400 });
    }

    // Minimum order check
    if (cartTotal < promo.minOrder) {
      return NextResponse.json(
        { valid: false, error: `Minimum order of ₹${promo.minOrder} required for this code` },
        { status: 400 },
      );
    }

    // ── Calculate discount ───────────────────────────────────────────────
    let discountAmount: number;
    if (promo.type === "percentage") {
      discountAmount = Math.round((cartTotal * promo.discountValue) / 100);
      if (promo.maxDiscount) discountAmount = Math.min(discountAmount, promo.maxDiscount);
    } else {
      // fixed flat discount
      discountAmount = Math.min(promo.discountValue, cartTotal);
    }

    const message =
      promo.type === "percentage"
        ? `${promo.discountValue}% off applied! You save ₹${discountAmount.toLocaleString("en-IN")}`
        : `₹${discountAmount.toLocaleString("en-IN")} off applied!`;

    return NextResponse.json({
      valid: true,
      promoId: promoDoc.id,
      code,
      type: promo.type,
      discountValue: promo.discountValue,
      discountAmount,
      message,
    });
  } catch (error) {
    console.error("Promo validation error:", error);
    return NextResponse.json({ valid: false, error: "Something went wrong" }, { status: 500 });
  }
}
