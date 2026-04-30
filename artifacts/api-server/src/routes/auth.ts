import { Router } from "express";
import { createClient } from "@supabase/supabase-js";

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

router.post("/auth/register", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const { error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    const status = error.message.toLowerCase().includes("already") ? 409 : 400;
    return res.status(status).json({ error: error.message });
  }

  return res.status(201).json({ success: true });
});

export default router;
