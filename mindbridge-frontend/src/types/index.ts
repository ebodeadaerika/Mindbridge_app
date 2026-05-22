// MindBridge — TypeScript Type Definitions
// Mirrors the backend Pydantic schemas

export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bio?: string;
  university?: string;
  year_of_study?: string;
  created_at: string;
  notif_mood_reminder: boolean;
  notif_forum_replies: boolean;
}

export interface AuthToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface MoodLog {
  id: string;
  mood_score: number;   // 1-5
  energy_level: number; // 1-5
  note?: string;
  date: string;
}

export interface MoodHistory {
  entries: MoodLog[];
  total: number;
}

export interface MoodTrends {
  average_mood: number;
  average_energy: number;
  total_checkins: number;
  mood_distribution: Record<string, number>;
  daily_averages: Array<{ date: string; avg_mood: number }>;
}

export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface JournalList {
  entries: JournalEntry[];
  total: number;
}

export interface ForumPost {
  id: string;
  anon_name: string;
  body: string;
  category?: string;
  created_at: string;
  reply_count: number;
  like_count: number;
  liked: boolean;
}

export interface ForumReply {
  id: string;
  anon_name: string;
  body: string;
  created_at: string;
}

export interface ForumPostDetail extends ForumPost {
  replies: ForumReply[];
}

export interface LikeToggleResponse {
  liked: boolean;
  like_count: number;
}

export interface ForumList {
  posts: ForumPost[];
  total: number;
  page: number;
  per_page: number;
}

export type CrisisSeverity = 'low' | 'medium' | 'high';

export interface CrisisFlag {
  id: string;
  severity: CrisisSeverity;
  message?: string;
  resolved: boolean;
  resolution_note?: string;
  created_at: string;
}

export interface CrisisList {
  flags: CrisisFlag[];
  total: number;
  pending_count: number;
  resolved_count: number;
}

export type ResourceCategory = 'article' | 'breathing' | 'coping' | 'hotline';

export interface Resource {
  id: string;
  title: string;
  category: ResourceCategory;
  description?: string;
  url?: string;
  created_at: string;
}

export interface ResourceList {
  resources: Resource[];
  total: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// UI-only types
export type MoodEmoji = '😞' | '😕' | '😐' | '🙂' | '😄';

export const MOOD_EMOJIS: MoodEmoji[] = ['😞', '😕', '😐', '🙂', '😄'];
export const MOOD_LABELS = ['Very Low', 'Low', 'Okay', 'Good', 'Excellent'];

export const FORUM_CATEGORIES = ['All', 'Anxiety', 'Exams', 'Relationships', 'Motivation', 'Sleep', 'Finance'];
export const RESOURCE_CATEGORIES: ResourceCategory[] = ['article', 'breathing', 'coping', 'hotline'];
