import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import ProUpgrade from "./pages/ProUpgrade"; // NEW: Import the ProUpgrade page
import NotFound from "./pages/NotFound";
import { Skeleton } from "./components/ui/skeleton"; // For loading state

const queryClient = new QueryClient();

// A simple full-screen loader
const FullScreenLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <Skeleton className="h-24 w-24 rounded-full" />
  </div>
);

/**
 * A component to protect routes.
 * It checks for an active session. If loading, it shows a skeleton.
 * If no session, it redirects to the /auth page.
 * If there is a session, it renders the child route (e.g., Chat).
 */
const ProtectedRoute = ({
  session,
  loading,
}: {
  session: Session | null;
  loading: boolean;
}) => {
  if (loading) {
    return <FullScreenLoader />;
  }

  if (!session) {
    // If not loading and no session, redirect to the auth page
    return <Navigate to="/auth" replace />;
  }

  // If session exists, render the nested child routes
  return <Outlet />;
};

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an existing session on app load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for changes in authentication state (sign in, sign out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Clean up the subscription on component unmount
    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />

            <Route
              path="/auth"
              element={
                loading ? (
                  <FullScreenLoader />
                ) : !session ? (
                  <Auth />
                ) : (
                  <Navigate to="/chat" replace />
                )
              }
            />

            <Route path="/contact" element={<Contact />} />

            {/* Protected Routes */}
            <Route
              element={<ProtectedRoute session={session} loading={loading} />}
            >
              {/* Pass session and loading state to Chat page */}
              <Route
                path="/chat"
                element={<Chat session={session} loading={loading} />}
              />
              <Route path="/upgrade" element={<ProUpgrade />} /> {/* NEW PROTECTED ROUTE */}
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;