// MindBridge — Resource Library

import React, { useState, useEffect } from 'react';
import { Search, X, ChevronRight, BookOpen, Wind, Shield, Phone, FileText } from 'lucide-react';
import { resourcesApi } from '@/api/client';
import BottomNav from '@/components/BottomNav';
import PageShell from '@/components/ui/PageShell';
import { CATEGORY_COLORS, CATEGORY_BG, RESOURCE_FILTER_LABELS, RESOURCE_FILTER_MAP } from '@/constants/resources';
import type { Resource, ResourceCategory } from '@/types';

const CATEGORY_ICONS: Record<ResourceCategory, React.ElementType> = {
  article: FileText,
  breathing: Wind,
  coping: Shield,
  hotline: Phone,
};

function SkeletonCard({ featured }: { featured?: boolean }) {
  if (featured) {
    return (
      <div style={{ height: 140, borderRadius: 20, background: 'linear-gradient(135deg, #1E2530, #30363D)', animation: 'pulse 1.5s infinite', marginBottom: 16 }} />
    );
  }
  return (
    <div style={{ height: 88, backgroundColor: '#161B22', borderRadius: 20, animation: 'pulse 1.5s infinite', border: '1px solid #30363D' }} />
  );
}

export default function ResourceLibrary() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = RESOURCE_FILTER_MAP[filter] ? { category: RESOURCE_FILTER_MAP[filter] } : {};
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

  const filtered = query
    ? resources.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          (r.description?.toLowerCase().includes(query.toLowerCase()))
      )
    : resources;

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <PageShell>
      {/* Header */}
      <div className="flex items-center justify-between px-5 md:px-8 pt-12 md:pt-6 pb-3">
        {searchOpen ? (
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: '#8B949E', width: 16, height: 16 }}
              />
              <input
                autoFocus
                type="text"
                placeholder="Search resources..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: 42,
                  borderRadius: 50,
                  backgroundColor: '#161B22',
                  border: '1px solid #30363D',
                  padding: '0 16px 0 36px',
                  color: '#F0F2F5',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
            <button
              onClick={() => { setSearchOpen(false); setQuery(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <X style={{ color: '#8B949E', width: 20, height: 20 }} />
            </button>
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: '#F0F2F5' }}>
              Resources
            </h1>
            <button
              onClick={() => setSearchOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <Search style={{ color: '#8B949E', width: 22, height: 22 }} />
            </button>
          </>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 px-5 md:px-8 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {RESOURCE_FILTER_LABELS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              whiteSpace: 'nowrap',
              padding: '7px 16px',
              borderRadius: 50,
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              border: `1px solid ${filter === f ? '#00C9A7' : '#30363D'}`,
              backgroundColor: filter === f ? '#00C9A7' : 'transparent',
              color: filter === f ? '#0D0F14' : '#8B949E',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 md:px-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto w-full">
        {loading ? (
          <>
            <SkeletonCard featured />
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </div>
          </>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Search style={{ color: '#8B949E', width: 48, height: 48 }} />
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '17px', color: '#F0F2F5' }}>
              No resources found
            </p>
            {query && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#8B949E' }}>
                No results for "{query}"
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #00C9A7 0%, #7B61FF 100%)',
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 16,
                  cursor: featured.url ? 'pointer' : 'default',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onClick={() => featured.url && window.open(featured.url, '_blank')}
              >
                <span
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 50,
                    display: 'inline-block',
                    marginBottom: 10,
                    letterSpacing: '0.05em',
                  }}
                >
                  FEATURED
                </span>
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', color: '#fff', marginBottom: 6 }}>
                  {featured.title}
                </p>
                {featured.description && (
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                    {featured.description}
                  </p>
                )}
              </div>
            )}

            {/* Resource cards */}
            <div className="flex flex-col gap-3">
              {rest.map((resource) => {
                const Icon = CATEGORY_ICONS[resource.category] || BookOpen;
                const color = CATEGORY_COLORS[resource.category] || '#8B949E';
                const bg = CATEGORY_BG[resource.category] || 'rgba(139,148,158,0.12)';
                return (
                  <div
                    key={resource.id}
                    onClick={() => resource.url && window.open(resource.url, '_blank')}
                    style={{
                      backgroundColor: '#161B22',
                      borderRadius: 20,
                      padding: 16,
                      border: '1px solid #30363D',
                      cursor: resource.url ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        backgroundColor: bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 44,
                      }}
                    >
                      <Icon style={{ color, width: 20, height: 20 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '15px', color: '#F0F2F5', marginBottom: 2 }}>
                        {resource.title}
                      </p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color, fontWeight: 600, marginBottom: 2 }}>
                        {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
                      </p>
                      {resource.description && (
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8B949E', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {resource.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight style={{ color: '#30363D', width: 18, height: 18, minWidth: 18 }} />
                  </div>
                );
              })}
            </div>
          </>
        )}
        </div>
      </div>

      <BottomNav />
    </PageShell>
  );
}
