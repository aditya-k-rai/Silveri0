'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  signInWithGoogleIdToken,
  signUpWithEmail,
  signInWithEmail,
  resetPassword,
} from '@/lib/firebase/auth';
import { useAuthContext } from '@/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { EmailAuthProvider, linkWithCredential } from 'firebase/auth';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff, ArrowLeft } from 'lucide-react';

// Google Identity Services — the OAuth Web Client ID from Google Cloud Console.
// This is the same client ID Firebase Auth auto-created and which is already
// publicly visible during OAuth flows, so it's safe to ship in the bundle.
const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '869948351660-pci4pd3m47oo39ndm32upd5m6jio4b9l.apps.googleusercontent.com';

interface GsiCredentialResponse {
  credential: string;
  select_by?: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GsiCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    use_fedcm_for_prompt?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: 'standard' | 'icon';
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'large' | 'medium' | 'small';
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
      shape?: 'rectangular' | 'pill' | 'circle' | 'square';
      logo_alignment?: 'left' | 'center';
      width?: string | number;
    }
  ) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

type View = 'login' | 'register' | 'forgot' | 'complete-profile';

export default function LoginPage() {
  const { user, userDoc, loading } = useAuthContext();
  const [view, setView] = useState<View>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regLocation, setRegLocation] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Complete profile form (after Google login)
  const [profilePhone, setProfilePhone] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileLocation, setProfileLocation] = useState('');

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');

  useEffect(() => {
    console.log(
      '[login] gate — submitting=', submitting,
      'loading=', loading,
      'user=', !!user,
      'userDoc=', !!userDoc,
      'role=', userDoc?.role ?? '—',
      'phone=', userDoc?.phone || '(empty)'
    );
    // Don't redirect mid-submission — handlers manage redirect after session cookie is set
    if (submitting) return;
    if (!loading && user && userDoc) {
      // Admins land in the admin panel, never the customer site
      if (userDoc.role === 'admin') {
        console.log('[login] redirecting admin -> /admin');
        window.location.href = '/admin';
        return;
      }
      // Customers must complete their profile (phone) before continuing
      if (!userDoc.phone) {
        console.log('[login] customer needs profile completion');
        setView('complete-profile');
      } else {
        console.log('[login] redirecting customer -> /');
        window.location.href = '/';
      }
    }
  }, [user, userDoc, loading, submitting]);

  // ─── Google Identity Services (in-page Sign-in with Google) ──────────
  const gsiBtnRef = useRef<HTMLDivElement | null>(null);
  const gsiInitialisedRef = useRef(false);

  const handleGisCredential = useCallback(async (response: GsiCredentialResponse) => {
    setError('');
    setSubmitting(true);
    try {
      console.log('[login] GIS credential received, signing into Firebase…');
      await signInWithGoogleIdToken(response.credential);
      // AuthContext picks up the user; the redirect-gate useEffect handles
      // routing to /admin, /complete-profile, or / based on the userDoc.
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed';
      console.error('[login] GIS sign-in failed:', err);
      setError(msg);
    } finally {
      // Always reset submitting — the redirect-gate useEffect is gated on
      // !submitting and won't switch to the complete-profile view (or hard-
      // redirect) until this clears. Skipping this on the success path is
      // what was causing the post-Google-login screen to take ~1–2 min
      // (only after a manual reload).
      setSubmitting(false);
    }
  }, []);

  // Render the Google sign-in button into the placeholder div whenever the
  // login or register view is active. The GIS script is loaded once globally
  // in app/layout.tsx; we just have to wait for `window.google` to be ready.
  useEffect(() => {
    if (view !== 'login' && view !== 'register') return;
    if (typeof window === 'undefined') return;

    let cancelled = false;
    const tryInit = () => {
      if (cancelled) return;
      const g = window.google?.accounts?.id;
      if (!g) {
        // GIS script still loading — try again shortly
        setTimeout(tryInit, 100);
        return;
      }
      if (!gsiInitialisedRef.current) {
        g.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGisCredential,
          auto_select: false,
          use_fedcm_for_prompt: true,
        });
        gsiInitialisedRef.current = true;
      }
      // Re-render every time the host div changes (between login/register views)
      if (gsiBtnRef.current) {
        gsiBtnRef.current.innerHTML = '';
        g.renderButton(gsiBtnRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: view === 'register' ? 'signup_with' : 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'center',
          width: 320,
        });
      }
    };
    tryInit();
    return () => {
      cancelled = true;
    };
  }, [view, handleGisCredential]);

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regName.trim()) { setError('Name is required'); return; }
    if (!regEmail.trim()) { setError('Email is required'); return; }
    if (!regPhone.trim() || regPhone.length < 10) { setError('Valid 10-digit phone number is required'); return; }
    if (!regPassword || regPassword.length < 6) { setError('Password must be at least 6 characters'); return; }

    setSubmitting(true);
    try {
      const firebaseUser = await signUpWithEmail(regEmail, regPassword, regName);

      // Update the Firestore user doc with phone and location
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        phone: regPhone,
        location: regLocation,
      });
      // Redirect handled by role-aware useEffect once AuthContext loads userDoc
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      if (msg.includes('email-already-in-use')) {
        setError('This email is already registered. Try logging in.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginEmail || !loginPassword) { setError('Email and password are required'); return; }

    setSubmitting(true);
    try {
      await signInWithEmail(loginEmail, loginPassword);
      // Redirect handled by role-aware useEffect once AuthContext loads userDoc
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      if (msg.includes('too-many-requests')) {
        setError('Too many login attempts. Please wait 15–30 minutes before trying again.');
      } else if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setError('Invalid email or password');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!forgotEmail) { setError('Enter your email address'); return; }

    setSubmitting(true);
    try {
      await resetPassword(forgotEmail);
      setSuccess('Password reset link sent to your email! If you don\'t see it, check your Spam or Junk folder.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset email';
      if (msg.includes('too-many-requests')) {
        setError('Too many attempts. Please wait 15–30 minutes before trying again.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!profilePhone.trim() || profilePhone.length < 10) {
      setError('Valid 10-digit phone number is required');
      return;
    }
    if (!profilePassword || profilePassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      if (user) {
        // 1) Save phone + location in Firestore
        await updateDoc(doc(db, 'users', user.uid), {
          phone: profilePhone,
          location: profileLocation,
        });

        // 2) Link an email/password credential so the user can also log in with
        //    email + password later, and use the password-reset flow.
        if (user.email) {
          const credential = EmailAuthProvider.credential(user.email, profilePassword);
          try {
            await linkWithCredential(user, credential);
          } catch (linkErr: unknown) {
            const msg = linkErr instanceof Error ? linkErr.message : '';
            // Already linked → fine. Anything else surfaces.
            if (
              !msg.includes('provider-already-linked') &&
              !msg.includes('email-already-in-use')
            ) {
              throw linkErr;
            }
          }
        }

        // Hard redirect — only customers reach this view (admins are redirected
        // earlier by the role-aware useEffect), so going to / is correct.
        window.location.href = '/';
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      if (msg.includes('weak-password')) {
        setError('Password too weak. Use at least 6 characters.');
      } else {
        setError(msg);
      }
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-cream px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl text-gold">Silveri</h1>
          <p className="text-muted text-sm mt-1">
            {view === 'login' && 'Welcome back! Sign in to your account'}
            {view === 'register' && 'Create your Silveri account'}
            {view === 'forgot' && 'Reset your password'}
            {view === 'complete-profile' && 'Complete your profile'}
          </p>
        </div>

        {/* Error / Success */}
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5 mb-4">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-2.5 mb-4">{success}</div>}

        {/* Signing-in indicator — shown while we exchange the Google credential
            for a Firebase session. Avoids the "nothing's happening" feeling. */}
        {submitting && (view === 'login' || view === 'register') && (
          <div className="bg-gold/10 border border-gold/30 text-gold-dark text-sm rounded-lg px-4 py-2.5 mb-4 flex items-center gap-2">
            <span className="inline-block w-3.5 h-3.5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            Signing in…
          </div>
        )}

        {/* ====== LOGIN VIEW ====== */}
        {view === 'login' && (
          <>
            {/* Google Sign-in via Google Identity Services (in-page, no redirect) */}
            <div className="flex justify-center w-full" aria-busy={submitting}>
              <div ref={gsiBtnRef} className={submitting ? 'pointer-events-none opacity-50' : ''} />
            </div>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-silver" />
              <span className="text-muted text-xs">or sign in with email</span>
              <div className="flex-1 h-px bg-silver" />
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input type="email" placeholder="Email address" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-silver rounded-lg text-sm outline-none focus:border-gold" />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full pl-10 pr-10 py-2.5 border border-silver rounded-lg text-sm outline-none focus:border-gold" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="text-right">
                <button type="button" onClick={() => { setView('forgot'); setError(''); setSuccess(''); }} className="text-gold text-xs hover:underline">Forgot password?</button>
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-gold text-warm-black py-3 rounded-lg text-sm font-medium hover:bg-gold-light transition-colors disabled:opacity-50">
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-muted mt-5">
              New to Silveri?{' '}
              <button onClick={() => { setView('register'); setError(''); }} className="text-gold font-medium hover:underline">Create an account</button>
            </p>
          </>
        )}

        {/* ====== REGISTER VIEW ====== */}
        {view === 'register' && (
          <>
            {/* Google Sign-up via Google Identity Services (in-page, no redirect) */}
            <div className="flex justify-center w-full" aria-busy={submitting}>
              <div ref={gsiBtnRef} className={submitting ? 'pointer-events-none opacity-50' : ''} />
            </div>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-silver" />
              <span className="text-muted text-xs">or register with email</span>
              <div className="flex-1 h-px bg-silver" />
            </div>

            <form onSubmit={handleEmailRegister} className="space-y-3">
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input type="text" placeholder="Full Name *" value={regName} onChange={(e) => setRegName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-silver rounded-lg text-sm outline-none focus:border-gold" required />
              </div>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input type="email" placeholder="Email address *" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-silver rounded-lg text-sm outline-none focus:border-gold" required />
              </div>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input type="tel" placeholder="Mobile Number * (10 digits)" value={regPhone} onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className="w-full pl-10 pr-4 py-2.5 border border-silver rounded-lg text-sm outline-none focus:border-gold" required />
              </div>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input type="text" placeholder="City / Location" value={regLocation} onChange={(e) => setRegLocation(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-silver rounded-lg text-sm outline-none focus:border-gold" />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Password * (min 6 chars)" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full pl-10 pr-10 py-2.5 border border-silver rounded-lg text-sm outline-none focus:border-gold" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-gold text-warm-black py-3 rounded-lg text-sm font-medium hover:bg-gold-light transition-colors disabled:opacity-50">
                {submitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-muted mt-5">
              Already have an account?{' '}
              <button onClick={() => { setView('login'); setError(''); }} className="text-gold font-medium hover:underline">Sign in</button>
            </p>
          </>
        )}

        {/* ====== FORGOT PASSWORD VIEW ====== */}
        {view === 'forgot' && (
          <>
            <button onClick={() => { setView('login'); setError(''); setSuccess(''); }} className="flex items-center gap-1 text-muted text-sm hover:text-warm-black mb-4">
              <ArrowLeft size={14} /> Back to login
            </button>
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input type="email" placeholder="Enter your email address" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-silver rounded-lg text-sm outline-none focus:border-gold" required />
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-gold text-warm-black py-3 rounded-lg text-sm font-medium hover:bg-gold-light transition-colors disabled:opacity-50">
                {submitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}

        {/* ====== COMPLETE PROFILE VIEW (after Google login — phone + password mandatory) ====== */}
        {view === 'complete-profile' && (
          <>
            <div className="bg-gold/10 border border-gold/30 rounded-lg px-4 py-3 mb-4">
              <p className="text-sm text-gold-dark">
                Welcome! Set a password so you can also sign in with email later.
                Mobile number and password are required.
              </p>
            </div>
            <form onSubmit={handleCompleteProfile} className="space-y-3">
              {/* Phone — required */}
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="tel"
                  placeholder="Mobile Number * (10 digits)"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full pl-10 pr-4 py-2.5 border border-silver rounded-lg text-sm outline-none focus:border-gold"
                  required
                  autoFocus
                />
              </div>

              {/* Password — required (so the user can also sign in with email) */}
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Set a password * (min 6 chars)"
                  value={profilePassword}
                  onChange={(e) => setProfilePassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-silver rounded-lg text-sm outline-none focus:border-gold"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Location — optional */}
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="City / Location (optional)"
                  value={profileLocation}
                  onChange={(e) => setProfileLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-silver rounded-lg text-sm outline-none focus:border-gold"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gold text-warm-black py-3 rounded-lg text-sm font-medium hover:bg-gold-light transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Continue to Silveri'}
              </button>
            </form>
          </>
        )}

        {/* Terms */}
        {(view === 'login' || view === 'register') && (
          <p className="text-muted text-[10px] text-center mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        )}
      </div>
    </div>
  );
}
