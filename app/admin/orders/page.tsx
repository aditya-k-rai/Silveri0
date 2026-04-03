"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Phone, Package, CreditCard, Clock, X, CheckCircle } from "lucide-react";
import { useOrderStore, Order } from "@/store/orderStore";

const STATUSES = ["All", "New", "Processing", "Shipped", "Delivered", "Cancelled"];

const STATUS_COLORS: Record<string, string> = {
  New: "bg-purple-50 text-purple-700",
  Delivered: "bg-green-50 text-green-700",
  Shipped: "bg-blue-50 text-blue-700",
  Processing: "bg-amber-50 text-amber-700",
  Cancelled: "bg-red-50 text-red-700",
};

interface StatusUpdateParams {
  id: string;
  currentStatus: string;
  newStatus: string;
}

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useOrderStore();
  const [activeTab, setActiveTab] = useState("All");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Status Modal State
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<StatusUpdateParams | null>(null);
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventNote, setEventNote] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(true);

  const filtered = activeTab === "All" ? orders : orders.filter((o) => o.status === activeTab);

  const openStatusModal = (e: React.ChangeEvent<HTMLSelectElement>, id: string, currentStatus: string) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;

    const now = new Date();
    setEventDate(now.toISOString().split("T")[0]);
    // Format to HH:MM based on local standard
    setEventTime(now.toTimeString().split(" ")[0].slice(0, 5));
    setEventNote("");
    setNotifyCustomer(true);

    setPendingStatusUpdate({ id, currentStatus, newStatus });
  };

  const confirmStatusUpdate = () => {
    if (!pendingStatusUpdate) return;
    
    const [hours, minutes] = eventTime.split(":");
    const h = parseInt(hours);
    const formattedTime = `${h % 12 || 12}:${minutes} ${h >= 12 ? 'PM' : 'AM'}`;

    updateOrderStatus(pendingStatusUpdate.id, pendingStatusUpdate.newStatus, {
      status: pendingStatusUpdate.newStatus,
      date: eventDate,
      time: formattedTime,
      note: eventNote || undefined,
      customerNotified: notifyCustomer
    });

    setPendingStatusUpdate(null);
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
                          onChange={(e) => openStatusModal(e, o.id, o.status)}
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
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2 pl-8">
                            
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

                            {/* Tracking Timeline */}
                            <div className="bg-white border border-[#E8E8E8] rounded-xl p-5 shrink-0">
                              <h4 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] mb-4">
                                <Clock size={16} className="text-purple-600" /> Order Tracking
                              </h4>
                              {o.events && o.events.length > 0 ? (
                                <div className="space-y-4">
                                  {o.events.map((ev, idx) => (
                                    <div key={idx} className="relative pl-6">
                                      {/* Vertical Line */}
                                      {idx !== o.events.length - 1 && (
                                        <div className="absolute left-[9px] top-6 bottom-[-20px] w-px bg-[#E8E8E8] z-0"></div>
                                      )}
                                      {/* Node */}
                                      <div className={`absolute left-0 top-1 w-[19px] h-[19px] rounded-full flex items-center justify-center z-10 ${idx === o.events.length - 1 ? 'bg-[#C9A84C]' : 'bg-[#E8E8E8]'}`}>
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                      </div>
                                      
                                      <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-[#1A1A1A]">{ev.status}</span>
                                        <span className="text-[10px] text-[#A09DAB] mt-0.5">{ev.date} at {ev.time}</span>
                                        {ev.note && (
                                          <span className="text-xs text-[#7A7585] mt-1.5 bg-[#F5F3EF] px-2.5 py-1.5 rounded-md inline-block">
                                            "{ev.note}"
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-[#7A7585] italic">No tracking events logged yet.</p>
                              )}
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
      {/* STATUS UPDATE MODAL */}
      {pendingStatusUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPendingStatusUpdate(null)} />
          <div className="bg-white rounded-2xl w-full max-w-md relative z-10 p-6 shadow-2xl border border-[#E8E8E8]">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-[family-name:var(--font-heading)] font-semibold text-[#1A1A1A]">Update Status</h3>
                <p className="text-sm text-[#7A7585] mt-1">Order {pendingStatusUpdate.id} ➔ <span className="font-semibold text-[#C9A84C]">{pendingStatusUpdate.newStatus}</span></p>
              </div>
              <button onClick={() => setPendingStatusUpdate(null)} className="p-2 hover:bg-[#F5F3EF] rounded-full text-[#7A7585] transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#7A7585] mb-1.5">Date</label>
                  <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full bg-[#F5F3EF] border border-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#7A7585] mb-1.5">Time</label>
                  <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="w-full bg-[#F5F3EF] border border-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-[#7A7585] mb-1.5">Dispatch / Tracking Note (Optional)</label>
                <textarea 
                  value={eventNote} onChange={(e) => setEventNote(e.target.value)}
                  placeholder="e.g. Tracking ID: AW309192, Shipped via BlueDart"
                  rows={2}
                  className="w-full bg-[#F5F3EF] border border-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 resize-none"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${notifyCustomer ? 'bg-amber-500' : 'bg-white border border-[#E8E8E8]'}`}>
                  {notifyCustomer && <CheckCircle size={14} className="text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={notifyCustomer} onChange={() => setNotifyCustomer(!notifyCustomer)} />
                <div>
                  <span className="text-sm font-semibold text-amber-900 block">Notify Customer</span>
                  <span className="text-[10px] text-amber-700/80 leading-tight block">Ping SMS / Email instantly.</span>
                </div>
              </label>
            </div>

            <button onClick={confirmStatusUpdate} className="w-full py-3 bg-[#1A1A1A] text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors">
              Save Tracking Event
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
