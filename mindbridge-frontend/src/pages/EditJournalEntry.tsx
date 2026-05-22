// MindBridge — Edit Journal Entry

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { journalApi } from '@/api/client';
import type { JournalEntry } from '@/types';

function formatRelative(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function EditJournalEntry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [saveError, setSaveError] = useState('');
  const [showDiscard, setShowDiscard] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await journalApi.get(id);
        const e: JournalEntry = res.data;
        setEntry(e);
        setTitle(e.title);
        setBody(e.body);
      } catch {
        navigate('/journal');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const hasChanges = entry ? title !== entry.title || body !== entry.body : false;
  const canSave = hasChanges && title.trim().length > 0 && body.trim().length > 0;

  const handleCancel = () => {
    if (hasChanges) {
      setShowDiscard(true);
    } else {
      navigate(-1);
    }
  };

  const handleUpdate = async () => {
    if (!canSave || !id) return;
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError('');
    try {
      await journalApi.update(id, { title: title.trim(), body: body.trim() });
      navigate(-1);
    } catch {
      setSaveError('Failed to save changes. Please try again.');
      savingRef.current = false;
      setSaving(false);
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

  return (
    <div
      className="w-full h-screen relative overflow-hidden flex flex-col"
      style={{ backgroundColor: '#0D0F14' }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 md:px-8 pt-12 md:pt-6 pb-2 max-w-3xl mx-auto w-full">
        <button
          onClick={handleCancel}
          style={{ background: 'none', border: 'none', color: '#8B949E', fontFamily: 'Inter, sans-serif', fontSize: '16px', cursor: 'pointer', padding: 4 }}
        >
          Cancel
        </button>
        {saveError ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#FF5C5C' }}>
            {saveError}
          </p>
        ) : entry ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8B949E' }}>
            Last edited {formatRelative(entry.updated_at)}
          </p>
        ) : null}
        <button
          onClick={handleUpdate}
          disabled={!canSave || saving}
          style={{
            background: 'none',
            border: 'none',
            color: canSave ? '#00C9A7' : '#30363D',
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            cursor: canSave && !saving ? 'pointer' : 'default',
            padding: 4,
            transition: 'color 0.2s',
          }}
        >
          {saving ? 'Saving...' : 'Update'}
        </button>
      </div>

      <div className="flex-1 flex flex-col px-5 md:px-8 pb-6 overflow-hidden max-w-3xl mx-auto w-full">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            color: '#F0F2F5',
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: '24px',
            width: '100%',
            marginBottom: 12,
            marginTop: 8,
          }}
        />

        <div style={{ height: 1, backgroundColor: '#00C9A7', opacity: 0.3, marginBottom: 16 }} />

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: '#F0F2F5',
            fontFamily: 'Inter, sans-serif',
            fontSize: '17px',
            lineHeight: 1.8,
            resize: 'none',
            width: '100%',
          }}
        />
      </div>

      {/* Discard Modal */}
      {showDiscard && (
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
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', color: '#F0F2F5' }}>
                Discard changes?
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#8B949E', textAlign: 'center' }}>
                Your unsaved changes will be lost.
              </p>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setShowDiscard(false)}
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
                  Keep Writing
                </button>
                <button
                  onClick={() => navigate(-1)}
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
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
