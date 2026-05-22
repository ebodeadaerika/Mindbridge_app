// MindBridge — Reset Password

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Eye, EyeOff, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { authApi } from '@/api/client';

function getStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

const strengthColors = ['#FF5C5C', '#FF5C5C', '#FFB347', '#FFD60A', '#00C9A7'];
const strengthLabels = ['', 'Weak', 'Weak', 'Fair', 'Strong'];

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  const strength = getStrength(newPassword);
  const hasLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const allMet = hasLength && hasUpper && hasNumber && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allMet || !token) return;
    setLoading(true);
    setResetError('');
    try {
      await authApi.resetPassword({ token, new_password: newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setResetError(err.response?.data?.detail || 'Reset link is invalid or has expired. Please request a new one.');
      setLoading(false);
    }
  };

  const inputStyle = (err?: boolean): React.CSSProperties => ({
    backgroundColor: '#161B22',
    border: `1px solid ${err ? '#FF5C5C' : '#30363D'}`,
    borderRadius: '14px',
    height: '56px',
    padding: '0 44px 0 16px',
    color: '#F0F2F5',
    fontFamily: 'Inter, sans-serif',
    fontSize: '15px',
    width: '100%',
    outline: 'none',
  });

  if (success) {
    return (
      <div
        className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-5 gap-6"
        style={{ backgroundColor: '#0D0F14' }}
      >
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
            boxShadow: '0 0 40px rgba(0,201,167,0.3)',
          }}
        >
          <CheckCircle2 style={{ color: '#00C9A7', width: 40, height: 40 }} />
        </div>
        <div className="text-center">
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '26px', color: '#F0F2F5', marginBottom: 8 }}>
            Password reset!
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: '#8B949E' }}>
            Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

  // No token in URL — show a friendly error instead of a broken form
  if (!token) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-5 gap-6"
        style={{ backgroundColor: '#0D0F14' }}
      >
        <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: 'rgba(255,92,92,0.12)', border: '2px solid rgba(255,92,92,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AlertTriangle style={{ color: '#FF5C5C', width: 32, height: 32 }} />
        </div>
        <div className="text-center">
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: '#F0F2F5', marginBottom: 8 }}>
            Invalid reset link
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#8B949E', lineHeight: 1.6 }}>
            This link is missing or malformed. Please request a new password reset.
          </p>
        </div>
        <button
          onClick={() => navigate('/forgot-password')}
          style={{ padding: '12px 28px', borderRadius: 50, background: 'linear-gradient(135deg, #00C9A7 0%, #7B61FF 100%)', color: '#0D0F14', fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
        >
          Request new link
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ backgroundColor: '#0D0F14' }}
    >
      {/* Teal orb */}
      <div
        className="absolute top-0 left-0 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,201,167,0.1) 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }}
      />

      <div className="flex-1 overflow-y-auto flex flex-col items-center px-5 pt-16 pb-8 gap-6">
        <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }} className="flex flex-col items-center gap-6">
        {/* Shield icon */}
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
          <Shield style={{ color: '#00C9A7', width: 36, height: 36 }} />
        </div>

        <div className="text-center flex flex-col gap-2">
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '26px', color: '#F0F2F5' }}>
            Create new password
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: '#8B949E' }}>
            Make it strong. Make it yours.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {/* New Password */}
          <div className="flex flex-col gap-2">
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                style={inputStyle()}
              />
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                {showNew ? <EyeOff style={{ color: '#8B949E', width: 18, height: 18 }} /> : <Eye style={{ color: '#8B949E', width: 18, height: 18 }} />}
              </button>
            </div>

            {/* Strength bar */}
            {newPassword.length > 0 && (
              <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 4,
                        backgroundColor: i <= strength ? strengthColors[strength] : '#30363D',
                        transition: 'background-color 0.3s',
                      }}
                    />
                  ))}
                </div>
                <p style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif', color: strengthColors[strength] }}>
                  {strengthLabels[strength]}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              style={{ ...inputStyle(!passwordsMatch && confirmPassword.length > 0), paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              {showConfirm ? <EyeOff style={{ color: '#8B949E', width: 18, height: 18 }} /> : <Eye style={{ color: '#8B949E', width: 18, height: 18 }} />}
            </button>
            {confirmPassword.length > 0 && (
              <div style={{ position: 'absolute', right: 44, top: '50%', transform: 'translateY(-50%)' }}>
                {passwordsMatch ? (
                  <CheckCircle2 style={{ color: '#00C9A7', width: 16, height: 16 }} />
                ) : null}
              </div>
            )}
          </div>

          {/* Requirements checklist */}
          <div
            style={{
              backgroundColor: '#161B22',
              borderRadius: '14px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8B949E', fontWeight: 500, marginBottom: 2 }}>
              REQUIREMENTS
            </p>
            {[
              { met: hasLength, label: 'At least 8 characters' },
              { met: hasUpper, label: 'At least one uppercase letter' },
              { met: hasNumber, label: 'At least one number' },
            ].map(({ met, label }) => (
              <div key={label} className="flex items-center gap-2">
                {met ? (
                  <CheckCircle2 style={{ color: '#00C9A7', width: 16, height: 16, minWidth: 16 }} />
                ) : (
                  <Circle style={{ color: '#30363D', width: 16, height: 16, minWidth: 16 }} />
                )}
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: met ? '#F0F2F5' : '#8B949E' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {resetError && (
            <div
              style={{ backgroundColor: 'rgba(255,92,92,0.1)', border: '1px solid rgba(255,92,92,0.3)', borderRadius: 12, padding: '12px 14px' }}
            >
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#FF5C5C', lineHeight: 1.5, margin: 0 }}>
                {resetError}
              </p>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                style={{ background: 'none', border: 'none', color: '#00C9A7', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: '4px 0 0', display: 'block' }}
              >
                Request a new link →
              </button>
            </div>
          )}
          <button
            type="submit"
            disabled={!allMet || loading}
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
              cursor: allMet && !loading ? 'pointer' : 'not-allowed',
              opacity: allMet && !loading ? 1 : 0.5,
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
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
