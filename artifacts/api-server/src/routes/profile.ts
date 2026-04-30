import { Router } from "express";
import { adminDb, resolveUser, extractJwt } from "../lib/db";

const router = Router();

router.get("/profile", async (req, res) => {
  const jwt = extractJwt(req.headers.authorization);
  if (!jwt) return res.status(401).json({ error: "Missing or invalid Authorization header" });

  const user = await resolveUser(jwt);
  if (!user) return res.status(401).json({ error: "Invalid or expired session" });

  const { data: profile, error } = await adminDb
    .from("users")
    .select("*")
    .eq("supabase_auth_id", user.supabaseAuthId)
    .single();

  if (error || !profile) return res.status(404).json({ error: "Profile not found" });
  return res.json(profile);
});

router.patch("/profile", async (req, res) => {
  const jwt = extractJwt(req.headers.authorization);
  if (!jwt) return res.status(401).json({ error: "Missing or invalid Authorization header" });

  const user = await resolveUser(jwt);
  if (!user) return res.status(401).json({ error: "Invalid or expired session" });

  const allowed = [
    "display_name", "daily_goal_minutes", "reminder_enabled",
    "reminder_time", "burnout_window_start", "burnout_window_end", "dark_mode",
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in req.body) updates[key] = req.body[key];
  }

  const { data: profile, error } = await adminDb
    .from("users")
    .update(updates)
    .eq("supabase_auth_id", user.supabaseAuthId)
    .select("*")
    .single();

  if (error || !profile) return res.status(500).json({ error: error?.message ?? "Update failed" });
  return res.json(profile);
});

export default router;
