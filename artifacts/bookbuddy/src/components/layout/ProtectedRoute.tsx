import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading, profile } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!session) {
        setLocation("/");
      } else if (profile && !profile.display_name && location !== "/onboarding") {
        setLocation("/onboarding");
      }
    }
  }, [session, loading, profile, location, setLocation]);

  if (loading) return null;
  if (!session) return null;
  if (profile && !profile.display_name && location !== "/onboarding") return null;

  return <>{children}</>;
}
