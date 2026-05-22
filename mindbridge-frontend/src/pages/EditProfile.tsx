// MindBridge — Edit Profile

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Lock, Trash2, AlertTriangle, User, Building2, Pencil } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/client';

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 48,
        height: 28,
        borderRadius: 50,
        backgroundColor: on ? '#00C9A7' : '#30363D',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.25s',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 23 : 3,
          width: 22,
          height: 22,
          borderRadius: '50%',
          backgroundColor: '#fff',
          transition: 'left 0.25s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );
}

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [university, setUniversity] = useState(user?.university || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [moodReminder, setMoodReminder] = useState(user?.notif_mood_reminder ?? true);
  const [forumNotifs, setForumNotifs] = useState(user?.notif_forum_replies ?? true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'MB';

  // bio is UI-only — no backend column yet. Exclude from dirty check so
  // users are not misled into thinking their bio was saved.
  const hasChanges =
    name !== (user?.name || '') ||
    bio !== (user?.bio || '') ||
    university !== (user?.university || '') ||
    avatarUrl !== null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Auto-save notification toggles immediately — no need to hit the top-bar Save button
  const handleToggleMoodReminder = async () => {
    const next = !moodReminder;
    setMoodReminder(next);
    try {
      const res = await authApi.updateMe({ notif_mood_reminder: next });
      updateUser(res.data);
    } catch {
      setMoodReminder(!next); // revert on failure
    }
  };

  const handleToggleForumNotifs = async () => {
    const next = !forumNotifs;
    setForumNotifs(next);
    try {
      const res = await authApi.updateMe({ notif_forum_replies: next });
      updateUser(res.data);
    } catch {
      setForumNotifs(!next); // revert on failure
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await authApi.deleteMe();
      logout();
      navigate('/login');
    } catch {
      setDeleteError('Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    setSaveError('');
    try {
      const res = await authApi.updateMe({ name: name.trim(), bio: bio.trim() || undefined, university: university.trim() || undefined });
      updateUser(res.data);
      navigate(-1);
    } catch {
      setSaveError('Failed to save changes. Please try again.');
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#0D0F14',
    border: '1px solid #30363D',
    borderRadius: 14,
    height: 52,
    padding: '0 16px',
    color: '#F0F2F5',
    fontFamily: 'Inter, sans-serif',
    fontSize: '15px',
    width: '100%',
    outline: 'none',
  };

  return (
    <div
      className="w-full h-screen relative overflow-hidden flex flex-col"
      style={{ backgroundColor: '#0D0F14' }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 md:px-8 pt-12 md:pt-6 pb-4 max-w-3xl mx-auto w-full">
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: '#8B949E', fontFamily: 'Inter, sans-serif', fontSize: '16px', cursor: 'pointer', padding: 4 }}
        >
          Cancel
        </button>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '17px', color: '#F0F2F5' }}>
          Edit Profile
        </h2>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          style={{
            background: 'none',
            border: 'none',
            color: hasChanges ? '#00C9A7' : '#30363D',
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            cursor: hasChanges && !saving ? 'pointer' : 'default',
            padding: 4,
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {saveError && (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#FF5C5C', textAlign: 'center', padding: '0 20px 8px' }} className="max-w-3xl mx-auto w-full">
          {saveError}
        </p>
      )}

      <div className="flex-1 overflow-y-auto px-5 md:px-8 pb-8 flex flex-col gap-5">
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-5">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-2">
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                backgroundColor: '#7B61FF',
                border: '3px solid #00C9A7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '28px', color: '#fff' }}>
                  {initials}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#00C9A7',
                border: '2px solid #0D0F14',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Camera style={{ color: '#0D0F14', width: 14, height: 14 }} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ background: 'none', border: 'none', color: '#00C9A7', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            Change photo
          </button>
        </div>

        {/* Form fields */}
        <div className="flex flex-col gap-3">
          {/* Name */}
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#00C9A7', width: 17, height: 17 }}
            />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 40 }}
            />
          </div>

          {/* University */}
          <div className="relative">
            <Building2
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#00C9A7', width: 17, height: 17 }}
            />
            <input
              type="text"
              placeholder="University"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 40 }}
            />
          </div>

          {/* Bio */}
          <div className="relative">
            <Pencil
              className="absolute left-3 top-4"
              style={{ color: '#00C9A7', width: 16, height: 16 }}
            />
            <textarea
              placeholder="Tell your campus community a little about yourself…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={300}
              style={{
                ...inputStyle,
                paddingLeft: 40,
                height: 'auto',
                paddingTop: 14,
                paddingBottom: 14,
                resize: 'none',
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* Email (read-only) */}
          <div className="flex flex-col gap-1">
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: '#30363D', width: 16, height: 16 }}
              />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                style={{
                  ...inputStyle,
                  paddingLeft: 40,
                  color: '#8B949E',
                  cursor: 'not-allowed',
                }}
              />
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#8B949E', paddingLeft: 4 }}>
              Email cannot be changed. Contact admin.
            </p>
          </div>
        </div>

        {/* Notification toggles */}
        <div
          style={{
            backgroundColor: '#161B22',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid #30363D',
          }}
        >
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#F0F2F5', fontWeight: 700, padding: '14px 16px 8px' }}>
            Preferences
          </p>
          <div style={{ height: 1, backgroundColor: '#30363D' }} />
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#F0F2F5' }}>
              Daily mood reminder
            </span>
            <Toggle on={moodReminder} onToggle={handleToggleMoodReminder} />
          </div>
          <div style={{ height: 1, backgroundColor: '#30363D', marginLeft: 16 }} />
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#F0F2F5' }}>
              Forum reply notifications
            </span>
            <Toggle on={forumNotifs} onToggle={handleToggleForumNotifs} />
          </div>
        </div>

        {/* Delete account */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FF5C5C',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Trash2 style={{ width: 15, height: 15 }} />
            Delete Account
          </button>
        </div>
        </div>
      </div>

      {/* Delete account modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 100,
            maxWidth: 560,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              backgroundColor: '#161B22',
              borderRadius: '20px 20px 0 0',
              padding: 24,
              width: '100%',
              border: '1px solid #30363D',
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,92,92,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle style={{ color: '#FF5C5C', width: 24, height: 24 }} />
              </div>
              <div className="text-center">
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', color: '#F0F2F5', marginBottom: 6 }}>
                  Delete your account?
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#8B949E', lineHeight: 1.5 }}>
                  All your data including journals, moods, and history will be permanently deleted. This cannot be undone.
                </p>
              </div>
              {deleteError && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#FF5C5C', textAlign: 'center', marginTop: -8 }}>
                  {deleteError}
                </p>
              )}
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeleteError(''); }}
                  disabled={deleting}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 50,
                    background: 'transparent',
                    border: '1px solid #30363D',
                    color: '#F0F2F5',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    opacity: deleting ? 0.5 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 50,
                    background: 'linear-gradient(135deg, #FF5C5C 0%, #cc3333 100%)',
                    border: 'none',
                    color: '#fff',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    opacity: deleting ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  {deleting ? (
                    <>
                      <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
