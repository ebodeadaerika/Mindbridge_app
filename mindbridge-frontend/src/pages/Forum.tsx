// MindBridge — Community Forum

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, MessageSquare, Heart, Share2 } from 'lucide-react';
import { forumApi } from '@/api/client';
import type { LikeToggleResponse } from '@/types';
import BottomNav from '@/components/BottomNav';
import type { ForumPost } from '@/types';

const CATEGORIES = ['All', 'Anxiety', 'Exams', 'Relationships', 'Motivation', 'Sleep'];

const ANIMAL_EMOJI: Record<string, string> = {
  sparrow: '🐦', fox: '🦊', turtle: '🐢', bear: '🐻', wolf: '🐺',
  owl: '🦉', eagle: '🦅', dolphin: '🐬', rabbit: '🐰', cat: '🐱',
  deer: '🦌', panda: '🐼', penguin: '🐧', parrot: '🦜', hawk: '🦅',
  swan: '🦢', lion: '🦁', tiger: '🐯', elephant: '🐘', whale: '🐳',
  shark: '🦈', butterfly: '🦋', bee: '🐝', horse: '🐴', koala: '🐨',
  otter: '🦦', peacock: '🦚', flamingo: '🦩', gecko: '🦎', crab: '🦀',
};

const COLOR_HEX: Record<string, string> = {
  blue: '#1A4A7A', purple: '#4B3580', green: '#1A6B4A', red: '#7A1A1A',
  orange: '#7A4A1A', teal: '#1A6B6B', pink: '#7A1A4B', gold: '#7A6A1A',
  silver: '#3A4050', brown: '#5A3A1A', coral: '#7A3A2A', indigo: '#2A2A7A',
};

function getAnimalEmoji(anonName: string): string {
  const lower = anonName.toLowerCase();
  for (const [animal, emoji] of Object.entries(ANIMAL_EMOJI)) {
    if (lower.includes(animal)) return emoji;
  }
  return '🐾';
}

