// MindBridge — Crisis Support (Safety Critical)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Wind, Bot, Shield, X } from 'lucide-react';
import { crisisApi } from '@/api/client';
import BottomNav from '@/components/BottomNav';
import type { CrisisSeverity } from '@/types';

type SeverityOption = { value: CrisisSeverity; label: string; color: string; bg: string };

const SEVERITIES: SeverityOption[] = [
  { value: 'low', label: 'Low', color: '#FFD60A', bg: 'rgba(255,214,10,0.12)' },
  { value: 'medium', label: 'Medium', color: '#FFB347', bg: 'rgba(255,179,71,0.12)' },
  { value: 'high', label: 'High', color: '#FF5C5C', bg: 'rgba(255,92,92,0.12)' },
];

export default function CrisisSupport() {
  const navigate = useNavigate();
  const [severity, setSeverity] = useState<CrisisSeverity | null>(null);
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationErr, setValidationErr] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const handleSendFlag = () => {
    if (!severity) {
      setValidationErr(true);
      return;
    }
    setValidationErr(false);
    setShowConfirm(true);
  };

  const handleConfirmSend = async () => {
    if (!severity) return;
    setSubmitting(true);
    setSubmitError(false);
    try {
      await crisisApi.submit({ severity, message: message.trim() || undefined });
      navigate('/crisis/confirmation');
    } catch {
      setSubmitError(true);
      setSubmitting(false);
      // Keep modal open so the user can see the error and retry
    }
  };

  return (
    <div
      className="w-full h-screen relative overflow-hidden flex flex-col"
      style={{ backgroundColor: '#0D0F14' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(61,10,10,0.6) 0%, transparent 60%)' }}
      />

      <div className="flex-1 overflow-y-auto px-5 md:px-8 pb-24 md:pb-8 relative z-10">
        <div className="max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="pt-12 md:pt-6 pb-2">
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '28px', color: '#F0F2F5', marginBottom: 6 }}>
            Crisis Support
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: '#8B949E', lineHeight: 1.5 }}>
            You are not alone. Reaching out is brave.
          </p>
        </div>

        {/* Flag card */}
        <div
          style={{
            backgroundColor: '#161B22',
            borderRadius: 20,
            padding: 20,
            border: '1px solid rgba(255,92,92,0.2)',
            borderLeft: '4px solid #FF5C5C',
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', color: '#F0F2F5', marginBottom: 14 }}>
            Flag for Support
          </h2>

          {/* Severity selector */}
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#8B949E', marginBottom: 10, fontWeight: 500 }}>
            How urgent is this?
          </p>
          <div className="flex gap-3 mb-3">
            {SEVERITIES.map(({ value, label, color, bg }) => (
              <button
                key={value}
                onClick={() => { setSeverity(value); setValidationErr(false); }}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 50,
                  border: `2px solid ${severity === value ? color : validationErr ? '#FF5C5C' : '#30363D'}`,
                  backgroundColor: severity === value ? bg : 'transparent',
                  color: severity === value ? color : validationErr ? '#FF5C5C' : '#8B949E',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {validationErr && (
            <p style={{ color: '#FF5C5C', fontSize: '12px', fontFamily: 'Inter, sans-serif', marginBottom: 10 }}>
              Please select a severity level
            </p>
          )}

          {/* Optional message */}
          <textarea
            placeholder="Optional: add a message for the counsellor..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              backgroundColor: '#0D0F14',
              border: '1px solid #30363D',
              borderRadius: 14,
              padding: '12px 14px',
              color: '#F0F2F5',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              resize: 'none',
              outline: 'none',
              marginBottom: 14,
              lineHeight: 1.6,
            }}
          />

          <button
            onClick={handleSendFlag}
            style={{
              width: '100%',
              height: 52,
              borderRadius: 50,
              background: 'linear-gradient(135deg, #FF5C5C 0%, #cc3333 100%)',
              color: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 20px rgba(255,92,92,0.3)',
            }}
          >
            <Shield style={{ width: 18, height: 18 }} />
            Send Flag
          </button>
        </div>

        {/* Immediate Resources */}
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', color: '#F0F2F5', marginBottom: 12 }}>
          Immediate Resources
        </h3>
        <div className="flex flex-col gap-3">
          <a
            href="tel:988"
            style={{
              backgroundColor: '#161B22',
              borderRadius: 16,
              padding: '16px',
              border: '1px solid rgba(255,92,92,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              textDecoration: 'none',
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(255,92,92,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Phone style={{ color: '#FF5C5C', width: 20, height: 20 }} />
            </div>
            <div>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '15px', color: '#F0F2F5' }}>
                988 Lifeline
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#FF5C5C', fontWeight: 500 }}>
                Call now — 24/7 crisis support
              </p>
            </div>
          </a>

          <button
            onClick={() => navigate('/resources')}
            style={{
              backgroundColor: '#161B22',
              borderRadius: 16,
              padding: '16px',
              border: '1px solid rgba(0,201,167,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(0,201,167,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wind style={{ color: '#00C9A7', width: 20, height: 20 }} />
            </div>
            <div>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '15px', color: '#F0F2F5' }}>
                4-7-8 Breathing
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#8B949E' }}>
                Calming breathing technique
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/mindbot')}
            style={{
              backgroundColor: '#161B22',
              borderRadius: 16,
              padding: '16px',
              border: '1px solid rgba(123,97,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(123,97,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot style={{ color: '#7B61FF', width: 20, height: 20 }} />
            </div>
            <div>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '15px', color: '#F0F2F5' }}>
                Talk to MindBot
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#8B949E' }}>
                AI companion always available
              </p>
            </div>
          </button>
        </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && severity && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 100,
            maxWidth: 560,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              backgroundColor: '#161B22',
              borderRadius: '20px 20px 0 0',
              padding: 24,
              width: '100%',
              border: '1px solid #30363D',
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,92,92,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                }}
              >
                🛡️
              </div>
              <div className="text-center">
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', color: '#F0F2F5', marginBottom: 6 }}>
                  Send your crisis flag?
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#8B949E', marginBottom: 10 }}>
                  A counsellor will be notified.
                </p>
                {submitError && (
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#FF5C5C', marginBottom: 8, fontWeight: 600 }}>
                    Something went wrong. Please try again or call 988 for immediate support.
                  </p>
                )}
                <span
                  style={{
                    backgroundColor: SEVERITIES.find((s) => s.value === severity)?.bg,
                    color: SEVERITIES.find((s) => s.value === severity)?.color,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: 700,
                    padding: '4px 14px',
                    borderRadius: 50,
                    border: `1px solid ${SEVERITIES.find((s) => s.value === severity)?.color}40`,
                  }}
                >
                  {severity.charAt(0).toUpperCase() + severity.slice(1)} severity
                </span>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => { setShowConfirm(false); setSubmitError(false); }}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 50,
                    background: 'transparent',
                    border: '1px solid #30363D',
                    color: '#F0F2F5',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSend}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 50,
                    background: 'linear-gradient(135deg, #FF5C5C 0%, #cc3333 100%)',
                    border: 'none',
                    color: '#fff',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
