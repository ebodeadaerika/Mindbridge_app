// MindBridge — Admin Desktop Sidebar Navigation (md+)

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, BookMarked, Shield, User, LogOut } from 'lucide-react';
import BrainBridgeLogo from '@/components/BrainBridgeLogo';
import { useAuth } from '@/context/AuthContext';

const ADMIN_NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',     path: '/admin/dashboard' },
  { icon: AlertCircle,     label: 'Crisis Alerts', path: '/admin/crisis', badge: true },
  { icon: BookMarked,      label: 'Resources',     path: '/admin/resources' },
  { icon: Shield,          label: 'Moderation',    path: '/admin/forum' },
  { icon: User,            label: 'Profile',       path: '/profile' },
];

export default function AdminSideNav() {
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
      {/* Logo + Admin badge */}
      <div
        className="flex items-center gap-3 px-6 py-6 cursor-pointer"
        onClick={() => navigate('/admin/dashboard')}
      >
        <div style={{ filter: 'drop-shadow(0 0 10px rgba(0,201,167,0.4))' }}>
          <BrainBridgeLogo size={32} />
        </div>
        <div>
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: '18px',
              color: '#F0F2F5',
              letterSpacing: '-0.3px',
              display: 'block',
            }}
          >
            MindBridge
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              color: '#00C9A7',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Admin
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: '#30363D', margin: '0 16px 12px' }} />

      {/* Nav Items */}
      <nav className="flex flex-col gap-1 px-3 flex-1">
        {ADMIN_NAV_ITEMS.map(({ icon: Icon, label, path, badge }) => {
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
                backgroundColor: isActive ? 'rgba(0,201,167,0.1)' : 'transparent',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <div className="relative">
                <Icon
                  style={{
                    width: 20,
                    height: 20,
                    color: isActive ? '#00C9A7' : '#8B949E',
                    flexShrink: 0,
                  }}
                />
                {badge && (
                  <span
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse-dot"
                    style={{ backgroundColor: '#FF5C5C' }}
                  />
                )}
              </div>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#00C9A7' : '#8B949E',
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
                    backgroundColor: '#00C9A7',
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
