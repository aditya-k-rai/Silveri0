import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1, "Promo code is required").toUpperCase(),
  cartTotal: z.number().positive("Cart total must be positive"),
});

/* ---------- sample promo codes ---------- */
const PROMO_CODES: Record<string, {
  type: "percentage" | "flat";
  discount: number;
  minOrder: number;
  maxDiscount?: number;
  expiresAt: string;
  usesLeft: number;
}> = {
  WELCOME10: { type: "percentage", discount: 10, minOrder: 999, maxDiscount: 500, expiresAt: "2026-12-31", usesLeft: 100 },
  FLAT200: { type: "flat", discount: 200, minOrder: 1999, expiresAt: "2026-06-30", usesLeft: 50 },
  SILVER15: { type: "percentage", discount: 15, minOrder: 2999, maxDiscount: 1000, expiresAt: "2026-09-30", usesLeft: 30 },
};

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
    const promo = PROMO_CODES[code];

    if (!promo) {
      return NextResponse.json({ valid: false, error: "Invalid promo code" }, { status: 404 });
    }

    if (new Date(promo.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: "Promo code has expired" }, { status: 400 });
    }

    if (promo.usesLeft <= 0) {
      return NextResponse.json({ valid: false, error: "Promo code usage limit reached" }, { status: 400 });
    }

    if (cartTotal < promo.minOrder) {
      return NextResponse.json(
        { valid: false, error: `Minimum order of ₹${promo.minOrder} required` },
        { status: 400 },
      );
    }

    let discountAmount: number;
    if (promo.type === "percentage") {
      discountAmount = Math.round((cartTotal * promo.discount) / 100);
      if (promo.maxDiscount) discountAmount = Math.min(discountAmount, promo.maxDiscount);
    } else {
      discountAmount = promo.discount;
    }

    return NextResponse.json({
      valid: true,
      code,
      type: promo.type,
      discount: promo.discount,
      discountAmount,
      message: promo.type === "percentage"
        ? `${promo.discount}% off applied! You save ₹${discountAmount}`
        : `₹${discountAmount} off applied!`,
    });
  } catch (error) {
    console.error("Promo validation error:", error);
    return NextResponse.json({ valid: false, error: "Something went wrong" }, { status: 500 });
  }
}
