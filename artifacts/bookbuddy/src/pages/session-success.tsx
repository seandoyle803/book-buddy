import { useState } from "react";
import { Link, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2 } from "lucide-react";

export default function SessionSuccess() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  
  const pagesRead = searchParams.get("pages") || "0";
  const minutesRead = searchParams.get("minutes") || "0";
  const title = searchParams.get("title") || "your book";
  const progress = searchParams.get("progress") || "0";

  // Messages to pick from
  const messages = [
    "You showed up today.",
    "Progress counts, even on low energy days.",
    "Nice work — you kept the habit moving.",
    "Every page is a step forward.",
    "A good session. Time to rest."
  ];
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="bg-primary/10 p-6 rounded-full mb-8 animate-in zoom-in duration-500">
          <CheckCircle2 className="h-16 w-16 text-primary" />
        </div>
        
        <h1 className="text-3xl font-serif font-bold mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {randomMessage}
        </h1>
        
        <p className="text-muted-foreground text-lg mb-12 max-w-md animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          You read <strong className="text-foreground">{pagesRead} pages</strong> of {decodeURIComponent(title)} in <strong className="text-foreground">{minutesRead} minutes</strong>. You are now {progress}% through.
        </p>
        
        <Button asChild size="lg" className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </AppLayout>
  );
}
