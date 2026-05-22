// MindBridge — Admin Dashboard

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, TrendingUp, AlertTriangle, MessageSquare } from 'lucide-react';
import { moodApi, crisisApi, forumApi } from '@/api/client';
import AdminBottomNav from '@/components/AdminBottomNav';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts';
import type { CrisisFlag, MoodTrends } from '@/types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function todayDayIndex(): number {
  return (new Date().getDay() + 6) % 7; // 0=Mon, 6=Sun
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [trends, setTrends] = useState<MoodTrends | null>(null);
  const [crisisFlags, setCrisisFlags] = useState<CrisisFlag[]>([]);
  const [forumPostCount, setForumPostCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [trendsRes, crisisRes, forumRes] = await Promise.all([
          moodApi.trends(),
          crisisApi.list({ resolved: false }),
          forumApi.list({}),
        ]);
        setTrends(trendsRes.data);
        setCrisisFlags(crisisRes.data.flags || []);
        setForumPostCount(forumRes.data.total ?? 0);
      } catch {
        // fail gracefully
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const todayIdx = todayDayIndex();

  // Build a day-of-week lookup from daily_averages (sorted oldest→newest).
  // daily_averages[i].date is a calendar date string, NOT a Mon-Sun index.
  // We iterate all entries so the LATEST value wins for each weekday bucket.
  const dayMoodMap: Record<number, number> = {};
  if (trends?.daily_averages) {
    for (const entry of trends.daily_averages) {
      const d = new Date(entry.date + 'T00:00:00'); // force local midnight parse
      const dow = (d.getDay() + 6) % 7; // JS: 0=Sun → convert to 0=Mon
      dayMoodMap[dow] = entry.avg_mood;
    }
  }
  const barData = DAYS.map((day, i) => ({ day, mood: dayMoodMap[i] ?? 0 }));

  const pendingCount = crisisFlags.filter((f) => !f.resolved).length;
  const topFlags = crisisFlags.slice(0, 3);

  const statCards = [
    { label: 'Total Check-ins', value: trends?.total_checkins ?? 0, icon: BarChart2, color: '#00C9A7', bg: 'rgba(0,201,167,0.12)' },
    { label: 'Avg Mood This Week', value: trends ? `${trends.average_mood.toFixed(1)}/5` : '—', icon: TrendingUp, color: '#7B61FF', bg: 'rgba(123,97,255,0.12)' },
    { label: 'Crisis Flags', value: pendingCount, icon: AlertTriangle, color: '#FF5C5C', bg: 'rgba(255,92,92,0.12)', pulse: true },
    { label: 'Forum Posts', value: forumPostCount !== null ? forumPostCount : '—', icon: MessageSquare, color: '#FFB347', bg: 'rgba(255,179,71,0.12)' },
  ];

  const severityColors: Record<string, string> = {
    low: '#FFD60A',
    medium: '#FFB347',
    high: '#FF5C5C',
  };

  return (
    <div
      className="w-full h-screen relative overflow-hidden flex flex-col"
      style={{ backgroundColor: '#0D0F14' }}
    >
      <div className="flex-1 overflow-y-auto px-5 md:px-8 pb-20 md:pb-8">
        <div className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between pt-12 md:pt-6 pb-2">
          <div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: '#F0F2F5' }}>
              Admin Panel
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#8B949E' }}>
              Today, {formatDate()}
            </p>
          </div>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: '#7B61FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700,
                fontSize: '15px',
                color: '#fff',
              }}
            >
              AD
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 18,
                height: 18,
                borderRadius: '50%',
                backgroundColor: '#7B61FF',
                border: '2px solid #0D0F14',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15 9H22L16.5 13.5L18.5 21L12 17L5.5 21L7.5 13.5L2 9H9L12 2Z" fill="#fff" />
              </svg>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {statCards.map(({ label, value, icon: Icon, color, bg, pulse }) => (
            <div
              key={label}
              style={{
                backgroundColor: '#161B22',
                borderRadius: 20,
                padding: '16px',
                border: '1px solid #30363D',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <Icon style={{ color, width: 18, height: 18 }} />
                  {pulse && pendingCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
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
              </div>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color }}>
                {loading ? '—' : value}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8B949E', marginTop: 2 }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Mood chart */}
        <div
          style={{
            backgroundColor: '#161B22',
            borderRadius: 20,
            padding: '16px 8px 8px',
            marginTop: 16,
            border: '1px solid #30363D',
          }}
        >
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '15px', color: '#F0F2F5', paddingLeft: 8, marginBottom: 12 }}>
            Campus Mood This Week
          </p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={barData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="day"
                tick={{ fill: '#8B949E', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis domain={[0, 5]} hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E2530',
                  border: '1px solid #30363D',
                  borderRadius: 10,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  color: '#F0F2F5',
                }}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey="mood" radius={[6, 6, 0, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={i === todayIdx ? '#00C9A7' : '#30363D'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Crisis alerts */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', color: '#F0F2F5' }}>
              Crisis Alerts
            </h3>
            <button
              onClick={() => navigate('/admin/crisis')}
              style={{ background: 'none', border: 'none', color: '#00C9A7', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
            >
              View all
            </button>
          </div>

          {topFlags.length === 0 ? (
            <div
              style={{
                backgroundColor: '#161B22',
                borderRadius: 16,
                padding: '16px',
                border: '1px solid #30363D',
                textAlign: 'center',
              }}
            >
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#8B949E' }}>
                No pending alerts
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {topFlags.map((flag) => (
                <div
                  key={flag.id}
                  style={{
                    backgroundColor: '#161B22',
                    borderRadius: 16,
                    padding: '14px 16px',
                    border: '1px solid #30363D',
                    borderLeft: `4px solid ${severityColors[flag.severity] || '#FF5C5C'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        style={{
                          backgroundColor: `${severityColors[flag.severity]}20`,
                          color: severityColors[flag.severity],
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 50,
                        }}
                      >
                        {flag.severity.toUpperCase()}
                      </span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#8B949E' }}>
                        {new Date(flag.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                    {flag.message && (
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#8B949E', fontStyle: 'italic' }}>
                        {flag.message.length > 60 ? flag.message.slice(0, 60) + '...' : flag.message}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => navigate('/admin/crisis')}
                    style={{
                      height: 32,
                      padding: '0 14px',
                      borderRadius: 50,
                      border: '1px solid #00C9A7',
                      backgroundColor: 'transparent',
                      color: '#00C9A7',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginLeft: 12,
                    }}
                  >
                    Resolve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>

      <AdminBottomNav />
    </div>
  );
}
