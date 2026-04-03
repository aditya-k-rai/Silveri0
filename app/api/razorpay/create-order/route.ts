import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";

const schema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("INR"),
  receipt: z.string().optional(),
  notes: z.record(z.string(), z.string()).optional(),
});

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId.includes('xxxx')) {
    return null;
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function POST(req: NextRequest) {
  try {
    const razorpay = getRazorpay();
    if (!razorpay) {
      return NextResponse.json({ error: "Razorpay not configured" }, { status: 503 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { amount, currency, receipt, notes } = parsed.data;

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt ?? `rcpt_${Date.now()}`,
      notes: notes ?? {},
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay create-order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
