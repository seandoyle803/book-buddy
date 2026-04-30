import { ReadingSessionRow } from "@/lib/supabase";

export function getTodayMinutes(sessions: ReadingSessionRow[]): number {
  const today = new Date().toISOString().split("T")[0];
  return sessions
    .filter((s) => s.session_date === today)
    .reduce((sum, s) => sum + s.minutes_read, 0);
}

export function getWeeklyActiveDays(sessions: ReadingSessionRow[]): number {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const uniqueDays = new Set(
    sessions
      .filter((s) => new Date(s.session_date) >= monday)
      .map((s) => s.session_date)
  );
  return uniqueDays.size;
}

export function getCurrentStreak(sessions: ReadingSessionRow[]): number {
  if (sessions.length === 0) return 0;

  const uniqueDates = [...new Set(sessions.map((s) => s.session_date))].sort().reverse();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export function getLongestStreak(sessions: ReadingSessionRow[]): number {
  if (sessions.length === 0) return 0;

  const uniqueDates = [...new Set(sessions.map((s) => s.session_date))].sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

export function getDaysSinceLastSession(sessions: ReadingSessionRow[]): number {
  if (sessions.length === 0) return -1; // never read
  const sorted = [...sessions].sort((a, b) =>
    new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
  );
  const last = new Date(sorted[0].session_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - last.getTime()) / 86400000);
}

export function getWeeklyConsistency(activeDays: number): string {
  return `${activeDays} of 7 days`;
}

export function getBookProgressPercent(currentPage: number, totalPages: number): number {
  if (totalPages === 0) return 0;
  return Math.min(100, Math.round((currentPage / totalPages) * 100));
}
