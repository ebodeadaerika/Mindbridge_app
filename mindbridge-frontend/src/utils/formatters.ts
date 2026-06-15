// MindBridge — Shared Formatting Utilities

/**
 * Convert an ISO date string to a human-readable relative time (e.g. "5m ago").
 * Used by Forum and AdminForumModeration.
 */
export function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/**
 * Format a date string as "Month Day, Year" (e.g. "June 15, 2026").
 * Used by JournalList.
 */
export function formatDateLong(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Format a date string as "Mon Day" short form (e.g. "Jun 15").
 * Used by MoodHistory chart.
 */
export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format a date string as "Weekday, Month Day" (e.g. "Mon, Jun 15").
 * Used by MoodHistory entries.
 */
export function formatDateWeekday(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Format today's date as "Weekday, Month Day, Year" (e.g. "Monday, June 15, 2026").
 * Used by Dashboard and AdminDashboard headers.
 */
export function formatToday(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Format a date string with time (e.g. "Jun 15, 3:42 PM").
 * Used by AdminCrisisAlerts and EditJournalEntry.
 */
export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Count words in a text string.
 * Used by JournalList and NewJournalEntry.
 */
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Get a greeting based on time of day.
 * Used by Dashboard.
 */
export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
