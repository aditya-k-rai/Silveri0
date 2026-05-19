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
      <section className="relative max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="relative inline-flex items-center justify-center mb-7">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold/15 via-silver/20 to-transparent blur-xl" />
          <div className="relative w-24 h-24 rounded-full bg-white/80 backdrop-blur border border-silver-200/70 flex items-center justify-center shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]">
            <ShoppingCart size={32} className="text-silver-500" />
          </div>
        </div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-silver-500 mb-3">Your cart is empty</p>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-semibold text-warm-black mb-3 tracking-tight">
          Nothing here — yet.
        </h1>
        <p className="text-muted mb-8 max-w-md mx-auto">Discover handcrafted silver pieces, made to be worn every day.</p>
        <Link
          href="/category/all"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-warm-black text-white text-sm font-medium rounded-full hover:bg-warm-black/85 transition-colors"
        >
          Browse the Collection
          <ChevronRight size={16} />
        </Link>
      </section>
    );
  }

  return (
    <section className="relative">
      {/* Ambient backdrop — soft radial mesh keeps the surface from feeling flat */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-gold/8 blur-3xl" />
        <div className="absolute top-40 -right-32 w-[380px] h-[380px] rounded-full bg-silver-300/30 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-silver-500 mb-6">
          <Link href="/" className="hover:text-warm-black transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-warm-black font-medium">Checkout</span>
        </nav>

        {/* Title bar */}
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-silver-500 mb-2">Secure Checkout</p>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-semibold text-warm-black tracking-tight">
              {step === 0 ? "Your Cart" : step === 1 ? "Shipping" : step === 2 ? "Review" : "Payment"}
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-silver-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            256-bit Encrypted
          </div>
        </div>

        {/* Progress rail */}
        <div className="relative mb-10 md:mb-12">
          {/* Track */}
          <div className="absolute top-5 left-5 right-5 h-px bg-gradient-to-r from-silver-200 via-silver-200 to-silver-200" />
          <div
            className="absolute top-5 left-5 h-px bg-gradient-to-r from-gold via-gold to-gold/70 transition-all duration-500"
            style={{ width: `calc(${(step / (STEPS.length - 1)) * 100}% - ${(step / (STEPS.length - 1)) * 40}px)` }}
          />
          <ol className="relative flex items-start justify-between">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li key={s.label} className="flex flex-col items-center flex-1 min-w-0">
                  <div
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      done
                        ? "bg-warm-black text-white shadow-[0_4px_12px_-2px_rgba(0,0,0,0.25)]"
                        : active
                        ? "bg-gradient-to-br from-gold to-gold/80 text-white shadow-[0_6px_20px_-4px_rgba(201,168,76,0.55)] ring-4 ring-gold/15"
                        : "bg-white text-silver-400 border border-silver-200"
                    }`}
                  >
                    {done ? <Check size={16} strokeWidth={2.5} /> : s.icon}
                  </div>
                  <span
                    className={`mt-2.5 text-[10px] md:text-[11px] uppercase tracking-[0.18em] font-medium transition-colors ${
                      done || active ? "text-warm-black" : "text-silver-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

      {/* Step 0 — Cart Items */}
      {step === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">
          {/* Items list */}
          <SurfaceCard>
            <SectionEyebrow label={`Step 01 · Cart`} title={`${items.length} ${items.length === 1 ? "Item" : "Items"} in your bag`} />
            <div className="mt-5 divide-y divide-silver-200/60">
              {items.map((item) => {
                const lineId = item.cartLineId || item.productId;
                return (
                  <div key={lineId} className="flex items-center gap-4 py-5 first:pt-0 last:pb-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-silver-100 to-silver-50 shrink-0 overflow-hidden relative ring-1 ring-silver-200/60">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[10px] text-silver-400">IMG</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.productId}`} className="text-sm font-medium text-warm-black truncate block hover:text-gold transition-colors">
                        {item.name}
                      </Link>
                      {(item.size || item.chain || item.plating) && (() => {
                        const parts: React.ReactNode[] = [];
                        if (item.size) parts.push(<span key="s">Size <strong className="text-silver-700">{item.size}</strong></span>);
                        if (item.chain) parts.push(<span key="c">{item.chain === 'with' ? 'With Chain' : 'Without Chain'}</span>);
                        if (item.plating) parts.push(<span key="p">{item.plating === 'gold' ? 'Gold Plated' : 'Silver Plated'}</span>);
                        return (
                          <p className="text-[11px] text-silver-500 mt-1 uppercase tracking-wider">
                            {parts.map((node, i) => (
                              <span key={i}>
                                {i > 0 && <span className="mx-1.5 text-silver-300">/</span>}
                                {node}
                              </span>
                            ))}
                          </p>
                        );
                      })()}
                      <p className="text-sm font-semibold text-warm-black mt-1.5 tabular-nums">₹{item.price.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="flex items-center bg-silver-50 border border-silver-200/60 rounded-full p-1">
                      <button
                        onClick={() => updateQuantity(lineId, item.quantity - 1)}
                        className="w-7 h-7 rounded-full hover:bg-white flex items-center justify-center transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-7 text-center text-xs font-semibold tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(lineId, item.quantity + 1)}
                        className="w-7 h-7 rounded-full hover:bg-white flex items-center justify-center transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(lineId)}
                      className="p-2 text-silver-400 hover:text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </SurfaceCard>

          {/* Summary rail */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <SummaryCard subtotal={subtotal} shipping={shipping} discount={0} total={subtotal + shipping} />
            <button
              onClick={() => setStep(1)}
              className="w-full group relative overflow-hidden py-4 bg-warm-black text-white font-medium rounded-2xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.4)] hover:shadow-[0_14px_36px_-12px_rgba(0,0,0,0.45)] transition-all"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                Proceed to Checkout
                <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/20 to-gold/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
            <p className="text-[11px] text-silver-500 text-center">Taxes & final shipping calculated at next steps.</p>
          </div>
        </div>
      )}

      {/* Step 1 — Address */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">
          <div className="space-y-6">
            {/* Saved addresses */}
            {savedAddresses.length > 0 && (
              <SurfaceCard>
                <SectionEyebrow label="Saved" title="Choose a saved address" />
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => {
                    const selected = selectedAddrId === addr.id;
                    return (
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
                        className={`relative text-left p-4 rounded-2xl border transition-all ${
                          selected
                            ? "border-gold bg-gradient-to-br from-gold/5 to-transparent shadow-[0_4px_16px_-6px_rgba(201,168,76,0.35)]"
                            : "border-silver-200/70 hover:border-silver-400"
                        }`}
                      >
                        {selected && (
                          <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                            <Check size={12} className="text-white" strokeWidth={3} />
                          </span>
                        )}
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-7 h-7 rounded-full bg-silver-50 flex items-center justify-center">
                            <MapPin size={13} className="text-gold" />
                          </span>
                          <span className="text-sm font-semibold text-warm-black">{addr.label || "Address"}</span>
                          {addr.isDefault && (
                            <span className="text-[9px] uppercase tracking-[0.18em] font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded-full">Default</span>
                          )}
                        </div>
                        <p className="text-xs text-silver-500 leading-relaxed">{addr.fullName} · {addr.line1}, {addr.city} — {addr.pincode}</p>
                      </button>
                    );
                  })}
                </div>
              </SurfaceCard>
            )}

            {/* Manual address form */}
            <SurfaceCard>
              <SectionEyebrow
                label={savedAddresses.length > 0 ? "New address" : "Step 02 · Shipping"}
                title={savedAddresses.length > 0 ? "Or enter a new address" : "Where should we ship it?"}
              />

              {/* Ordering-for toggle */}
              <div className="mt-5 grid grid-cols-2 gap-2.5 p-1.5 bg-silver-100/70 rounded-2xl">
                {(["myself", "other"] as const).map((mode) => {
                  const active = orderingFor === mode;
                  const Icon = mode === "myself" ? User : UserPlus;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => switchOrderingFor(mode)}
                      aria-pressed={active}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-white text-warm-black shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]"
                          : "text-silver-500 hover:text-warm-black"
                      }`}
                    >
                      <Icon size={15} className={active ? "text-gold" : ""} />
                      {mode === "myself" ? "Ordering for Myself" : "Ordering for Other"}
                    </button>
                  );
                })}
              </div>
              {orderingFor === "myself" && (
                <p className="text-[11px] text-silver-500 mt-3">
                  Using your account details. Switch to <strong className="text-warm-black">Ordering for Other</strong> to ship to someone else.
                </p>
              )}

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Row 1 — Name + Email */}
                <Input
                  label="Full Name"
                  value={address.fullName}
                  onChange={(v) => updateAddress("fullName", v)}
                  disabled={lockMyselfFields}
                  required
                />
                <Input
                  label="Email"
                  value={address.email}
                  onChange={(v) => updateAddress("email", v)}
                  type="email"
                  placeholder="you@example.com"
                  disabled={lockMyselfFields}
                  required
                />

                {/* Row 2 — Phone */}
                <div className="md:col-span-2">
                  <FieldLabel>Phone Number</FieldLabel>
                  <div className="flex gap-2">
                    <select
                      value={address.phoneCountryCode}
                      onChange={(e) => updateAddress("phoneCountryCode", e.target.value)}
                      disabled={lockMyselfFields}
                      className={inputBase + " shrink-0 w-[120px] pr-2"}
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
                      className={inputBase + " flex-1"}
                    />
                  </div>
                </div>

                {/* Row 3 — Address */}
                <div className="md:col-span-2">
                  <Input
                    label="Address"
                    value={address.addressLine1}
                    onChange={(v) => updateAddress("addressLine1", v)}
                    placeholder="House / flat number, building, street"
                  />
                </div>

                {/* Row 4 — Landmark */}
                <div className="md:col-span-2">
                  <Input
                    label="Nearest Landmark (Optional)"
                    value={address.landmark}
                    onChange={(v) => updateAddress("landmark", v)}
                    placeholder="e.g. opposite SBI ATM"
                  />
                </div>

                {/* Row 5 — Pincode */}
                <div>
                  <FieldLabel>
                    Pincode
                    {pincodeValid && pincodeLookup.state === 'loading' && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-normal text-silver-500">
                        <Loader2 size={11} className="animate-spin" /> looking up…
                      </span>
                    )}
                    {pincodeValid && pincodeLookup.state === 'ok' && (
                      <span className="ml-2 text-[10px] font-medium text-emerald-600">✓ auto-filled</span>
                    )}
                    {pincodeValid && pincodeLookup.state === 'not-found' && (
                      <span className="ml-2 text-[10px] font-medium text-red-500">not found — fill manually</span>
                    )}
                  </FieldLabel>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={address.pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    className={inputBase + " tabular-nums tracking-wider"}
                  />
                </div>
                <div className="hidden md:block" />

                {/* Row 6 — City + District */}
                <div>
                  <FieldLabel>City</FieldLabel>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => updateAddress("city", e.target.value)}
                    list="city-options"
                    placeholder="City / locality"
                    className={inputBase}
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

                {/* Row 7 — State */}
                <div className="md:col-span-2">
                  <FieldLabel>State</FieldLabel>
                  <select
                    value={address.state}
                    onChange={(e) => updateAddress("state", e.target.value)}
                    className={inputBase}
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {!canContinue && (
                <p className="text-[11px] text-silver-500 mt-6 inline-flex items-center gap-2 px-3 py-2 bg-amber-50/60 border border-amber-200/50 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Fill in <strong className="text-warm-black mx-1">Name</strong>, <strong className="text-warm-black mx-1">Email</strong> and a valid 6-digit <strong className="text-warm-black mx-1">Pincode</strong> to continue.
                </p>
              )}
            </SurfaceCard>
          </div>

          {/* Summary rail */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <SummaryCard subtotal={subtotal} shipping={shipping} discount={0} total={subtotal + shipping} />
            <div className="flex gap-2">
              <button
                onClick={() => setStep(0)}
                className="px-5 py-3.5 border border-silver-200 bg-white rounded-2xl text-sm font-medium hover:bg-silver-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => canContinue && setStep(2)}
                disabled={!canContinue}
                className="flex-1 group relative overflow-hidden py-3.5 bg-warm-black text-white font-medium rounded-2xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.4)] hover:shadow-[0_14px_36px_-12px_rgba(0,0,0,0.45)] transition-all disabled:bg-silver-300 disabled:shadow-none disabled:cursor-not-allowed"
              >
                <span className="relative z-10 inline-flex items-center gap-2 text-sm">
                  Continue
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Review */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">
          <div className="space-y-6">
            {/* Address summary */}
            <SurfaceCard>
              <div className="flex items-start justify-between">
                <SectionEyebrow label="Step 03 · Review" title="Shipping To" />
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-medium text-warm-black border-b border-warm-black/40 hover:border-warm-black transition-colors"
                >
                  Edit
                </button>
              </div>
              <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                <ReviewRow label="Name" value={address.fullName} />
                {address.email && <ReviewRow label="Email" value={address.email} />}
                <ReviewRow
                  label="Phone"
                  value={address.phone ? `${address.phoneCountryCode} ${address.phone}` : ""}
                />
                <ReviewRow label="Pincode" value={address.pincode} mono />
                <div className="sm:col-span-2"><ReviewRow label="Address" value={address.addressLine1} /></div>
                {address.landmark && <div className="sm:col-span-2"><ReviewRow label="Landmark" value={address.landmark} /></div>}
                <ReviewRow label="City" value={address.city} />
                {address.district && <ReviewRow label="District" value={address.district} />}
                <div className="sm:col-span-2"><ReviewRow label="State" value={address.state} /></div>
              </dl>
            </SurfaceCard>

            {/* Items */}
            <SurfaceCard>
              <SectionEyebrow label="Items" title={`${items.length} ${items.length === 1 ? "Item" : "Items"}`} />
              <div className="mt-5 divide-y divide-silver-200/60">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-silver-100 to-silver-50 shrink-0 overflow-hidden relative ring-1 ring-silver-200/60">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[10px] text-silver-400">IMG</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-warm-black truncate">{item.name}</h3>
                      <p className="text-[11px] text-silver-500 uppercase tracking-wider mt-0.5">Qty <strong className="text-silver-700">{item.quantity}</strong></p>
                    </div>
                    <span className="font-semibold text-sm tabular-nums">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            {/* Promo */}
            <SurfaceCard>
              <SectionEyebrow label="Discount" title="Promo Code" />
              <div className="mt-5 flex gap-2.5">
                <div className="flex-1 relative">
                  <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-silver-400" />
                  <input
                    value={promo}
                    onChange={(e) => setPromo(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className={inputBase + " pl-10 uppercase tracking-wider"}
                  />
                </div>
                <button
                  onClick={() => setPromoApplied(true)}
                  className="px-6 py-3 bg-warm-black text-white text-sm font-medium rounded-2xl hover:bg-warm-black/85 transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoApplied && (
                <div className="flex items-center justify-between mt-3 bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs px-4 py-2.5 rounded-xl">
                  <span className="inline-flex items-center gap-2">
                    <Check size={14} /> WELCOME10 applied — 10% off
                  </span>
                  <button onClick={() => { setPromoApplied(false); setPromo(""); }} className="hover:text-emerald-900">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </SurfaceCard>
          </div>

          {/* Summary rail */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <SummaryCard subtotal={subtotal} shipping={shipping} discount={discount} total={total} />
            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3.5 border border-silver-200 bg-white rounded-2xl text-sm font-medium hover:bg-silver-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 group relative overflow-hidden py-3.5 bg-warm-black text-white font-medium rounded-2xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.4)] hover:shadow-[0_14px_36px_-12px_rgba(0,0,0,0.45)] transition-all"
              >
                <span className="relative z-10 inline-flex items-center gap-2 text-sm">
                  Proceed to Payment
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — Payment */}
      {step === 3 && (
        <div className="max-w-xl mx-auto">
          <SurfaceCard className="text-center !p-8 md:!p-12 relative overflow-hidden">
            {/* Decorative aura behind the icon */}
            <div aria-hidden className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-gradient-to-b from-gold/20 to-transparent blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-warm-black to-warm-black/85 flex items-center justify-center shadow-[0_18px_40px_-14px_rgba(0,0,0,0.45)] mb-6">
                <CreditCard size={28} className="text-gold" />
              </div>

              <p className="text-[11px] uppercase tracking-[0.28em] text-silver-500 mb-2">Step 04 · Payment</p>
              <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-heading)] font-semibold tracking-tight text-warm-black mb-2">
                Almost there.
              </h2>
              <p className="text-silver-500 text-sm max-w-sm mx-auto mb-7">
                You&apos;ll be redirected to Razorpay&apos;s secure checkout to complete the transaction.
              </p>

              {/* Amount band */}
              <div className="inline-flex flex-col items-center gap-1 px-8 py-5 rounded-2xl bg-gradient-to-br from-silver-50 to-white border border-silver-200/70 mb-7">
                <span className="text-[10px] uppercase tracking-[0.24em] text-silver-500">Total Payable</span>
                <span className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-semibold tabular-nums text-warm-black">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              <button
                onClick={() => {
                  clearCart();
                  window.location.href = `/order/ORD-${Date.now().toString(36).toUpperCase()}`;
                }}
                className="w-full group relative overflow-hidden px-12 py-4 bg-gradient-to-r from-gold via-gold to-gold/85 text-white font-semibold rounded-2xl shadow-[0_18px_40px_-14px_rgba(201,168,76,0.65)] hover:shadow-[0_22px_44px_-14px_rgba(201,168,76,0.75)] transition-all text-base"
              >
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  Pay Securely
                  <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>

              <div className="flex items-center justify-center gap-4 mt-5 text-[10px] uppercase tracking-[0.22em] text-silver-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> PCI-DSS
                </span>
                <span className="w-px h-3 bg-silver-200" />
                <span>256-bit SSL</span>
                <span className="w-px h-3 bg-silver-200" />
                <span>Razorpay</span>
              </div>

              <button onClick={() => setStep(2)} className="block mx-auto mt-6 text-xs text-silver-500 hover:text-warm-black transition-colors">
                ← Back to Review
              </button>
            </div>
          </SurfaceCard>
        </div>
      )}
      </div>
    </section>
  );
}

/* ---------- helpers ---------- */

// Shared input class — used by raw <input>/<select> + the <Input> wrapper so
// every field on the form has the same visual language.
const inputBase =
  "w-full bg-white border border-silver-200 rounded-2xl px-4 py-3.5 text-sm text-warm-black placeholder:text-silver-400 " +
  "focus:outline-none focus:border-warm-black focus:ring-4 focus:ring-warm-black/8 transition " +
  "disabled:bg-silver-50 disabled:text-silver-400 disabled:cursor-not-allowed";

function SurfaceCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative bg-white/95 backdrop-blur-sm border border-silver-200/70 rounded-3xl p-6 md:p-7 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_8px_28px_-12px_rgba(15,15,15,0.08)] ${className}`}
    >
      {children}
    </div>
  );
}

function SectionEyebrow({ label, title }: { label: string; title: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.28em] text-silver-500 mb-2">{label}</p>
      <h2 className="font-[family-name:var(--font-heading)] text-xl md:text-2xl font-semibold text-warm-black tracking-tight">
        {title}
      </h2>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="flex items-center text-[11px] uppercase tracking-[0.18em] font-medium text-silver-500 mb-2">
      {children}
    </label>
  );
}

function ReviewRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.2em] text-silver-500 mb-0.5">{label}</dt>
      <dd className={`text-warm-black break-words ${mono ? "tabular-nums tracking-wider" : ""}`}>
        {value || <span className="text-silver-400 italic">—</span>}
      </dd>
    </div>
  );
}

