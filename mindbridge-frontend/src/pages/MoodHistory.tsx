// MindBridge — Mood History

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { moodApi } from '@/api/client';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { MOOD_EMOJIS, MOOD_LABELS } from '@/types';
import type { MoodLog, MoodHistory as MoodHistoryType } from '@/types';
import PageShell from '@/components/ui/PageShell';
import BackButton from '@/components/ui/BackButton';
import { formatDateShort, formatDateWeekday } from '@/utils/formatters';

export default function MoodHistory() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [entries, setEntries] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [average, setAverage] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await moodApi.history();
        const data: MoodHistoryType = res.data;
        setEntries(data.entries || []);
        if (data.entries?.length) {
          const avg = data.entries.reduce((s, e) => s + e.mood_score, 0) / data.entries.length;
          setAverage(Math.round(avg * 10) / 10);
        }
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredEntries = (() => {
    const now = new Date();
    const cutoff = new Date(now);
    if (period === 'weekly') cutoff.setDate(now.getDate() - 7);
    else cutoff.setDate(now.getDate() - 30);
    return entries.filter((e) => new Date(e.date) >= cutoff);
  })();

  const chartData = filteredEntries.map((e) => ({
    date: formatDateShort(e.date),
    mood: e.mood_score,
  })).reverse();

  const leftBorderColors = ['#00C9A7', '#7B61FF', '#FFB347'];

  return (
    <PageShell>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 md:px-8 pt-12 md:pt-6 pb-4">
        <BackButton />
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: '#F0F2F5', flex: 1 }}>
          My Mood
        </h1>
        {average > 0 && (
          <span
            style={{
              backgroundColor: 'rgba(0,201,167,0.15)',
              color: '#00C9A7',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              padding: '4px 12px',
              borderRadius: 50,
              border: '1px solid rgba(0,201,167,0.3)',
            }}
          >
            Avg: {average}/5
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 pb-8">
        <div className="max-w-3xl mx-auto w-full">
        {/* Period toggle */}
        <div
          className="flex gap-2 mb-6"
          style={{
            backgroundColor: '#161B22',
            borderRadius: 50,
            padding: 4,
            display: 'inline-flex',
          }}
        >
          {(['weekly', 'monthly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                borderRadius: 50,
                padding: '8px 20px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                border: period === p ? 'none' : '1px solid transparent',
                backgroundColor: period === p ? '#00C9A7' : 'transparent',
                color: period === p ? '#0D0F14' : '#8B949E',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {p === 'weekly' ? 'Weekly' : 'Monthly'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            <div style={{ height: 200, backgroundColor: '#161B22', borderRadius: 20, animation: 'pulse 1.5s infinite' }} />
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 80, backgroundColor: '#161B22', borderRadius: 20, animation: 'pulse 1.5s infinite', opacity: 1 - i * 0.2 }} />
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <Calendar style={{ color: '#8B949E', width: 64, height: 64 }} />
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '18px', color: '#F0F2F5' }}>
              No mood history yet
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#8B949E' }}>
              Start by logging your mood today
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '12px 28px',
                borderRadius: 50,
                background: 'linear-gradient(135deg, #00C9A7 0%, #7B61FF 100%)',
                color: '#0D0F14',
                fontFamily: 'Inter, sans-serif',
                fontSize: '15px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Go to Check-in
            </button>
          </div>
        ) : (
          <>
            {/* Chart */}
            <div
              style={{ backgroundColor: '#161B22', borderRadius: 20, padding: '16px 8px 8px', marginBottom: 20 }}
            >
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#00C9A7" />
                      <stop offset="100%" stopColor="#7B61FF" />
                    </linearGradient>
                    <linearGradient id="moodAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00C9A7" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#7B61FF" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#8B949E', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis domain={[1, 5]} hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E2530',
                      border: '1px solid #30363D',
                      borderRadius: 10,
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 13,
                      color: '#F0F2F5',
                    }}
                    labelStyle={{ color: '#8B949E' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="url(#moodGrad)"
                    strokeWidth={2.5}
                    fill="url(#moodAreaGrad)"
                    dot={{ fill: '#00C9A7', r: 3 }}
                    activeDot={{ r: 5, fill: '#00C9A7' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Entry list */}
            <div className="flex flex-col gap-3">
              {filteredEntries.map((entry, i) => (
                <div
                  key={entry.id}
                  style={{
                    backgroundColor: '#161B22',
                    borderRadius: 16,
                    padding: '14px 16px',
                    borderLeft: `4px solid ${leftBorderColors[i % leftBorderColors.length]}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 26 }}>{MOOD_EMOJIS[entry.mood_score - 1]}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '15px', color: '#F0F2F5' }}>
                        {MOOD_LABELS[entry.mood_score - 1]}
                      </p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8B949E' }}>
                        {formatDateWeekday(entry.date)}
                      </p>
                    </div>
                    {entry.note && (
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#8B949E', lineHeight: 1.5 }}>
                        {entry.note.length > 80 ? entry.note.slice(0, 80) + '...' : entry.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        </div>
      </div>
    </PageShell>
  );
}
