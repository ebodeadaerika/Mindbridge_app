// MindBridge — Admin Manage Resources

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MoreVertical, Trash2, Edit2, X, Link, AlertTriangle } from 'lucide-react';
import { resourcesApi } from '@/api/client';
import AdminBottomNav from '@/components/AdminBottomNav';
import type { Resource, ResourceCategory } from '@/types';

const CATEGORIES: ResourceCategory[] = ['article', 'breathing', 'coping', 'hotline'];
const CATEGORY_COLORS: Record<ResourceCategory, string> = {
  article: '#7B61FF',
  breathing: '#00C9A7',
  coping: '#FFB347',
  hotline: '#FF5C5C',
};

const ALL_FILTERS = ['All', 'Articles', 'Breathing', 'Coping', 'Hotlines'];
const FILTER_MAP: Record<string, ResourceCategory | undefined> = {
  All: undefined,
  Articles: 'article',
  Breathing: 'breathing',
  Coping: 'coping',
  Hotlines: 'hotline',
};

export default function AdminManageResources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ResourceCategory>('article');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = FILTER_MAP[filter] ? { category: FILTER_MAP[filter] } : {};
        const res = await resourcesApi.list(params);
        setResources(res.data.resources || []);
      } catch {
        setResources([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filter]);

  const requestDelete = (id: string) => {
    setPendingDeleteId(id);
    setShowDeleteConfirm(true);
    setOpenMenuId(null);
    setSwipedId(null);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await resourcesApi.delete(pendingDeleteId);
      setResources((prev) => prev.filter((r) => r.id !== pendingDeleteId));
      setShowDeleteConfirm(false);
      setPendingDeleteId(null);
    } catch {
      setDeleteError('Failed to delete resource. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPendingDeleteId(null);
    setDeleteError('');
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    setAddError('');
    try {
      const res = await resourcesApi.create({
        title: newTitle.trim(),
        category: newCategory,
        description: newDesc.trim() || undefined,
        url: newUrl.trim() || undefined,
      });
      setResources((prev) => [res.data, ...prev]);
      setNewTitle('');
      setNewDesc('');
      setNewUrl('');
      setAddError('');
      setShowSheet(false);
    } catch {
      setAddError('Failed to add resource. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const filtered = resources;

  return (
    <div
      className="w-full h-screen relative overflow-hidden flex flex-col"
      style={{ backgroundColor: '#0D0F14' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 md:px-8 pt-12 md:pt-6 pb-3">
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ArrowLeft style={{ color: '#F0F2F5', width: 24, height: 24 }} />
        </button>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', color: '#F0F2F5', flex: 1 }}>
          Manage Resources
        </h1>
        <button
          onClick={() => setShowSheet(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          <Plus style={{ color: '#00C9A7', width: 24, height: 24 }} />
        </button>
      </div>

      {/* Filter + count */}
      <div className="px-5 md:px-8 pb-3">
        <div className="flex gap-2 overflow-x-auto mb-2" style={{ scrollbarWidth: 'none' }}>
          {ALL_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                whiteSpace: 'nowrap',
                padding: '7px 14px',
                borderRadius: 50,
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                border: `1px solid ${filter === f ? '#00C9A7' : '#30363D'}`,
                backgroundColor: filter === f ? '#00C9A7' : 'transparent',
                color: filter === f ? '#0D0F14' : '#8B949E',
                cursor: 'pointer',
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8B949E' }}>
          {filtered.length} resource{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Resources list */}
      <div className="flex-1 overflow-y-auto px-5 md:px-8 pb-20 md:pb-8">
        <div className="max-w-5xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 84, backgroundColor: '#161B22', borderRadius: 20, animation: 'pulse 1.5s infinite', opacity: 1 - i * 0.2 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px', color: '#F0F2F5' }}>
              No resources yet
            </p>
            <button
              onClick={() => setShowSheet(true)}
              style={{
                padding: '10px 24px',
                borderRadius: 50,
                background: 'linear-gradient(135deg, #00C9A7 0%, #7B61FF 100%)',
                color: '#0D0F14',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Add First Resource
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((resource) => {
              const color = CATEGORY_COLORS[resource.category];
              return (
                <div
                  key={resource.id}
                  style={{ position: 'relative', overflow: 'hidden', borderRadius: 20 }}
                >
                  {/* Delete reveal */}
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: 72,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#FF5C5C',
                      borderRadius: '0 20px 20px 0',
                    }}
                  >
                    <button
                      onClick={() => requestDelete(resource.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
                    >
                      <Trash2 style={{ color: '#fff', width: 20, height: 20 }} />
                    </button>
                  </div>

                  {/* Card */}
                  <div
                    style={{
                      backgroundColor: '#161B22',
                      borderRadius: 20,
                      padding: '14px 16px',
                      border: '1px solid #30363D',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      transform: swipedId === resource.id ? 'translateX(-72px)' : 'translateX(0)',
                      transition: 'transform 0.25s ease',
                      position: 'relative',
                      zIndex: 1,
                    }}
                    onTouchStart={(e) => {
                      const x = e.touches[0].clientX;
                      const handler = (e2: TouchEvent) => {
                        const diff = x - e2.changedTouches[0].clientX;
                        if (diff > 40) setSwipedId(resource.id);
                        else if (diff < -20) setSwipedId(null);
                        document.removeEventListener('touchend', handler);
                      };
                      document.addEventListener('touchend', handler);
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: `${color}20`,
                        border: `1px solid ${color}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 40,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>
                        {resource.category === 'article' ? '📄' : resource.category === 'breathing' ? '🌬️' : resource.category === 'coping' ? '🛡️' : '📞'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '14px', color: '#F0F2F5', marginBottom: 2 }}>
                        {resource.title}
                      </p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color, fontWeight: 600 }}>
                        {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
                      </p>
                      {resource.url && (
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#8B949E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {resource.url}
                        </p>
                      )}
                    </div>

                    {/* More menu */}
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === resource.id ? null : resource.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                      >
                        <MoreVertical style={{ color: '#8B949E', width: 18, height: 18 }} />
                      </button>
                      {openMenuId === resource.id && (
                        <div
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: 28,
                            backgroundColor: '#1E2530',
                            border: '1px solid #30363D',
                            borderRadius: 12,
                            overflow: 'hidden',
                            minWidth: 120,
                            zIndex: 50,
                          }}
                        >
                          <button
                            onClick={() => setOpenMenuId(null)}
                            style={{ width: '100%', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', borderBottom: '1px solid #30363D', cursor: 'pointer', color: '#00C9A7', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}
                          >
                            <Edit2 style={{ width: 14, height: 14 }} /> Edit
                          </button>
                          <button
                            onClick={() => requestDelete(resource.id)}
                            style={{ width: '100%', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#FF5C5C', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}
                          >
                            <Trash2 style={{ width: 14, height: 14 }} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {/* Add Resource bottom sheet */}
      {showSheet && (
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
              maxHeight: '85vh',
              overflowY: 'auto',
              animation: 'slideUp 0.3s ease',
            }}
          >
            <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
            {/* Drag handle */}
            <div style={{ width: 40, height: 4, backgroundColor: '#30363D', borderRadius: 2, margin: '0 auto 16px' }} />
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', color: '#F0F2F5' }}>
                Add Resource
              </h3>
              <button onClick={() => { setShowSheet(false); setAddError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ color: '#8B949E', width: 20, height: 20 }} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{
                  height: 50,
                  backgroundColor: '#0D0F14',
                  border: '1px solid #30363D',
                  borderRadius: 14,
                  padding: '0 16px',
                  color: '#F0F2F5',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '15px',
                  outline: 'none',
                  width: '100%',
                }}
              />

              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8B949E', fontWeight: 500, marginBottom: 8 }}>
                  Category
                </p>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNewCategory(cat)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 50,
                        border: `1px solid ${newCategory === cat ? CATEGORY_COLORS[cat] : '#30363D'}`,
                        backgroundColor: newCategory === cat ? `${CATEGORY_COLORS[cat]}20` : 'transparent',
                        color: newCategory === cat ? CATEGORY_COLORS[cat] : '#8B949E',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                style={{
                  backgroundColor: '#0D0F14',
                  border: '1px solid #30363D',
                  borderRadius: 14,
                  padding: '12px 16px',
                  color: '#F0F2F5',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  resize: 'none',
                  outline: 'none',
                  width: '100%',
                }}
              />

              <div className="relative">
                <Link
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#8B949E', width: 16, height: 16 }}
                />
                <input
                  type="url"
                  placeholder="URL (optional)"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  style={{
                    height: 50,
                    backgroundColor: '#0D0F14',
                    border: '1px solid #30363D',
                    borderRadius: 14,
                    padding: '0 16px 0 36px',
                    color: '#F0F2F5',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    outline: 'none',
                    width: '100%',
                  }}
                />
              </div>

              {addError && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#FF5C5C', textAlign: 'center' }}>
                  {addError}
                </p>
              )}

              <button
                onClick={handleAdd}
                disabled={!newTitle.trim() || adding}
                style={{
                  width: '100%',
                  height: 52,
                  borderRadius: 50,
                  background: newTitle.trim() ? 'linear-gradient(135deg, #00C9A7 0%, #7B61FF 100%)' : '#30363D',
                  border: 'none',
                  color: newTitle.trim() ? '#0D0F14' : '#8B949E',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: newTitle.trim() && !adding ? 'pointer' : 'not-allowed',
                  opacity: adding ? 0.7 : 1,
                }}
              >
                {adding ? 'Adding...' : 'Add Resource'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation bottom sheet */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 200,
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
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', color: '#F0F2F5', marginBottom: 6 }}>
                  Delete this resource?
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#8B949E', lineHeight: 1.5 }}>
                  This resource will be permanently removed. This cannot be undone.
                </p>
                {deleteError && (
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#FF5C5C', marginTop: 8 }}>
                    {deleteError}
                  </p>
                )}
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={cancelDelete}
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
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
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
                  }}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AdminBottomNav />
    </div>
  );
}
