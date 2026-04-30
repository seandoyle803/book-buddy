import { useState, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Calendar, Settings, LogOut, Home, Play, Library } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const [, setLocation] = useLocation();

  const handleSignOut = async () => {
    await signOut();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Mobile Nav - Bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-card z-50 px-4 py-2 flex justify-between items-center">
        <Link href="/dashboard" className="flex flex-col items-center p-2 text-muted-foreground hover:text-primary">
          <Home className="h-5 w-5" />
          <span className="text-[10px] mt-1">Home</span>
        </Link>
        <Link href="/books" className="flex flex-col items-center p-2 text-muted-foreground hover:text-primary">
          <Library className="h-5 w-5" />
          <span className="text-[10px] mt-1">Books</span>
        </Link>
        <Link href="/session" className="flex flex-col items-center p-2 text-primary">
          <div className="bg-primary/20 p-3 rounded-full -mt-6 border border-background shadow-sm">
            <Play className="h-6 w-6 fill-current" />
          </div>
        </Link>
        <Link href="/history" className="flex flex-col items-center p-2 text-muted-foreground hover:text-primary">
          <Calendar className="h-5 w-5" />
          <span className="text-[10px] mt-1">History</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center p-2 text-muted-foreground hover:text-primary">
          <Settings className="h-5 w-5" />
          <span className="text-[10px] mt-1">Settings</span>
        </Link>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card h-screen sticky top-0 px-4 py-6">
        <div className="flex items-center gap-2 mb-8 px-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-serif font-bold text-xl tracking-tight">BookBuddy</span>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/10 text-muted-foreground hover:text-foreground transition-colors">
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/books" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/10 text-muted-foreground hover:text-foreground transition-colors">
            <Library className="h-5 w-5" />
            <span>Books</span>
          </Link>
          <Link href="/history" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/10 text-muted-foreground hover:text-foreground transition-colors">
            <Calendar className="h-5 w-5" />
            <span>History</span>
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/10 text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </div>

        <div className="mt-auto">
          <Link href="/session" className="flex items-center justify-center gap-2 w-full py-3 mb-4 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium">
            <Play className="h-4 w-4 fill-current" />
            <span>Start Session</span>
          </Link>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
