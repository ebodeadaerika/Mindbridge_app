// MindBridge — Create Account / Register

import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { authInputBase, authInputStyle } from '@/styles/shared';
import type { AuthToken } from '@/types';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function Register() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const allFilled = name.trim() && email.trim() && password && confirmPassword;
  const isEnabled = allFilled && termsChecked;

  // Mirrors the backend _ACADEMIC_EMAIL_RE: .edu | .ac.XX | .edu.XX
  const isAcademicEmail = (addr: string): boolean =>
    /\.(edu|ac\.[a-z]{2,4}|edu\.[a-z]{2,4})$/i.test(addr.split('@')[1] || '');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) newErrors.email = 'University email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter a valid email';
    else if (!isAcademicEmail(email)) newErrors.email = 'Please use your university email (e.g. .edu, .ac.uk, .ac.cm)';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(password)) newErrors.password = 'Password must contain at least one uppercase letter';
    else if (!/\d/.test(password)) newErrors.password = 'Password must contain at least one number';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!isEnabled) return;
    setLoading(true);
    setErrors({});
    try {
      const res = await authApi.register({ name: name.trim(), email: email.trim(), password });
      const data: AuthToken = res.data;
      login(data.access_token, data.refresh_token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed. Please try again.';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (field: keyof FormErrors): React.CSSProperties => ({
    ...authInputBase,
    ...authInputStyle(!!errors[field]),
    opacity: loading ? 0.6 : 1,
  });

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ backgroundColor: '#0D0F14' }}
    >
      {/* Teal glow orb top-right */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,201,167,0.15) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
      />

      <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-2">
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          <ArrowLeft style={{ color: '#F0F2F5', width: 24, height: 24 }} />
        </button>
      </div>

      <div className="px-5 pb-4">
        <h1
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: '28px',
            color: '#F0F2F5',
            marginBottom: 6,
          }}
        >
          Create account
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#8B949E' }}>
          Join your campus wellness community
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 pb-8 flex flex-col gap-4">
        {errors.general && (
          <div
            className="rounded-[14px] px-4 py-3"
            style={{ backgroundColor: 'rgba(255,92,92,0.12)', border: '1px solid rgba(255,92,92,0.3)' }}
          >
            <p style={{ color: '#FF5C5C', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>{errors.general}</p>
          </div>
        )}

        {/* Full Name */}
        <div className="flex flex-col gap-1">
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#8B949E', width: 18, height: 18 }}
            />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              style={getInputStyle('name')}
            />
          </div>
          {errors.name && (
            <p style={{ color: '#FF5C5C', fontSize: '12px', fontFamily: 'Inter, sans-serif', paddingLeft: 4 }}>{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
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
              style={getInputStyle('email')}
            />
          </div>
          {errors.email && (
            <p style={{ color: '#FF5C5C', fontSize: '12px', fontFamily: 'Inter, sans-serif', paddingLeft: 4 }}>{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#8B949E', width: 18, height: 18 }}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={{ ...getInputStyle('password'), paddingRight: 44 }}
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
          {errors.password && (
            <p style={{ color: '#FF5C5C', fontSize: '12px', fontFamily: 'Inter, sans-serif', paddingLeft: 4 }}>{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1">
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#8B949E', width: 18, height: 18 }}
            />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              style={{ ...getInputStyle('confirmPassword'), paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((p) => !p)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              {showConfirmPassword ? (
                <EyeOff style={{ color: '#8B949E', width: 18, height: 18 }} />
              ) : (
                <Eye style={{ color: '#8B949E', width: 18, height: 18 }} />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p style={{ color: '#FF5C5C', fontSize: '12px', fontFamily: 'Inter, sans-serif', paddingLeft: 4 }}>{errors.confirmPassword}</p>
          )}
        </div>

        {/* Terms */}
        <label className="flex items-start gap-3 cursor-pointer" style={{ paddingTop: 4 }}>
          <div
            onClick={() => setTermsChecked((p) => !p)}
            style={{
              width: 20,
              height: 20,
              minWidth: 20,
              borderRadius: 6,
              border: `2px solid ${termsChecked ? '#00C9A7' : '#30363D'}`,
              backgroundColor: termsChecked ? '#00C9A7' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 2,
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
          >
            {termsChecked && (
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M1 5L4.5 8.5L11 1" stroke="#0D0F14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#8B949E', lineHeight: 1.5 }}>
            I agree to the{' '}
            <span style={{ color: '#00C9A7' }}>Terms of Service</span> and{' '}
            <span style={{ color: '#00C9A7' }}>Privacy Policy</span>
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isEnabled || loading}
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
            cursor: isEnabled && !loading ? 'pointer' : 'not-allowed',
            opacity: isEnabled && !loading ? 1 : 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'opacity 0.2s',
            marginTop: 8,
          }}
        >
          {loading ? (
            <>
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(13,15,20,0.3)" strokeWidth="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#0D0F14" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>

        <p className="text-center" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#8B949E' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', color: '#00C9A7', fontWeight: 600, cursor: 'pointer', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
          >
            Sign in
          </button>
        </p>
      </form>
      </div>
    </div>
  );
}
