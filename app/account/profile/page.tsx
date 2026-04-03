"use client";

import { useState, useEffect } from "react";
import { User, Save, Camera, MapPin, Loader2 } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import Image from "next/image";

export default function ProfilePage() {
  const { user, userDoc, loading } = useAuthContext();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userDoc) {
      setName(userDoc.name || "");
      setPhone(userDoc.phone || "");
      setLocation(userDoc.location || "");
    }
  }, [userDoc]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    );
  }

  if (!user || !userDoc) return null;

  const email = userDoc.email || user.email || "";
  const photoURL = userDoc.photoURL || user.photoURL || "";

  const handleSave = async () => {
    setError("");
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      setError("Valid 10-digit phone number is required");
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-silver/40 rounded-2xl p-6 md:p-8">
      <h2 className="text-xl font-[family-name:var(--font-heading)] font-semibold mb-6">Profile Details</h2>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-8">
        <div className="relative">
          {photoURL ? (
            <Image
              src={photoURL}
              alt={name}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center">
              <User size={32} className="text-gold" />
            </div>
          )}
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-gold text-white rounded-full flex items-center justify-center hover:bg-gold-dark transition-colors">
            <Camera size={14} />
          </button>
        </div>
        <div>
          <p className="font-medium">{userDoc.name || "User"}</p>
          <p className="text-sm text-muted">{email}</p>
          {userDoc.role === "admin" && (
            <span className="inline-block mt-1 text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full font-medium">
              Admin
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5 mb-4">
          {error}
        </div>
      )}

      <div className="space-y-5 max-w-md">
        <div>
          <label className="block text-sm font-medium text-warm-black mb-1.5">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-black mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full border border-silver rounded-xl px-4 py-3 text-sm bg-silver/10 text-muted cursor-not-allowed"
          />
          <p className="text-xs text-muted mt-1">Email cannot be changed.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-black mb-1.5">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit mobile number"
            className="w-full border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-black mb-1.5">
            <span className="flex items-center gap-1.5"><MapPin size={14} /> Location</span>
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City / State"
            className="w-full border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 transition"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-8 inline-flex items-center gap-2 px-8 py-3 bg-gold hover:bg-gold-dark text-white font-medium rounded-xl transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        {saving ? "Saving..." : "Save Changes"}
      </button>

      {saved && (
        <p className="mt-3 text-sm text-green-700 font-medium">Profile updated successfully!</p>
      )}
    </div>
  );
}
