"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MapPin, Package, CreditCard, Check, Tag, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

/* ---------- Indian states ---------- */
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const STEPS = [
  { label: "Cart", icon: <ShoppingCart size={16} /> },
  { label: "Address", icon: <MapPin size={16} /> },
  { label: "Review", icon: <Package size={16} /> },
  { label: "Payment", icon: <CreditCard size={16} /> },
];

export default function CheckoutPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const [step, setStep] = useState(0);
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [address, setAddress] = useState({
    fullName: "", phone: "", addressLine1: "", addressLine2: "",
    city: "", state: "", pincode: "",
  });

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal > 2000 ? 0 : 99;
  const total = subtotal - discount + shipping;

  const updateAddress = (field: string, value: string) =>
    setAddress((p) => ({ ...p, [field]: value }));

  // Empty cart view
  if (items.length === 0 && step === 0) {
    return (
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-silver/20 flex items-center justify-center mb-6">
          <ShoppingCart size={32} className="text-muted" />
        </div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-warm-black mb-3">Your cart is empty</h1>
        <p className="text-muted mb-6">Looks like you haven&apos;t added anything yet.</p>
        <Link
          href="/category/all"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-white font-medium rounded-xl hover:bg-gold-dark transition-colors"
        >
          Browse Products
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted mb-8">
        <Link href="/" className="hover:text-gold transition-colors">Home</Link>
        <ChevronRight size={14} />
        <span className="text-warm-black font-medium">Checkout</span>
      </nav>

      <h1 className="text-3xl font-[family-name:var(--font-heading)] font-semibold text-warm-black mb-8">Checkout</h1>

      {/* Progress bar */}
      <div className="flex items-center justify-between mb-10">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex-1 flex flex-col items-center relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors z-10 ${
                i <= step ? "bg-gold text-white" : "bg-silver/40 text-muted"
              }`}
            >
              {i < step ? <Check size={18} /> : s.icon}
            </div>
            <span className={`text-xs mt-2 font-medium ${i <= step ? "text-gold" : "text-muted"}`}>{s.label}</span>
            {i < STEPS.length - 1 && (
              <div className={`absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5 ${i < step ? "bg-gold" : "bg-silver/40"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0 — Cart Items */}
      {step === 0 && (
        <div className="space-y-6">
          <div className="bg-white border border-silver/40 rounded-2xl p-6">
            <h2 className="text-lg font-[family-name:var(--font-heading)] font-semibold mb-4">Your Cart ({items.length} items)</h2>
            <div className="divide-y divide-silver/30">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="w-20 h-20 rounded-lg bg-silver/20 shrink-0 overflow-hidden relative">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[10px] text-muted">IMG</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.productId}`} className="text-sm font-medium truncate block hover:text-gold transition-colors">
                      {item.name}
                    </Link>
                    <p className="text-sm text-warm-black font-semibold mt-1">₹{item.price.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border border-silver flex items-center justify-center hover:bg-silver/20 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg border border-silver flex items-center justify-center hover:bg-silver/20 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-2 text-muted hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white border border-silver/40 rounded-2xl p-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
              <div className="flex justify-between text-base font-semibold border-t border-silver/30 pt-3 mt-3">
                <span>Total</span><span>₹{(subtotal + shipping).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep(1)}
            className="w-full py-3.5 bg-gold hover:bg-gold-dark text-white font-medium rounded-xl transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      )}

      {/* Step 1 — Address */}
      {step === 1 && (
        <div className="bg-white border border-silver/40 rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-[family-name:var(--font-heading)] font-semibold mb-6">Shipping Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Full Name" value={address.fullName} onChange={(v) => updateAddress("fullName", v)} />
            <Input label="Phone Number" value={address.phone} onChange={(v) => updateAddress("phone", v)} type="tel" placeholder="+91" />
            <div className="md:col-span-2">
              <Input label="Address Line 1" value={address.addressLine1} onChange={(v) => updateAddress("addressLine1", v)} />
            </div>
            <div className="md:col-span-2">
              <Input label="Address Line 2 (Optional)" value={address.addressLine2} onChange={(v) => updateAddress("addressLine2", v)} />
            </div>
            <Input label="City" value={address.city} onChange={(v) => updateAddress("city", v)} />
            <div>
              <label className="block text-sm font-medium text-warm-black mb-1.5">State</label>
              <select
                value={address.state}
                onChange={(e) => updateAddress("state", e.target.value)}
                className="w-full border border-silver rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold/40"
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Input label="Pincode" value={address.pincode} onChange={(v) => updateAddress("pincode", v)} maxLength={6} />
          </div>
          <div className="flex gap-3 mt-8">
            <button onClick={() => setStep(0)} className="px-6 py-3.5 border border-silver rounded-xl text-sm font-medium hover:bg-silver/10 transition-colors">
              Back
            </button>
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3.5 bg-gold hover:bg-gold-dark text-white font-medium rounded-xl transition-colors"
            >
              Continue to Review
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Review */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Address summary */}
          <div className="bg-white border border-silver/40 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-[family-name:var(--font-heading)] font-semibold">Shipping To</h2>
              <button onClick={() => setStep(1)} className="text-sm text-gold hover:underline">Edit</button>
            </div>
            <p className="text-sm text-muted">
              {address.fullName || "Name"}, {address.addressLine1 || "Address"}, {address.city || "City"}, {address.state || "State"} — {address.pincode || "000000"}
            </p>
            <p className="text-sm text-muted">Phone: {address.phone || "+91 XXXXX XXXXX"}</p>
          </div>

          {/* Items */}
          <div className="bg-white border border-silver/40 rounded-2xl p-6">
            <h2 className="text-lg font-[family-name:var(--font-heading)] font-semibold mb-4">Order Items</h2>
            <div className="divide-y divide-silver/30">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="w-16 h-16 rounded-lg bg-silver/30 shrink-0 overflow-hidden relative">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[10px] text-muted">IMG</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{item.name}</h3>
                    <p className="text-xs text-muted">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium text-sm">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Promo */}
          <div className="bg-white border border-silver/40 rounded-2xl p-6">
            <h2 className="text-lg font-[family-name:var(--font-heading)] font-semibold mb-4">Promo Code</h2>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="w-full border border-silver rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                />
              </div>
              <button
                onClick={() => setPromoApplied(true)}
                className="px-6 py-3 bg-warm-black text-white text-sm font-medium rounded-xl hover:bg-warm-black/80 transition-colors"
              >
                Apply
              </button>
            </div>
            {promoApplied && (
              <div className="flex items-center justify-between mt-3 bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg">
                <span>WELCOME10 applied — 10% off</span>
                <button onClick={() => { setPromoApplied(false); setPromo(""); }}>
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white border border-silver/40 rounded-2xl p-6">
            <h2 className="text-lg font-[family-name:var(--font-heading)] font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>-₹{discount.toLocaleString("en-IN")}</span></div>}
              <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
              <div className="flex justify-between text-base font-semibold border-t border-silver/30 pt-3 mt-3">
                <span>Total</span><span>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="px-6 py-3.5 border border-silver rounded-xl text-sm font-medium hover:bg-silver/10 transition-colors">
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3.5 bg-gold hover:bg-gold-dark text-white font-medium rounded-xl transition-colors"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Payment */}
      {step === 3 && (
        <div className="bg-white border border-silver/40 rounded-2xl p-6 md:p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gold/10 flex items-center justify-center mb-6">
            <CreditCard size={28} className="text-gold" />
          </div>
          <h2 className="text-2xl font-[family-name:var(--font-heading)] font-semibold mb-3">Payment</h2>
          <p className="text-muted mb-2">Total: <span className="font-semibold text-warm-black">₹{total.toLocaleString("en-IN")}</span></p>
          <p className="text-sm text-muted mb-8 max-w-md mx-auto">
            Click the button below to pay securely via Razorpay. You will be redirected to complete the transaction.
          </p>
          <button
            onClick={() => {
              clearCart();
              window.location.href = `/order/ORD-${Date.now().toString(36).toUpperCase()}`;
            }}
            className="px-12 py-4 bg-gold hover:bg-gold-dark text-white font-semibold rounded-xl transition-colors text-lg"
          >
            Pay ₹{total.toLocaleString("en-IN")}
          </button>
          <button onClick={() => setStep(2)} className="block mx-auto mt-4 text-sm text-muted hover:text-gold transition-colors">
            Back to Review
          </button>
        </div>
      )}
    </section>
  );
}

/* ---------- helpers ---------- */
function Input({
  label, value, onChange, type = "text", placeholder, maxLength,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-warm-black mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 transition"
      />
    </div>
  );
}
