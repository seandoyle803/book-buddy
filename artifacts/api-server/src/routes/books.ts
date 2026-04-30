import { Router } from "express";
import { adminDb, resolveUser, extractJwt } from "../lib/db";

const router = Router();

router.get("/books", async (req, res) => {
  const jwt = extractJwt(req.headers.authorization);
  if (!jwt) return res.status(401).json({ error: "Missing or invalid Authorization header" });

  const user = await resolveUser(jwt);
  if (!user) return res.status(401).json({ error: "Invalid or expired session" });

  const { data, error } = await adminDb
    .from("books")
    .select("*")
    .eq("user_id", user.profileId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data ?? []);
});

router.post("/books", async (req, res) => {
  const jwt = extractJwt(req.headers.authorization);
  if (!jwt) return res.status(401).json({ error: "Missing or invalid Authorization header" });

  const user = await resolveUser(jwt);
  if (!user) return res.status(401).json({ error: "Invalid or expired session" });

  const { title, author, total_pages, current_page = 0, is_current = false,
    is_completed, completed_at, last_read_at } = req.body as {
    title: string;
    author?: string | null;
    total_pages: number;
    current_page?: number;
    is_current?: boolean;
    is_completed?: boolean;
    completed_at?: string | null;
    last_read_at?: string | null;
  };

  if (!title || !total_pages) return res.status(400).json({ error: "title and total_pages are required" });

  if (is_current) {
    await adminDb.from("books").update({ is_current: false }).eq("user_id", user.profileId);
  }

  const { data, error } = await adminDb
    .from("books")
    .insert({
      user_id: user.profileId,
      title,
      author: author ?? null,
      total_pages,
      current_page,
      is_current,
      is_completed: is_completed ?? (current_page >= total_pages),
      completed_at: completed_at ?? (current_page >= total_pages ? new Date().toISOString() : null),
      last_read_at: last_read_at ?? null,
    })
    .select("*")
    .single();

  if (error || !data) return res.status(500).json({ error: error?.message ?? "Create failed" });
  return res.status(201).json(data);
});

router.patch("/books/:bookId", async (req, res) => {
  const jwt = extractJwt(req.headers.authorization);
  if (!jwt) return res.status(401).json({ error: "Missing or invalid Authorization header" });

  const user = await resolveUser(jwt);
  if (!user) return res.status(401).json({ error: "Invalid or expired session" });

  const { bookId } = req.params;

  const allowed = ["title", "author", "total_pages", "current_page", "is_completed", "completed_at", "last_read_at", "is_current"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in req.body) updates[key] = req.body[key];
  }

  if (updates.is_current === true) {
    await adminDb.from("books").update({ is_current: false }).eq("user_id", user.profileId);
  }

  const { data, error } = await adminDb
    .from("books")
    .update(updates)
    .eq("id", bookId)
    .eq("user_id", user.profileId)
    .select("*")
    .single();

  if (error || !data) return res.status(error ? 500 : 404).json({ error: error?.message ?? "Book not found" });
  return res.json(data);
});

router.delete("/books/:bookId", async (req, res) => {
  const jwt = extractJwt(req.headers.authorization);
  if (!jwt) return res.status(401).json({ error: "Missing or invalid Authorization header" });

  const user = await resolveUser(jwt);
  if (!user) return res.status(401).json({ error: "Invalid or expired session" });

  const { bookId } = req.params;

  const { error } = await adminDb
    .from("books")
    .delete()
    .eq("id", bookId)
    .eq("user_id", user.profileId);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

export default router;
