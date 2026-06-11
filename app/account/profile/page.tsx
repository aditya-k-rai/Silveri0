"use client";

import { useState, useEffect } from "react";
import { User, Save, Camera, MapPin, Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { changePassword } from "@/lib/firebase/auth";
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

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

      <hr className="my-10 border-silver/30" />

      <h2 className="text-xl font-[family-name:var(--font-heading)] font-semibold mb-6">Change Password</h2>

      {passwordError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5 mb-4 max-w-md">
          {passwordError}
        </div>
      )}

      {passwordSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-2.5 mb-4 max-w-md">
          {passwordSuccess}
        </div>
      )}

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setPasswordError("");
          setPasswordSuccess("");

          if (!currentPassword) {
            setPasswordError("Current password is required");
            return;
          }
          if (newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters");
            return;
          }
          if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
          }

          setChangingPassword(true);
          try {
            await changePassword(user, currentPassword, newPassword);
            setPasswordSuccess("Password updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
          } catch (err: any) {
            console.error(err);
            if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
              setPasswordError("Incorrect current password");
            } else if (err.code === "auth/weak-password") {
              setPasswordError("New password is too weak");
            } else {
              setPasswordError(err.message || "Failed to update password");
            }
          } finally {
            setChangingPassword(false);
          }
        }}
        className="space-y-5 max-w-md"
      >
        <div>
          <label className="block text-sm font-medium text-warm-black mb-1.5">Current Password</label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-silver rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
            >
              {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-black mb-1.5">New Password</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-silver rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 transition"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
            >
              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-black mb-1.5">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-silver rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 transition"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={changingPassword}
          className="inline-flex items-center gap-2 px-8 py-3 bg-gold hover:bg-gold-dark text-white font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {changingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
          {changingPassword ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
