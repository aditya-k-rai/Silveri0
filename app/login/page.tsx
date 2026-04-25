'use client';

import { useEffect, useState } from 'react';
import { signInWithGoogle, signUpWithEmail, signInWithEmail, resetPassword } from '@/lib/firebase/auth';
import { useAuthContext } from '@/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff, ArrowLeft } from 'lucide-react';

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
  const [profileLocation, setProfileLocation] = useState('');

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');

  useEffect(() => {
    // Don't redirect mid-submission — handlers manage redirect after session cookie is set
    if (submitting) return;
    if (!loading && user && userDoc) {
      // Check if profile is complete (phone is mandatory)
      if (!userDoc.phone) {
        setView('complete-profile');
      } else {
        window.location.href = '/';
      }
    }
  }, [user, userDoc, loading, submitting]);

  const handleGoogleLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      await signInWithGoogle();
      // signInWithGoogle now awaits the session cookie creation; safe to clear flag
      // AuthContext useEffect will then handle redirect (or trigger profile completion)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed';
      // Firebase popup closed by user shouldn't show as a scary error
      if (msg.includes('popup-closed-by-user') || msg.includes('cancelled-popup-request')) {
        // Silent — user closed the popup intentionally
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

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

      window.location.href = '/';
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
      window.location.href = '/';
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
    if (!profilePhone.trim() || profilePhone.length < 10) { setError('Valid 10-digit phone number is required'); return; }

    setSubmitting(true);
    try {
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          phone: profilePhone,
          location: profileLocation,
        });
        // Hard redirect to avoid middleware/session issues
        window.location.href = '/';
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
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

        {/* ====== LOGIN VIEW ====== */}
        {view === 'login' && (
          <>
            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-silver hover:border-gold text-warm-black py-3 px-6 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {submitting ? 'Signing in...' : 'Continue with Google'}
            </button>

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
            {/* Google Register */}
            <button
              onClick={handleGoogleLogin}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-silver hover:border-gold text-warm-black py-3 px-6 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {submitting ? 'Signing up...' : 'Sign up with Google'}
            </button>

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

        {/* ====== COMPLETE PROFILE VIEW (after Google login, phone mandatory) ====== */}
        {view === 'complete-profile' && (
          <>
            <div className="bg-gold/10 border border-gold/30 rounded-lg px-4 py-3 mb-4">
              <p className="text-sm text-gold-dark">Welcome! Please complete your profile to continue. Mobile number is required.</p>
            </div>
            <form onSubmit={handleCompleteProfile} className="space-y-3">
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input type="tel" placeholder="Mobile Number * (10 digits)" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className="w-full pl-10 pr-4 py-2.5 border border-silver rounded-lg text-sm outline-none focus:border-gold" required autoFocus />
              </div>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input type="text" placeholder="City / Location (optional)" value={profileLocation} onChange={(e) => setProfileLocation(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-silver rounded-lg text-sm outline-none focus:border-gold" />
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-gold text-warm-black py-3 rounded-lg text-sm font-medium hover:bg-gold-light transition-colors disabled:opacity-50">
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
