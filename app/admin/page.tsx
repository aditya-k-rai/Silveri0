"use client";

import { useEffect, useState } from "react";
import { IndianRupee, ShoppingBag, Package, Users } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import { useProductStore } from "@/store/productStore";
import { subscribeToOrders } from "@/lib/firebase/orders";
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

export default function AdminDashboard() {
  const { products } = useProductStore();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const unsub = subscribeToOrders((data) => setOrders(data));
    return () => { if (unsub) unsub(); };
  }, []);

  const activeProducts = products.filter((p) => p.status === "Active");
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<IndianRupee size={22} />} label="Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} trend="" />
        <StatCard icon={<ShoppingBag size={22} />} label="Orders" value={String(orders.length)} trend="" />
        <StatCard icon={<Package size={22} />} label="Products" value={String(activeProducts.length)} trend="" />
        <StatCard icon={<Users size={22} />} label="Total Products" value={String(products.length)} trend="" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8E8E8] p-6">
          <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg mb-4">Recent Orders</h3>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#7A7585] border-b border-[#E8E8E8]">
                    <th className="pb-3 font-medium">Order ID</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium text-right">Total</th>
                    <th className="pb-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-[#E8E8E8]/50 last:border-0">
                      <td className="py-3 font-medium">{o.id}</td>
                      <td className="py-3">{o.customerName || "—"}</td>
                      <td className="py-3 text-[#7A7585]">{o.createdAt.toLocaleDateString("en-IN")}</td>
                      <td className="py-3 text-right">₹{o.total.toLocaleString("en-IN")}</td>
                      <td className="py-3 text-right">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[o.status] || "bg-silver/20 text-muted"}`}>
                          {capitalize(o.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-[#7A7585] text-center py-8">No orders yet.</p>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6">
          <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg mb-4">Products Overview</h3>
          {activeProducts.length > 0 ? (
            <div className="space-y-4">
              {activeProducts.slice(0, 5).map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C] text-xs font-semibold">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-[#7A7585]">Stock: {p.stock}</p>
                  </div>
                  <span className="text-sm font-medium">₹{p.price.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#7A7585] text-center py-8">No active products.</p>
          )}
        </div>
      </div>
    </div>
  );
}
