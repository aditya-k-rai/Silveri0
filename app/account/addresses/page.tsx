"use client";

import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

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

const EMPTY_FORM: Omit<Address, "id"> = {
  label: "", fullName: "", phone: "", line1: "", line2: "",
  city: "", state: "", pincode: "", isDefault: false,
};

export default function AddressesPage() {
  const { user, userDoc } = useAuthContext();
  const savedAddresses: Address[] = (userDoc?.addresses as Address[]) || [];

  const [addresses, setAddresses] = useState<Address[]>(savedAddresses);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Address, "id">>(EMPTY_FORM);

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const persistToFirestore = async (updated: Address[]) => {
    if (!user || !db) return;
    await updateDoc(doc(db, "users", user.uid), { addresses: updated });
  };

  const handleEdit = (id: string) => {
    const addr = addresses.find((a) => a.id === id);
    if (!addr) return;
    setForm({
      label: addr.label,
      fullName: addr.fullName,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setEditingId(id);
    setShowForm(true);
  };

  const handleAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.fullName || !form.line1 || !form.city || !form.pincode) return;

    let updated: Address[];
    if (editingId) {
      updated = addresses.map((a) =>
        a.id === editingId ? { ...form, id: editingId } : a
      );
    } else {
      const newAddr: Address = { ...form, id: `addr-${Date.now()}` };
      if (addresses.length === 0) newAddr.isDefault = true;
      updated = [...addresses, newAddr];
    }

    setAddresses(updated);
    await persistToFirestore(updated);
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleDelete = async (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    // If deleted address was default, make first remaining address default
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    setAddresses(updated);
    await persistToFirestore(updated);
  };

  const handleSetDefault = async (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(updated);
    await persistToFirestore(updated);
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

      {/* Form */}
      {showForm && (
        <div className="mb-6 bg-white border border-silver/40 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg">
              {editingId ? "Edit Address" : "New Address"}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-muted hover:text-warm-black">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Label (e.g. Home)"
              value={form.label}
              onChange={(e) => updateField("label", e.target.value)}
              className="border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            <input
              placeholder="Full Name"
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              className="border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            <input
              placeholder="Pincode"
              value={form.pincode}
              onChange={(e) => updateField("pincode", e.target.value)}
              maxLength={6}
              className="border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            <input
              placeholder="Address Line 1"
              value={form.line1}
              onChange={(e) => updateField("line1", e.target.value)}
              className="md:col-span-2 border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            <input
              placeholder="Address Line 2"
              value={form.line2}
              onChange={(e) => updateField("line2", e.target.value)}
              className="md:col-span-2 border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            <input
              placeholder="City"
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              className="border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            <input
              placeholder="State"
              value={form.state}
              onChange={(e) => updateField("state", e.target.value)}
              className="border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={!form.fullName || !form.line1 || !form.city || !form.pincode}
            className="mt-5 px-8 py-3 bg-gold hover:bg-gold-dark text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            Save Address
          </button>
        </div>
      )}

      {/* Address cards */}
      {addresses.length === 0 && !showForm ? (
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
                <span className="font-semibold text-sm">{addr.label || "Address"}</span>
              </div>
              <p className="text-sm">{addr.fullName}</p>
              <p className="text-sm text-muted">{addr.line1}</p>
              {addr.line2 && <p className="text-sm text-muted">{addr.line2}</p>}
              <p className="text-sm text-muted">{addr.city}, {addr.state} — {addr.pincode}</p>
              <p className="text-sm text-muted mt-1">{addr.phone}</p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleEdit(addr.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-gold transition-colors"
                >
                  <Pencil size={12} /> Edit
                </button>
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-green-600 transition-colors"
                  >
                    <Check size={12} /> Set Default
                  </button>
                )}
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
