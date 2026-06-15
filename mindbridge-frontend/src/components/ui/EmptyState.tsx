// MindBridge — Shared Empty State
// Displays an icon, title, subtitle, and optional action button.

import React from 'react';
import { gradientButtonStyle } from '@/styles/shared';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <Icon style={{ color: '#8B949E', width: 64, height: 64 }} />
      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '18px', color: '#F0F2F5' }}>
        {title}
      </p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#8B949E' }}>
        {subtitle}
      </p>
      {actionLabel && onAction && (
        <button onClick={onAction} style={gradientButtonStyle}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
