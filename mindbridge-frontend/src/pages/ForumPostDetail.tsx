// MindBridge — Forum Post Detail

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Send, X, Flag, Link2, Share2, Heart, CornerDownRight } from 'lucide-react';
import { forumApi } from '@/api/client';
import type { ForumPostDetail as ForumPostDetailType, ForumReply, LikeToggleResponse } from '@/types';

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

const REPORT_REASONS = [
  { icon: '🚨', label: 'Harmful content' },
  { icon: '🤬', label: 'Harassment or bullying' },
  { icon: '💊', label: 'Self-harm or crisis' },
  { icon: '🔞', label: 'Inappropriate content' },
  { icon: '🤥', label: 'Misinformation' },
  { icon: '🗑️', label: 'Spam' },
];

export default function ForumPostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<ForumPostDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState('');
  const sendingRef = useRef(false); // synchronous double-submit guard
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [postLiked, setPostLiked] = useState(false);
  const [postLikeCount, setPostLikeCount] = useState(0);
  const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set());
  const menuRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await forumApi.getPost(id);
        setPost(res.data);
        setPostLiked(res.data.liked ?? false);
        setPostLikeCount(res.data.like_count ?? 0);
      } catch {
        navigate('/forum');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    if (showMenu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !id) return;
    if (sendingRef.current) return; // synchronous guard against double-tap
    sendingRef.current = true;
    setSending(true);
    setReplyError('');
    try {
      const res = await forumApi.reply(id, { body: replyText.trim() });
      const newReply: ForumReply = res.data;
      setPost((prev) => prev ? { ...prev, replies: [...(prev.replies || []), newReply] } : prev);
      setReplyText('');
      setReplyingTo(null);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {
      setReplyError('Failed to send reply. Please try again.');
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  const handleLikePost = async () => {
    if (!id) return;
    const wasLiked = postLiked;
    const delta = wasLiked ? -1 : 1;
    // Optimistic
    setPostLiked(!wasLiked);
    setPostLikeCount((c) => c + delta);
    try {
      const res = await forumApi.like(id);
      const data: LikeToggleResponse = res.data;
      setPostLiked(data.liked);
      setPostLikeCount(data.like_count);
    } catch {
      // Revert
      setPostLiked(wasLiked);
      setPostLikeCount((c) => c - delta);
    }
  };

  const toggleReplyLike = (replyId: string) => {
    setLikedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(replyId)) next.delete(replyId);
      else next.add(replyId);
      return next;
    });
  };

  const handleReplyTo = (name: string) => {
    setReplyingTo(name);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center" style={{ backgroundColor: '#0D0F14' }}>
        <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#30363D" strokeWidth="3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="#00C9A7" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div
      className="w-full h-screen relative overflow-hidden flex flex-col"
      style={{ backgroundColor: '#0D0F14' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 md:px-8 pt-12 md:pt-6 pb-4"
        style={{ borderBottom: '1px solid #30363D' }}
      >
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ArrowLeft style={{ color: '#F0F2F5', width: 24, height: 24 }} />
        </button>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '17px', color: '#F0F2F5', flex: 1, textAlign: 'center' }}>
          Post
        </h1>
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button onClick={() => setShowMenu((p) => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <MoreVertical style={{ color: '#8B949E', width: 20, height: 20 }} />
          </button>
          {showMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 32,
                backgroundColor: '#1E2530',
                border: '1px solid #30363D',
                borderRadius: 12,
                overflow: 'hidden',
                minWidth: 160,
                zIndex: 50,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              {[
                { icon: Link2, label: 'Copy link', action: () => { navigator.clipboard.writeText(window.location.href); setShowMenu(false); } },
                { icon: Flag, label: 'Report', action: () => { setShowMenu(false); setShowReport(true); } },
                { icon: Share2, label: 'Share', action: () => { setShowMenu(false); } },
              ].map(({ icon: Icon, label, action }, idx) => (
                <button
                  key={label}
                  onClick={action}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'none',
                    border: 'none',
                    borderBottom: idx < 2 ? '1px solid #30363D' : 'none',
                    cursor: 'pointer',
                    color: '#F0F2F5',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                  }}
                >
                  <Icon style={{ width: 16, height: 16, color: '#8B949E' }} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 md:px-8 pb-24">
        <div className="max-w-4xl mx-auto w-full">
        {/* Original post */}
        <div style={{ paddingTop: 16, paddingBottom: 16, borderBottom: '1px solid #30363D' }}>
          {/* Author */}
          <div className="flex items-center gap-3 mb-12px" style={{ marginBottom: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: getAvatarBg(post.anon_name),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                flexShrink: 0,
              }}
            >
              {getAnimalEmoji(post.anon_name)}
            </div>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: '#F0F2F5', fontWeight: 600 }}>
                {post.anon_name}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8B949E' }}>
                {relativeTime(post.created_at)}
              </p>
            </div>
          </div>

          {/* Body */}
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#F0F2F5', lineHeight: 1.75, marginBottom: 12 }}>
            {post.body}
          </p>

          {/* Category tag */}
          {post.category && (
            <span
              style={{
                display: 'inline-block',
                marginBottom: 14,
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
          )}

          {/* Post actions: Likes · Reply · Share */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingTop: 4 }}>
            <button
              onClick={handleLikePost}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: 0 }}
            >
              <Heart
                style={{
                  width: 18,
                  height: 18,
                  color: postLiked ? '#00C9A7' : '#8B949E',
                  fill: postLiked ? '#00C9A7' : 'none',
                  transition: 'all 0.2s',
                }}
              />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: postLiked ? '#00C9A7' : '#8B949E', fontWeight: 500 }}>
                {postLikeCount > 0 ? postLikeCount : ''}
              </span>
            </button>
            <button
              onClick={() => { setReplyingTo(null); setTimeout(() => inputRef.current?.focus(), 100); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: 0 }}
            >
              <CornerDownRight style={{ width: 16, height: 16, color: '#8B949E' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#8B949E', fontWeight: 500 }}>
                Reply
              </span>
            </button>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: 0, marginLeft: 'auto' }}
            >
              <Share2 style={{ width: 16, height: 16, color: '#8B949E' }} />
            </button>
          </div>
        </div>

        {/* Replies header */}
        <div style={{ paddingTop: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 24, height: 3, backgroundColor: '#00C9A7', borderRadius: 2 }} />
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', color: '#F0F2F5', fontWeight: 700 }}>
            Replies {(post.replies || []).length > 0 ? `(${(post.replies || []).length})` : ''}
          </p>
        </div>

        {/* Replies list */}
        {(post.replies || []).length === 0 ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#8B949E', textAlign: 'center', padding: '20px 0' }}>
            Be the first to reply
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {(post.replies || []).map((reply, i) => {
              const replyLiked = likedReplies.has(reply.id);
              return (
                <div
                  key={reply.id}
                  style={{
                    backgroundColor: '#1E2530',
                    borderRadius: 16,
                    padding: '14px 14px 10px',
                    border: '1px solid #30363D',
                  }}
                >
                  {/* Reply author */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: getAvatarBg(reply.anon_name),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '15px',
                        flexShrink: 0,
                      }}
                    >
                      {getAnimalEmoji(reply.anon_name)}
                    </div>
                    <div>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#F0F2F5', fontWeight: 600 }}>
                        {reply.anon_name}
                      </p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#8B949E' }}>
                        {relativeTime(reply.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Reply body */}
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#F0F2F5', lineHeight: 1.65, marginBottom: 10 }}>
                    {reply.body}
                  </p>

                  {/* Reply actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16 }}>
                    <button
                      onClick={() => handleReplyTo(reply.anon_name)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                    >
                      <CornerDownRight style={{ width: 13, height: 13, color: '#8B949E' }} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8B949E' }}>Reply</span>
                    </button>
                    <button
                      onClick={() => toggleReplyLike(reply.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                    >
                      <Heart
                        style={{
                          width: 13,
                          height: 13,
                          color: replyLiked ? '#00C9A7' : '#8B949E',
                          fill: replyLiked ? '#00C9A7' : 'none',
                          transition: 'all 0.15s',
                        }}
                      />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: replyLiked ? '#00C9A7' : '#8B949E' }}>
                        {replyLiked ? 1 : 0}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={bottomRef} />
        </div>
      </div>

      {/* Fixed bottom input */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 560,
          backgroundColor: '#0D0F14',
          borderTop: '1px solid #30363D',
          padding: '8px 16px 16px',
          zIndex: 20,
        }}
      >
        {replyingTo && (
          <div className="flex items-center justify-between mb-2">
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#00C9A7' }}>
              Replying to @{replyingTo}
            </p>
            <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
              <X style={{ color: '#8B949E', width: 14, height: 14 }} />
            </button>
          </div>
        )}
        {replyError && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#FF5C5C', marginBottom: 6, paddingLeft: 4 }}>
            {replyError}
          </p>
        )}
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 50,
              backgroundColor: '#161B22',
              border: '1px solid #30363D',
              padding: '0 16px',
              color: '#F0F2F5',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <button
            onClick={handleSendReply}
            disabled={!replyText.trim() || sending}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: replyText.trim() ? 'linear-gradient(135deg, #00C9A7 0%, #7B61FF 100%)' : '#30363D',
              border: 'none',
              cursor: replyText.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
              minWidth: 44,
            }}
          >
            <Send style={{ color: '#0D0F14', width: 18, height: 18 }} />
          </button>
        </div>
      </div>

      {/* Report bottom sheet */}
      {showReport && (
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
                Report Post
              </h3>
              <button onClick={() => setShowReport(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ color: '#8B949E', width: 20, height: 20 }} />
              </button>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              {REPORT_REASONS.map(({ icon, label }) => (
                <button
                  key={label}
                  onClick={() => setSelectedReason(label)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: `1px solid ${selectedReason === label ? '#00C9A7' : '#30363D'}`,
                    backgroundColor: selectedReason === label ? 'rgba(0,201,167,0.1)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    color: '#F0F2F5',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReport(false)}
                style={{
                  flex: 1, height: 48, borderRadius: 50, background: 'transparent',
                  border: '1px solid #30363D', color: '#F0F2F5',
                  fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowReport(false)}
                disabled={!selectedReason}
                style={{
                  flex: 1, height: 48, borderRadius: 50,
                  background: selectedReason ? 'linear-gradient(135deg, #00C9A7 0%, #7B61FF 100%)' : '#30363D',
                  border: 'none', color: '#0D0F14',
                  fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600,
                  cursor: selectedReason ? 'pointer' : 'not-allowed',
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
