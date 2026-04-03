"use client";

import React, { use } from "react";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight, Clock } from "lucide-react";
import { useOrderStore } from "@/store/orderStore";

type Props = { params: Promise<{ orderId: string }> };

export default function OrderConfirmationPage({ params }: Props) {
  const { orderId } = use(params);
  const { orders } = useOrderStore();
  
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold mb-4">Order Not Found</h1>
        <Link href="/account/orders" className="text-gold hover:underline">Return to Orders</Link>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="w-20 h-20 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-[family-name:var(--font-heading)] font-semibold text-warm-black mb-3">
          Order Status
        </h1>
        <p className="text-muted mb-1">Tracking data for your recent purchase.</p>
        <p className="text-sm text-muted">
          Order ID: <span className="font-semibold text-warm-black">{orderId}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 text-left">
        {/* Order tracking timeline */}
        <div className="bg-white border border-silver/40 rounded-2xl p-6">
          <h2 className="text-lg font-[family-name:var(--font-heading)] font-semibold mb-6 flex items-center gap-2">
            <Clock size={18} className="text-purple-600" /> Live Tracking
          </h2>
          
          {order.events && order.events.length > 0 ? (
            <div className="space-y-6">
              {order.events.map((ev, idx) => (
                <div key={idx} className="relative pl-8">
                  {/* Vertical Line */}
                  {idx !== order.events.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-silver/60 z-0"></div>
                  )}
                  {/* Node */}
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center z-10 ${idx === order.events.length - 1 ? 'bg-gold' : 'bg-silver/40'}`}>
                    <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="font-semibold text-warm-black">{ev.status}</span>
                    <span className="text-xs text-muted mt-0.5">{ev.date} • {ev.time}</span>
                    {ev.note && (
                      <span className="text-xs text-muted/80 mt-2 bg-silver/10 px-3 py-2 rounded-lg border border-silver/30 inline-block">
                        {ev.note}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted italic">Tracking events will appear here once your order begins processing.</p>
          )}
        </div>

        {/* Order summary card */}
        <div className="bg-white border border-silver/40 rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-[family-name:var(--font-heading)] font-semibold mb-4 flex items-center gap-2">
            <Package size={18} className="text-gold" /> Order Summary
          </h2>
          <div className="divide-y divide-silver/30">
            {order.items.map((item) => (
              <div key={item.name} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted ml-2">x{item.quantity}</span>
                </div>
                <span className="font-medium">₹{item.price.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-silver/30 pt-3 mt-1 font-semibold">
            <span>Total</span>
            <span className="text-gold">₹{order.total.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/account/orders"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gold text-gold font-medium rounded-xl hover:bg-gold/5 transition-colors"
        >
          Back to Orders
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
