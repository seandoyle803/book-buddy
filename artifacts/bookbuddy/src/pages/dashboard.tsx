import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCurrentBook } from "@/hooks/use-books";
import { useRecentSessions } from "@/hooks/use-sessions";
import { useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Play, Book, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getBookProgressPercent } from "@/lib/calculations";
import type { BookRow } from "@/lib/supabase";

interface SessionWithBook {
  id: string;
  book_id: string;
  pages_read: number;
  minutes_read: number;
  session_date: string;
  book: BookRow | null;
}

export default function Dashboard() {
  const { profile } = useAuth();
  
  const { data: currentBook, isLoading: isLoadingBook } = useCurrentBook();
  const { data: recentSessionsRaw, isLoading: isLoadingSessions } = useRecentSessions(5);
  const recentSessions = recentSessionsRaw as SessionWithBook[] | undefined;
  
  const { data: stats, isLoading: isLoadingStats } = useGetDashboardSummary({
    query: { enabled: !!profile?.id, queryKey: getGetDashboardSummaryQueryKey() },
  });

  const isLoading = isLoadingBook || isLoadingSessions || isLoadingStats;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 md:p-10 space-y-8 animate-pulse">
          <div className="h-10 bg-muted rounded w-1/3"></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded-xl"></div>
            <div className="h-64 bg-muted rounded-xl"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
        
        <header>
          <h1 className="text-3xl font-serif font-bold" data-testid="text-greeting">
            Good evening, {profile?.display_name}.
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Time to settle in with a good book.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          <div className="md:col-span-7 space-y-8">
            <section>
              <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
                <Book className="h-5 w-5 text-primary" />
                Current Read
              </h2>
              {currentBook ? (
                <Card className="overflow-hidden border-border/50 shadow-sm">
                  <CardContent className="p-6 sm:p-8">
                    <div className="mb-6">
                      <h3 className="text-2xl font-serif font-semibold">{currentBook.title}</h3>
                      {currentBook.author && <p className="text-muted-foreground text-lg">{currentBook.author}</p>}
                    </div>
                    
                    <div className="space-y-2 mb-8">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{getBookProgressPercent(currentBook.current_page, currentBook.total_pages)}%</span>
                      </div>
                      <Progress value={getBookProgressPercent(currentBook.current_page, currentBook.total_pages)} className="h-2" />
                      <div className="text-xs text-muted-foreground text-right">
                        Page {currentBook.current_page} of {currentBook.total_pages}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button asChild size="lg" className="flex-1 text-base">
                        <Link href="/session">
                          <Play className="mr-2 h-5 w-5 fill-current" />
                          Start Reading
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed bg-transparent">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">You aren't reading anything right now.</p>
                    <Button asChild variant="outline">
                      <Link href="/books">Choose a book</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </section>
            
            {stats && stats.daysSinceLastSession !== null && stats.daysSinceLastSession >= 2 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="font-medium text-lg mb-2 text-primary">Ready to pick it back up?</h3>
                  <p className="text-muted-foreground text-sm">It's been a couple days. Even just a few pages counts.</p>
                </CardContent>
              </Card>
            )}
            
            <section>
              <h2 className="text-xl font-medium mb-4">Recent Sessions</h2>
              {recentSessions && recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-card border border-border/50">
                      <div>
                        <p className="font-medium">{session.book?.title ?? 'Unknown Book'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.session_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary">{session.pages_read} pages</p>
                        <p className="text-xs text-muted-foreground">{session.minutes_read} min</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 rounded-lg border border-dashed border-border text-muted-foreground">
                  No sessions yet — your first one is waiting.
                </div>
              )}
            </section>
          </div>

          <div className="md:col-span-5 space-y-6">
            <section>
              <h2 className="text-xl font-medium mb-4">Daily Goal</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Today's Reading</p>
                      <p className="text-3xl font-bold">
                        {stats?.todayMinutes || 0} <span className="text-base font-normal text-muted-foreground">/ {profile?.daily_goal_minutes || 15} min</span>
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-primary/40 mb-1" />
                  </div>
                  <Progress 
                    value={Math.min(100, ((stats?.todayMinutes || 0) / (profile?.daily_goal_minutes || 15)) * 100)} 
                    className="h-3"
                  />
                  {stats && stats.todayMinutes >= (profile?.daily_goal_minutes || 15) && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-4 font-medium">
                      You showed up today. Nice work.
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-4">Momentum</h2>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-normal text-muted-foreground">Active this week</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{stats?.weeklyActiveDays || 0} <span className="text-sm font-normal text-muted-foreground">days</span></p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-normal text-muted-foreground">Current streak</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{stats?.currentStreak || 0} <span className="text-sm font-normal text-muted-foreground">days</span></p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
          
        </div>
      </div>
    </AppLayout>
  );
}
