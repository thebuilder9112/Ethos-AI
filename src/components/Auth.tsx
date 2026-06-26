import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Mail, Lock, ShieldAlert, Sparkles, RefreshCw, LogOut, CheckCircle } from 'lucide-react';

interface AuthProps {
  onAuthComplete: (user: User) => void;
}

export default function Auth({ onAuthComplete }: AuthProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'verify'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        if (!user.emailVerified) {
          setMode('verify');
        } else {
          onAuthComplete(user);
        }
      } else {
        if (mode === 'verify') {
          setMode('signin');
        }
      }
    });
    return unsubscribe;
  }, [mode, onAuthComplete]);

  // Handle cooldown timer for resending email verification
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const user = credential.user;
      if (!user.emailVerified) {
        setMode('verify');
        setError('Please verify your email address to log in.');
      } else {
        onAuthComplete(user);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'Failed to sign in.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const user = credential.user;
      
      // Send verification email immediately
      try {
        await sendEmailVerification(user);
        setMessage('Account created! A verification email has been sent to ' + email + '.');
      } catch (verifErr: any) {
        console.error("Verification email sending failed", verifErr);
        setError('Account created, but we failed to send a verification email. Please try requesting it below.');
      }
      
      setMode('verify');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use.');
      } else {
        setError(err.message || 'Failed to sign up.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('A password reset link has been sent to ' + email);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!currentUser) return;
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await sendEmailVerification(currentUser);
      setMessage('A new verification link has been sent to ' + currentUser.email + '.');
      setResendCooldown(60); // 60 seconds cooldown
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerificationStatus = async () => {
    if (!currentUser) return;
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await currentUser.reload();
      const updatedUser = auth.currentUser;
      if (updatedUser && updatedUser.emailVerified) {
        setMessage('Email verified successfully!');
        setTimeout(() => {
          onAuthComplete(updatedUser);
        }, 1000);
      } else {
        setError('Email is not verified yet. Please check your inbox and click the verification link.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to refresh status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await signOut(auth);
      setMode('signin');
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-container" className="min-h-screen bg-[#F7F5F0] flex items-center justify-center p-4">
      <div id="auth-card" className="w-full max-w-md bg-white border border-[#E5E2D9] rounded-[32px] p-8 md:p-10 shadow-xs space-y-6">
        
        {/* Logo and Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#5A5A40] flex items-center justify-center mx-auto shadow-sm">
            <div className="w-3.5 h-3.5 bg-white rotate-45"></div>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#5A5A40] tracking-tight">
              Ethos AI / Eunoia
            </h2>
            <p className="text-xs text-[#7C7971] font-medium tracking-wide">
              {mode === 'signin' && 'Sign in to access your ethical journal'}
              {mode === 'signup' && 'Create a private, verified moral workspace'}
              {mode === 'forgot' && 'Reset your philosophy ledger password'}
              {mode === 'verify' && 'Verify your ethical identity'}
            </p>
          </div>
        </div>

        {/* Message and Error alerts */}
        {error && (
          <div id="auth-error-alert" className="bg-rose-50 border border-rose-200/50 text-rose-800 text-xs p-3.5 rounded-xl font-medium flex items-start gap-2 animate-fade-in">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div id="auth-message-alert" className="bg-[#F2F1EC] border border-[#D1CEC4] text-[#5A5A40] text-xs p-3.5 rounded-xl font-medium flex items-start gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-[#5A5A40] shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {/* Auth Forms */}
        {mode === 'verify' ? (
          <div id="verification-view" className="space-y-5">
            <div className="bg-[#FCFBF9] border border-[#E5E2D9] p-4 rounded-xl text-xs text-[#5D5B54] leading-relaxed space-y-2 text-center">
              <p className="font-serif italic font-semibold text-sm text-[#3D3B36]">Awaiting Verification</p>
              <p>
                We have dispatched a secure authentication link to:
              </p>
              <p className="font-mono font-bold text-[#5A5A40] break-all">{currentUser?.email}</p>
              <p>
                Please inspect your inbox (and spam folder) and click the verification link to proceed.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                id="check-verif-btn"
                onClick={handleCheckVerificationStatus}
                disabled={loading}
                className="w-full py-3 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#DEDCD4] disabled:text-[#A09D94]"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span>I Have Verified My Email</span>
              </button>

              <button
                id="resend-verif-btn"
                onClick={handleResendVerification}
                disabled={loading || resendCooldown > 0}
                className="w-full py-3 bg-white hover:bg-[#FCFBF9] text-[#5A5A40] border border-[#D1CEC4] rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-50 disabled:text-gray-300"
              >
                <Mail className="w-4 h-4" />
                <span>
                  {resendCooldown > 0 ? `Resend Email in ${resendCooldown}s` : 'Resend Verification Email'}
                </span>
              </button>
            </div>

            <div className="border-t border-[#F2F1EC] pt-4 flex justify-center">
              <button
                id="verify-signout-btn"
                onClick={handleSignOut}
                disabled={loading}
                className="text-xs text-[#7C7971] hover:text-[#5A5A40] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out / Switch Account</span>
              </button>
            </div>
          </div>
        ) : (
          <form id="auth-form" onSubmit={mode === 'signin' ? handleSignIn : mode === 'signup' ? handleSignUp : handleForgotPassword} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="auth-email-input" className="block text-[10px] font-bold text-[#7C7971] uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09D94]" />
                <input
                  id="auth-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={loading}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#FCFBF9] border border-[#E5E2D9] rounded-xl text-xs text-[#3D3B36] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#5A5A40] placeholder-[#C2C0B8]"
                />
              </div>
            </div>

            {/* Password Fields (Conditional) */}
            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="auth-password-input" className="block text-[10px] font-bold text-[#7C7971] uppercase tracking-widest">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      id="auth-to-forgot-btn"
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[10px] font-bold text-[#5A5A40] hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09D94]" />
                  <input
                    id="auth-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#FCFBF9] border border-[#E5E2D9] rounded-xl text-xs text-[#3D3B36] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#5A5A40] placeholder-[#C2C0B8]"
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label htmlFor="auth-confirm-password-input" className="block text-[10px] font-bold text-[#7C7971] uppercase tracking-widest">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09D94]" />
                  <input
                    id="auth-confirm-password-input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#FCFBF9] border border-[#E5E2D9] rounded-xl text-xs text-[#3D3B36] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#5A5A40] placeholder-[#C2C0B8]"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#DEDCD4] disabled:text-[#A09D94]"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#F0E6D2]" />
              )}
              <span>
                {mode === 'signin' && 'Sign In to Ethos AI'}
                {mode === 'signup' && 'Register Philosophy Workspace'}
                {mode === 'forgot' && 'Send Password Reset Link'}
              </span>
            </button>

            {/* Mode Swapper */}
            <div className="text-center pt-2">
              {mode === 'signin' && (
                <p className="text-xs text-[#7C7971]">
                  Don't have a ledger account yet?{' '}
                  <button
                    id="auth-to-signup-btn"
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError('');
                      setMessage('');
                    }}
                    className="font-bold text-[#5A5A40] hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              )}
              {mode === 'signup' && (
                <p className="text-xs text-[#7C7971]">
                  Already have an account?{' '}
                  <button
                    id="auth-to-signin-btn"
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError('');
                      setMessage('');
                    }}
                    className="font-bold text-[#5A5A40] hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              )}
              {mode === 'forgot' && (
                <p className="text-xs text-[#7C7971]">
                  Remembered your password?{' '}
                  <button
                    id="auth-forgot-to-signin-btn"
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError('');
                      setMessage('');
                    }}
                    className="font-bold text-[#5A5A40] hover:underline"
                  >
                    Back to Sign In
                  </button>
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
