// MindBridge — Journal Entry Detail

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { journalApi } from '@/api/client';
import type { JournalEntry } from '@/types';

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) +
    ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function JournalEntryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await journalApi.get(id);
        setEntry(res.data);
      } catch {
        navigate('/journal');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await journalApi.delete(id);
      navigate('/journal');
    } catch {
      setDeleteError('Could not delete this entry. Please try again.');
      setDeleting(false);
    }
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

  if (!entry) return null;

  return (
    <div
      className="w-full h-screen relative overflow-hidden flex flex-col"
      style={{ backgroundColor: '#0D0F14' }}
    >
      {/* Teal glow orb top-right */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,201,167,0.08) 0%, transparent 70%)', transform: 'translate(30%, -30%)', zIndex: 0 }}
      />

      {/* Header */}
      <div className="flex items-center gap-3 px-5 md:px-8 pt-12 md:pt-6 pb-4 relative z-10 max-w-3xl mx-auto w-full">
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          <ArrowLeft style={{ color: '#F0F2F5', width: 24, height: 24 }} />
        </button>
        <h1
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 600,
            fontSize: '17px',
            color: '#F0F2F5',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {entry.title}
        </h1>
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            onClick={() => setShowMenu((p) => !p)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
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
              <button
                onClick={() => { setShowMenu(false); setTimeout(() => navigate(`/journal/${id}/edit`), 0); }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#00C9A7',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                }}
              >
                <Edit2 style={{ width: 16, height: 16 }} />
                Edit
              </button>
              <div style={{ height: 1, backgroundColor: '#30363D' }} />
              <button
                onClick={() => { setShowMenu(false); setShowDeleteModal(true); }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#FF5C5C',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                }}
              >
                <Trash2 style={{ width: 16, height: 16 }} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 md:px-8 pb-8 relative z-10">
        <div className="max-w-3xl mx-auto w-full">
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#8B949E', marginBottom: 20 }}>
          Written on {formatDateTime(entry.created_at)} · {readingTime(entry.body)} min read
        </p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '17px', color: '#F0F2F5', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {entry.body}
        </p>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
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
                <Trash2 style={{ color: '#FF5C5C', width: 24, height: 24 }} />
              </div>
              <div className="text-center">
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', color: '#F0F2F5', marginBottom: 6 }}>
                  Delete this entry?
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#8B949E' }}>
                  This action cannot be undone.
                </p>
                {deleteError && (
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#FF5C5C', marginTop: 8 }}>
                    {deleteError}
                  </p>
                )}
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeleteError(''); }}
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
                  onClick={handleDelete}
                  disabled={deleting}
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
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    opacity: deleting ? 0.7 : 1,
                  }}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
