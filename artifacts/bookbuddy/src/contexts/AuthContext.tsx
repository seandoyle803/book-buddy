import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase, UserRow } from "@/lib/supabase";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserRow | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(authUser: User) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("supabase_auth_id", authUser.id)
      .single();
    if (data) setProfile(data as UserRow);
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user).finally(() => setLoading(false));
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, s: Session | null) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          await fetchProfile(s.user);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function signUp(email: string, password: string) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: new Error(body.error ?? "Registration failed") };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
