// MindBridge — Notifications

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Heart, MessageSquare, AlertTriangle, BookOpen } from 'lucide-react';

interface Notification {
  id: string;
  type: 'mood' | 'forum' | 'crisis' | 'resource';
  title: string;
  body: string;
  time: string;
  read: boolean;
  group: 'Today' | 'Earlier';
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'mood', title: 'Daily Check-in Reminder', body: "Don't forget to log your mood today.", time: '9:00 AM', read: false, group: 'Today' },
  { id: '2', type: 'forum', title: 'New reply on your post', body: 'Blue Sparrow replied to "Feeling overwhelmed with exams"', time: '8:30 AM', read: false, group: 'Today' },
  { id: '3', type: 'crisis', title: 'Crisis Support Team', body: 'A counsellor has reviewed your recent flag and is available.', time: 'Yesterday', read: true, group: 'Earlier' },
  { id: '4', type: 'resource', title: 'New Resource Available', body: 'Check out our new mindfulness guide for exam season.', time: '2 days ago', read: true, group: 'Earlier' },
  { id: '5', type: 'forum', title: 'Trending post you might like', body: '"How I survived finals week" is getting a lot of replies.', time: '3 days ago', read: true, group: 'Earlier' },
];

const TYPE_ICONS: Record<Notification['type'], React.ElementType> = {
  mood: Heart,
  forum: MessageSquare,
  crisis: AlertTriangle,
  resource: BookOpen,
};

const TYPE_COLORS: Record<Notification['type'], string> = {
  mood: '#00C9A7',
  forum: '#7B61FF',
  crisis: '#FF5C5C',
  resource: '#FFB347',
};

const TYPE_BG: Record<Notification['type'], string> = {
  mood: 'rgba(0,201,167,0.12)',
  forum: 'rgba(123,97,255,0.12)',
  crisis: 'rgba(255,92,92,0.12)',
  resource: 'rgba(255,179,71,0.12)',
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const groups = ['Today', 'Earlier'] as const;
  const grouped = groups.reduce(
    (acc, g) => {
      acc[g] = notifications.filter((n) => n.group === g);
      return acc;
    },
    {} as Record<string, Notification[]>
  );

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div
      className="w-full h-screen relative overflow-hidden flex flex-col"
      style={{ backgroundColor: '#0D0F14' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 md:px-8 pt-12 md:pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <ArrowLeft style={{ color: '#F0F2F5', width: 24, height: 24 }} />
          </button>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: '#F0F2F5' }}>
            Notifications
          </h1>
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '10px',
            fontWeight: 700,
            color: '#7B61FF',
            backgroundColor: 'rgba(123,97,255,0.12)',
            border: '1px solid rgba(123,97,255,0.25)',
            padding: '2px 7px',
            borderRadius: 50,
            letterSpacing: '0.04em',
          }}>
            PREVIEW
          </span>
        </div>
        {hasUnread && (
          <button
            onClick={markAllRead}
            style={{ background: 'none', border: 'none', color: '#00C9A7', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 md:px-8 pb-8">
        <div className="max-w-3xl mx-auto w-full">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <Bell style={{ color: '#8B949E', width: 64, height: 64 }} />
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '18px', color: '#F0F2F5' }}>
              You're all caught up 😊
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#8B949E' }}>
              Nothing new right now
            </p>
          </div>
        ) : (
          <>
            {groups.map((group) => {
              const items = grouped[group];
              if (!items || items.length === 0) return null;
              return (
                <div key={group} className="mb-4">
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      color: '#8B949E',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      marginBottom: 10,
                      marginTop: 4,
                    }}
                  >
                    {group.toUpperCase()}
                  </p>
                  <div className="flex flex-col gap-2">
                    {items.map((notif) => {
                      const Icon = TYPE_ICONS[notif.type];
                      const color = TYPE_COLORS[notif.type];
                      const bg = TYPE_BG[notif.type];
                      return (
                        <div
                          key={notif.id}
                          onClick={() => setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, read: true } : n))}
                          style={{
                            backgroundColor: notif.read ? 'transparent' : '#1E2530',
                            borderRadius: 14,
                            padding: '14px 16px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                            cursor: 'pointer',
                            border: `1px solid ${notif.read ? 'transparent' : '#30363D'}`,
                            position: 'relative',
                          }}
                        >
                          {!notif.read && (
                            <div
                              style={{
                                position: 'absolute',
                                left: -8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: '#00C9A7',
                              }}
                            />
                          )}
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              backgroundColor: bg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: 40,
                            }}
                          >
                            <Icon style={{ color, width: 18, height: 18 }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#F0F2F5', fontWeight: 600 }}>
                                {notif.title}
                              </p>
                              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#8B949E', whiteSpace: 'nowrap' }}>
                                {notif.time}
                              </p>
                            </div>
                            <p
                              style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '13px',
                                color: '#8B949E',
                                lineHeight: 1.5,
                                marginTop: 2,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {notif.body}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}
        </div>
      </div>
    </div>
  );
}
