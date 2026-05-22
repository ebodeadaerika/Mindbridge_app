// MindBridge — BrainBridge Logo Component
// Pixel-matched to Figma reference (1.jpeg / 5.jpeg screenshots):
// two round teal lobes, dark fold lines, teal glow drop-shadow applied by parent

import React from 'react';

interface BrainBridgeLogoProps {
  size?: number;
  className?: string;
}

export default function BrainBridgeLogo({ size = 64, className = '' }: BrainBridgeLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* ── Left lobe ─────────────────────────────────────────────────
          Starts at the centre-top, sweeps out over a full round bump,
          down the outside, and back to the centre-bottom.           */}
      <path
        d="M32 14
           C32 14 29 11 25 11
           C20 11 15 15 14 20
           C12 22 11 25 11 28
           C10 31 11 34 13 37
           C12 39 12 42 14 44
           C16 47 20 49 24 49
           L32 49
           Z"
        fill="#00C9A7"
      />

      {/* ── Right lobe ────────────────────────────────────────────────*/}
      <path
        d="M32 14
           C32 14 35 11 39 11
           C44 11 49 15 50 20
           C52 22 53 25 53 28
           C54 31 53 34 51 37
           C52 39 52 42 50 44
           C48 47 44 49 40 49
           L32 49
           Z"
        fill="#00C9A7"
      />

      {/* ── Centre groove between the two lobes ──────────────────────*/}
      <line
        x1="32" y1="14"
        x2="32" y2="49"
        stroke="#091A15"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* ── Left gyri (fold arcs) ─────────────────────────────────────*/}
      <path d="M15 24 C17 21.5 22 21.5 24 24"
        stroke="#091A15" strokeWidth="1.7" strokeLinecap="round" fill="none" />
      <path d="M14 33 C16 30.5 21 30.5 23 33"
        stroke="#091A15" strokeWidth="1.7" strokeLinecap="round" fill="none" />
      <path d="M15 42 C17 39.5 22 39.5 24 42"
        stroke="#091A15" strokeWidth="1.7" strokeLinecap="round" fill="none" />

      {/* ── Right gyri (fold arcs) ────────────────────────────────────*/}
      <path d="M40 24 C42 21.5 47 21.5 49 24"
        stroke="#091A15" strokeWidth="1.7" strokeLinecap="round" fill="none" />
      <path d="M41 33 C43 30.5 48 30.5 50 33"
        stroke="#091A15" strokeWidth="1.7" strokeLinecap="round" fill="none" />
      <path d="M40 42 C42 39.5 47 39.5 49 42"
        stroke="#091A15" strokeWidth="1.7" strokeLinecap="round" fill="none" />
    </svg>
  );
}
