"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, ChevronRight, Loader2 } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { subscribeToUserOrders } from "@/lib/firebase/orders";
import { Order } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  delivered: "bg-green-50 text-green-700",
  shipped: "bg-blue-50 text-blue-700",
  processing: "bg-amber-50 text-amber-700",
  pending: "bg-purple-50 text-purple-700",
  cancelled: "bg-red-50 text-red-700",
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default function OrdersPage() {
  const { user } = useAuthContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    const unsub = subscribeToUserOrders(user.uid, (data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => { if (unsub) unsub(); };
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="bg-white border border-silver/40 rounded-2xl p-10 text-center">
        <Loader2 size={32} className="mx-auto text-gold animate-spin mb-4" />
        <p className="text-sm text-muted">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
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
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/order/${order.id}`}
          className="block bg-white border border-silver/40 rounded-2xl p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-medium text-sm">{order.id}</span>
              <span className="text-xs text-muted ml-3">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] ?? "bg-silver/20 text-muted"}`}>
                {capitalize(order.status)}
              </span>
              <ChevronRight size={16} className="text-muted" />
            </div>
          </div>
          <div className="space-y-1 text-sm text-muted">
            {order.items.map((item) => (
              <p key={item.name}>
                {item.name} <span className="text-xs">x{item.quantity}</span>
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
