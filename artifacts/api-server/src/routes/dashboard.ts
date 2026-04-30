import { Router } from "express";
import { adminDb, resolveUser, extractJwt } from "../lib/db";

const router = Router();

interface SessionRow {
  session_date: string;
  minutes_read: number;
  pages_read: number;
}

function getTodayMinutes(sessions: SessionRow[]): number {
  const today = new Date().toISOString().split("T")[0];
  return sessions
    .filter((s) => s.session_date === today)
    .reduce((sum, s) => sum + (s.minutes_read || 0), 0);
}

function getWeeklyActiveDays(sessions: SessionRow[]): number {
  const now = new Date();
  const dayOfWeek = now.getDay();
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

function getCurrentStreak(sessions: SessionRow[]): number {
  if (!sessions.length) return 0;
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

function getLongestStreak(sessions: SessionRow[]): number {
  if (!sessions.length) return 0;
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

function getDaysSinceLastSession(sessions: SessionRow[]): number | null {
  if (!sessions.length) return null;
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
  );
  const last = new Date(sorted[0].session_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - last.getTime()) / 86400000);
}

router.get("/dashboard/summary", async (req, res) => {
  const jwt = extractJwt(req.headers.authorization);
  if (!jwt) return res.status(401).json({ error: "Missing or invalid Authorization header" });

  const user = await resolveUser(jwt);
  if (!user) return res.status(401).json({ error: "Invalid or expired session" });

  const { data: sessions, error } = await adminDb
    .from("reading_sessions")
    .select("session_date, minutes_read, pages_read")
    .eq("user_id", user.profileId)
    .order("session_date", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const allSessions: SessionRow[] = sessions ?? [];

  return res.json({
    todayMinutes: getTodayMinutes(allSessions),
    weeklyActiveDays: getWeeklyActiveDays(allSessions),
    currentStreak: getCurrentStreak(allSessions),
    longestStreak: getLongestStreak(allSessions),
    weeklyConsistency: `${getWeeklyActiveDays(allSessions)} of 7 days`,
    daysSinceLastSession: getDaysSinceLastSession(allSessions),
    totalPagesAllTime: allSessions.reduce((sum, s) => sum + (s.pages_read || 0), 0),
    totalMinutesAllTime: allSessions.reduce((sum, s) => sum + (s.minutes_read || 0), 0),
    totalSessionsAllTime: allSessions.length,
  });
});

export default router;
