// MindBridge — New Forum Post

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { forumApi } from '@/api/client';

const CATEGORIES = ['Anxiety', 'Exams', 'Relationships', 'Motivation', 'Sleep'];
const MAX_CHARS = 500;
// Anonymous name is assigned by the server per post — do not hardcode one here

export default function NewForumPost() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  // useRef guard fires synchronously — prevents double-submit before React re-renders the disabled state
  const postingRef = useRef(false);
  const [validationError, setValidationError] = useState('');

  const charCount = body.length;
  const canPost = category && body.trim().length > 0;

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_CHARS) {
      setBody(e.target.value);
      if (validationError) setValidationError('');
    }
  };

  const handlePost = async () => {
    if (!body.trim()) {
      setValidationError('Please write something before posting.');
      return;
    }
    if (!category) {
      setValidationError('Please select a category.');
      return;
    }
    // Synchronous guard — blocks second click before React processes the first setPosting(true)
    if (postingRef.current) return;
    postingRef.current = true;
    setPosting(true);
    try {
      await forumApi.create({ body: body.trim(), category });
      navigate('/forum');
    } catch {
      setValidationError('Failed to post. Please try again.');
      postingRef.current = false;
      setPosting(false);
    }
  };

  return (
    <div
      className="w-full h-screen relative overflow-hidden flex flex-col"
      style={{ backgroundColor: '#0D0F14' }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 md:px-8 pt-12 md:pt-6 pb-4 max-w-4xl mx-auto w-full">
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: '#8B949E', fontFamily: 'Inter, sans-serif', fontSize: '16px', cursor: 'pointer', padding: 4 }}
        >
          Cancel
        </button>
        <button
          onClick={handlePost}
          disabled={!canPost || posting}
          style={{
            background: 'none',
            border: 'none',
            color: canPost ? '#00C9A7' : '#30363D',
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            cursor: canPost && !posting ? 'pointer' : 'default',
            padding: 4,
            transition: 'color 0.2s',
          }}
        >
          {posting ? 'Posting...' : 'Post'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 pb-8 flex flex-col gap-4">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-4">
        {/* Anon shield banner */}
        <div
          style={{
            backgroundColor: '#1E2530',
            borderRadius: 14,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: '1px solid rgba(0,201,167,0.15)',
          }}
        >
          <Shield style={{ color: '#00C9A7', width: 18, height: 18, minWidth: 18 }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#00C9A7', lineHeight: 1.4 }}>
            You're posting anonymously.{' '}
            <span style={{ fontWeight: 700 }}>Your alias is assigned automatically.</span>
          </p>
        </div>

        {/* Category selector */}
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#8B949E', fontWeight: 500, marginBottom: 10 }}>
            Select a category:
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '8px 16px',
                  borderRadius: 50,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: `1px solid ${category === cat ? '#00C9A7' : '#30363D'}`,
                  backgroundColor: category === cat ? 'rgba(0,201,167,0.12)' : 'transparent',
                  color: category === cat ? '#00C9A7' : '#8B949E',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div className="flex flex-col gap-1 flex-1">
          <textarea
            placeholder="Share what's on your mind..."
            value={body}
            onChange={handleBodyChange}
            style={{
              flex: 1,
              minHeight: 200,
              background: 'none',
              border: `1px solid ${validationError ? '#FF5C5C' : 'transparent'}`,
              borderRadius: 14,
              outline: 'none',
              color: '#F0F2F5',
              fontFamily: 'Inter, sans-serif',
              fontSize: '17px',
              lineHeight: 1.8,
              resize: 'none',
              width: '100%',
              padding: validationError ? '12px' : '0',
            }}
          />
          {validationError && (
            <p style={{ color: '#FF5C5C', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>{validationError}</p>
          )}
        </div>

        {/* Character counter */}
        <div className="flex justify-end">
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              color: charCount >= MAX_CHARS ? '#FF5C5C' : charCount > MAX_CHARS * 0.8 ? '#FFB347' : '#8B949E',
              fontWeight: charCount >= MAX_CHARS ? 700 : 400,
            }}
          >
            {charCount} / {MAX_CHARS}
          </span>
        </div>

        {/* Footer disclaimer */}
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8B949E', textAlign: 'center' }}>
          Be kind. Be anonymous. Be safe.
        </p>
        </div>
      </div>
    </div>
  );
}
