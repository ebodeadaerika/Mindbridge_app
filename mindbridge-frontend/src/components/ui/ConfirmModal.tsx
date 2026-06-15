// MindBridge — Shared Confirmation Modal
// Bottom-sheet style modal for destructive or important confirmations.

import React from 'react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  loading?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = '#FF5C5C',
  loading = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
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
          <h3
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: '18px',
              color: '#F0F2F5',
              textAlign: 'center',
            }}
          >
            {title}
          </h3>
          {description && (
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#8B949E',
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              {description}
            </p>
          )}
          {error && (
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                color: '#FF5C5C',
                textAlign: 'center',
              }}
            >
              {error}
            </p>
          )}
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              disabled={loading}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 50,
                border: '1px solid #30363D',
                backgroundColor: 'transparent',
                color: '#F0F2F5',
                fontFamily: 'Inter, sans-serif',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 50,
                border: 'none',
                backgroundColor: confirmColor,
                color: '#0D0F14',
                fontFamily: 'Inter, sans-serif',
                fontSize: '15px',
                fontWeight: 600,
                cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Processing...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
