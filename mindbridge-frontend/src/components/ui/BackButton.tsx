// MindBridge — Shared Back Button
// Reusable navigation-back button with ArrowLeft icon.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick?: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={onClick ?? (() => navigate(-1))}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
    >
      <ArrowLeft style={{ color: '#F0F2F5', width: 24, height: 24 }} />
    </button>
  );
}
