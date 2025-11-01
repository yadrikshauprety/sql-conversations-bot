import { supabase } from "@/integrations/supabase/client";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Database } from "lucide-react";
// No longer need useNavigate or useEffect here

const Auth = () => {
  // All navigation logic is now handled by the routing in App.tsx
  // This component's only job is to show the sign-in form.

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Database className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">Text2SQL.ai</span>
        </div>
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={["google", "github"]} // You can configure providers here
          redirectTo={`${window.location.origin}/chat`} // This is for magic links (email sign-in)
        />
      </div>
    </div>
  );
};

export default Auth;