"use client";

import { IndianRupee, ShoppingBag, Package, Users } from "lucide-react";
import StatCard from "@/components/admin/StatCard";

const STATS = [
  { label: "Revenue", value: "₹4,82,350", change: "+12.5%", icon: <IndianRupee size={22} /> },
  { label: "Orders", value: "156", change: "+8.2%", icon: <ShoppingBag size={22} /> },
  { label: "Products", value: "89", change: "+3", icon: <Package size={22} /> },
  { label: "Users", value: "1,240", change: "+24", icon: <Users size={22} /> },
];

const RECENT_ORDERS = [
  { id: "ORD-2026-156", customer: "Priya Sharma", date: "2026-04-02", total: 6398, status: "Delivered" },
  { id: "ORD-2026-155", customer: "Arjun Mehta", date: "2026-04-01", total: 3899, status: "Shipped" },
  { id: "ORD-2026-154", customer: "Neha Reddy", date: "2026-03-31", total: 8750, status: "Processing" },
  { id: "ORD-2026-153", customer: "Rahul Singh", date: "2026-03-30", total: 2499, status: "Delivered" },
  { id: "ORD-2026-152", customer: "Ananya Gupta", date: "2026-03-29", total: 5200, status: "Shipped" },
];

const TOP_PRODUCTS = [
  { name: "Silver Elegance Ring", sold: 42, revenue: "₹1,04,958" },
  { name: "Luna Necklace", sold: 35, revenue: "₹1,36,465" },
  { name: "Aria Earrings", sold: 28, revenue: "₹53,172" },
  { name: "Charm Bracelet", sold: 22, revenue: "₹94,578" },
];

const STATUS_COLORS: Record<string, string> = {
  Delivered: "bg-green-50 text-green-700",
  Shipped: "bg-blue-50 text-blue-700",
  Processing: "bg-amber-50 text-amber-700",
};

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} trend={s.change} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8E8E8] p-6">
          <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg mb-4">Recent Orders</h3>
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
                {RECENT_ORDERS.map((o) => (
                  <tr key={o.id} className="border-b border-[#E8E8E8]/50 last:border-0">
                    <td className="py-3 font-medium">{o.id}</td>
                    <td className="py-3">{o.customer}</td>
                    <td className="py-3 text-[#7A7585]">{o.date}</td>
                    <td className="py-3 text-right">₹{o.total.toLocaleString("en-IN")}</td>
                    <td className="py-3 text-right">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6">
          <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg mb-4">Top Products</h3>
          <div className="space-y-4">
            {TOP_PRODUCTS.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C] text-xs font-semibold">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-[#7A7585]">{p.sold} sold</p>
                </div>
                <span className="text-sm font-medium">{p.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
