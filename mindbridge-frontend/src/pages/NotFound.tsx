// MindBridge — 404 Not Found

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2 } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="w-full h-screen relative overflow-hidden flex flex-col items-center justify-center px-6 gap-6"
      style={{ backgroundColor: '#0D0F14' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(123,97,255,0.08) 0%, transparent 60%)' }}
      />

      <div className="flex flex-col items-center gap-6 relative z-10 text-center">
        {/* Broken link illustration */}
        <div style={{ position: 'relative', width: 80, height: 80 }}>
          <Link2 style={{ color: '#8B949E', width: 80, height: 80, position: 'absolute', top: 0, left: 0 }} />
          {/* Diagonal line through it */}
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <line
              x1="20"
              y1="15"
              x2="60"
              y2="65"
              stroke="#FF5C5C"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.8"
            />
          </svg>
        </div>

        <div className="flex flex-col gap-2">
          <h1
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: '28px',
              color: '#F0F2F5',
            }}
          >
            Page not found
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: '#8B949E', lineHeight: 1.5 }}>
            This page doesn't seem to exist.
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          style={{
            padding: '14px 36px',
            borderRadius: 50,
            background: 'linear-gradient(135deg, #00C9A7 0%, #7B61FF 100%)',
            color: '#0D0F14',
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,201,167,0.25)',
            transition: 'transform 0.15s',
          }}
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