function getAvatarBg(anonName: string): string {
  const lower = anonName.toLowerCase();
  for (const [color, hex] of Object.entries(COLOR_HEX)) {
    if (lower.includes(color)) return hex;
  }
  // fallback: derive from name hash
  const hash = anonName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const fallbacks = ['#1A4A7A', '#4B3580', '#1A6B4A', '#7A4A1A', '#1A6B6B'];
  return fallbacks[hash % fallbacks.length];
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function SkeletonCard() {
  return (
    <div style={{ backgroundColor: '#161B22', borderRadius: 20, padding: 16, border: '1px solid #30363D' }}>
      <div className="flex items-center gap-3 mb-3">
        <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#30363D', animation: 'pulse 1.5s infinite' }} />
        <div>
          <div style={{ width: 80, height: 12, backgroundColor: '#30363D', borderRadius: 6, marginBottom: 6, animation: 'pulse 1.5s infinite' }} />
          <div style={{ width: 50, height: 10, backgroundColor: '#30363D', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
        </div>
      </div>
      <div style={{ width: '100%', height: 12, backgroundColor: '#30363D', borderRadius: 6, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
      <div style={{ width: '80%', height: 12, backgroundColor: '#30363D', borderRadius: 6, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
      <div style={{ width: '60%', height: 12, backgroundColor: '#30363D', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
    </div>
  );
}

export default function Forum() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = activeCategory !== 'All' ? { category: activeCategory } : {};
        const res = await forumApi.list(params);
        const loadedPosts = res.data.posts || [];
        setPosts(loadedPosts);
        // Seed likedIds from the API's per-user liked flag
        setLikedIds(new Set(loadedPosts.filter((p: ForumPost) => p.liked).map((p: ForumPost) => p.id)));
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeCategory]);

  const toggleLike = async (postId: string) => {
    const wasLiked = likedIds.has(postId);
    const delta = wasLiked ? -1 : 1;

    // Optimistic update — fast UI response before server round-trip
    setLikedIds((prev) => {
      const next = new Set(prev);
      wasLiked ? next.delete(postId) : next.add(postId);
      return next;
    });
    setPosts((prev) =>
      prev.map((p) => p.id === postId ? { ...p, like_count: (p.like_count ?? 0) + delta } : p)
    );

    try {
      const res = await forumApi.like(postId);
      const data: LikeToggleResponse = res.data;
      // Reconcile with authoritative server count
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, like_count: data.like_count } : p));
      setLikedIds((prev) => {
        const next = new Set(prev);
        data.liked ? next.add(postId) : next.delete(postId);
        return next;
      });
    } catch {
      // Revert optimistic update on failure
      setLikedIds((prev) => {
        const next = new Set(prev);
        wasLiked ? next.add(postId) : next.delete(postId);
        return next;
      });
      setPosts((prev) =>
        prev.map((p) => p.id === postId ? { ...p, like_count: (p.like_count ?? 0) - delta } : p)
      );
    }
  };

  return (
    <div
      className="w-full h-screen relative overflow-hidden flex flex-col"
      style={{ backgroundColor: '#0D0F14' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 md:px-8 pt-12 md:pt-6 pb-3">
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: '#F0F2F5' }}>
          Community Forum
        </h1>
        <button
          onClick={() => navigate('/forum/new')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          <Pencil style={{ color: '#00C9A7', width: 22, height: 22 }} />
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 px-5 md:px-8 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              whiteSpace: 'nowrap',
              padding: '8px 16px',
              borderRadius: 50,
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              border: `1px solid ${activeCategory === cat ? '#00C9A7' : '#30363D'}`,
              backgroundColor: activeCategory === cat ? '#00C9A7' : 'transparent',
              color: activeCategory === cat ? '#0D0F14' : '#8B949E',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="flex-1 overflow-y-auto px-5 md:px-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <MessageSquare style={{ color: '#8B949E', width: 64, height: 64 }} />
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '18px', color: '#F0F2F5' }}>
              No posts yet
            </p>
            <button
              onClick={() => navigate('/forum/new')}
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
              Write the First Post
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post, i) => {
              const isTrending = (post.like_count ?? 0) > 20 || post.reply_count > 5 || i < 2;
              const isLiked = likedIds.has(post.id);
              const displayLikes = post.like_count ?? 0;
              return (
                <div
                  key={post.id}
                  onClick={() => navigate(`/forum/${post.id}`)}
                  style={{
                    backgroundColor: '#161B22',
                    borderRadius: 20,
                    padding: 16,
                    border: '1px solid #30363D',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {/* Meta row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Emoji avatar */}
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: getAvatarBg(post.anon_name),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          flexShrink: 0,
                        }}
                      >
                        {getAnimalEmoji(post.anon_name)}
                      </div>
                      <div>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#F0F2F5', fontWeight: 600 }}>
                          {post.anon_name}
                        </p>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#8B949E' }}>
                          {relativeTime(post.created_at)}
                        </p>
                      </div>
                    </div>
                    {isTrending && (
                      <span
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.35)',
                          color: '#F0F2F5',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '4px 10px',
                          borderRadius: 50,
                          border: '1px solid rgba(255,255,255,0.12)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        💚 Trending
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      color: '#F0F2F5',
                      lineHeight: 1.6,
                      marginBottom: 4,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {post.body}
                  </p>
                  {post.body.length > 120 && (
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#00C9A7', fontWeight: 500, marginBottom: 10 }}>
                      read more
                    </p>
                  )}

                  {/* Footer */}
                  <div style={{ borderTop: '1px solid #30363D', marginTop: 10, paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Category tag */}
                    {post.category ? (
                      <span
                        style={{
                          backgroundColor: 'rgba(0,201,167,0.1)',
                          color: '#00C9A7',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: 50,
                          border: '1px solid rgba(0,201,167,0.2)',
                        }}
                      >
                        {post.category}
                      </span>
                    ) : <div />}

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {/* Comments */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MessageSquare style={{ width: 14, height: 14, color: '#8B949E' }} />
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8B949E' }}>
                          {post.reply_count}
                        </span>
                      </div>
                      {/* Likes */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleLike(post.id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                      >
                        <Heart
                          style={{
                            width: 14,
                            height: 14,
                            color: isLiked ? '#00C9A7' : '#8B949E',
                            fill: isLiked ? '#00C9A7' : 'none',
                            transition: 'all 0.2s',
                          }}
                        />
                        {displayLikes > 0 && (
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: isLiked ? '#00C9A7' : '#8B949E' }}>
                            {displayLikes}
                          </span>
                        )}
                      </button>
                      {/* Share */}
                      <button
                        onClick={(e) => e.stopPropagation()}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <Share2 style={{ width: 14, height: 14, color: '#8B949E' }} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/forum/new')}
        style={{
          position: 'fixed',
          bottom: 80,
          right: 'max(16px, calc(50% - 179px))',
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00C9A7 0%, #7B61FF 100%)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,201,167,0.3)',
          zIndex: 10,
        }}
      >
        <Pencil style={{ color: '#0D0F14', width: 22, height: 22 }} />
      </button>

      <BottomNav />
    </div>
  );
}
