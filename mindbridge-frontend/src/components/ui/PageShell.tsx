// MindBridge — Shared Page Shell
// Wraps page content with the common dark background layout.

import React from 'react';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageShell({ children, className = '' }: PageShellProps) {
  return (
    <div
      className={`w-full h-screen relative overflow-hidden flex flex-col ${className}`}
      style={{ backgroundColor: '#0D0F14' }}
    >
      {children}
    </div>
  );
}
