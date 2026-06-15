// MindBridge — Shared Style Utilities
// Consolidates repeated inline style objects from auth pages.

import type React from 'react';

/**
 * Base input style used by Login, Register, ForgotPassword, ResetPassword.
 */
export const authInputBase: React.CSSProperties = {
  backgroundColor: '#161B22',
  border: '1px solid #30363D',
  borderRadius: '14px',
  height: '56px',
  padding: '0 16px 0 44px',
  color: '#F0F2F5',
  fontFamily: 'Inter, sans-serif',
  fontSize: '15px',
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.2s',
};

/**
 * Generate an input style with optional error border highlight.
 */
export function authInputStyle(hasError?: boolean): React.CSSProperties {
  return {
    ...authInputBase,
    borderColor: hasError ? '#FF5C5C' : '#30363D',
  };
}

/**
 * Gradient button style used across multiple pages.
 */
export const gradientButtonStyle: React.CSSProperties = {
  padding: '12px 28px',
  borderRadius: 50,
  background: 'linear-gradient(135deg, #00C9A7 0%, #7B61FF 100%)',
  color: '#0D0F14',
  fontFamily: 'Inter, sans-serif',
  fontSize: '15px',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
};
