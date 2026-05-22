// MindBridge — Desktop Sidebar Navigation (md+)
// Mirrors BottomNav items: Home | Journal | Crisis | MindBot | Profile

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, AlertTriangle, Bot, User, LogOut } from 'lucide-react';
import BrainBridgeLogo from '@/components/BrainBridgeLogo';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { icon: Home,          label: 'Home',         path: '/dashboard' },
  { icon: BookOpen,      label: 'Journal',       path: '/journal' },
  { icon: AlertTriangle, label: 'Crisis Support',path: '/crisis', danger: true },
  { icon: Bot,           label: 'MindBot',       path: '/mindbot' },
  { icon: User,          label: 'Profile',       path: '/profile' },
];

export default function SideNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 h-full z-50"
      style={{
        width: 240,
        backgroundColor: '#0D0F14',
        borderRight: '1px solid #30363D',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-6 py-6 cursor-pointer"
        onClick={() => navigate('/dashboard')}
      >
        <div style={{ filter: 'drop-shadow(0 0 10px rgba(0,201,167,0.4))' }}>
          <BrainBridgeLogo size={32} />
        </div>
        <span
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: '18px',
            color: '#F0F2F5',
            letterSpacing: '-0.3px',
          }}
        >
          MindBridge
        </span>
      </div>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: '#30363D', margin: '0 16px 12px' }} />

      {/* Nav Items */}
      <nav className="flex flex-col gap-1 px-3 flex-1">
        {NAV_ITEMS.map(({ icon: Icon, label, path, danger }) => {
          const isActive = location.pathname.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.15s',
                backgroundColor: isActive
                  ? danger
                    ? 'rgba(255,92,92,0.1)'
                    : 'rgba(0,201,167,0.1)'
                  : 'transparent',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <div className="relative">
                <Icon
                  style={{
                    width: 20,
                    height: 20,
                    color: danger
                      ? isActive ? '#FF5C5C' : '#8B949E'
                      : isActive ? '#00C9A7' : '#8B949E',
                    flexShrink: 0,
                  }}
                />
                {danger && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse-dot"
                    style={{ backgroundColor: '#FF5C5C' }}
                  />
                )}
              </div>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  color: danger
                    ? isActive ? '#FF5C5C' : '#8B949E'
                    : isActive ? '#00C9A7' : '#8B949E',
                }}
              >
                {label}
              </span>
              {isActive && (
                <div
                  style={{
                    marginLeft: 'auto',
                    width: 4,
                    height: 20,
                    borderRadius: 2,
                    backgroundColor: danger ? '#FF5C5C' : '#00C9A7',
                    flexShrink: 0,
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 12px 24px' }}>
        <div style={{ height: 1, backgroundColor: '#30363D', marginBottom: 12 }} />
        <button
          onClick={() => { logout(); navigate('/login'); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            width: '100%',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,92,92,0.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <LogOut style={{ width: 20, height: 20, color: '#8B949E', flexShrink: 0 }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#8B949E' }}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}
