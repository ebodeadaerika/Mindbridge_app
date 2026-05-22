// MindBridge — Login Screen

import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Building2 } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import BrainBridgeLogo from '@/components/BrainBridgeLogo';
import { authApi } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import type { AuthToken } from '@/types';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useAuth();

  // Already authenticated — skip login page
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (tokenResponse: { access_token: string }) => {
    setGoogleLoading(true);
    setError('');
    try {
      const res = await authApi.googleAuth(tokenResponse.access_token);
      const data: AuthToken = res.data;
      login(data.access_token, data.refresh_token, data.user);
      navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Google sign-in was cancelled or failed.'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login({ email: email.trim(), password });
      const data: AuthToken = res.data;
      login(data.access_token, data.refresh_token, data.user);
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Incorrect email or password');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    backgroundColor: '#161B22',
    border: `1px solid ${hasError ? '#FF5C5C' : '#30363D'}`,
    borderRadius: '14px',
    height: '56px',
    padding: '0 16px 0 44px',
    color: '#F0F2F5',
    fontFamily: 'Inter, sans-serif',
    fontSize: '15px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
  });

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ backgroundColor: '#0D0F14' }}
    >
      {/* Violet glow orb bottom-left */}
      <div
        className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(123,97,255,0.12) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }}
      />

      <div className="flex-1 overflow-y-auto flex flex-col items-center px-5 pt-16 pb-8">
        <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }} className="flex flex-col items-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div style={{ filter: 'drop-shadow(0 0 20px rgba(0,201,167,0.5))' }}>
            <BrainBridgeLogo size={48} />
          </div>
          <h1
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: '28px',
              color: '#F0F2F5',
            }}
          >
            Welcome back
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#8B949E' }}>
            We missed you 👋
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {/* Email */}
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#00C9A7', width: 18, height: 18 }}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={inputStyle(!!error)}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: '#00C9A7', width: 18, height: 18 }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{ ...inputStyle(!!error), paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                {showPassword ? (
                  <EyeOff style={{ color: '#8B949E', width: 18, height: 18 }} />
                ) : (
                  <Eye style={{ color: '#8B949E', width: 18, height: 18 }} />
                )}
              </button>
            </div>

            {/* Error */}
            {error && (
              <p style={{ color: '#FF5C5C', fontSize: '13px', fontFamily: 'Inter, sans-serif', paddingLeft: 4 }}>{error}</p>
            )}

            {/* Forgot password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                style={{ background: 'none', border: 'none', color: '#00C9A7', fontSize: '13px', fontFamily: 'Inter, sans-serif', cursor: 'pointer', fontWeight: 500 }}
              >
                Forgot password?
              </button>
            </div>
          </div>

          {/* Sign In */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: 56,
              borderRadius: 50,
              background: 'linear-gradient(135deg, #00C9A7 0%, #7B61FF 100%)',
              color: '#0D0F14',
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 24px rgba(0,201,167,0.25)',
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(13,15,20,0.3)" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#0D0F14" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full my-6">
          <div style={{ flex: 1, height: 1, backgroundColor: '#30363D' }} />
          <span style={{ color: '#8B949E', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>or</span>
          <div style={{ flex: 1, height: 1, backgroundColor: '#30363D' }} />
        </div>

        {/* SSO Buttons — side by side */}
        <div className="flex gap-3 w-full">
          <button
            onClick={() => googleLogin()}
            disabled={googleLoading || loading}
            style={{
              flex: 1,
              height: 52,
              borderRadius: 14,
              background: 'transparent',
              border: '1px solid #30363D',
              color: '#F0F2F5',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              cursor: googleLoading || loading ? 'not-allowed' : 'pointer',
              opacity: googleLoading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'border-color 0.2s, opacity 0.2s',
            }}
          >
            {googleLoading ? (
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(240,242,245,0.3)" strokeWidth="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#F0F2F5" strokeWidth="3" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Google
          </button>
          <button
            onClick={() => alert('SSO coming soon')}
            style={{
              flex: 1,
              height: 52,
              borderRadius: 14,
              background: 'transparent',
              border: '1px solid #30363D',
              color: '#F0F2F5',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Building2 style={{ width: 18, height: 18, color: '#00C9A7' }} />
            Campus SSO
          </button>
        </div>

        {/* Register link */}
        <p className="mt-8 text-center" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#8B949E' }}>
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            style={{ background: 'none', border: 'none', color: '#00C9A7', fontWeight: 600, cursor: 'pointer', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
          >
            Register
          </button>
        </p>
        </div>
      </div>
    </div>
  );
}
