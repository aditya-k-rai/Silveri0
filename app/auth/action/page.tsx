'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { verifyResetCode, confirmReset } from '@/lib/firebase/auth';
import { Shield, Lock, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invalidCode, setInvalidCode] = useState(false);

  useEffect(() => {
    if (mode !== 'resetPassword' || !oobCode) {
      setInvalidCode(true);
      setVerifying(false);
      return;
    }

    verifyResetCode(oobCode)
      .then((userEmail) => {
        setEmail(userEmail);
        setVerifying(false);
      })
      .catch(() => {
        setInvalidCode(true);
        setVerifying(false);
      });
  }, [mode, oobCode]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await confirmReset(oobCode!, newPassword);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset password';
      if (msg.includes('expired')) {
        setError('This reset link has expired. Please request a new one.');
      } else if (msg.includes('weak-password')) {
        setError('Password is too weak. Use at least 6 characters.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (verifying) {
    return (
      <div className="text-center py-12">
        <Loader2 size={32} className="text-gold animate-spin mx-auto mb-4" />
        <p className="text-[#888] text-sm">Verifying reset link...</p>
      </div>
    );
  }

  // Invalid or expired link
  if (invalidCode) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-900/20 border border-red-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle size={28} className="text-red-400" />
        </div>
        <h2 className="text-white text-lg font-semibold mb-2">Invalid or Expired Link</h2>
        <p className="text-[#888] text-sm mb-6">
          This password reset link is invalid or has expired.<br />
          Please request a new one.
        </p>
        <Link
          href="/login"
          className="inline-block bg-gold text-warm-black px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gold-light transition-colors"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-900/20 border border-green-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-green-400" />
        </div>
        <h2 className="text-white text-lg font-semibold mb-2">Password Reset Successful</h2>
        <p className="text-[#888] text-sm mb-6">
          Your password has been updated successfully.<br />
          You can now sign in with your new password.
        </p>
        <Link
          href="/login"
          className="inline-block bg-gold text-warm-black px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gold-light transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Reset form
  return (
    <>
      <h2 className="text-white text-lg font-semibold mb-1">Reset Your Password</h2>
      <p className="text-[#888] text-sm mb-6">
        Enter a new password for <span className="text-gold">{email}</span>
      </p>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-2.5 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="block text-sm text-[#aaa] mb-1.5">New Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-[#242424] border border-[#333] rounded-lg text-sm text-white placeholder-[#666] outline-none focus:border-gold"
              required
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#999]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm text-[#aaa] mb-1.5">Confirm Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-[#242424] border border-[#333] rounded-lg text-sm text-white placeholder-[#666] outline-none focus:border-gold"
              required
            />
          </div>
        </div>

        {/* Password strength hints */}
        <div className="space-y-1">
          <p className={`text-xs flex items-center gap-1.5 ${newPassword.length >= 6 ? 'text-green-400' : 'text-[#555]'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 6 ? 'bg-green-400' : 'bg-[#555]'}`} />
            At least 6 characters
          </p>
          <p className={`text-xs flex items-center gap-1.5 ${newPassword && newPassword === confirmPassword ? 'text-green-400' : 'text-[#555]'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${newPassword && newPassword === confirmPassword ? 'bg-green-400' : 'bg-[#555]'}`} />
            Passwords match
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gold text-warm-black py-3 rounded-lg text-sm font-semibold hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          {submitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </>
  );
}

export default function AuthActionPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold/10 border border-gold/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-gold" />
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl text-gold">Silveri</h1>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8">
          <Suspense
            fallback={
              <div className="text-center py-12">
                <Loader2 size={32} className="text-gold animate-spin mx-auto mb-4" />
                <p className="text-[#888] text-sm">Loading...</p>
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-[#666] text-xs hover:text-gold transition-colors">
            ← Back to Silveri store
          </Link>
        </p>
      </div>
    </div>
  );
}
