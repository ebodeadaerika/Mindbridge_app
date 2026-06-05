// MindBridge — Login Screen

import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Building2 } from 'lucide-react';
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
  const [error, setError] = useState('');

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

        {/* Campus SSO */}
        <div className="flex gap-3 w-full">
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
