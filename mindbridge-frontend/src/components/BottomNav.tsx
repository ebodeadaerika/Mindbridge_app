// MindBridge — Student Bottom Navigation
// Updated nav per Architecture Notes: Home | Journal | Crisis | MindBot | Profile

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, AlertTriangle, Bot, User } from 'lucide-react';

const NAV_ITEMS = [
  { icon: Home,          label: 'Home',    path: '/dashboard' },
  { icon: BookOpen,      label: 'Journal', path: '/journal' },
  { icon: AlertTriangle, label: 'Crisis',  path: '/crisis', danger: true },
  { icon: Bot,           label: 'MindBot', path: '/mindbot' },
  { icon: User,          label: 'Profile', path: '/profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 w-full border-t border-border bg-surface z-50"
      style={{ height: '64px' }}
    >
      <div className="flex items-center justify-around h-full px-2">
        {NAV_ITEMS.map(({ icon: Icon, label, path, danger }) => {
          const isActive = location.pathname.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1 flex-1 py-2 transition-all"
            >
              <div className="relative">
                <Icon
                  className="w-5 h-5 transition-colors"
                  style={{
                    color: danger
                      ? isActive ? '#FF5C5C' : '#8B949E'
                      : isActive ? '#00C9A7' : '#8B949E',
                  }}
                />
                {/* Pulsing dot for Crisis (safety critical) */}
                {danger && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse-dot"
                    style={{ backgroundColor: '#FF5C5C' }}
                  />
                )}
              </div>
              <span
                className="text-[10px] font-medium transition-colors"
                style={{
                  color: danger
                    ? isActive ? '#FF5C5C' : '#8B949E'
                    : isActive ? '#00C9A7' : '#8B949E',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
