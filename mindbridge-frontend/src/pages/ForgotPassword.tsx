// MindBridge — Forgot Password

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { authApi } from '@/api/client';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!submitted) return;
    setCountdown(60);
    setCanResend(false);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      await authApi.forgotPassword({ email: email.trim() });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setLoading(true);
    setError('');
    try {
      await authApi.forgotPassword({ email: email.trim() });
      setSubmitted(false);
      setTimeout(() => setSubmitted(true), 50);
    } catch {
      setError('Could not resend. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ backgroundColor: '#0D0F14' }}
    >
      {/* Violet orb corner */}
      <div
        className="absolute bottom-0 right-0 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(123,97,255,0.12) 0%, transparent 70%)', transform: 'translate(30%, 30%)' }}
      />

      <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
      {/* Back button */}
      <div className="px-5 pt-12 pb-2">
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <ArrowLeft style={{ color: '#F0F2F5', width: 24, height: 24 }} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-16 gap-8">
        {!submitted ? (
          <>
            {/* Icon */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'rgba(0,201,167,0.12)',
                border: '2px solid rgba(0,201,167,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 32px rgba(0,201,167,0.2)',
              }}
            >
              <Mail style={{ color: '#00C9A7', width: 36, height: 36 }} />
            </div>

            <div className="text-center flex flex-col gap-2">
              <h1
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  fontSize: '26px',
                  color: '#F0F2F5',
                }}
              >
                Forgot your password?
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: '#8B949E', lineHeight: 1.6 }}>
                Enter your university email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#8B949E', width: 18, height: 18 }}
                />
                <input
                  type="email"
                  placeholder="your@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  style={{
                    backgroundColor: '#161B22',
                    border: '1px solid #30363D',
                    borderRadius: '14px',
                    height: '56px',
                    padding: '0 16px 0 44px',
                    color: '#F0F2F5',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15px',
                    width: '100%',
                    outline: 'none',
                  }}
                />
              </div>

              {error && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#FF5C5C', paddingLeft: 4 }}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={!email.trim() || loading}
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
                  cursor: email.trim() && !loading ? 'pointer' : 'not-allowed',
                  opacity: email.trim() && !loading ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 24px rgba(0,201,167,0.25)',
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(13,15,20,0.3)" strokeWidth="3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="#0D0F14" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <button
              onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', color: '#00C9A7', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
            >
              Back to login
            </button>
          </>
        ) : (
          // Success state
          <>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'rgba(0,201,167,0.12)',
                border: '2px solid rgba(0,201,167,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 32px rgba(0,201,167,0.25)',
                position: 'relative',
              }}
            >
              <Mail style={{ color: '#00C9A7', width: 36, height: 36 }} />
              <div
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#00C9A7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path d="M1 5L4.5 8.5L11 1" stroke="#0D0F14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div className="text-center flex flex-col gap-2">
              <h1
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  fontSize: '26px',
                  color: '#F0F2F5',
                }}
              >
                Check your inbox
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: '#8B949E', lineHeight: 1.6 }}>
                If{' '}
                <span style={{ color: '#F0F2F5', fontWeight: 500 }}>{email}</span>
                {' '}is registered, you'll receive a reset link shortly. The link expires in 1 hour.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              {canResend ? (
                <button
                  onClick={handleResend}
                  style={{ background: 'none', border: 'none', color: '#00C9A7', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Resend email
                </button>
              ) : (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#8B949E' }}>
                  Resend in{' '}
                  <span style={{ color: '#00C9A7', fontWeight: 600 }}>{countdown}s</span>
                </p>
              )}

              <button
                onClick={() => navigate('/login')}
                style={{ background: 'none', border: 'none', color: '#00C9A7', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
              >
                Back to login
              </button>
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
