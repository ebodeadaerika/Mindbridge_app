// MindBridge — Admin Bottom Navigation
// Admin: Home | Alerts | Resources | Moderation | Profile

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, BookMarked, Shield, User } from 'lucide-react';

const ADMIN_NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Home',       path: '/admin/dashboard' },
  { icon: AlertCircle,     label: 'Alerts',     path: '/admin/crisis', badge: true },
  { icon: BookMarked,      label: 'Resources',  path: '/admin/resources' },
  { icon: Shield,          label: 'Moderation', path: '/admin/forum' },
  { icon: User,            label: 'Profile',    path: '/profile' },
];

export default function AdminBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 w-full border-t border-border bg-surface z-50"
      style={{ height: '64px' }}
    >
      <div className="flex items-center justify-around h-full px-2">
        {ADMIN_NAV_ITEMS.map(({ icon: Icon, label, path, badge }) => {
          const isActive = location.pathname.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1 flex-1 py-2"
            >
              <div className="relative">
                <Icon
                  className="w-5 h-5 transition-colors"
                  style={{ color: isActive ? '#00C9A7' : '#8B949E' }}
                />
                {badge && (
                  <span
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse-dot"
                    style={{ backgroundColor: '#FF5C5C' }}
                  />
                )}
              </div>
              <span
                className="text-[10px] font-medium"
                style={{
                  color: isActive ? '#00C9A7' : '#8B949E',
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
