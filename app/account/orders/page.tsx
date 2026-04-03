"use client";

import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";

const ORDERS = [
  {
    id: "ORD-2026-001",
    date: "2026-03-28",
    items: [
      { name: "Silver Elegance Ring", qty: 1, price: 2499 },
      { name: "Luna Necklace", qty: 1, price: 3899 },
    ],
    total: 6398,
    status: "Delivered",
  },
  {
    id: "ORD-2026-002",
    date: "2026-03-15",
    items: [{ name: "Aria Earrings", qty: 2, price: 1899 }],
    total: 3798,
    status: "Shipped",
  },
  {
    id: "ORD-2026-003",
    date: "2026-02-20",
    items: [{ name: "Charm Bracelet", qty: 1, price: 4299 }],
    total: 4299,
    status: "Processing",
  },
];

const STATUS_COLORS: Record<string, string> = {
  Delivered: "bg-green-50 text-green-700",
  Shipped: "bg-blue-50 text-blue-700",
  Processing: "bg-amber-50 text-amber-700",
  Cancelled: "bg-red-50 text-red-700",
};

export default function OrdersPage() {
  if (ORDERS.length === 0) {
    return (
      <div className="bg-white border border-silver/40 rounded-2xl p-10 text-center">
        <Package size={48} className="mx-auto text-muted mb-4" />
        <h2 className="text-xl font-[family-name:var(--font-heading)] font-semibold mb-2">No Orders Yet</h2>
        <p className="text-sm text-muted mb-6">Start shopping to see your orders here.</p>
        <Link href="/" className="inline-block px-6 py-3 bg-gold text-white font-medium rounded-xl hover:bg-gold-dark transition-colors">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-[family-name:var(--font-heading)] font-semibold mb-2">My Orders</h2>
      {ORDERS.map((order) => (
        <Link
          key={order.id}
          href={`/order/${order.id}`}
          className="block bg-white border border-silver/40 rounded-2xl p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-medium text-sm">{order.id}</span>
              <span className="text-xs text-muted ml-3">{order.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] ?? "bg-silver/20 text-muted"}`}>
                {order.status}
              </span>
              <ChevronRight size={16} className="text-muted" />
            </div>
          </div>
          <div className="space-y-1 text-sm text-muted">
            {order.items.map((item) => (
              <p key={item.name}>
                {item.name} <span className="text-xs">x{item.qty}</span>
              </p>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-silver/30 flex justify-between text-sm">
            <span className="text-muted">{order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
            <span className="font-semibold">₹{order.total.toLocaleString("en-IN")}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
