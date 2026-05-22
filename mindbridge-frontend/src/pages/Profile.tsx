// MindBridge — Student Profile

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
  Globe,
  LogOut,
  Edit2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { moodApi, journalApi } from '@/api/client';
import BottomNav from '@/components/BottomNav';

type SettingsItem = {
  label: string;
  icon: React.ElementType;
  path?: string;
  soon?: boolean;
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showSignOut, setShowSignOut] = useState(false);
  const [stats, setStats] = useState({ moods: 0, journals: 0, streak: 0 });
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((label: string) => {
    setToast(`${label} — coming soon`);
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, []);

  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'MB';
  const memberYear = user?.created_at ? new Date(user.created_at).getFullYear() : new Date().getFullYear();

  useEffect(() => {
    const load = async () => {
      try {
        const [moodRes, journalRes] = await Promise.all([moodApi.history(), journalApi.list()]);
        const moodCount = moodRes.data.total || 0;
        const journalCount = journalRes.data.total || 0;
        const entries = moodRes.data.entries || [];
        let streak = 0;
        if (entries.length > 0) {
          const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          for (const e of sorted) {
            const d = new Date(e.date);
            d.setHours(0, 0, 0, 0);
            const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
            if (diff === streak) streak++;
            else break;
          }
        }
        setStats({ moods: moodCount, journals: journalCount, streak });
      } catch {
        // default zeros
      }
    };
    load();
  }, []);

  const settingsItems: SettingsItem[] = [
    { label: 'Edit Profile', icon: Edit2, path: '/profile/edit' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
    { label: 'Privacy & Anonymity', icon: Shield, soon: true },
    { label: 'Help & Support', icon: HelpCircle, soon: true },
    { label: 'Language & Accessibility', icon: Globe, soon: true },
  ];

  return (
    <div
      className="w-full h-screen relative overflow-hidden flex flex-col"
      style={{ backgroundColor: '#0D0F14' }}
    >
      <div className="flex-1 overflow-y-auto pb-20 md:pb-8">
        <div className="max-w-3xl mx-auto w-full">
        {/* Gradient header */}
        <div
          style={{
            height: 160,
            background: 'linear-gradient(135deg, #00C9A7 0%, #7B61FF 100%)',
            position: 'relative',
          }}
        />

        {/* Avatar (overlapping header) */}
        <div
          style={{
            marginTop: -44,
            paddingLeft: 20,
            paddingRight: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7B61FF 0%, #00C9A7 100%)',
              border: '3px solid #00C9A7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: '28px',
              color: '#fff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
          >
            {initials}
          </div>

          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: '#F0F2F5' }}>
            {user?.name || 'Student'}
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#8B949E' }}>
            {user?.email}
          </p>
          <span
            style={{
              backgroundColor: 'rgba(0,201,167,0.12)',
              color: '#00C9A7',
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              padding: '4px 12px',
              borderRadius: 50,
              border: '1px solid rgba(0,201,167,0.25)',
            }}
          >
            Member since {memberYear}
          </span>
        </div>

        {/* Stats */}
        <div className="flex gap-3 px-5 mt-6">
          {[
            { label: 'Mood Logs', value: stats.moods },
            { label: 'Journal Entries', value: stats.journals },
            { label: 'Days Streak', value: stats.streak },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                flex: 1,
                backgroundColor: '#161B22',
                borderRadius: 14,
                padding: '14px 8px',
                textAlign: 'center',
                border: '1px solid #30363D',
              }}
            >
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', color: '#00C9A7' }}>
                {value}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#8B949E', marginTop: 2 }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Settings list */}
        <div
          className="mx-5 mt-6"
          style={{
            backgroundColor: '#161B22',
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid #30363D',
          }}
        >
          {settingsItems.map(({ label, icon: Icon, path, soon }, i) => (
            <React.Fragment key={label}>
              <button
                onClick={() => { if (soon) showToast(label); else if (path) navigate(path); }}
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(139,148,158,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon style={{ color: '#8B949E', width: 17, height: 17 }} />
                </div>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: '#F0F2F5', flex: 1 }}>
                  {label}
                </span>
                {soon ? (
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 600, color: '#7B61FF', backgroundColor: 'rgba(123,97,255,0.12)', padding: '2px 8px', borderRadius: 50, border: '1px solid rgba(123,97,255,0.25)' }}>
                    SOON
                  </span>
                ) : (
                  <ChevronRight style={{ color: '#30363D', width: 18, height: 18 }} />
                )}
              </button>
              {i < settingsItems.length - 1 && (
                <div style={{ height: 1, backgroundColor: '#30363D', marginLeft: 68 }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Sign out */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowSignOut(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FF5C5C',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <LogOut style={{ width: 16, height: 16 }} />
            Sign Out
          </button>
        </div>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#30363D', textAlign: 'center', marginTop: 16, paddingBottom: 8 }}>
          v1.0.0
        </p>
        </div>
      </div>

      {/* Sign Out Modal */}
      {showSignOut && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
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
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,92,92,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LogOut style={{ color: '#FF5C5C', width: 24, height: 24 }} />
              </div>
              <div className="text-center">
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', color: '#F0F2F5', marginBottom: 6 }}>
                  Sign out of MindBridge?
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#8B949E' }}>
                  You can sign back in at any time.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setShowSignOut(false)}
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
                  Stay
                </button>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 50,
                    background: 'linear-gradient(135deg, #FF5C5C 0%, #cc3333 100%)',
                    border: 'none',
                    color: '#fff',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coming-soon toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1E2530',
            border: '1px solid #30363D',
            borderRadius: 50,
            padding: '10px 20px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            fontWeight: 500,
            color: '#F0F2F5',
            whiteSpace: 'nowrap',
            zIndex: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
          }}
        >
          {toast}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
