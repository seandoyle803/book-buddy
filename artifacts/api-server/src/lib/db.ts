import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const adminDb: SupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export interface ResolvedUser {
  supabaseAuthId: string;
  profileId: string;
}

export async function resolveUser(jwt: string): Promise<ResolvedUser | null> {
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error } = await anonClient.auth.getUser(jwt);
  if (error || !user) return null;

  const { data: profile } = await adminDb
    .from("users")
    .select("id")
    .eq("supabase_auth_id", user.id)
    .single();

  if (!profile) return null;

  return { supabaseAuthId: user.id, profileId: profile.id };
}

export function extractJwt(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
