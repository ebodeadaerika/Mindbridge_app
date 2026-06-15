// MindBridge — Admin Forum Moderation

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, AlertTriangle, X } from 'lucide-react';
import { forumApi } from '@/api/client';
import AdminBottomNav from '@/components/AdminBottomNav';
import PageShell from '@/components/ui/PageShell';
import BackButton from '@/components/ui/BackButton';
import { relativeTime } from '@/utils/formatters';
import type { ForumPost } from '@/types';

export default function AdminForumModeration() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'all' | 'flagged'>('all');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [confirmRemove, setConfirmRemove] = useState<ForumPost | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await forumApi.list();
        setPosts(res.data.posts || []);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRemove = async () => {
    if (!confirmRemove) return;
    setRemoving(true);
    setRemoveError('');
    try {
      await forumApi.delete(confirmRemove.id);
      setRemovedIds((prev) => new Set([...prev, confirmRemove.id]));
      setConfirmRemove(null);
    } catch {
      setRemoveError('Failed to remove post. Please try again.');
    } finally {
      setRemoving(false);
    }
  };

  // Simulate flagged posts (reply_count > 8 or certain keywords)
  const flaggedIds = new Set(posts.filter((p, i) => i % 4 === 1).map((p) => p.id));
  const filteredPosts = tab === 'flagged' ? posts.filter((p) => flaggedIds.has(p.id)) : posts;

  return (
    <PageShell>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 md:px-8 pt-12 md:pt-6 pb-4">
        <BackButton />
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', color: '#F0F2F5', flex: 1 }}>
          Moderation
        </h1>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <Info style={{ color: '#8B949E', width: 20, height: 20 }} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 pb-20 md:pb-8">
        <div className="max-w-5xl mx-auto w-full">
        {/* Tabs */}
        <div className="flex gap-3 mb-4">
          {(['all', 'flagged'] as const).map((t) => {
            const count = t === 'all' ? posts.length : [...flaggedIds].length;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 50,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: `1px solid ${tab === t ? (t === 'flagged' ? '#FFB347' : '#00C9A7') : '#30363D'}`,
                  backgroundColor: tab === t ? (t === 'flagged' ? 'rgba(255,179,71,0.12)' : 'rgba(0,201,167,0.12)') : 'transparent',
                  color: tab === t ? (t === 'flagged' ? '#FFB347' : '#00C9A7') : '#8B949E',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {t === 'all' ? 'All Posts' : 'Flagged'}
                <span
                  style={{
                    backgroundColor: tab === t ? (t === 'flagged' ? '#FFB347' : '#00C9A7') : '#30363D',
                    color: tab === t ? '#0D0F14' : '#8B949E',
                    borderRadius: 50,
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '1px 7px',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Stats row */}
        <div className="flex gap-2 mb-4">
          {[
            { label: 'Total Posts', value: posts.length, color: '#F0F2F5' },
            { label: 'Flagged', value: flaggedIds.size, color: '#FFB347' },
            { label: 'Removed', value: removedIds.size, color: '#FF5C5C' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                flex: 1,
                backgroundColor: '#161B22',
                borderRadius: 12,
                padding: '10px 10px',
                textAlign: 'center',
                border: '1px solid #30363D',
              }}
            >
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', color }}>
                {value}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#8B949E' }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 120, backgroundColor: '#161B22', borderRadius: 20, animation: 'pulse 1.5s infinite', opacity: 1 - i * 0.2 }} />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px', color: '#F0F2F5' }}>
              No posts found
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredPosts.map((post) => {
              const isRemoved = removedIds.has(post.id);
              const isFlagged = flaggedIds.has(post.id);
              return (
                <div
                  key={post.id}
                  style={{
                    backgroundColor: isFlagged ? 'rgba(255,159,64,0.06)' : '#161B22',
                    borderRadius: 20,
                    padding: 16,
                    border: `1px solid ${isFlagged ? 'rgba(255,179,71,0.2)' : '#30363D'}`,
                    borderLeft: `4px solid ${isFlagged ? '#FFB347' : '#30363D'}`,
                    opacity: isRemoved ? 0.5 : 1,
                  }}
                >
                  {/* Category + time */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {post.category && (
                        <span
                          style={{
                            backgroundColor: 'rgba(0,201,167,0.1)',
                            color: '#00C9A7',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 50,
                          }}
                        >
                          {post.category}
                        </span>
                      )}
                      {isFlagged && (
                        <span
                          style={{
                            backgroundColor: 'rgba(255,179,71,0.15)',
                            color: '#FFB347',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 50,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <AlertTriangle style={{ width: 9, height: 9 }} />
                          Flagged
                        </span>
                      )}
                    </div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#8B949E' }}>
                      {relativeTime(post.created_at)}
                    </span>
                  </div>

                  {/* Body */}
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      color: '#F0F2F5',
                      lineHeight: 1.6,
                      marginBottom: 10,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textDecoration: isRemoved ? 'line-through' : 'none',
                    }}
                  >
                    {post.body}
                  </p>

                  {/* Meta + actions */}
                  <div className="flex items-center justify-between">
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8B949E' }}>
                      {post.anon_name} · {post.reply_count} replies
                    </p>
                    {!isRemoved ? (
                      <div className="flex gap-2">
                        <button
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
                          }}
                        >
                          Keep
                        </button>
                        <button
                          onClick={() => setConfirmRemove(post)}
                          style={{
                            height: 32,
                            padding: '0 14px',
                            borderRadius: 50,
                            border: '1px solid #FF5C5C',
                            backgroundColor: 'transparent',
                            color: '#FF5C5C',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#FF5C5C', fontWeight: 500 }}>
                        Removed
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

      {/* Confirm Remove Modal */}
      {confirmRemove && (
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
                  backgroundColor: 'rgba(255,179,71,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle style={{ color: '#FFB347', width: 24, height: 24 }} />
              </div>
              <div className="text-center">
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', color: '#F0F2F5', marginBottom: 6 }}>
                  Remove this post?
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#8B949E', lineHeight: 1.5 }}>
                  This post will be removed from the community forum.
                </p>
                {removeError && (
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#FF5C5C', marginTop: 8 }}>
                    {removeError}
                  </p>
                )}
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => { setConfirmRemove(null); setRemoveError(''); }}
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
                  onClick={handleRemove}
                  disabled={removing}
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
                    cursor: removing ? 'not-allowed' : 'pointer',
                    opacity: removing ? 0.7 : 1,
                  }}
                >
                  {removing ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AdminBottomNav />
    </PageShell>
  );
}
