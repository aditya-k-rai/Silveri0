"use client";

import { Plus } from "lucide-react";

const PROMOS = [
  { id: "pr1", code: "WELCOME10", type: "Percentage", discount: "10%", minOrder: 999, maxDiscount: 500, uses: 42, limit: 100, expiry: "2026-12-31", active: true },
  { id: "pr2", code: "FLAT200", type: "Flat", discount: "₹200", minOrder: 1999, maxDiscount: null, uses: 18, limit: 50, expiry: "2026-06-30", active: true },
  { id: "pr3", code: "SILVER15", type: "Percentage", discount: "15%", minOrder: 2999, maxDiscount: 1000, uses: 7, limit: 30, expiry: "2026-09-30", active: true },
  { id: "pr4", code: "FESTIVE20", type: "Percentage", discount: "20%", minOrder: 3999, maxDiscount: 2000, uses: 50, limit: 50, expiry: "2025-11-30", active: false },
  { id: "pr5", code: "FREESHIP", type: "Flat", discount: "₹99", minOrder: 0, maxDiscount: null, uses: 120, limit: 200, expiry: "2026-12-31", active: true },
];

export default function AdminPromosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#7A7585]">{PROMOS.length} promo codes</p>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] text-white text-sm font-medium rounded-xl hover:bg-[#8A6E2F] transition-colors">
          <Plus size={16} /> Add Promo
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#7A7585] bg-[#FDFAF5]">
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Discount</th>
                <th className="px-5 py-3 font-medium text-center">Uses</th>
                <th className="px-5 py-3 font-medium">Expiry</th>
                <th className="px-5 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {PROMOS.map((p) => (
                <tr key={p.id} className="border-t border-[#E8E8E8]/50 hover:bg-[#FDFAF5]/50 transition-colors">
                  <td className="px-5 py-3">
                    <span className="font-mono font-medium bg-[#E8E8E8]/30 px-2 py-0.5 rounded text-xs">{p.code}</span>
                  </td>
                  <td className="px-5 py-3">{p.type}</td>
                  <td className="px-5 py-3 font-medium">{p.discount}</td>
                  <td className="px-5 py-3 text-center">
                    {p.uses} / {p.limit}
                  </td>
                  <td className="px-5 py-3 text-[#7A7585]">{p.expiry}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      p.active ? "bg-green-50 text-green-700" : "bg-[#E8E8E8]/40 text-[#7A7585]"
                    }`}>
                      {p.active ? "Active" : "Expired"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
