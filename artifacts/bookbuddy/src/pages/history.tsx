import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, BookOpen, Quote } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { useSessions } from "@/hooks/use-sessions";

export default function History() {
  const { data: sessions, isLoading } = useSessions();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const sessionsByDate = useMemo(() => {
    if (!sessions) return {};
    const map: Record<string, any[]> = {};
    sessions.forEach(s => {
      if (!map[s.session_date]) map[s.session_date] = [];
      map[s.session_date].push(s);
    });
    return map;
  }, [sessions]);

  const activeDates = useMemo(() => {
    if (!sessions) return [];
    return [...new Set(sessions.map(s => s.session_date))].map(d => new Date(d));
  }, [sessions]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 md:p-10 space-y-8 animate-pulse max-w-5xl mx-auto">
          <div className="h-10 bg-muted rounded w-1/4 mb-8"></div>
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-5 h-80 bg-muted rounded-xl"></div>
            <div className="md:col-span-7 h-64 bg-muted rounded-xl"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const selectedSessions = selectedDateStr ? sessionsByDate[selectedDateStr] || [] : [];

  return (
    <AppLayout>
      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
        <div className="border-b border-border/50 pb-6">
          <h1 className="text-3xl font-serif font-bold tracking-tight">Reading History</h1>
          <p className="text-muted-foreground mt-2">Your reading journey over time.</p>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-5 flex flex-col items-center sm:items-start">
            <Card className="p-2 inline-block">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{ active: activeDates }}
                modifiersClassNames={{
                  active: "bg-primary/20 text-primary font-bold"
                }}
                className="rounded-md"
              />
            </Card>
          </div>

          <div className="md:col-span-7 space-y-6">
            <h2 className="text-xl font-medium mb-4">
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
            </h2>
            
            {selectedSessions.length > 0 ? (
              <div className="space-y-4">
                {selectedSessions.map(session => (
                  <Card key={session.id} className="overflow-hidden border-border/50 hover:border-border transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            {session.book?.title || "Unknown Book"}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Pages Read</p>
                          <p className="text-xl font-medium text-foreground">{session.pages_read}</p>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Time Read</p>
                          <div className="flex items-center gap-2 text-xl font-medium text-foreground">
                            <Clock className="h-5 w-5 text-primary/70" />
                            {session.minutes_read} <span className="text-sm font-normal text-muted-foreground">min</span>
                          </div>
                        </div>
                      </div>
                      
                      {session.notes && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Quote className="h-5 w-5 shrink-0 opacity-50" />
                            <p className="text-sm italic">{session.notes}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 rounded-xl border border-dashed border-border/60 text-muted-foreground bg-card/50">
                <CalendarIcon className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p>No reading sessions on this day.</p>
                <p className="text-sm mt-1 opacity-70">Take a deep breath and enjoy the quiet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
