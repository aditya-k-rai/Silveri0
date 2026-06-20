"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import {
  ChevronRight, MapPin, Package, CreditCard, Check, Tag, Trash2, Plus, Minus,
  ShoppingCart, Loader2, User, UserPlus, LogIn, Phone, ShieldCheck,
  Sparkles, X, AlertCircle,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthContext } from "@/context/AuthContext";
import type { UserAddress } from "@/types";
import { INDIAN_STATES, DIAL_CODES, DEFAULT_DIAL_CODE } from "@/lib/utils/india";
import { isValidPincode, lookupPincode } from "@/lib/utils/pincode";
import { signInWithGoogleIdToken } from "@/lib/firebase/auth";
import { auth } from "@/lib/firebase/client";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { trackBeginCheckout, trackRemoveFromCart, trackPurchase } from "@/lib/analytics/gtm";

/* ──────────────── Razorpay window type ──────────────── */
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
}
interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: () => void) => void;
}

/* ──────────────── Steps ──────────────── */
const STEPS = [
  { label: "Cart", icon: <ShoppingCart size={16} /> },
  { label: "Address", icon: <MapPin size={16} /> },
  { label: "Review", icon: <Package size={16} /> },
  { label: "Payment", icon: <CreditCard size={16} /> },
];

const STEP_PARAM_TO_INDEX: Record<string, number> = {
  cart: 0, address: 1, review: 2, payment: 3,
};

/* ──────────────── Root export ──────────────── */
export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <CheckoutInner />
    </Suspense>
  );
}

function CheckoutFallback() {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-12 flex items-center justify-center min-h-[60vh]">
      <Loader2 size={28} className="text-silver-400 animate-spin" />
    </section>
  );
}

/* ──────────────── Promo state type ──────────────── */
interface PromoState {
  status: "idle" | "loading" | "valid" | "invalid";
  promoId?: string;
  code?: string;
  type?: string;
  discountAmount: number;
  message?: string;
  error?: string;
}

