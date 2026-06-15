// MindBridge — Journal List

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Lock, BookOpen, Trash2 } from 'lucide-react';
import { journalApi } from '@/api/client';
import BottomNav from '@/components/BottomNav';
import PageShell from '@/components/ui/PageShell';
import BackButton from '@/components/ui/BackButton';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { formatDateLong, wordCount } from '@/utils/formatters';
import type { JournalEntry } from '@/types';

const BORDER_COLORS = ['#00C9A7', '#7B61FF', '#FFB347'];


export default function JournalList() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<JournalEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await journalApi.list();
        setEntries(res.data.entries || []);
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await journalApi.delete(deleteModal.id);
      setEntries((prev) => prev.filter((e) => e.id !== deleteModal.id));
      setDeleteModal(null);
    } catch {
      setDeleteError('Could not delete this entry. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const toggleSwipe = (id: string) => {
    setSwipedId((prev) => (prev === id ? null : id));
  };

  return (
    <PageShell>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 md:px-8 pt-12 md:pt-6 pb-2">
        <BackButton />
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: '#F0F2F5', flex: 1 }}>
          My Journal
        </h1>
        <button
          onClick={() => navigate('/journal/new')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          <Plus style={{ color: '#00C9A7', width: 24, height: 24 }} />
        </button>
      </div>

      <div className="flex items-center gap-2 px-5 md:px-8 pb-4">
        <Lock style={{ color: '#8B949E', width: 13, height: 13 }} />
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8B949E' }}>
          Private. Only you can see this.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 md:px-8 pb-20 md:pb-8">
        <div className="max-w-3xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  height: 100,
                  backgroundColor: '#161B22',
                  borderRadius: 20,
                  animation: 'pulse 1.5s infinite',
                  opacity: 1 - i * 0.15,
                }}
              />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <BookOpen style={{ color: '#8B949E', width: 64, height: 64 }} />
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '18px', color: '#F0F2F5' }}>
              No entries yet
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#8B949E' }}>
              Your thoughts are waiting to be written
            </p>
            <button
              onClick={() => navigate('/journal/new')}
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
              Write your first entry
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry, i) => (
              <div
                key={entry.id}
                style={{ position: 'relative', overflow: 'hidden', borderRadius: 20 }}
              >
                {/* Delete reveal */}
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: 72,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#FF5C5C',
                    borderRadius: '0 20px 20px 0',
                  }}
                >
                  <button
                    onClick={() => setDeleteModal(entry)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
                  >
                    <Trash2 style={{ color: '#fff', width: 20, height: 20 }} />
                  </button>
                </div>

                {/* Card */}
                <div
                  onClick={() => {
                    if (swipedId === entry.id) {
                      setSwipedId(null);
                      return;
                    }
                    navigate(`/journal/${entry.id}`);
                  }}
                  style={{
                    backgroundColor: '#161B22',
                    borderRadius: 20,
                    padding: '16px',
                    borderLeft: `4px solid ${BORDER_COLORS[i % BORDER_COLORS.length]}`,
                    cursor: 'pointer',
                    transform: swipedId === entry.id ? 'translateX(-72px)' : 'translateX(0)',
                    transition: 'transform 0.25s ease',
                    position: 'relative',
                    zIndex: 1,
                  }}
                  onTouchStart={(e) => {
                    const x = e.touches[0].clientX;
                    const handler = (e2: TouchEvent) => {
                      const diff = x - e2.changedTouches[0].clientX;
                      if (diff > 40) setSwipedId(entry.id);
                      else if (diff < -20) setSwipedId(null);
                      document.removeEventListener('touchend', handler);
                    };
                    document.addEventListener('touchend', handler);
                  }}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', color: '#F0F2F5', flex: 1, marginRight: 8 }}>
                      {entry.title}
                    </p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#8B949E', whiteSpace: 'nowrap', marginTop: 2 }}>
                      {formatDateLong(entry.created_at)}
                    </p>
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#8B949E', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {entry.body}
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#30363D', marginTop: 8 }}>
                    {wordCount(entry.body)} words
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* FAB */}
      {entries.length > 0 && (
        <button
          onClick={() => navigate('/journal/new')}
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
          <Plus style={{ color: '#0D0F14', width: 24, height: 24 }} />
        </button>
      )}

      <ConfirmModal
        open={!!deleteModal}
        title="Delete this entry?"
        description={deleteModal ? `"${deleteModal.title}" will be permanently deleted.` : ''}
        confirmLabel="Delete Forever"
        cancelLabel="Keep Entry"
        confirmColor="#FF5C5C"
        loading={deleting}
        error={deleteError || undefined}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteModal(null); setDeleteError(''); }}
      />

      <BottomNav />
    </PageShell>
  );
}
