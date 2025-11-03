import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Zap,
  Shield,
  Code,
  Database,
  MessageSquare,
  ArrowRight,
  Check,
  LogOut,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface IndexProps {
  session: Session | null;
}

const Index = ({ session }: IndexProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  
  const userEmail = session?.user?.email;
  const userInitial = userEmail
    ? userEmail[0].toUpperCase()
    : "U";

  // Helper function for conditional links
  const getCtaLink = session ? "/chat" : "/auth";
  const getCtaText = session ? "Go to Chat" : "Try for free now";

  return (
    <div className="min-h-screen bg-background">
      {/* Header (MODIFIED) */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">QueryZen</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Pricing
              </a>
              <a
                href="#faq"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                FAQ
              </a>
            </div>
            {/* START MODIFIED TOP-RIGHT NAV */}
            <div className="flex items-center gap-4">
              {session ? ( 
                <>
                  {/* User Info (Email and Initials) */}
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline text-sm font-medium text-foreground">
                      {userEmail}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-sm font-medium text-primary-foreground">
                      {userInitial}
                    </div>
                  </div>
                  
                  {/* Try Chat Button (Prominent CTA) */}
                  <Link to="/chat">
                    <Button size="sm" className="bg-primary hover:bg-primary-hover">
                      Try Chat
                    </Button>
                  </Link>

                  {/* Sign Out Button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleSignOut}
                    title="Sign Out"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </>
              ) : ( 
                <>
                  <Link to="/auth">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button size="sm" className="bg-primary hover:bg-primary-hover">
                      Try for free
                    </Button>
                  </Link>
                </>
              )}
            </div>
            {/* END MODIFIED TOP-RIGHT NAV */}
          </nav>
        </div>
      </header>

      {/* Hero Section (MODIFIED CTA) */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Automating Queries through NLP driven Text to SQL Translation
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
            Convert Text to SQL with AI, in seconds
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Save time by letting our AI generate optimized SQL queries using your
            natural language. Get accurate results in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to={getCtaLink}>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary-hover text-lg px-8"
              >
                {getCtaText} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/50 border-2 border-background"
                />
              ))}
            </div>
            <span className="text-sm">
              from <strong className="text-foreground">AIT</strong> Department of CSE
            </span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              “Ask. Generate. Query. Done.”
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Transform how you interact with your databases. Our AI-powered
              Text-to-SQL tool makes data querying effortless and efficient.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Get accurate responses within seconds. No need to wait for data
                analysts or spend hours on complex queries.
              </p>
            </div>
            <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Natural Language</h3>
              <p className="text-muted-foreground">
                Ask questions in plain English. Our AI understands context and
                generates optimized SQL queries.
              </p>
            </div>
            <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">All Databases</h3>
              <p className="text-muted-foreground">
                Support for MySQL, PostgreSQL, Oracle, SQL Server, and more.
                Works with any SQL database.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Demo Section (MODIFIED CTA) */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-border">
              <h3 className="font-semibold mb-1">Try it yourself</h3>
              <p className="text-sm text-muted-foreground">
                Ask any SQL question in natural language
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-primary">You</span>
                </div>
                <div className="flex-1 bg-muted p-4 rounded-lg">
                  <p className="text-sm">
                    How many users have signed up in the last 12 months, by
                    month?
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center flex-shrink-0">
                  <Database className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="bg-code-bg p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-chat-foreground">
                      <span className="text-code-keyword">SELECT</span>
                      {"\n"}
                      {"  "}
                      <span className="text-code-keyword">DATE_TRUNC</span>(
                      <span className="text-code-string">'month'</span>,
                      created_at) <span className="text-code-keyword">AS</span>{" "}
                      month,{"\n"}
                      {"  "}
                      <span className="text-code-keyword">COUNT</span>(*)
                      <span className="text-code-keyword">AS</span> user_count
                      {"\n"}
                      <span className="text-code-keyword">FROM</span>{" "}
                      public.profiles{"\n"}
                      <span className="text-code-keyword">WHERE</span> created_at
                      {">"}= <span className="text-code-keyword">NOW</span>() -
                      <span className="text-code-keyword">INTERVAL</span>
                      <span className="text-code-string">'12 months'</span>
                      {"\n"}
                      <span className="text-code-keyword">GROUP BY</span> month
                      {"\n"}
                      <span className="text-code-keyword">ORDER BY</span> month;
                    </pre>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-muted/30 border-t border-border text-center">
              <Link to={getCtaLink}>
                <Button className="bg-primary hover:bg-primary-hover">
                  {session ? "Go to Chat" : "Start using Text2SQL.ai"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Maximum Security
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Your database credentials and data stay completely private. Only
              schema names are sent to AI providers.
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="bg-card p-6 rounded-xl border border-border">
                <Check className="w-5 h-5 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Complete Privacy</h3>
                <p className="text-sm text-muted-foreground">
                  Database credentials and data stay on your machine
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <Check className="w-5 h-5 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Secure Connection</h3>
                <p className="text-sm text-muted-foreground">
                  Connect to local databases or secure remote databases without
                  risk
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground">
              Choose the plan that's right for you
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card p-8 rounded-2xl border border-border">
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">Rs 199</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground mb-6">
                Ideal for recurring or advanced SQL needs
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited messages per month + Receipts generation",
                  "SQL AI generation & optimization ",
                  "Mutilingual and domain-specific SQL support",
                  "Access to early feature releases",
                  "Priority email support",
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/upgrade">
                <Button className="w-full bg-primary hover:bg-primary-hover">
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-2xl border-2 border-primary relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <p className="text-muted-foreground mb-6">
                For enterprise-level SQL needs
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "All Pro features",
                  "Custom limits",
                  "Dedicated support",
                  "Lightning-fast ",
                  "Support for on-premise databases",
                  "Custom integrations",
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/contact" className="w-full">
                <Button className="w-full bg-primary hover:bg-primary-hover">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "How accurate is the SQL AI?",
                a: "Our AI generates highly accurate SQL queries, especially when you provide your database schema. Most queries work on the first try.",
              },
              {
                q: "Who can use this system?",
                a: "This platform is designed for farmers, small business owners, educators, healthcare workers, and anyone who wants to access or analyze data without needing to learn SQL.",
              },
              {
                q: "Is my data safe?",
                a: "Absolutely. Your data is stored on your local device or server. The system uses Ollama to run the Llama 3.1 8B model locally — so no data is shared with cloud providers or third parties. Only non-sensitive schema information is used for AI understanding.",
              },
              {
                q: "Can I use this for free?",
                a: "Yes! We offer a free tier to get started. For unlimited usage, upgrade to Pro.",
              },
            ].map((faq, i) => (
              <div key={i} className="bg-card p-6 rounded-xl border border-border">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section (MODIFIED CTA) */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/10 to-primary/5 p-12 rounded-3xl border border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Stop wasting time writing SQL queries. Let our AI generate them for
              you in seconds.
            </p>
            <Link to={getCtaLink}>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary-hover text-lg px-8"
              >
                {getCtaText} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer (MODIFIED CTA) */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold">QueryZen</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Ask.Generate.Query.Done. Transforming data access with AI-powered
                Text-to-SQL.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#features"
                    className="hover:text-foreground transition"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-foreground transition"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <Link to={getCtaLink} className="hover:text-foreground transition">
                    Try Now
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Team</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Tanushree
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Yadriksha
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Tanisha
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2025 Tanisha Yadav, Tanushree, Yadriksha Uprety. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;