/* ──────────────── Main component ──────────────── */
function CheckoutInner() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const { user, userDoc, loading: authLoading } = useAuthContext();
  const savedAddresses: UserAddress[] = (userDoc?.addresses as UserAddress[]) || [];

  const searchParams = useSearchParams();
  const [step, setStep] = useState(() => {
    const param = searchParams?.get("step");
    return param && STEP_PARAM_TO_INDEX[param] !== undefined ? STEP_PARAM_TO_INDEX[param] : 0;
  });

  // ── Promo state ────────────────────────────────────────────────────────
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<PromoState>({ status: "idle", discountAmount: 0 });
  const [showPromoAnimation, setShowPromoAnimation] = useState(false);

  // ── Payment state ──────────────────────────────────────────────────────
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "creating" | "paying" | "verifying" | "success" | "failed">("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [razorpayReady, setRazorpayReady] = useState(false);

  // ── Guest login / phone collection state ──────────────────────────────
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneDialCode, setPhoneDialCode] = useState(DEFAULT_DIAL_CODE);
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  // ── Account-derived contact ────────────────────────────────────────────
  const accountContact = useMemo(() => {
    const phoneSplit = splitPhone(userDoc?.phone);
    return {
      fullName: userDoc?.name || user?.displayName || "",
      email: userDoc?.email || user?.email || "",
      phoneCountryCode: phoneSplit.code,
      phone: phoneSplit.number,
    };
  }, [userDoc?.name, userDoc?.email, userDoc?.phone, user?.displayName, user?.email]);

  const [orderingFor, setOrderingFor] = useState<"myself" | "other">("myself");
  const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];

  const [address, setAddress] = useState({
    fullName: accountContact.fullName || defaultAddr?.fullName || "",
    email: accountContact.email || defaultAddr?.email || "",
    phoneCountryCode: accountContact.phone ? accountContact.phoneCountryCode : defaultAddr?.phoneCountryCode || DEFAULT_DIAL_CODE,
    phone: accountContact.phone || defaultAddr?.phone || "",
    addressLine1: defaultAddr?.line1 || "",
    landmark: defaultAddr?.landmark || defaultAddr?.line2 || "",
    pincode: defaultAddr?.pincode || "",
    city: defaultAddr?.city || "",
    district: defaultAddr?.district || "",
    state: defaultAddr?.state || "",
  });
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(defaultAddr?.id || null);

  // ── Pincode lookup ─────────────────────────────────────────────────────
  const [pincodeLookup, setPincodeLookup] = useState<{
    state: "idle" | "loading" | "ok" | "not-found" | "error";
    cities: string[];
  }>({ state: "idle", cities: [] });
  const lastLookedUpPincode = useRef<string>("");

  const runPincodeLookup = useCallback(async (code: string) => {
    if (code === lastLookedUpPincode.current) return;
    lastLookedUpPincode.current = code;
    setPincodeLookup({ state: "loading", cities: [] });
    try {
      const result = await lookupPincode(code);
      if (!result) { setPincodeLookup({ state: "not-found", cities: [] }); return; }
      setPincodeLookup({ state: "ok", cities: result.cities });
      setAddress((prev) => ({
        ...prev,
        city: prev.city || result.city,
        district: prev.district || result.district,
        state: prev.state || result.state,
      }));
    } catch {
      setPincodeLookup({ state: "error", cities: [] });
    }
  }, []);

  const handlePincodeChange = (raw: string) => {
    const cleaned = raw.replace(/\D/g, "").slice(0, 6);
    updateAddress("pincode", cleaned);
    if (isValidPincode(cleaned)) runPincodeLookup(cleaned);
  };

  const pincodeValid = isValidPincode(address.pincode);
  const canContinue =
    address.fullName.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim()) &&
    pincodeValid;

  const lockMyselfFields = !!user && orderingFor === "myself";

  const switchOrderingFor = (next: "myself" | "other") => {
    setOrderingFor(next);
    if (next === "myself") {
      setAddress((p) => ({
        ...p,
        fullName: accountContact.fullName,
        email: accountContact.email,
        phoneCountryCode: accountContact.phone ? accountContact.phoneCountryCode : DEFAULT_DIAL_CODE,
        phone: accountContact.phone,
      }));
    } else {
      setAddress((p) => ({ ...p, fullName: "", email: "", phoneCountryCode: DEFAULT_DIAL_CODE, phone: "" }));
      setSelectedAddrId(null);
    }
  };

  // ── Totals ─────────────────────────────────────────────────────────────
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = promo.status === "valid" ? promo.discountAmount : 0;
  const shipping = subtotal > 2000 ? 0 : 99;
  const total = subtotal - discount + shipping;

  const updateAddress = (field: string, value: string) =>
    setAddress((p) => ({ ...p, [field]: value }));

  // ── Promo validation ───────────────────────────────────────────────────
  const handleApplyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromo({ status: "loading", discountAmount: 0 });
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, cartTotal: subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromo({
          status: "valid",
          promoId: data.promoId,
          code: data.code,
          type: data.type,
          discountAmount: data.discountAmount,
          message: data.message,
        });
        setShowPromoAnimation(true);
        setTimeout(() => setShowPromoAnimation(false), 3000);
      } else {
        setPromo({ status: "invalid", discountAmount: 0, error: data.error });
      }
    } catch {
      setPromo({ status: "invalid", discountAmount: 0, error: "Something went wrong. Try again." });
    }
  };

  const clearPromo = () => {
    setPromo({ status: "idle", discountAmount: 0 });
    setPromoInput("");
  };

  // ── Google sign-in (inline, no redirect) ──────────────────────────────
  const handleGoogleSignIn = useCallback(async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      const g = window.google?.accounts?.id;
      if (!g) throw new Error("Google sign-in not loaded. Please refresh the page.");
      await new Promise<void>((resolve, reject) => {
        g.initialize({
          client_id:
            process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
            "869948351660-pci4pd3m47oo39ndm32upd5m6jio4b9l.apps.googleusercontent.com",
          callback: async (response: { credential: string }) => {
            try {
              await signInWithGoogleIdToken(response.credential);
              resolve();
            } catch (e) { reject(e); }
          },
          auto_select: false,
          use_fedcm_for_prompt: true,
        });
        g.prompt();
      });
    } catch (err) {
      console.error("Google sign-in failed:", err);
    } finally {
      setGoogleLoading(false);
    }
  }, [googleLoading]);


  // ── Phone save ─────────────────────────────────────────────────────────
  const handleSavePhone = async () => {
    if (!user || !db) return;
    const num = phoneInput.replace(/\D/g, "");
    if (num.length < 10) { setPhoneError("Please enter a valid 10-digit number"); return; }
    setPhoneSaving(true);
    setPhoneError("");
    try {
      await updateDoc(doc(db, "users", user.uid), {
        phone: `${phoneDialCode}${num}`,
      });
      setShowPhoneModal(false);
    } catch {
      setPhoneError("Failed to save phone. Please try again.");
    } finally {
      setPhoneSaving(false);
    }
  };

  // ── Needs phone check ──────────────────────────────────────────────────
  const userHasPhone = useMemo(() => {
    if (!userDoc) return false;
    const { number } = splitPhone(userDoc.phone);
    return number.replace(/\D/g, "").length >= 10;
  }, [userDoc]);

  // ── Real Razorpay payment flow ─────────────────────────────────────────
  const handlePay = async () => {
    if (!user || !razorpayReady) return;
    if (!userHasPhone) { setShowPhoneModal(true); return; }

    setPaymentStatus("creating");
    setPaymentError(null);

    try {
      // 1. Get Firebase ID token
      const idToken = await user.getIdToken();

      // 2. Create Razorpay order on server
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image || "",
          })),
          address: {
            fullName: address.fullName,
            email: address.email,
            phoneCountryCode: address.phoneCountryCode,
            phone: address.phone,
            line1: address.addressLine1,
            landmark: address.landmark,
            pincode: address.pincode,
            city: address.city,
            district: address.district,
            state: address.state,
          },
          shipping,
          promoId: promo.status === "valid" ? promo.promoId : undefined,
          promoCode: promo.status === "valid" ? promo.code : undefined,
          promoDiscount: promo.status === "valid" ? promo.discountAmount : 0,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

      setPaymentStatus("paying");

      // 3. Open Razorpay modal
      const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!rzpKey || rzpKey.includes("xxxx")) throw new Error("Payment gateway not configured");

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: rzpKey,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Silveri Jewellery",
          description: `Order of ${items.length} item${items.length > 1 ? "s" : ""}`,
          image: "/favicon.ico",
          order_id: orderData.orderId,
          prefill: {
            name: address.fullName,
            email: address.email,
            contact: `${address.phoneCountryCode}${address.phone}`.replace(/\s/g, ""),
          },
          theme: { color: "#C9A84C" },
          modal: {
            ondismiss: () => {
              setPaymentStatus("idle");
              reject(new Error("dismissed"));
            },
          },
          handler: async (response) => {
            try {
              setPaymentStatus("verifying");

              // 4. Verify signature on server
              const freshToken = await user.getIdToken();
              const verifyRes = await fetch("/api/razorpay/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${freshToken}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");

              // 5. Clear cart + redirect to order page
              clearCart();
              trackPurchase(response.razorpay_order_id, items, total, shipping);
              setPaymentStatus("success");
              resolve();
              window.location.href = `/order/${response.razorpay_order_id}`;
            } catch (e) {
              reject(e);
            }
          },
        });
        rzp.open();
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "dismissed") return;
      console.error("Payment error:", err);
      setPaymentStatus("failed");
      setPaymentError(err instanceof Error ? err.message : "Payment failed. Please try again.");
    }
  };

  // ── Empty cart ──────────────────────────────────────────────────────────
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
          Browse the Collection <ChevronRight size={16} />
        </Link>
      </section>
    );
  }

  // ── Guest wall — shown instead of checkout when not logged in ──────────
  if (!authLoading && !user && step > 0) {
    return (
      <section className="relative max-w-2xl mx-auto px-4 py-20 text-center">
        <Script src="https://accounts.google.com/gsi/client" async />
        <div className="relative inline-flex items-center justify-center mb-7">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold/20 to-transparent blur-2xl" />
          <div className="relative w-24 h-24 rounded-full bg-white border border-silver-200/70 flex items-center justify-center shadow-lg">
            <LogIn size={32} className="text-gold" />
          </div>
        </div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-silver-500 mb-3">Sign in required</p>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-semibold text-warm-black mb-3 tracking-tight">
          Please sign in to continue
        </h1>
        <p className="text-muted mb-8 max-w-sm mx-auto text-sm leading-relaxed">
          We need your account to keep your order safe, send updates, and track your delivery.
        </p>
        <button
          id="checkout-google-signin"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="inline-flex items-center gap-3 px-8 py-4 bg-white border border-silver-200 rounded-2xl text-sm font-medium text-warm-black hover:bg-silver-50 hover:border-silver-300 transition-all shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <Loader2 size={18} className="animate-spin text-gold" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
          )}
          Continue with Google
        </button>
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.2em] text-silver-400">
          <ShieldCheck size={13} className="text-emerald-500" />
          <span>Secure · Encrypted · No spam</span>
        </div>
        <button
          onClick={() => setStep(0)}
          className="block mx-auto mt-8 text-xs text-silver-500 hover:text-warm-black transition-colors"
        >
          ← Back to Cart
        </button>
      </section>
    );
  }

  return (
    <>
      {/* Razorpay SDK */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayReady(true)}
        strategy="afterInteractive"
      />
      {/* Google GSI for checkout login */}
      <Script src="https://accounts.google.com/gsi/client" async strategy="afterInteractive" />

      {/* Phone collection modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-7 shadow-2xl animate-[fadeInUp_0.25s_ease]">
            <button
              onClick={() => setShowPhoneModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-silver-100 flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center mb-5">
              <Phone size={24} className="text-gold" />
            </div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-warm-black mb-1">
              One last step
            </h2>
            <p className="text-sm text-silver-500 mb-6">
              We need your phone number to confirm your delivery and send order updates.
            </p>
            <div className="flex gap-2 mb-4">
              <select
                value={phoneDialCode}
                onChange={(e) => setPhoneDialCode(e.target.value)}
                className="shrink-0 w-[108px] bg-white border border-silver-200 rounded-2xl pl-3 pr-2 py-3 text-sm text-warm-black focus:outline-none focus:border-warm-black focus:ring-4 focus:ring-warm-black/8 transition"
                aria-label="Country dial code"
              >
                {DIAL_CODES.map((d) => (
                  <option key={d.code} value={d.code}>{d.flag} {d.code}</option>
                ))}
              </select>
              <input
                type="tel"
                inputMode="numeric"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit number"
                className={inputBase + " flex-1"}
                autoFocus
              />
            </div>
            {phoneError && (
              <p className="text-xs text-red-500 flex items-center gap-1.5 mb-4">
                <AlertCircle size={13} /> {phoneError}
              </p>
            )}
            <button
              onClick={handleSavePhone}
              disabled={phoneSaving || phoneInput.replace(/\D/g, "").length < 10}
              className="w-full py-3.5 bg-warm-black text-white font-medium rounded-2xl hover:bg-warm-black/85 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {phoneSaving ? <Loader2 size={16} className="animate-spin" /> : null}
              Save &amp; Continue to Payment
            </button>
          </div>
        </div>
      )}

      <section className="relative">
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

          {/* Title */}
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

          {/* ── Step 0 — Cart ── */}
          {step === 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">
              <SurfaceCard>
                <SectionEyebrow label="Step 01 · Cart" title={`${items.length} ${items.length === 1 ? "Item" : "Items"} in your bag`} />
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
                            if (item.chain) parts.push(<span key="c">{item.chain === "with" ? "With Chain" : "Without Chain"}</span>);
                            if (item.plating) parts.push(<span key="p">{item.plating === "gold" ? "Gold Plated" : "Silver Plated"}</span>);
                            return (
                              <p className="text-[11px] text-silver-500 mt-1 uppercase tracking-wider">
                                {parts.map((node, i) => (
                                  <span key={i}>{i > 0 && <span className="mx-1.5 text-silver-300">/</span>}{node}</span>
                                ))}
                              </p>
                            );
                          })()}
                          <p className="text-sm font-semibold text-warm-black mt-1.5 tabular-nums">₹{item.price.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="flex items-center bg-silver-50 border border-silver-200/60 rounded-full p-1">
                          <button onClick={() => updateQuantity(lineId, item.quantity - 1)} className="w-7 h-7 rounded-full hover:bg-white flex items-center justify-center transition-colors" aria-label="Decrease quantity">
                            <Minus size={12} />
                          </button>
                          <span className="w-7 text-center text-xs font-semibold tabular-nums">{item.quantity}</span>
                          <button onClick={() => updateQuantity(lineId, item.quantity + 1)} className="w-7 h-7 rounded-full hover:bg-white flex items-center justify-center transition-colors" aria-label="Increase quantity">
                            <Plus size={12} />
                          </button>
                        </div>
                        <button onClick={() => { trackRemoveFromCart(item); removeItem(lineId); }} className="p-2 text-silver-400 hover:text-red-500 transition-colors" aria-label="Remove item">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </SurfaceCard>
              <div className="lg:sticky lg:top-24 space-y-4">
                <SummaryCard subtotal={subtotal} shipping={shipping} discount={0} total={subtotal + shipping} />

                {/* Guest upsell inside cart */}
                {!authLoading && !user && (
                  <div className="bg-gradient-to-br from-warm-black to-warm-black/90 rounded-2xl p-5 text-white">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-gold mb-2">Member benefit</p>
                    <p className="text-sm font-medium mb-3 leading-snug">Sign in to track your order, save addresses &amp; access exclusive deals.</p>
                    <button
                      id="cart-google-signin"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-warm-black text-sm font-medium rounded-xl hover:bg-silver-50 transition-colors disabled:opacity-60"
                    >
                      {googleLoading ? <Loader2 size={14} className="animate-spin" /> : (
                        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                          <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                          <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                        </svg>
                      )}
                      Sign in with Google
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!user) { setStep(1); } // will show guest wall
                    else {
                      trackBeginCheckout(items, total);
                      setStep(1);
                    }
                  }}
                  className="w-full group relative overflow-hidden py-4 bg-warm-black text-white font-medium rounded-2xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.4)] hover:shadow-[0_14px_36px_-12px_rgba(0,0,0,0.45)] transition-all"
                >
                  <span className="relative z-10 inline-flex items-center gap-2">
                    Proceed to Checkout
                    <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/20 to-gold/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
                <p className="text-[11px] text-silver-500 text-center">Taxes &amp; final shipping calculated at next steps.</p>
              </div>
            </div>
          )}

          {/* ── Step 1 — Address ── */}
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">
              <div className="space-y-6">
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
                <SurfaceCard>
                  <SectionEyebrow
                    label={savedAddresses.length > 0 ? "New address" : "Step 02 · Shipping"}
                    title={savedAddresses.length > 0 ? "Or enter a new address" : "Where should we ship it?"}
                  />
                  {user && (
                    <>
                      <div className="mt-5 grid grid-cols-2 gap-2.5 p-1.5 bg-silver-100/70 rounded-2xl">
                        {(["myself", "other"] as const).map((mode) => {
                          const active = orderingFor === mode;
                          const Icon = mode === "myself" ? User : UserPlus;
                          return (
                            <button key={mode} type="button" onClick={() => switchOrderingFor(mode)} aria-pressed={active}
                              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                active ? "bg-white text-warm-black shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]" : "text-silver-500 hover:text-warm-black"
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
                          Details synced from your account. Switch to <strong className="text-warm-black">Ordering for Other</strong> to ship to someone else.
                        </p>
                      )}
                    </>
                  )}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Full Name" value={address.fullName} onChange={(v) => updateAddress("fullName", v)} disabled={lockMyselfFields} required />
                    <FormInput label="Email" value={address.email} onChange={(v) => updateAddress("email", v)} type="email" placeholder="you@example.com" disabled={lockMyselfFields} required />
                    <div className="md:col-span-2">
                      <FieldLabel>Phone Number</FieldLabel>
                      <div className="flex gap-2">
                        <select value={address.phoneCountryCode} onChange={(e) => updateAddress("phoneCountryCode", e.target.value)} disabled={lockMyselfFields}
                          className="shrink-0 w-[112px] bg-white border border-silver-200 rounded-2xl pl-3 pr-2 py-3.5 text-sm text-warm-black focus:outline-none focus:border-warm-black focus:ring-4 focus:ring-warm-black/8 transition disabled:bg-silver-50 disabled:text-silver-400 disabled:cursor-not-allowed"
                          aria-label="Country dial code"
                        >
                          {DIAL_CODES.map((d) => (<option key={d.code} value={d.code}>{d.flag} {d.code}</option>))}
                        </select>
                        <input type="tel" inputMode="numeric" value={address.phone} onChange={(e) => updateAddress("phone", e.target.value.replace(/\D/g, ""))} placeholder="10-digit number" maxLength={15} disabled={lockMyselfFields} className={inputBase + " flex-1"} />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <FormInput label="Address" value={address.addressLine1} onChange={(v) => updateAddress("addressLine1", v)} placeholder="House / flat number, building, street" />
                    </div>
                    <div className="md:col-span-2">
                      <FormInput label="Nearest Landmark (Optional)" value={address.landmark} onChange={(v) => updateAddress("landmark", v)} placeholder="e.g. opposite SBI ATM" />
                    </div>
                    <div>
                      <FieldLabel>
                        Pincode
                        {pincodeValid && pincodeLookup.state === "loading" && (
                          <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-normal text-silver-500">
                            <Loader2 size={11} className="animate-spin" /> looking up…
                          </span>
                        )}
                        {pincodeValid && pincodeLookup.state === "ok" && (
                          <span className="ml-2 text-[10px] font-medium text-emerald-600">✓ auto-filled</span>
                        )}
                        {pincodeValid && pincodeLookup.state === "not-found" && (
                          <span className="ml-2 text-[10px] font-medium text-red-500">not found — fill manually</span>
                        )}
                      </FieldLabel>
                      <input type="text" inputMode="numeric" value={address.pincode} onChange={(e) => handlePincodeChange(e.target.value)} placeholder="6-digit pincode" maxLength={6} className={inputBase + " tabular-nums tracking-wider"} />
                    </div>
                    <div className="hidden md:block" />
                    <div>
                      <FieldLabel>City</FieldLabel>
                      <input type="text" value={address.city} onChange={(e) => updateAddress("city", e.target.value)} list="city-options" placeholder="City / locality" className={inputBase} />
                      {pincodeLookup.cities.length > 1 && (
                        <datalist id="city-options">
                          {pincodeLookup.cities.map((c) => <option key={c} value={c} />)}
                        </datalist>
                      )}
                    </div>
                    <FormInput label="District" value={address.district} onChange={(v) => updateAddress("district", v)} placeholder="District" />
                    <div className="md:col-span-2">
                      <FieldLabel>State</FieldLabel>
                      <select value={address.state} onChange={(e) => updateAddress("state", e.target.value)} className={inputBase}>
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
              <div className="lg:sticky lg:top-24 space-y-4">
                <SummaryCard subtotal={subtotal} shipping={shipping} discount={0} total={subtotal + shipping} />
                <div className="flex gap-2">
                  <button onClick={() => setStep(0)} className="px-5 py-3.5 border border-silver-200 bg-white rounded-2xl text-sm font-medium hover:bg-silver-50 transition-colors">Back</button>
                  <button
                    onClick={() => canContinue && setStep(2)} disabled={!canContinue}
                    className="flex-1 group relative overflow-hidden py-3.5 bg-warm-black text-white font-medium rounded-2xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.4)] hover:shadow-[0_14px_36px_-12px_rgba(0,0,0,0.45)] transition-all disabled:bg-silver-300 disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 inline-flex items-center gap-2 text-sm">Continue <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2 — Review ── */}
          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">
              <div className="space-y-6">
                <SurfaceCard>
                  <div className="flex items-start justify-between">
                    <SectionEyebrow label="Step 03 · Review" title="Shipping To" />
                    <button onClick={() => setStep(1)} className="text-xs font-medium text-warm-black border-b border-warm-black/40 hover:border-warm-black transition-colors">Edit</button>
                  </div>
                  <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                    <ReviewRow label="Name" value={address.fullName} />
                    {address.email && <ReviewRow label="Email" value={address.email} />}
                    <ReviewRow label="Phone" value={address.phone ? `${address.phoneCountryCode} ${address.phone}` : ""} />
                    <ReviewRow label="Pincode" value={address.pincode} mono />
                    <div className="sm:col-span-2"><ReviewRow label="Address" value={address.addressLine1} /></div>
                    {address.landmark && <div className="sm:col-span-2"><ReviewRow label="Landmark" value={address.landmark} /></div>}
                    <ReviewRow label="City" value={address.city} />
                    {address.district && <ReviewRow label="District" value={address.district} />}
                    <div className="sm:col-span-2"><ReviewRow label="State" value={address.state} /></div>
                  </dl>
                </SurfaceCard>
                <SurfaceCard>
                  <SectionEyebrow label="Items" title={`${items.length} ${items.length === 1 ? "Item" : "Items"}`} />
                  <div className="mt-5 divide-y divide-silver-200/60">
                    {items.map((item) => (
                      <div key={item.productId} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-silver-100 to-silver-50 shrink-0 overflow-hidden relative ring-1 ring-silver-200/60">
                          {item.image ? (<Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />) : (<div className="w-full h-full flex items-center justify-center"><span className="text-[10px] text-silver-400">IMG</span></div>)}
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

                {/* Promo code — Firestore validated with animation */}
                <SurfaceCard>
                  <SectionEyebrow label="Discount" title="Promo Code" />
                  <div className="mt-5 flex gap-2.5">
                    <div className="flex-1 relative">
                      <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-silver-400" />
                      <input
                        value={promoInput}
                        onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); if (promo.status !== "idle") setPromo({ status: "idle", discountAmount: 0 }); }}
                        placeholder="Enter promo code"
                        disabled={promo.status === "valid"}
                        className={inputBase + " pl-10 uppercase tracking-wider"}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                      />
                    </div>
                    {promo.status === "valid" ? (
                      <button onClick={clearPromo} className="px-4 py-3 border border-red-200 text-red-500 text-sm font-medium rounded-2xl hover:bg-red-50 transition-colors flex items-center gap-1.5">
                        <X size={14} /> Remove
                      </button>
                    ) : (
                      <button
                        onClick={handleApplyPromo}
                        disabled={promo.status === "loading" || !promoInput.trim()}
                        className="px-6 py-3 bg-warm-black text-white text-sm font-medium rounded-2xl hover:bg-warm-black/85 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {promo.status === "loading" ? <Loader2 size={14} className="animate-spin" /> : null}
                        Apply
                      </button>
                    )}
                  </div>

                  {/* Invalid promo */}
                  {promo.status === "invalid" && (
                    <div className="flex items-center gap-2.5 mt-3 bg-red-50 border border-red-200/60 text-red-600 text-xs px-4 py-3 rounded-xl">
                      <AlertCircle size={14} className="shrink-0" />
                      {promo.error || "Invalid promo code"}
                    </div>
                  )}

                  {/* Valid promo — animated */}
                  {promo.status === "valid" && (
                    <div className={`mt-3 relative overflow-hidden rounded-xl transition-all duration-500 ${showPromoAnimation ? "scale-[1.02]" : "scale-100"}`}>
                      <div className="bg-emerald-50 border border-emerald-200/60 px-4 py-3 rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                            <Sparkles size={15} className={showPromoAnimation ? "animate-spin" : ""} />
                            {promo.code} applied!
                          </span>
                          <span className={`font-bold text-emerald-700 tabular-nums text-sm transition-all duration-700 ${showPromoAnimation ? "translate-y-[-4px] opacity-0" : "translate-y-0 opacity-100"}`}>
                            -₹{promo.discountAmount.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-600 mt-1">{promo.message}</p>
                      </div>
                      {/* Flying savings badge animation */}
                      {showPromoAnimation && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="bg-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg animate-[promoFly_0.8s_ease_forwards]">
                            -₹{promo.discountAmount.toLocaleString("en-IN")} saved!
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </SurfaceCard>
              </div>
              <div className="lg:sticky lg:top-24 space-y-4">
                <SummaryCard subtotal={subtotal} shipping={shipping} discount={discount} total={total} promoCode={promo.status === "valid" ? promo.code : undefined} />
                <div className="flex gap-2">
                  <button onClick={() => setStep(1)} className="px-5 py-3.5 border border-silver-200 bg-white rounded-2xl text-sm font-medium hover:bg-silver-50 transition-colors">Back</button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 group relative overflow-hidden py-3.5 bg-warm-black text-white font-medium rounded-2xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.4)] hover:shadow-[0_14px_36px_-12px_rgba(0,0,0,0.45)] transition-all"
                  >
                    <span className="relative z-10 inline-flex items-center gap-2 text-sm">Proceed to Payment <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3 — Payment ── */}
          {step === 3 && (
            <div className="max-w-xl mx-auto">
              <SurfaceCard className="text-center !p-8 md:!p-12 relative overflow-hidden">
                <div aria-hidden className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-gradient-to-b from-gold/20 to-transparent blur-3xl pointer-events-none" />
                <div className="relative">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-warm-black to-warm-black/85 flex items-center justify-center shadow-[0_18px_40px_-14px_rgba(0,0,0,0.45)] mb-6">
                    {paymentStatus === "verifying" ? (
                      <Loader2 size={28} className="text-gold animate-spin" />
                    ) : (
                      <CreditCard size={28} className="text-gold" />
                    )}
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-silver-500 mb-2">Step 04 · Payment</p>
                  <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-heading)] font-semibold tracking-tight text-warm-black mb-2">
                    {paymentStatus === "creating" ? "Preparing..." : paymentStatus === "verifying" ? "Verifying..." : "Almost there."}
                  </h2>
                  <p className="text-silver-500 text-sm max-w-sm mx-auto mb-7">
                    {paymentStatus === "verifying"
                      ? "Verifying your payment securely…"
                      : "You'll be redirected to Razorpay's secure checkout to complete the transaction."}
                  </p>

                  {/* Amount */}
                  <div className="inline-flex flex-col items-center gap-1 px-8 py-5 rounded-2xl bg-gradient-to-br from-silver-50 to-white border border-silver-200/70 mb-3">
                    <span className="text-[10px] uppercase tracking-[0.24em] text-silver-500">Total Payable</span>
                    <span className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-semibold tabular-nums text-warm-black">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                    {discount > 0 && (
                      <span className="text-[10px] text-emerald-600 font-medium">
                        (You save ₹{discount.toLocaleString("en-IN")} with {promo.code})
                      </span>
                    )}
                  </div>

                  {/* Error */}
                  {paymentStatus === "failed" && paymentError && (
                    <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200/60 text-red-600 text-xs px-4 py-3 rounded-xl text-left">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  {/* Pay button */}
                  <button
                    id="pay-now-btn"
                    onClick={handlePay}
                    disabled={paymentStatus === "creating" || paymentStatus === "verifying" || paymentStatus === "success" || !razorpayReady}
                    className="w-full group relative overflow-hidden px-12 py-4 bg-gradient-to-r from-gold via-gold to-gold/85 text-white font-semibold rounded-2xl shadow-[0_18px_40px_-14px_rgba(201,168,76,0.65)] hover:shadow-[0_22px_44px_-14px_rgba(201,168,76,0.75)] transition-all text-base disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 inline-flex items-center justify-center gap-2">
                      {paymentStatus === "creating" || paymentStatus === "verifying" ? (
                        <><Loader2 size={18} className="animate-spin" /> Processing…</>
                      ) : paymentStatus === "success" ? (
                        <><Check size={18} /> Payment Confirmed!</>
                      ) : (
                        <>Pay Securely · ₹{total.toLocaleString("en-IN")} <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" /></>
                      )}
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>

                  {!razorpayReady && (
                    <p className="text-[11px] text-silver-400 mt-3 flex items-center justify-center gap-1.5">
                      <Loader2 size={11} className="animate-spin" /> Loading payment gateway…
                    </p>
                  )}

                  <div className="flex items-center justify-center gap-4 mt-5 text-[10px] uppercase tracking-[0.22em] text-silver-500">
                    <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> PCI-DSS</span>
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
    </>
  );
}

