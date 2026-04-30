import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Play, Pause, Square, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentBook, useUpdateBook } from "@/hooks/use-books";
import { useCreateSession } from "@/hooks/use-sessions";

export default function Session() {
  const [, setLocation] = useLocation();
  const { data: book, isLoading: isLoadingBook } = useCurrentBook();
  const createSession = useCreateSession();
  const updateBook = useUpdateBook();

  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const [startPage, setStartPage] = useState<string>("");
  const [endPage, setEndPage] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && !isFinished) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isFinished]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const finishSession = () => {
    setIsActive(false);
    setIsFinished(true);
    if (book) {
      setStartPage(String(book.current_page));
      setEndPage(String(book.current_page));
    }
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSave = async () => {
    if (!book) return;

    const parsedStartPage = parseInt(startPage, 10);
    const parsedEndPage = parseInt(endPage, 10);

    if (isNaN(parsedStartPage) || parsedStartPage < 0) {
      alert("Start page must be a valid non-negative number.");
      return;
    }
    if (isNaN(parsedEndPage) || parsedEndPage < parsedStartPage) {
      alert("End page must be a number greater than or equal to start page.");
      return;
    }

    setIsSaving(true);
    const minutesRead = Math.ceil(seconds / 60);
    const pagesRead = parsedEndPage - parsedStartPage;
    const isCompleted = parsedEndPage >= book.total_pages;

    try {
      await createSession.mutateAsync({
        book_id: book.id,
        session_date: new Date().toISOString().split("T")[0],
        minutes_read: minutesRead,
        pages_read: pagesRead,
        start_page: parsedStartPage,
        end_page: parsedEndPage,
        notes: notes || null,
      });

      await updateBook.mutateAsync({
        id: book.id,
        current_page: parsedEndPage,
        last_read_at: new Date().toISOString(),
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : book.completed_at,
      });

      setLocation(`/session/success?pages=${pagesRead}&minutes=${minutesRead}&title=${encodeURIComponent(book.title)}&progress=${Math.min(100, Math.round((parsedEndPage / book.total_pages) * 100))}`);
    } catch (e) {
      console.error(e);
      setIsSaving(false);
    }
  };

  if (isLoadingBook) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <div className="animate-pulse space-y-4 w-64">
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!book) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
          <Book className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-serif font-medium mb-2">No active book</h2>
          <p className="text-muted-foreground mb-6">Select a book from your library to start reading.</p>
          <Button onClick={() => setLocation("/books")}>Go to Library</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-md mx-auto p-6 md:p-10 pt-12 md:pt-20">
        <div className="text-center mb-12">
          <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase mb-2">Currently Reading</p>
          <h1 className="text-3xl font-serif font-bold leading-tight">{book.title}</h1>
          <p className="text-muted-foreground mt-2">Started on page {book.current_page}</p>
        </div>

        {!isFinished ? (
          <div className="flex flex-col items-center space-y-12">
            <div className="text-8xl font-serif tracking-tighter text-primary" data-testid="text-timer">
              {formatTime(seconds)}
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                size="lg" 
                variant={isActive ? "outline" : "default"} 
                className="h-16 w-32 text-lg rounded-2xl" 
                onClick={toggleTimer}
                data-testid="button-toggle-timer"
              >
                {isActive ? <><Pause className="mr-2 h-6 w-6" /> Pause</> : <><Play className="mr-2 h-6 w-6 fill-current" /> Start</>}
              </Button>
              <Button 
                size="lg" 
                variant="secondary" 
                className="h-16 w-32 text-lg rounded-2xl"
                onClick={finishSession}
                disabled={seconds === 0}
                data-testid="button-end-session"
              >
                <Square className="mr-2 h-5 w-5" /> End
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-card border border-border/50 p-6 rounded-2xl space-y-6 shadow-sm">
              <h2 className="text-xl font-serif font-medium border-b border-border/50 pb-4">Log Session</h2>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Time Read</Label>
                  <div className="text-2xl font-serif">{Math.ceil(seconds / 60)} <span className="text-sm font-sans text-muted-foreground">min</span></div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startPage">Start Page</Label>
                  <Input
                    id="startPage"
                    type="number"
                    value={startPage}
                    onChange={(e) => setStartPage(e.target.value)}
                    className="text-lg"
                    data-testid="input-start-page"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endPage">End Page</Label>
                  <Input
                    id="endPage"
                    type="number"
                    value={endPage}
                    onChange={(e) => setEndPage(e.target.value)}
                    className="text-lg"
                    data-testid="input-end-page"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Any favorite quotes or thoughts?" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-24 resize-none"
                  data-testid="input-notes"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setIsFinished(false)}
                disabled={isSaving}
              >
                Back to Timer
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleSave}
                disabled={isSaving || !endPage}
                data-testid="button-save-session"
              >
                {isSaving ? "Saving..." : "Save Session"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
