"use client";

import { useState } from "react";
import { Search, ShieldOff, Shield } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  joined: string;
  blocked: boolean;
}

const INITIAL_USERS: UserData[] = [
  { id: "U001", name: "Priya Sharma", email: "priya@example.com", phone: "+91 98765 43210", orders: 5, totalSpent: 18500, joined: "2025-12-10", blocked: false },
  { id: "U002", name: "Arjun Mehta", email: "arjun@example.com", phone: "+91 87654 32100", orders: 3, totalSpent: 12400, joined: "2026-01-05", blocked: false },
  { id: "U003", name: "Neha Reddy", email: "neha@example.com", phone: "+91 76543 21000", orders: 8, totalSpent: 32000, joined: "2025-11-20", blocked: false },
  { id: "U004", name: "Rahul Singh", email: "rahul@example.com", phone: "+91 65432 10000", orders: 1, totalSpent: 2499, joined: "2026-03-01", blocked: false },
  { id: "U005", name: "Ananya Gupta", email: "ananya@example.com", phone: "+91 54321 00000", orders: 4, totalSpent: 15800, joined: "2026-02-14", blocked: true },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBlock = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, blocked: !u.blocked } : u))
    );
  };

  return (
    <div className="space-y-6">
      <div className="relative w-full sm:w-80">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7585]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
        />
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#7A7585] bg-[#FDFAF5]">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium text-center">Orders</th>
                <th className="px-5 py-3 font-medium text-right">Total Spent</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-[#E8E8E8]/50 hover:bg-[#FDFAF5]/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C] text-xs font-semibold shrink-0">
                        {u.name[0]}
                      </div>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-[#7A7585]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#7A7585]">{u.phone}</td>
                  <td className="px-5 py-3 text-center">{u.orders}</td>
                  <td className="px-5 py-3 text-right">₹{u.totalSpent.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-[#7A7585]">{u.joined}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => toggleBlock(u.id)}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        u.blocked
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      {u.blocked ? <Shield size={12} /> : <ShieldOff size={12} />}
                      {u.blocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center py-10 text-[#7A7585] text-sm">No users found.</p>
        )}
      </div>
    </div>
  );
}