/* ──────────────── Helper components ──────────────── */
const inputBase =
  "w-full bg-white border border-silver-200 rounded-2xl px-4 py-3.5 text-sm text-warm-black placeholder:text-silver-400 " +
  "focus:outline-none focus:border-warm-black focus:ring-4 focus:ring-warm-black/8 transition " +
  "disabled:bg-silver-50 disabled:text-silver-400 disabled:cursor-not-allowed";

function SurfaceCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative bg-white/95 backdrop-blur-sm border border-silver-200/70 rounded-3xl p-6 md:p-7 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_8px_28px_-12px_rgba(15,15,15,0.08)] ${className}`}>
      {children}
    </div>
  );
}

function SectionEyebrow({ label, title }: { label: string; title: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.28em] text-silver-500 mb-2">{label}</p>
      <h2 className="font-[family-name:var(--font-heading)] text-xl md:text-2xl font-semibold text-warm-black tracking-tight">{title}</h2>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="flex items-center text-[11px] uppercase tracking-[0.18em] font-medium text-silver-500 mb-2">{children}</label>;
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
  subtotal, shipping, discount, total, promoCode,
}: {
  subtotal: number; shipping: number; discount: number; total: number; promoCode?: string;
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
          <div className="flex justify-between text-emerald-600 animate-[fadeIn_0.4s_ease]">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles size={12} />
              {promoCode ? promoCode : "Discount"}
            </span>
            <span className="font-semibold tabular-nums">-₹{discount.toLocaleString("en-IN")}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-silver-500">Shipping</span>
          <span className="font-medium text-warm-black tabular-nums">{shipping === 0 ? "Free" : `₹${shipping}`}</span>
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-silver-200/60 flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-[0.28em] text-silver-500">Total</span>
        <span className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-warm-black tabular-nums transition-all duration-500">
          ₹{total.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}

function FormInput({
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
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} maxLength={maxLength} disabled={disabled}
        className={inputBase}
      />
    </div>
  );
}

function splitPhone(raw: string | undefined | null): { code: string; number: string } {
  if (!raw) return { code: DEFAULT_DIAL_CODE, number: "" };
  const trimmed = String(raw).trim();
  const match = trimmed.match(/^(\+(\d{1,4}))\s*(.*)$/);
  if (match) {
    const candidate = `+${match[2]}`;
    const rest = match[3].replace(/\D/g, "");
    const known = DIAL_CODES.some((d) => d.code === candidate);
    return known ? { code: candidate, number: rest } : { code: DEFAULT_DIAL_CODE, number: trimmed.replace(/\D/g, "") };
  }
  return { code: DEFAULT_DIAL_CODE, number: trimmed.replace(/\D/g, "") };
}
