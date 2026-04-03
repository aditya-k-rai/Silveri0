"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Phone, Package, CreditCard } from "lucide-react";

interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  location: string;
  date: string;
  total: number;
  status: string;
  items: { sku: string; name: string; price: number; quantity: number }[];
}

const STATUSES = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];

const STATUS_COLORS: Record<string, string> = {
  Delivered: "bg-green-50 text-green-700",
  Shipped: "bg-blue-50 text-blue-700",
  Processing: "bg-amber-50 text-amber-700",
  Cancelled: "bg-red-50 text-red-700",
};

const INITIAL_ORDERS: Order[] = [
  { 
    id: "ORD-2026-156", customer: "Priya Sharma", email: "priya@example.com", phone: "+91 98765 43210", location: "Mumbai, Maharashtra", date: "2026-04-02", total: 6398, status: "Delivered",
    items: [{ sku: "SLV-RNG-001", name: "Silver Elegance Ring", price: 2499, quantity: 1 }, { sku: "SLV-NCK-002", name: "Luna Necklace", price: 3899, quantity: 1 }]
  },
  { 
    id: "ORD-2026-155", customer: "Arjun Mehta", email: "arjun@example.com", phone: "+91 87654 32100", location: "Delhi, NCR", date: "2026-04-01", total: 3899, status: "Shipped",
    items: [{ sku: "SLV-NCK-002", name: "Luna Necklace", price: 3899, quantity: 1 }]
  },
  { 
    id: "ORD-2026-154", customer: "Neha Reddy", email: "neha@example.com", phone: "+91 76543 21000", location: "Bangalore, Karnataka", date: "2026-03-31", total: 8750, status: "Processing",
    items: [{ sku: "SLV-RNG-006", name: "Solitaire Ring", price: 5499, quantity: 1 }, { sku: "SLV-ANK-005", name: "Twist Anklet", price: 1299, quantity: 2 }, { sku: "SLV-BRC-004", name: "Charm Bracelet", price: 653, quantity: 1 }] 
  },
  { 
    id: "ORD-2026-153", customer: "Rahul Singh", email: "rahul@example.com", phone: "+91 65432 10000", location: "Pune, Maharashtra", date: "2026-03-30", total: 2499, status: "Delivered",
    items: [{ sku: "SLV-RNG-001", name: "Silver Elegance Ring", price: 2499, quantity: 1 }]
  },
  { 
    id: "ORD-2026-152", customer: "Ananya Gupta", email: "ananya@example.com", phone: "+91 54321 00000", location: "Hyderabad, Telangana", date: "2026-03-29", total: 5200, status: "Shipped",
    items: [{ sku: "SLV-NCK-007", name: "Pearl Pendant", price: 2899, quantity: 1 }, { sku: "SLV-EAR-003", name: "Aria Earrings", price: 2301, quantity: 1 }]
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState("All");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filtered = activeTab === "All" ? orders : orders.filter((o) => o.status === activeTab);

  const updateStatus = (e: React.ChangeEvent<HTMLSelectElement>, id: string) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    setOrders((prev) => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const toggleExpand = (id: string) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

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
                ({orders.filter((o) => o.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#7A7585] bg-[#FDFAF5]">
                <th className="px-5 py-3 font-medium w-8"></th>
                <th className="px-5 py-3 font-medium">Order ID</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium text-center">Total Items</th>
                <th className="px-5 py-3 font-medium text-right">Total Price</th>
                <th className="px-5 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const isExpanded = expandedOrder === o.id;
                const totalQuantity = o.items.reduce((sum, item) => sum + item.quantity, 0);

                return (
                  <React.Fragment key={o.id}>
                    <tr onClick={() => toggleExpand(o.id)} className={`cursor-pointer transition-colors ${isExpanded ? 'bg-[#FDFAF5]/30' : 'border-t border-[#E8E8E8]/50 hover:bg-[#FDFAF5]/50'}`}>
                      <td className="px-5 py-4 text-[#7A7585]">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </td>
                      <td className="px-5 py-4 font-medium text-[#1A1A1A]">{o.id}</td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-[#1A1A1A]">{o.customer}</p>
                          <p className="text-xs text-[#7A7585]">{o.email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#7A7585]">{o.date}</td>
                      <td className="px-5 py-4 text-center font-medium">{totalQuantity}</td>
                      <td className="px-5 py-4 text-right font-medium text-[#1A1A1A]">₹{o.total.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={o.status}
                          onChange={(e) => updateStatus(e, o.id)}
                          className={`text-xs font-medium px-2.5 py-1.5 rounded-full border border-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 transition-colors ${STATUS_COLORS[o.status]}`}
                        >
                          {STATUSES.filter((s) => s !== "All").map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>

                    {/* EXPANDED ORDER DETAILS */}
                    {isExpanded && (
                      <tr className="bg-[#FDFAF5]/30 border-b border-[#E8E8E8]/50">
                        <td colSpan={7} className="px-5 pb-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 pl-8">
                            
                            {/* Items Ordered */}
                            <div className="bg-white border border-[#E8E8E8] rounded-xl p-5">
                              <h4 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] mb-4">
                                <Package size={16} className="text-[#C9A84C]" /> Ordered Items
                              </h4>
                              <div className="space-y-3">
                                {o.items.map(item => (
                                  <div key={item.sku} className="flex justify-between items-start border-b border-[#E8E8E8] last:border-0 pb-3 last:pb-0">
                                    <div>
                                      <p className="text-sm font-medium text-[#1A1A1A]">{item.name}</p>
                                      <p className="text-[10px] text-[#A09DAB] mb-0.5">SKU: {item.sku}</p>
                                      <p className="text-xs text-[#7A7585]">Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}</p>
                                    </div>
                                    <span className="text-sm font-semibold whitespace-nowrap ml-4">
                                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                ))}
                                <div className="flex justify-between items-center pt-2 font-semibold">
                                  <span className="text-sm">Total</span>
                                  <span className="text-[#C9A84C]">₹{o.total.toLocaleString("en-IN")}</span>
                                </div>
                              </div>
                            </div>

                            {/* Customer Contact & Logistics */}
                            <div className="space-y-4">
                              <div className="bg-white border border-[#E8E8E8] rounded-xl p-4">
                                <h4 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] mb-3">
                                  <Phone size={16} className="text-blue-500" /> Contact Info
                                </h4>
                                <p className="text-sm text-[#444] mb-1"><span className="text-[#7A7585] w-16 inline-block">Phone:</span> {o.phone}</p>
                                <p className="text-sm text-[#444]"><span className="text-[#7A7585] w-16 inline-block">Email:</span> {o.email}</p>
                              </div>

                              <div className="bg-white border border-[#E8E8E8] rounded-xl p-4">
                                <h4 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] mb-3">
                                  <MapPin size={16} className="text-rose-500" /> Delivery Address
                                </h4>
                                <p className="text-sm text-[#444] leading-relaxed">{o.location}</p>
                              </div>

                              <div className="bg-white border border-[#E8E8E8] rounded-xl p-4">
                                <h4 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] mb-3">
                                  <CreditCard size={16} className="text-green-600" /> Payment Summary
                                </h4>
                                <p className="text-sm text-[#444] mb-1">Method: <span className="font-medium">Prepaid (Card)</span></p>
                                <p className="text-sm text-[#444]">Payment Status: <span className="text-green-600 font-medium">Completed</span></p>
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center py-10 text-[#7A7585] text-sm">No orders found for this status.</p>
        )}
      </div>
    </div>
  );
}
