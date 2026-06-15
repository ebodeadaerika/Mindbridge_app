// MindBridge — Shared Loading Skeleton
// Renders placeholder shimmer cards for list loading states.

import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
  height?: number;
  rounded?: number;
}

export default function LoadingSkeleton({ count = 4, height = 100, rounded = 20 }: LoadingSkeletonProps) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            height,
            backgroundColor: '#161B22',
            borderRadius: rounded,
            animation: 'pulse 1.5s infinite',
            opacity: 1 - i * 0.15,
          }}
        />
      ))}
    </div>
  );
}
