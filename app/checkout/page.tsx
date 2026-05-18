"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MapPin, Package, CreditCard, Check, Tag, Trash2, Plus, Minus, ShoppingCart, Loader2, User, UserPlus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthContext } from "@/context/AuthContext";
import type { UserAddress } from "@/types";
import { INDIAN_STATES, DIAL_CODES, DEFAULT_DIAL_CODE } from "@/lib/utils/india";
import { isValidPincode, lookupPincode } from "@/lib/utils/pincode";

const STEPS = [
  { label: "Cart", icon: <ShoppingCart size={16} /> },
  { label: "Address", icon: <MapPin size={16} /> },
  { label: "Review", icon: <Package size={16} /> },
  { label: "Payment", icon: <CreditCard size={16} /> },
];

export default function CheckoutPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const { user, userDoc } = useAuthContext();
  const savedAddresses: UserAddress[] = (userDoc?.addresses as UserAddress[]) || [];

  const [step, setStep] = useState(0);
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  // Account-derived contact details — used to pre-fill the form when "Myself"
  // is selected and to lock those three fields read-only.
  const accountContact = useMemo(() => {
    const phoneSplit = splitPhone(userDoc?.phone);
    return {
      fullName: userDoc?.name || user?.displayName || "",
      email: userDoc?.email || user?.email || "",
      phoneCountryCode: phoneSplit.code,
      phone: phoneSplit.number,
    };
  }, [userDoc?.name, userDoc?.email, userDoc?.phone, user?.displayName, user?.email]);

  // "Myself" — locked to account contact details. "Other" — blank, editable.
  const [orderingFor, setOrderingFor] = useState<"myself" | "other">("myself");

  // Pre-fill with default address if available
  const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
  const [address, setAddress] = useState({
    fullName: accountContact.fullName || defaultAddr?.fullName || "",
    email: accountContact.email || defaultAddr?.email || "",
    phoneCountryCode: accountContact.phone
      ? accountContact.phoneCountryCode
      : defaultAddr?.phoneCountryCode || DEFAULT_DIAL_CODE,
    phone: accountContact.phone || defaultAddr?.phone || "",
    addressLine1: defaultAddr?.line1 || "",
    landmark: defaultAddr?.landmark || defaultAddr?.line2 || "",
    pincode: defaultAddr?.pincode || "",
    city: defaultAddr?.city || "",
    district: defaultAddr?.district || "",
    state: defaultAddr?.state || "",
  });
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(defaultAddr?.id || null);

  const switchOrderingFor = (next: "myself" | "other") => {
    setOrderingFor(next);
    if (next === "myself") {
      // Re-fetch from account and lock
      setAddress((p) => ({
        ...p,
        fullName: accountContact.fullName,
        email: accountContact.email,
        phoneCountryCode: accountContact.phone
          ? accountContact.phoneCountryCode
          : DEFAULT_DIAL_CODE,
        phone: accountContact.phone,
      }));
    } else {
      // Start fresh — clear the three locked fields
      setAddress((p) => ({
        ...p,
        fullName: "",
        email: "",
        phoneCountryCode: DEFAULT_DIAL_CODE,
        phone: "",
      }));
      setSelectedAddrId(null);
    }
  };

  // ── Pincode auto-lookup ─────────────────────────────────────────────
  // When the customer types a full 6-digit pincode we hit India Post's public
  // API once and fill City / District / State. Editable afterwards.
  const [pincodeLookup, setPincodeLookup] = useState<{
    state: 'idle' | 'loading' | 'ok' | 'not-found' | 'error';
    cities: string[];
  }>({ state: 'idle', cities: [] });
  const lastLookedUpPincode = useRef<string>('');

  // Trigger pincode auto-fill from the onChange handler, not a useEffect.
  // React 19's set-state-in-effect rule disallows the latter; an event-
  // driven lookup is also semantically cleaner — we only hit the API in
  // direct response to user typing, not on every re-render.
  const runPincodeLookup = useCallback(async (code: string) => {
    if (code === lastLookedUpPincode.current) return;
    lastLookedUpPincode.current = code;
    setPincodeLookup({ state: 'loading', cities: [] });
    try {
      const result = await lookupPincode(code);
      if (!result) {
        setPincodeLookup({ state: 'not-found', cities: [] });
        return;
      }
      setPincodeLookup({ state: 'ok', cities: result.cities });
      setAddress((prev) => ({
        ...prev,
        // Only overwrite if the customer hadn't already typed something custom
        city: prev.city || result.city,
        district: prev.district || result.district,
        state: prev.state || result.state,
      }));
    } catch {
      setPincodeLookup({ state: 'error', cities: [] });
    }
  }, []);

  const handlePincodeChange = (raw: string) => {
    const cleaned = raw.replace(/\D/g, '').slice(0, 6);
    updateAddress('pincode', cleaned);
    if (isValidPincode(cleaned)) runPincodeLookup(cleaned);
  };

  const pincodeValid = isValidPincode(address.pincode);

  // Continue-button gate: Name, Email, and a valid 6-digit Pincode required.
  const canContinue =
    address.fullName.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim()) &&
    pincodeValid;

  const lockMyselfFields = orderingFor === "myself";

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
              {items.map((item) => {
                // Backwards-compat for legacy persisted carts that lack cartLineId
                const lineId = item.cartLineId || item.productId;
                return (
                <div key={lineId} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
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
                    {/* Selected variant options — size, chain, plating — shown beneath name */}
                    {(item.size || item.chain || item.plating) && (() => {
                      const parts: React.ReactNode[] = [];
                      if (item.size) parts.push(<span key="s">Size: <strong className="text-silver-700">{item.size}</strong></span>);
                      if (item.chain) parts.push(<span key="c">{item.chain === 'with' ? 'With Chain' : 'Without Chain'}</span>);
                      if (item.plating) parts.push(<span key="p">{item.plating === 'gold' ? 'Gold Plated' : 'Silver Plated'}</span>);
                      return (
                        <p className="text-[11px] text-muted mt-0.5">
                          {parts.map((node, i) => (
                            <span key={i}>
                              {i > 0 && <span className="mx-1.5">·</span>}
                              {node}
                            </span>
                          ))}
                        </p>
                      );
                    })()}
                    <p className="text-sm text-warm-black font-semibold mt-1">₹{item.price.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(lineId, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border border-silver flex items-center justify-center hover:bg-silver/20 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(lineId, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg border border-silver flex items-center justify-center hover:bg-silver/20 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(lineId)}
                    className="p-2 text-muted hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                );
              })}
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
        <div className="space-y-6">
          {/* Saved addresses */}
          {savedAddresses.length > 0 && (
            <div className="bg-white border border-silver/40 rounded-2xl p-6">
              <h2 className="text-lg font-[family-name:var(--font-heading)] font-semibold mb-4">Saved Addresses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => {
                      setOrderingFor("other");
                      setSelectedAddrId(addr.id);
                      setAddress({
                        fullName: addr.fullName,
                        email: addr.email || userDoc?.email || user?.email || "",
                        phoneCountryCode: addr.phoneCountryCode || DEFAULT_DIAL_CODE,
                        phone: addr.phone,
                        addressLine1: addr.line1,
                        landmark: addr.landmark || addr.line2 || "",
                        pincode: addr.pincode,
                        city: addr.city,
                        district: addr.district || "",
                        state: addr.state,
                      });
                    }}
                    className={`text-left p-4 rounded-xl border-2 transition-colors ${
                      selectedAddrId === addr.id
                        ? "border-gold bg-gold/5"
                        : "border-silver/40 hover:border-silver"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold flex items-center gap-1.5">
                        <MapPin size={14} className="text-gold" />
                        {addr.label || "Address"}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded-full">Default</span>
                      )}
                    </div>
                    <p className="text-xs text-muted">{addr.fullName}, {addr.line1}, {addr.city} — {addr.pincode}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Manual address form */}
          <div className="bg-white border border-silver/40 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-[family-name:var(--font-heading)] font-semibold mb-4">
              {savedAddresses.length > 0 ? "Or Enter New Address" : "Shipping Address"}
            </h2>

            {/* Ordering-for toggle: Myself locks contact fields to the account;
                Other clears them so a fresh recipient can be entered. */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => switchOrderingFor("myself")}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                  orderingFor === "myself"
                    ? "border-gold bg-gold/5 text-warm-black"
                    : "border-silver/40 text-muted hover:border-silver"
                }`}
                aria-pressed={orderingFor === "myself"}
              >
                <User size={16} className={orderingFor === "myself" ? "text-gold" : ""} />
                Ordering for Myself
              </button>
              <button
                type="button"
                onClick={() => switchOrderingFor("other")}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                  orderingFor === "other"
                    ? "border-gold bg-gold/5 text-warm-black"
                    : "border-silver/40 text-muted hover:border-silver"
                }`}
                aria-pressed={orderingFor === "other"}
              >
                <UserPlus size={16} className={orderingFor === "other" ? "text-gold" : ""} />
                Ordering for Other
              </button>
            </div>
            {orderingFor === "myself" && (
              <p className="text-xs text-muted mb-5 -mt-2">
                Using your account details. Switch to <strong>Ordering for Other</strong> to ship to someone else.
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Row 1 — Name + Email */}
            <Input
              label="Full Name"
              value={address.fullName}
              onChange={(v) => updateAddress("fullName", v)}
              disabled={lockMyselfFields}
            />
            <Input
              label="Email"
              value={address.email}
              onChange={(v) => updateAddress("email", v)}
              type="email"
              placeholder="you@example.com"
              disabled={lockMyselfFields}
            />

            {/* Row 2 — Phone (country code + number) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-warm-black mb-1.5">Phone Number</label>
              <div className="flex gap-2">
                <select
                  value={address.phoneCountryCode}
                  onChange={(e) => updateAddress("phoneCountryCode", e.target.value)}
                  disabled={lockMyselfFields}
                  className="shrink-0 w-[120px] border border-silver rounded-xl px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:bg-silver/15 disabled:text-muted disabled:cursor-not-allowed"
                  aria-label="Country dial code"
                >
                  {DIAL_CODES.map((d) => (
                    <option key={d.code} value={d.code}>{d.flag} {d.code}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={address.phone}
                  onChange={(e) => updateAddress("phone", e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit number"
                  maxLength={15}
                  disabled={lockMyselfFields}
                  className="flex-1 w-full border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:bg-silver/15 disabled:text-muted disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Row 3 — Address line */}
            <div className="md:col-span-2">
              <Input
                label="Address"
                value={address.addressLine1}
                onChange={(v) => updateAddress("addressLine1", v)}
                placeholder="House / flat number, building, street"
              />
            </div>

            {/* Row 4 — Nearest Landmark */}
            <div className="md:col-span-2">
              <Input
                label="Nearest Landmark (Optional)"
                value={address.landmark}
                onChange={(v) => updateAddress("landmark", v)}
                placeholder="e.g. opposite SBI ATM"
              />
            </div>

            {/* Row 5 — Pincode (with live lookup status) */}
            <div>
              <label className="block text-sm font-medium text-warm-black mb-1.5">
                Pincode
                {pincodeValid && pincodeLookup.state === 'loading' && (
                  <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-normal text-muted">
                    <Loader2 size={12} className="animate-spin" /> looking up…
                  </span>
                )}
                {pincodeValid && pincodeLookup.state === 'ok' && (
                  <span className="ml-2 text-[11px] font-normal text-emerald-600">✓ auto-filled</span>
                )}
                {pincodeValid && pincodeLookup.state === 'not-found' && (
                  <span className="ml-2 text-[11px] font-normal text-red-500">not found — fill manually</span>
                )}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={address.pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                placeholder="6-digit pincode"
                maxLength={6}
                className="w-full border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </div>

            {/* Row 5 right — empty spacer on desktop (keeps the 2-col layout balanced) */}
            <div className="hidden md:block" />

            {/* Row 6 — City + District (auto-filled from pincode, editable) */}
            <div>
              <label className="block text-sm font-medium text-warm-black mb-1.5">City</label>
              <input
                type="text"
                value={address.city}
                onChange={(e) => updateAddress("city", e.target.value)}
                list="city-options"
                placeholder="City / locality"
                className="w-full border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
              {pincodeLookup.cities.length > 1 && (
                <datalist id="city-options">
                  {pincodeLookup.cities.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              )}
            </div>

            <Input
              label="District"
              value={address.district}
              onChange={(v) => updateAddress("district", v)}
              placeholder="District"
            />

            {/* Row 7 — State (dropdown) */}
            <div className="md:col-span-2">
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
          </div>
          {!canContinue && (
            <p className="text-xs text-muted mt-6">
              Please fill in <strong>Name</strong>, <strong>Email</strong> and a valid 6-digit <strong>Pincode</strong> to continue.
            </p>
          )}
          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep(0)} className="px-6 py-3.5 border border-silver rounded-xl text-sm font-medium hover:bg-silver/10 transition-colors">
              Back
            </button>
            <button
              onClick={() => canContinue && setStep(2)}
              disabled={!canContinue}
              className="flex-1 py-3.5 bg-gold hover:bg-gold-dark text-white font-medium rounded-xl transition-colors disabled:bg-silver/40 disabled:cursor-not-allowed disabled:hover:bg-silver/40"
            >
              Continue to Review
            </button>
          </div>
          </div>
        </div>
      )}

      {/* Step 2 — Review */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Address summary */}
          <div className="bg-white border border-silver/40 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-[family-name:var(--font-heading)] font-semibold">Shipping To</h2>
              <button onClick={() => setStep(1)} className="text-sm text-gold hover:underline">Edit</button>
            </div>
            <dl className="text-sm space-y-1.5">
              <ReviewRow label="Name" value={address.fullName} />
              {address.email && <ReviewRow label="Email" value={address.email} />}
              <ReviewRow
                label="Phone"
                value={address.phone ? `${address.phoneCountryCode} ${address.phone}` : ""}
              />
              <ReviewRow label="Address" value={address.addressLine1} />
              {address.landmark && <ReviewRow label="Landmark" value={address.landmark} />}
              <ReviewRow label="City" value={address.city} />
              {address.district && <ReviewRow label="District" value={address.district} />}
              <ReviewRow label="State" value={address.state} />
              <ReviewRow label="Pincode" value={address.pincode} />
            </dl>
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
function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-muted">{label}</dt>
      <dd className="text-warm-black break-words">{value || <span className="text-muted italic">—</span>}</dd>
    </div>
  );
}

function Input({
  label, value, onChange, type = "text", placeholder, maxLength, disabled = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; maxLength?: number; disabled?: boolean;
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
        disabled={disabled}
        className="w-full border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 transition disabled:bg-silver/15 disabled:text-muted disabled:cursor-not-allowed"
      />
    </div>
  );
}

/**
 * Split a stored phone string into a dial-code + local number. Accepts inputs
 * like "+919812345678", "+91 9812345678", or "9812345678" (no prefix). When
 * the prefix isn't a known DIAL_CODES entry we fall back to +91 and keep all
 * digits as the local number.
 */
function splitPhone(raw: string | undefined | null): { code: string; number: string } {
  if (!raw) return { code: DEFAULT_DIAL_CODE, number: "" };
  const trimmed = String(raw).trim();
  const match = trimmed.match(/^\+(\d{1,4})\s*(.*)$/);
  if (match) {
    const candidate = `+${match[1]}`;
    const rest = match[2].replace(/\D/g, "");
    const known = DIAL_CODES.some((d) => d.code === candidate);
    return known ? { code: candidate, number: rest } : { code: DEFAULT_DIAL_CODE, number: trimmed.replace(/\D/g, "") };
  }
  return { code: DEFAULT_DIAL_CODE, number: trimmed.replace(/\D/g, "") };
}
