// MindBridge — Resource Category Constants
// Shared by ResourceLibrary and AdminManageResources

import type { ResourceCategory } from '@/types';

export const CATEGORY_COLORS: Record<ResourceCategory, string> = {
  article: '#7B61FF',
  breathing: '#00C9A7',
  coping: '#FFB347',
  hotline: '#FF5C5C',
};

export const CATEGORY_BG: Record<ResourceCategory, string> = {
  article: 'rgba(123,97,255,0.12)',
  breathing: 'rgba(0,201,167,0.12)',
  coping: 'rgba(255,179,71,0.12)',
  hotline: 'rgba(255,92,92,0.12)',
};

export const RESOURCE_FILTER_LABELS = ['All', 'Articles', 'Breathing', 'Coping', 'Hotlines'];

export const RESOURCE_FILTER_MAP: Record<string, ResourceCategory | undefined> = {
  All: undefined,
  Articles: 'article',
  Breathing: 'breathing',
  Coping: 'coping',
  Hotlines: 'hotline',
};
