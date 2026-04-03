import Link from "next/link";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";

type Props = { params: Promise<{ orderId: string }> };

const ORDER_ITEMS = [
  { name: "Silver Elegance Ring", qty: 1, price: 2499 },
  { name: "Luna Necklace", qty: 1, price: 3899 },
];

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderId } = await params;
  const total = ORDER_ITEMS.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <section className="max-w-2xl mx-auto px-4 py-16 text-center">
      {/* Success icon */}
      <div className="w-20 h-20 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-6">
        <CheckCircle2 size={40} className="text-green-600" />
      </div>

      <h1 className="text-3xl md:text-4xl font-[family-name:var(--font-heading)] font-semibold text-warm-black mb-3">
        Order Confirmed!
      </h1>
      <p className="text-muted mb-1">Thank you for shopping with Silveri.</p>
      <p className="text-sm text-muted mb-8">
        Order ID: <span className="font-semibold text-warm-black">{orderId}</span>
      </p>

      {/* Order summary card */}
      <div className="bg-white border border-silver/40 rounded-2xl p-6 text-left mb-8">
        <h2 className="text-lg font-[family-name:var(--font-heading)] font-semibold mb-4 flex items-center gap-2">
          <Package size={18} className="text-gold" /> Order Summary
        </h2>
        <div className="divide-y divide-silver/30">
          {ORDER_ITEMS.map((item) => (
            <div key={item.name} className="flex items-center justify-between py-3 text-sm">
              <div>
                <span className="font-medium">{item.name}</span>
                <span className="text-muted ml-2">x{item.qty}</span>
              </div>
              <span className="font-medium">₹{item.price.toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-silver/30 pt-3 mt-1 font-semibold">
          <span>Total</span>
          <span>₹{total.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <p className="text-sm text-muted mb-8">
        A confirmation email has been sent to your registered email address. You can track your order from your account.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/account/orders"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gold text-gold font-medium rounded-xl hover:bg-gold/5 transition-colors"
        >
          View Orders
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold hover:bg-gold-dark text-white font-medium rounded-xl transition-colors"
        >
          Continue Shopping <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