function SummaryCard({
  subtotal,
  shipping,
  discount,
  total,
}: {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-silver-200/70 bg-gradient-to-br from-white to-silver-50/40 p-6 shadow-[0_8px_28px_-12px_rgba(15,15,15,0.08)]">
      <div aria-hidden className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gold/8 blur-3xl pointer-events-none" />
      <p className="text-[10px] uppercase tracking-[0.28em] text-silver-500 mb-4">Order Summary</p>
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-silver-500">Subtotal</span>
          <span className="font-medium text-warm-black tabular-nums">₹{subtotal.toLocaleString("en-IN")}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Discount</span>
            <span className="font-medium tabular-nums">-₹{discount.toLocaleString("en-IN")}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-silver-500">Shipping</span>
          <span className="font-medium text-warm-black tabular-nums">{shipping === 0 ? "Free" : `₹${shipping}`}</span>
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-silver-200/60 flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-[0.28em] text-silver-500">Total</span>
        <span className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-warm-black tabular-nums">
          ₹{total.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}

function Input({
  label, value, onChange, type = "text", placeholder, maxLength, disabled = false, required = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; maxLength?: number; disabled?: boolean; required?: boolean;
}) {
  return (
    <div>
      <FieldLabel>
        {label}
        {required && <span className="ml-1 text-gold">*</span>}
      </FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={inputBase}
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
