// MindBridge — New Journal Entry

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { journalApi } from '@/api/client';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { wordCount } from '@/utils/formatters';

export default function NewJournalEntry() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [saveError, setSaveError] = useState('');
  const [showDiscard, setShowDiscard] = useState(false);

  const hasContent = title.trim().length > 0 || body.trim().length > 0;
  const canSave = title.trim().length > 0 && body.trim().length > 0;

  const handleCancel = () => {
    if (hasContent) {
      setShowDiscard(true);
    } else {
      navigate('/journal');
    }
  };

  const handleSave = async () => {
    if (!canSave) return;
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError('');
    try {
      await journalApi.create({ title: title.trim(), body: body.trim() });
      navigate('/journal');
    } catch {
      setSaveError('Failed to save entry. Please try again.');
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <div
      className="w-full h-screen relative overflow-hidden flex flex-col"
      style={{ backgroundColor: '#0D0F14' }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 md:px-8 pt-12 md:pt-6 pb-4 max-w-3xl mx-auto w-full">
        <button
          onClick={handleCancel}
          style={{ background: 'none', border: 'none', color: '#8B949E', fontFamily: 'Inter, sans-serif', fontSize: '16px', cursor: 'pointer', padding: 4 }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
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
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {saveError && (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#FF5C5C', textAlign: 'center', padding: '0 20px 8px' }} className="max-w-3xl mx-auto w-full">
          {saveError}
        </p>
      )}

      {/* Entry */}
      <div className="flex-1 flex flex-col px-5 md:px-8 pb-6 overflow-hidden max-w-3xl mx-auto w-full">
        {/* Title */}
        <input
          type="text"
          placeholder="Entry title..."
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
          }}
        />

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: '#00C9A7', opacity: 0.3, marginBottom: 16 }} />

        {/* Body */}
        <textarea
          placeholder="Start writing..."
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

      {/* Word count */}
      <div className="px-5 md:px-8 pb-6 flex justify-end max-w-3xl mx-auto w-full">
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8B949E' }}>
          {wordCount(body)} words
        </span>
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
                Discard this entry?
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#8B949E', textAlign: 'center' }}>
                Your writing won't be saved if you leave now.
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
                  onClick={() => navigate('/journal')}
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
