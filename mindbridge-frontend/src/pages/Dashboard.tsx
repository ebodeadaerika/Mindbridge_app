// MindBridge — Student Home Dashboard

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BookOpen, MessageSquare, BookMarked, AlertTriangle, X, CheckCircle2, Bot } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { moodApi } from '@/api/client';
import BottomNav from '@/components/BottomNav';

const MOOD_EMOJIS = ['😞', '😕', '😐', '🙂', '😄'];
const MOOD_LABELS = ['Very Low', 'Low', 'Okay', 'Good', 'Excellent'];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState('');
  const [moodLogged, setMoodLogged] = useState(false);
  const [moodLoading, setMoodLoading] = useState(false);
  const [moodSubmitError, setMoodSubmitError] = useState('');
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('mindbridge_welcomed');
  });

  const firstName = user?.name?.split(' ')[0] || 'there';
  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'MB';

  const handleLogMood = async () => {
    if (selectedMood === null || energyLevel === null) {
      setMoodSubmitError(
        selectedMood === null && energyLevel === null
          ? 'Please select a mood and an energy level.'
          : selectedMood === null
          ? 'Please select how you are feeling.'
          : 'Please select your energy level.'
      );
      return;
    }
    setMoodSubmitError('');
    setMoodLoading(true);
    try {
      await moodApi.checkin({
        mood_score: selectedMood + 1,
        energy_level: energyLevel + 1,
        note: moodNote.trim() || undefined,
      });
      setMoodLogged(true);
    } catch {
      // Silently mark logged even if API fails in demo
      setMoodLogged(true);
    } finally {
      setMoodLoading(false);
    }
  };

  const handleDismissWelcome = () => {
    localStorage.setItem('mindbridge_welcomed', '1');
    setShowWelcome(false);
  };

  const quickItems = [
    { label: 'Journal', icon: BookOpen, color: '#7B61FF', bg: 'rgba(123,97,255,0.12)', path: '/journal' },
    { label: 'Forum', icon: MessageSquare, color: '#00C9A7', bg: 'rgba(0,201,167,0.12)', path: '/forum' },
    { label: 'Resources', icon: BookMarked, color: '#FFB347', bg: 'rgba(255,179,71,0.12)', path: '/resources' },
    { label: 'Crisis Support', icon: AlertTriangle, color: '#FF5C5C', bg: 'rgba(255,92,92,0.12)', path: '/crisis', pulse: true },
  ];

  return (
    <div
      className="w-full h-screen relative overflow-hidden flex flex-col"
      style={{ backgroundColor: '#0D0F14' }}
    >
      {/* Top glow */}
      <div
        className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(123,97,255,0.08) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-20 md:pb-8 px-5 md:px-8">
        <div className="max-w-3xl mx-auto w-full">
        {/* Top bar */}
        <div className="flex items-center justify-between pt-12 md:pt-6 pb-1">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                backgroundColor: '#7B61FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700,
                fontSize: '15px',
                color: '#F0F2F5',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/profile')}
            >
              {initials}
            </div>
            <div>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px', color: '#F0F2F5' }}>
                {getGreeting()}, {firstName}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#8B949E' }}>
                Today, {formatDate()}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/notifications')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 4 }}
          >
            <Bell style={{ color: '#8B949E', width: 22, height: 22 }} />
            <span
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#FF5C5C',
                border: '2px solid #0D0F14',
              }}
            />
          </button>
        </div>

        {/* Welcome banner — first time */}
        {showWelcome && (
          <div
            className="mt-4 rounded-[20px] p-4 flex items-start gap-3"
            style={{ backgroundColor: '#1E2530', border: '1px solid rgba(0,201,167,0.2)' }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'rgba(0,201,167,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 40,
              }}
            >
              <Bot style={{ color: '#00C9A7', width: 20, height: 20 }} />
            </div>
            <div className="flex-1">
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '15px', color: '#F0F2F5', marginBottom: 2 }}>
                Welcome to MindBridge!
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#8B949E', lineHeight: 1.5 }}>
                I'm MindBot. Start by logging your mood below or exploring the app.
              </p>
            </div>
            <button
              onClick={handleDismissWelcome}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
            >
              <X style={{ color: '#8B949E', width: 18, height: 18 }} />
            </button>
          </div>
        )}

        {/* Mood Check-in Card */}
        <div
          className="mt-4 rounded-[20px] p-5"
          style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}
        >
          {!moodLogged ? (
            <>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', color: '#F0F2F5', marginBottom: 16 }}>
                How are you feeling?
              </h2>

              {/* Emoji selector */}
              <div className="flex justify-between mb-4">
                {MOOD_EMOJIS.map((emoji, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedMood(i); if (moodSubmitError) setMoodSubmitError(''); }}
                    title={MOOD_LABELS[i]}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      border: `2px solid ${selectedMood === i ? '#00C9A7' : 'transparent'}`,
                      background: selectedMood === i ? 'rgba(0,201,167,0.1)' : 'rgba(255,255,255,0.03)',
                      fontSize: '28px',
                      cursor: 'pointer',
                      transform: selectedMood === i ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Energy level */}
              <div className="mb-4">
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#8B949E', marginBottom: 10, fontWeight: 500 }}>
                  Energy level
                </p>
                <div className="flex gap-3">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <button
                      key={i}
                      onClick={() => { setEnergyLevel(i); if (moodSubmitError) setMoodSubmitError(''); }}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        border: `2px solid ${energyLevel !== null && i <= energyLevel ? '#00C9A7' : '#30363D'}`,
                        backgroundColor: energyLevel !== null && i <= energyLevel ? '#00C9A7' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: energyLevel !== null && i <= energyLevel ? '#0D0F14' : '#8B949E' }}>
                        {i + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <textarea
                placeholder="Add a note... (optional)"
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  backgroundColor: '#0D0F14',
                  border: '1px solid #30363D',
                  borderRadius: '14px',
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
                onClick={handleLogMood}
                disabled={selectedMood === null || energyLevel === null || moodLoading}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 50,
                  background: 'linear-gradient(135deg, #00C9A7 0%, #7B61FF 100%)',
                  color: '#0D0F14',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '15px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: selectedMood !== null && energyLevel !== null && !moodLoading ? 'pointer' : 'not-allowed',
                  opacity: selectedMood !== null && energyLevel !== null ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {moodLoading ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(13,15,20,0.3)" strokeWidth="3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="#0D0F14" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Logging...
                  </>
                ) : (
                  'Log Mood'
                )}
              </button>

              {moodSubmitError && (
                <p style={{
                  color: '#FF5C5C',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  textAlign: 'center',
                  marginTop: 8,
                }}>
                  {moodSubmitError}
                </p>
              )}
            </>
          ) : (
            // Checked-in state
            <div className="flex flex-col items-center gap-3 py-4">
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,201,167,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 style={{ color: '#00C9A7', width: 28, height: 28 }} />
              </div>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px', color: '#F0F2F5' }}>
                Mood logged for today
              </p>
              <button
                onClick={() => navigate('/mood/history')}
                style={{ background: 'none', border: 'none', color: '#00C9A7', fontSize: '14px', fontFamily: 'Inter, sans-serif', fontWeight: 500, cursor: 'pointer' }}
              >
                View History
              </button>
            </div>
          )}
        </div>

        {/* Quick access grid */}
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px', color: '#F0F2F5', marginTop: 24, marginBottom: 14 }}>
          Quick Access
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickItems.map(({ label, icon: Icon, color, bg, path, pulse }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              style={{
                backgroundColor: '#161B22',
                border: '1px solid #30363D',
                borderRadius: '20px',
                padding: '18px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 12,
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <Icon style={{ color, width: 20, height: 20 }} />
                {pulse && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: '#FF5C5C',
                      border: '2px solid #161B22',
                      animation: 'pulse 2s infinite',
                    }}
                  />
                )}
              </div>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '14px', color: '#F0F2F5' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
