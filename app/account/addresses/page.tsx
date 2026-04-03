"use client";

import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2, X } from "lucide-react";

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const INITIAL_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    label: "Home",
    fullName: "Priya Sharma",
    phone: "+91 98765 43210",
    line1: "302, Lakeview Apartments",
    line2: "Koramangala 4th Block",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560034",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Office",
    fullName: "Priya Sharma",
    phone: "+91 98765 43210",
    line1: "WeWork Galaxy, #43",
    line2: "Residency Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560025",
    isDefault: false,
  },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setShowForm(true);
  };

  const handleSave = () => {
    // In production, save to backend
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-[family-name:var(--font-heading)] font-semibold">My Addresses</h2>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-white text-sm font-medium rounded-xl hover:bg-gold-dark transition-colors"
        >
          <Plus size={16} /> Add Address
        </button>
      </div>

      {/* Form modal overlay */}
      {showForm && (
        <div className="mb-6 bg-white border border-silver/40 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg">
              {editingId ? "Edit Address" : "New Address"}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-muted hover:text-warm-black">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Label (e.g. Home)" className="border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40" />
            <input placeholder="Full Name" className="border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40" />
            <input placeholder="Phone" className="border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40" />
            <input placeholder="Pincode" className="border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40" />
            <input placeholder="Address Line 1" className="md:col-span-2 border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40" />
            <input placeholder="Address Line 2" className="md:col-span-2 border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40" />
            <input placeholder="City" className="border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40" />
            <input placeholder="State" className="border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40" />
          </div>
          <button
            onClick={handleSave}
            className="mt-5 px-8 py-3 bg-gold hover:bg-gold-dark text-white font-medium rounded-xl transition-colors"
          >
            Save Address
          </button>
        </div>
      )}

      {/* Address cards */}
      {addresses.length === 0 ? (
        <div className="bg-white border border-silver/40 rounded-2xl p-10 text-center">
          <MapPin size={48} className="mx-auto text-muted mb-4" />
          <h3 className="text-lg font-[family-name:var(--font-heading)] font-semibold mb-2">No Addresses</h3>
          <p className="text-sm text-muted">Add a shipping address to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white border rounded-2xl p-5 relative ${
                addr.isDefault ? "border-gold" : "border-silver/40"
              }`}
            >
              {addr.isDefault && (
                <span className="absolute top-4 right-4 text-[10px] uppercase tracking-wider font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                  Default
                </span>
              )}
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-gold" />
                <span className="font-semibold text-sm">{addr.label}</span>
              </div>
              <p className="text-sm">{addr.fullName}</p>
              <p className="text-sm text-muted">{addr.line1}</p>
              {addr.line2 && <p className="text-sm text-muted">{addr.line2}</p>}
              <p className="text-sm text-muted">{addr.city}, {addr.state} — {addr.pincode}</p>
              <p className="text-sm text-muted mt-1">{addr.phone}</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(addr.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-gold transition-colors"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-red-600 transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
