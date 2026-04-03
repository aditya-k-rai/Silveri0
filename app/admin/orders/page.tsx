"use client";

import { useState } from "react";

const STATUSES = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];

const ORDERS = [
  { id: "ORD-2026-156", customer: "Priya Sharma", email: "priya@example.com", date: "2026-04-02", total: 6398, items: 2, status: "Delivered" },
  { id: "ORD-2026-155", customer: "Arjun Mehta", email: "arjun@example.com", date: "2026-04-01", total: 3899, items: 1, status: "Shipped" },
  { id: "ORD-2026-154", customer: "Neha Reddy", email: "neha@example.com", date: "2026-03-31", total: 8750, items: 3, status: "Processing" },
  { id: "ORD-2026-153", customer: "Rahul Singh", email: "rahul@example.com", date: "2026-03-30", total: 2499, items: 1, status: "Delivered" },
  { id: "ORD-2026-152", customer: "Ananya Gupta", email: "ananya@example.com", date: "2026-03-29", total: 5200, items: 2, status: "Shipped" },
  { id: "ORD-2026-151", customer: "Vikram Patel", email: "vikram@example.com", date: "2026-03-28", total: 1899, items: 1, status: "Cancelled" },
];

const STATUS_COLORS: Record<string, string> = {
  Delivered: "bg-green-50 text-green-700",
  Shipped: "bg-blue-50 text-blue-700",
  Processing: "bg-amber-50 text-amber-700",
  Cancelled: "bg-red-50 text-red-700",
};

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState("All");

  const filtered = activeTab === "All" ? ORDERS : ORDERS.filter((o) => o.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setActiveTab(s)}
            className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
              activeTab === s
                ? "bg-[#C9A84C] text-white"
                : "bg-white border border-[#E8E8E8] text-[#7A7585] hover:text-[#1A1A1A]"
            }`}
          >
            {s}
            {s !== "All" && (
              <span className="ml-1.5 text-xs">
                ({ORDERS.filter((o) => o.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#7A7585] bg-[#FDFAF5]">
                <th className="px-5 py-3 font-medium">Order ID</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium text-center">Items</th>
                <th className="px-5 py-3 font-medium text-right">Total</th>
                <th className="px-5 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-t border-[#E8E8E8]/50 hover:bg-[#FDFAF5]/50 transition-colors">
                  <td className="px-5 py-3 font-medium">{o.id}</td>
                  <td className="px-5 py-3">
                    <div>
                      <p>{o.customer}</p>
                      <p className="text-xs text-[#7A7585]">{o.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#7A7585]">{o.date}</td>
                  <td className="px-5 py-3 text-center">{o.items}</td>
                  <td className="px-5 py-3 text-right">₹{o.total.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-right">
                    <select
                      defaultValue={o.status}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${STATUS_COLORS[o.status]}`}
                    >
                      {STATUSES.filter((s) => s !== "All").map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center py-10 text-[#7A7585] text-sm">No orders found.</p>
        )}
      </div>
    </div>
  );
}
