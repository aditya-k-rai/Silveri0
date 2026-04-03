"use client";

import { useState } from "react";
import { Upload, Save, Globe, Mail, Phone, MessageCircle } from "lucide-react";

export default function AdminSettingsPage() {
  const [announcement, setAnnouncement] = useState("Free shipping on orders above ₹2,000!");
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [socials, setSocials] = useState({
    instagram: "https://instagram.com/silveri",
    facebook: "https://facebook.com/silveri",
    twitter: "https://twitter.com/silveri",
    website: "https://silveri.in",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Hero Banner */}
      <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6">
        <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg mb-4">Hero Banner</h3>
        <div className="border-2 border-dashed border-[#E8E8E8] rounded-2xl p-10 text-center hover:border-[#C9A84C]/40 transition-colors cursor-pointer">
          <Upload size={32} className="mx-auto text-[#7A7585] mb-3" />
          <p className="text-sm text-[#7A7585] mb-1">Drag and drop an image, or click to browse</p>
          <p className="text-xs text-[#7A7585]">Recommended: 1920 x 720px, JPG/PNG, max 2MB</p>
          <input type="file" accept="image/*" className="hidden" />
        </div>
        <div className="mt-4 flex gap-3">
          <div className="w-24 h-16 rounded-lg bg-[#E8E8E8]/40 flex items-center justify-center text-[10px] text-[#7A7585]">
            Current
          </div>
        </div>
      </div>

      {/* Announcement */}
      <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg">Announcement Bar</h3>
          <button
            onClick={() => setAnnouncementEnabled(!announcementEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              announcementEnabled ? "bg-[#C9A84C]" : "bg-[#E8E8E8]"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                announcementEnabled ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>
        <input
          type="text"
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          placeholder="Enter announcement text..."
          className="w-full border border-[#E8E8E8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
        />
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6">
        <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg mb-4">Social Links</h3>
        <div className="space-y-4">
          {[
            { key: "instagram" as const, label: "Instagram", icon: <Globe size={18} /> },
            { key: "facebook" as const, label: "Facebook", icon: <Mail size={18} /> },
            { key: "twitter" as const, label: "Twitter / X", icon: <MessageCircle size={18} /> },
            { key: "website" as const, label: "Website", icon: <Globe size={18} /> },
          ].map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#FDFAF5] flex items-center justify-center text-[#7A7585] shrink-0">
                {s.icon}
              </span>
              <div className="flex-1">
                <label className="block text-xs font-medium text-[#7A7585] mb-1">{s.label}</label>
                <input
                  type="url"
                  value={socials[s.key]}
                  onChange={(e) => setSocials((p) => ({ ...p, [s.key]: e.target.value }))}
                  className="w-full border border-[#E8E8E8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#C9A84C] text-white font-medium rounded-xl hover:bg-[#8A6E2F] transition-colors"
        >
          <Save size={16} /> Save Settings
        </button>
        {saved && <span className="text-sm text-green-700 font-medium">Settings saved!</span>}
      </div>
    </div>
  );
}
