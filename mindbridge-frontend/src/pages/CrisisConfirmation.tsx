// MindBridge — Crisis Flag Confirmation

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Phone } from 'lucide-react';

function generateRef(): string {
  return 'MB-' + Math.random().toString(36).toUpperCase().slice(2, 8);
}

export default function CrisisConfirmation() {
  const navigate = useNavigate();
  const refNumber = useMemo(() => generateRef(), []);

  return (
    <div
      className="w-full h-screen relative overflow-hidden flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: '#0D0F14' }}
    >
      {/* Violet ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(123,97,255,0.15) 0%, transparent 65%)' }}
      />

      <div className="flex flex-col items-center gap-6 relative z-10 w-full max-w-lg mx-auto">
        {/* Animated illustration */}
        <div
          style={{
            width: 100,
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Glowing heart */}
          <div
            style={{
              fontSize: 64,
              animation: 'bounceY 2s ease-in-out infinite',
            }}
          >
            🤝
          </div>
          {/* Glow ring */}
          <div
            style={{
              position: 'absolute',
              inset: -12,
              borderRadius: '50%',
              border: '2px solid rgba(0,201,167,0.3)',
              animation: 'pulseRing 2s ease-in-out infinite',
            }}
          />
        </div>

        <style>{`
          @keyframes bounceY {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes pulseRing {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.15); opacity: 0.15; }
          }
        `}</style>

        {/* Heading */}
        <h1
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: '28px',
            color: '#F0F2F5',
            textAlign: 'center',
            lineHeight: 1.3,
          }}
        >
          We received your message
        </h1>

        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '15px',
            color: '#8B949E',
            textAlign: 'center',
            lineHeight: 1.7,
            maxWidth: 300,
          }}
        >
          You are not alone. A counsellor will review your message and reach out if needed.
        </p>

        {/* Divider */}
        <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, #00C9A7, transparent)' }} />

        {/* Need help right now */}
        <div className="w-full flex flex-col gap-3">
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '14px', color: '#F0F2F5', textAlign: 'center' }}>
            Need help right now?
          </p>

          <button
            onClick={() => navigate('/mindbot')}
            style={{
              backgroundColor: '#161B22',
              borderRadius: 16,
              padding: '16px',
              border: '1px solid rgba(123,97,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(123,97,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot style={{ color: '#7B61FF', width: 20, height: 20 }} />
            </div>
            <div>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '14px', color: '#F0F2F5' }}>
                Talk to MindBot
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8B949E' }}>
                Available now, always anonymous
              </p>
            </div>
          </button>

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
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '14px', color: '#F0F2F5' }}>
                Crisis Hotline 988
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#FF5C5C', fontWeight: 500 }}>
                Call now — free, confidential
              </p>
            </div>
          </a>
        </div>

        {/* Return home */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            width: '100%',
            height: 52,
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
          Return to Home
        </button>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#30363D' }}>
          Reference #{refNumber}
        </p>
      </div>
    </div>
  );
}
