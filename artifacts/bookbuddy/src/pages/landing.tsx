import { Link, useLocation } from "wouter";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function Landing() {
  const { session, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && session) {
      setLocation("/dashboard");
    }
  }, [session, loading, setLocation]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="bg-primary/10 p-4 rounded-2xl">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground">
            BookBuddy
          </h1>
          <p className="text-xl text-muted-foreground">
            Your quiet night reading companion.
          </p>
        </div>

        <div className="space-y-4 pt-8">
          <Link href="/signup" className="w-full">
            <Button className="w-full h-12 text-lg" size="lg" data-testid="button-signup-link">
              Create an account
            </Button>
          </Link>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full h-12 text-lg bg-transparent border-primary/20 hover:bg-primary/5" size="lg" data-testid="button-login-link">
              Sign in
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground pt-12">
          Calm, grounded, and supportive.
          <br />Progress is still progress.
        </p>
      </div>
    </div>
  );
}
