// MindBridge — Admin Crisis Alerts

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, X } from 'lucide-react';
import { crisisApi } from '@/api/client';
import AdminBottomNav from '@/components/AdminBottomNav';
import type { CrisisFlag } from '@/types';

const SEVERITY_COLORS: Record<string, string> = {
  low: '#FFD60A',
  medium: '#FFB347',
  high: '#FF5C5C',
};

const SEVERITY_BG: Record<string, string> = {
  low: 'rgba(255,214,10,0.12)',
  medium: 'rgba(255,179,71,0.12)',
  high: 'rgba(255,92,92,0.12)',
};

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AdminCrisisAlerts() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'pending' | 'resolved'>('pending');
  const [flags, setFlags] = useState<CrisisFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolveModal, setResolveModal] = useState<CrisisFlag | null>(null);
  const [resolveNote, setResolveNote] = useState('');
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pendingRes, resolvedRes] = await Promise.all([
          crisisApi.list({ resolved: false }),
          crisisApi.list({ resolved: true }),
        ]);
        const pending: CrisisFlag[] = pendingRes.data.flags || [];
        const resolved: CrisisFlag[] = resolvedRes.data.flags || [];
        setFlags([...pending, ...resolved]);
      } catch {
        setFlags([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pendingFlags = flags.filter((f) => !f.resolved);
  const resolvedFlags = flags.filter((f) => f.resolved);
  const resolvedThisWeek = resolvedFlags.filter((f) => {
    const diff = Date.now() - new Date(f.created_at).getTime();
    return diff < 7 * 86400000;
  }).length;

  const handleResolve = async () => {
    if (!resolveModal) return;
    setResolving(true);
    setResolveError('');
    try {
      await crisisApi.resolve(resolveModal.id, { resolution_note: resolveNote.trim() || undefined });
      setFlags((prev) => prev.map((f) => f.id === resolveModal.id ? { ...f, resolved: true, resolution_note: resolveNote.trim() } : f));
      setResolveModal(null);
      setResolveNote('');
    } catch {
      setResolveError('Failed to mark as resolved. Please try again.');
    } finally {
      setResolving(false);
    }
  };

  const displayFlags = tab === 'pending' ? pendingFlags : resolvedFlags;

  return (
    <div
      className="w-full h-screen relative overflow-hidden flex flex-col"
      style={{ backgroundColor: '#0D0F14' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 md:px-8 pt-12 md:pt-6 pb-4">
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ArrowLeft style={{ color: '#F0F2F5', width: 24, height: 24 }} />
        </button>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', color: '#F0F2F5', flex: 1 }}>
          Crisis Alerts
        </h1>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <SlidersHorizontal style={{ color: '#8B949E', width: 20, height: 20 }} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 pb-20 md:pb-8">
        <div className="max-w-5xl mx-auto w-full">
        {/* Tab pills */}
        <div className="flex gap-3 mb-4">
          {(['pending', 'resolved'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '8px 18px',
                borderRadius: 50,
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                border: `1px solid ${tab === t ? (t === 'pending' ? '#FF5C5C' : '#00C9A7') : '#30363D'}`,
                backgroundColor: tab === t ? (t === 'pending' ? 'rgba(255,92,92,0.12)' : 'rgba(0,201,167,0.12)') : 'transparent',
                color: tab === t ? (t === 'pending' ? '#FF5C5C' : '#00C9A7') : '#8B949E',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {t === 'pending' ? 'Pending' : 'Resolved'}
              <span
                style={{
                  backgroundColor: tab === t ? (t === 'pending' ? '#FF5C5C' : '#00C9A7') : '#30363D',
                  color: tab === t ? '#0D0F14' : '#8B949E',
                  borderRadius: 50,
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 7px',
                }}
              >
                {t === 'pending' ? pendingFlags.length : resolvedFlags.length}
              </span>
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mb-4">
          <div
            style={{
              flex: 1,
              backgroundColor: '#161B22',
              borderRadius: 14,
              padding: '12px 14px',
              border: '1px solid rgba(255,92,92,0.2)',
            }}
          >
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', color: '#FF5C5C' }}>
              {pendingFlags.length}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8B949E' }}>Pending</p>
          </div>
          <div
            style={{
              flex: 1,
              backgroundColor: '#161B22',
              borderRadius: 14,
              padding: '12px 14px',
              border: '1px solid rgba(0,201,167,0.2)',
            }}
          >
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', color: '#00C9A7' }}>
              {resolvedThisWeek}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8B949E' }}>Resolved This Week</p>
          </div>
        </div>

        {/* Flags list */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 100, backgroundColor: '#161B22', borderRadius: 20, animation: 'pulse 1.5s infinite', opacity: 1 - i * 0.2 }} />
            ))}
          </div>
        ) : displayFlags.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px', color: '#F0F2F5' }}>
              {tab === 'pending' ? 'No pending alerts' : 'No resolved alerts'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {displayFlags.map((flag) => {
              const isHighPending = flag.severity === 'high' && !flag.resolved;
              return (
                <div
                  key={flag.id}
                  style={{
                    backgroundColor: isHighPending ? 'rgba(255,92,92,0.06)' : '#161B22',
                    borderRadius: 20,
                    padding: '16px',
                    border: `1px solid ${isHighPending ? 'rgba(255,92,92,0.15)' : '#30363D'}`,
                    borderLeft: `4px solid ${flag.resolved ? '#00C9A7' : SEVERITY_COLORS[flag.severity] || '#FF5C5C'}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          backgroundColor: SEVERITY_BG[flag.severity],
                          border: `1px solid ${SEVERITY_COLORS[flag.severity]}40`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: SEVERITY_COLORS[flag.severity],
                          }}
                        />
                        {flag.severity === 'high' && !flag.resolved && (
                          <span
                            style={{
                              position: 'absolute',
                              top: -3,
                              right: -3,
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: '#fff',
                              animation: 'pulse 1.5s infinite',
                            }}
                          />
                        )}
                      </div>
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: SEVERITY_COLORS[flag.severity],
                        }}
                      >
                        {flag.severity.toUpperCase()}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#8B949E' }}>
                      {formatTime(flag.created_at)}
                    </span>
                  </div>

                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8B949E', marginBottom: 6 }}>
                    Anonymous · Shield
                  </p>

                  {flag.message && (
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#8B949E', fontStyle: 'italic', marginBottom: 10 }}>
                      "{flag.message.length > 80 ? flag.message.slice(0, 80) + '...' : flag.message}"
                    </p>
                  )}

                  <div className="flex justify-end">
                    {!flag.resolved ? (
                      <button
                        onClick={() => setResolveModal(flag)}
                        style={{
                          height: 34,
                          padding: '0 18px',
                          borderRadius: 50,
                          border: '1px solid #00C9A7',
                          backgroundColor: 'transparent',
                          color: '#00C9A7',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Respond
                      </button>
                    ) : (
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#00C9A7', fontWeight: 600 }}>
                        Resolved ✓
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {/* Resolve Modal */}
      {resolveModal && (
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
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', color: '#F0F2F5' }}>
                Mark as resolved?
              </h3>
              <button onClick={() => { setResolveModal(null); setResolveNote(''); setResolveError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ color: '#8B949E', width: 20, height: 20 }} />
              </button>
            </div>
            <textarea
              placeholder="Optional: add a resolution note..."
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
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
                marginBottom: resolveError ? 8 : 14,
              }}
            />
            {resolveError && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#FF5C5C', marginBottom: 12 }}>
                {resolveError}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setResolveModal(null); setResolveNote(''); setResolveError(''); }}
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
                onClick={handleResolve}
                disabled={resolving}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 50,
                  background: 'linear-gradient(135deg, #00C9A7 0%, #7B61FF 100%)',
                  border: 'none',
                  color: '#0D0F14',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: resolving ? 'not-allowed' : 'pointer',
                  opacity: resolving ? 0.7 : 1,
                }}
              >
                {resolving ? 'Confirming...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminBottomNav />
    </div>
  );
}
