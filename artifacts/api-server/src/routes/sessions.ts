import { Router } from "express";
import { adminDb, resolveUser, extractJwt } from "../lib/db";

const router = Router();

router.get("/sessions", async (req, res) => {
  const jwt = extractJwt(req.headers.authorization);
  if (!jwt) return res.status(401).json({ error: "Missing or invalid Authorization header" });

  const user = await resolveUser(jwt);
  if (!user) return res.status(401).json({ error: "Invalid or expired session" });

  const limitParam = req.query.limit;
  const limit = limitParam ? parseInt(String(limitParam), 10) : undefined;

  let query = adminDb
    .from("reading_sessions")
    .select("*, book:books(*)")
    .eq("user_id", user.profileId)
    .order("created_at", { ascending: false });

  if (limit && !isNaN(limit) && limit > 0) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data ?? []);
});

router.post("/sessions", async (req, res) => {
  const jwt = extractJwt(req.headers.authorization);
  if (!jwt) return res.status(401).json({ error: "Missing or invalid Authorization header" });

  const user = await resolveUser(jwt);
  if (!user) return res.status(401).json({ error: "Invalid or expired session" });

  const { book_id, pages_read, minutes_read, start_page, end_page, session_date, notes } = req.body as {
    book_id: string;
    pages_read: number;
    minutes_read: number;
    start_page?: number | null;
    end_page?: number | null;
    session_date: string;
    notes?: string | null;
  };

  if (!book_id || pages_read === undefined || minutes_read === undefined || !session_date) {
    return res.status(400).json({ error: "book_id, pages_read, minutes_read, and session_date are required" });
  }

  const { data: book, error: bookError } = await adminDb
    .from("books")
    .select("id")
    .eq("id", book_id)
    .eq("user_id", user.profileId)
    .single();

  if (bookError || !book) {
    return res.status(403).json({ error: "Book not found or does not belong to this user" });
  }

  const { data, error } = await adminDb
    .from("reading_sessions")
    .insert({
      user_id: user.profileId,
      book_id,
      pages_read,
      minutes_read,
      start_page: start_page ?? null,
      end_page: end_page ?? null,
      session_date,
      notes: notes ?? null,
    })
    .select("*, book:books(*)")
    .single();

  if (error || !data) return res.status(500).json({ error: error?.message ?? "Create failed" });
  return res.status(201).json(data);
});

export default router;
