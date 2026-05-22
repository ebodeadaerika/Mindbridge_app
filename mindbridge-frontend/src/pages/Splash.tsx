// MindBridge — Splash / Onboarding Screen

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, MessageCircle, Shield } from 'lucide-react';
import BrainBridgeLogo from '@/components/BrainBridgeLogo';

const SLIDES = [
  {
    icon: Moon,
    color: '#00C9A7',
    title: 'Check in daily',
    description: 'Track your mood anonymously',
  },
  {
    icon: MessageCircle,
    color: '#7B61FF',
    title: 'Talk to MindBot',
    description: 'AI companion always available',
  },
  {
    icon: Shield,
    color: '#00C9A7',
    title: 'Always anonymous',
    description: 'Your privacy is foundational',
  },
];

export default function Splash() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentSlide < SLIDES.length - 1) setCurrentSlide((p) => p + 1);
      if (diff < 0 && currentSlide > 0) setCurrentSlide((p) => p - 1);
    }
    setTouchStart(null);
  };

  const slide = SLIDES[currentSlide];
  const SlideIcon = slide.icon;

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-between py-12 px-6"
      style={{ backgroundColor: '#0D0F14' }}
    >
      <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }} className="flex flex-col items-center justify-between flex-1 w-full py-0">
      {/* Top glow */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,201,167,0.12) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
      />

      {/* Logo + Brand */}
      <div className="flex flex-col items-center gap-3 mt-4">
        <div style={{ filter: 'drop-shadow(0 0 20px rgba(0,201,167,0.5))' }}>
          <BrainBridgeLogo size={64} />
        </div>
        <h1
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: '36px',
            color: '#F0F2F5',
            letterSpacing: '-0.5px',
          }}
        >
          MindBridge
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#8B949E' }}>
          Your safe space. Always.
        </p>
      </div>

      {/* Slide area */}
      <div
        className="flex flex-col items-center gap-6 w-full flex-1 justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Card */}
        <div
          className="w-full rounded-[20px] flex flex-col items-center gap-4 py-10 px-6 transition-all duration-300"
          style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, ${slide.color}22 0%, ${slide.color}08 100%)`,
              border: `2px solid ${slide.color}40`,
              boxShadow: `0 0 24px ${slide.color}30`,
            }}
          >
            <SlideIcon style={{ color: slide.color, width: 36, height: 36 }} />
          </div>
          <h2
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: '22px',
              color: '#F0F2F5',
              textAlign: 'center',
            }}
          >
            {slide.title}
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px',
              color: '#8B949E',
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            {slide.description}
          </p>
        </div>

        {/* Dot pagination */}
        <div className="flex gap-2 items-center">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              style={{
                width: i === currentSlide ? 24 : 8,
                height: 8,
                borderRadius: 50,
                backgroundColor: i === currentSlide ? '#00C9A7' : '#30363D',
                transition: 'all 0.3s ease',
                border: 'none',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-4 w-full">
        <button
          onClick={() => navigate('/register')}
          className="w-full h-14 rounded-[50px] font-semibold text-base transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #00C9A7 0%, #7B61FF 100%)',
            color: '#0D0F14',
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(0,201,167,0.3)',
          }}
        >
          Get Started
        </button>
        <button
          onClick={() => navigate('/login')}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            color: '#8B949E',
            cursor: 'pointer',
          }}
        >
          Already have an account?{' '}
          <span style={{ color: '#00C9A7', fontWeight: 600 }}>Log in</span>
        </button>
      </div>
      </div>
    </div>
  );
}
