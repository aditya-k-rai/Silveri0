"use client";

import { useState } from "react";
import { User, Save, Camera } from "lucide-react";

export default function ProfilePage() {
  const [name, setName] = useState("Priya Sharma");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [email] = useState("priya@example.com");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white border border-silver/40 rounded-2xl p-6 md:p-8">
      <h2 className="text-xl font-[family-name:var(--font-heading)] font-semibold mb-6">Profile Details</h2>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center">
            <User size={32} className="text-gold" />
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-gold text-white rounded-full flex items-center justify-center hover:bg-gold-dark transition-colors">
            <Camera size={14} />
          </button>
        </div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted">{email}</p>
        </div>
      </div>

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
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 transition"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="mt-8 inline-flex items-center gap-2 px-8 py-3 bg-gold hover:bg-gold-dark text-white font-medium rounded-xl transition-colors"
      >
        <Save size={16} /> Save Changes
      </button>

      {saved && (
        <p className="mt-3 text-sm text-green-700 font-medium">Profile updated successfully!</p>
      )}
    </div>
  );
}
