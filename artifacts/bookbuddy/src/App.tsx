import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { supabase } from "@/lib/supabase";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import Session from "@/pages/session";
import SessionSuccess from "@/pages/session-success";
import Books from "@/pages/books";
import History from "@/pages/history";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

setAuthTokenGetter(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />

      <Route path="/onboarding">
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/session">
        <ProtectedRoute>
          <Session />
        </ProtectedRoute>
      </Route>

      <Route path="/session/success">
        <ProtectedRoute>
          <SessionSuccess />
        </ProtectedRoute>
      </Route>

      <Route path="/books">
        <ProtectedRoute>
          <Books />
        </ProtectedRoute>
      </Route>

      <Route path="/history">
        <ProtectedRoute>
          <History />
        </ProtectedRoute>
      </Route>

      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
