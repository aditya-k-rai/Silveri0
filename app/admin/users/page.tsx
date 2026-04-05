"use client";

import React, { useState } from "react";
import { Search, ShieldOff, Shield, ChevronDown, ChevronUp, ShoppingBag, Heart, ShoppingCart } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  joined: string;
  blocked: boolean;
  orders: { id: string; date: string; amount: number; items: number; status: string }[];
  wishlist: { sku: string; name: string; price: number }[];
  cart: { sku: string; name: string; price: number; quantity: number }[];
}

const INITIAL_USERS: UserData[] = [];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBlock = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, blocked: !u.blocked } : u))
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedUser(expandedUser === id ? null : id);
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
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#7A7585] bg-[#FDFAF5]">
                <th className="px-5 py-3 font-medium w-8"></th>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium text-center">Orders</th>
                <th className="px-5 py-3 font-medium text-right">Total Spent</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isExpanded = expandedUser === u.id;
                const totalSpent = u.orders.reduce((sum, ord) => sum + ord.amount, 0);

                return (
                  <React.Fragment key={u.id}>
                    <tr onClick={() => toggleExpand(u.id)} className={`cursor-pointer hover:bg-[#FDFAF5]/50 transition-colors ${isExpanded ? 'bg-[#FDFAF5]/30' : 'border-t border-[#E8E8E8]/50'}`}>
                      <td className="px-5 py-4 text-[#7A7585]">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C] text-xs font-semibold shrink-0">
                            {u.name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-[#1A1A1A]">{u.name}</p>
                            <p className="text-xs text-[#7A7585]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#7A7585]">{u.phone}</td>
                      <td className="px-5 py-4 text-center font-medium">{u.orders.length}</td>
                      <td className="px-5 py-4 text-right font-medium">₹{totalSpent.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-4 text-[#7A7585]">{u.joined}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={(e) => toggleBlock(e, u.id)}
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
                    
                    {/* EXPANDED DETAILS */}
                    {isExpanded && (
                      <tr className="bg-[#FDFAF5]/30 border-b border-[#E8E8E8]/50">
                        <td colSpan={7} className="px-5 pb-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 pl-8">
                            
                            {/* Orders */}
                            <div className="bg-white border border-[#E8E8E8] rounded-xl p-4">
                              <h4 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] mb-3">
                                <ShoppingBag size={16} className="text-[#C9A84C]" /> Recent Orders
                              </h4>
                              {u.orders.length > 0 ? (
                                <ul className="space-y-2">
                                  {u.orders.map(o => (
                                    <li key={o.id} className="flex justify-between items-center text-xs">
                                      <span className="text-[#7A7585]">{o.id} ({o.items} items)</span>
                                      <span className="font-medium">₹{o.amount.toLocaleString()}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : <p className="text-xs text-[#7A7585]">No orders yet.</p>}
                            </div>

                            {/* Wishlist */}
                            <div className="bg-white border border-[#E8E8E8] rounded-xl p-4">
                              <h4 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] mb-3">
                                <Heart size={16} className="text-rose-500" /> Wishlisted Items
                              </h4>
                              {u.wishlist.length > 0 ? (
                                <ul className="space-y-2">
                                  {u.wishlist.map(w => (
                                    <li key={w.sku} className="flex justify-between items-center text-xs">
                                      <span className="text-[#7A7585] truncate pr-2 max-w-[150px]">{w.name} <br/><span className="text-[10px] text-[#A09DAB]">{w.sku}</span></span>
                                      <span className="font-medium shrink-0">₹{w.price.toLocaleString()}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : <p className="text-xs text-[#7A7585]">Wishlist is empty.</p>}
                            </div>

                            {/* Cart */}
                            <div className="bg-white border border-[#E8E8E8] rounded-xl p-4">
                              <h4 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] mb-3">
                                <ShoppingCart size={16} className="text-blue-500" /> Active Cart
                              </h4>
                              {u.cart.length > 0 ? (
                                <ul className="space-y-2">
                                  {u.cart.map(c => (
                                    <li key={c.sku} className="flex justify-between items-center text-xs">
                                      <span className="text-[#7A7585] truncate pr-2 max-w-[150px]">{c.name} (x{c.quantity}) <br/><span className="text-[10px] text-[#A09DAB]">{c.sku}</span></span>
                                      <span className="font-medium shrink-0">₹{(c.price * c.quantity).toLocaleString()}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : <p className="text-xs text-[#7A7585]">Cart is currently empty.</p>}
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
          <p className="text-center py-10 text-[#7A7585] text-sm">No users found.</p>
        )}
      </div>
    </div>
  );
}
